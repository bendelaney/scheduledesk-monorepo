import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TeamMember, AvailabilityEvent } from '@/types';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import { useAvailabilityEvents } from '@/lib/supabase/hooks/useAvailabilityEvents';
import { useCalendarUI } from '@/contexts/CalendarUIContext';
import { useNormalSchedule } from '@/hooks/useNormalSchedule';

// Utility function to extract base UUID from recurring instance IDs
const getBaseUuid = (id: string): string => {
  // If it's an instance ID (format: uuid-instance-YYYY-MM-DD), extract the base UUID
  const instanceMatch = id.match(/^(.+)-instance-\d{4}-\d{2}-\d{2}$/);
  return instanceMatch ? instanceMatch[1] : id;
};

interface UseTeamMemberPageLogicResult {
  // Data
  teamMember: TeamMember | undefined;
  teamMembers: TeamMember[];
  availabilityEvents: AvailabilityEvent[];
  loading: boolean;
  error: string | null;
  needsJobberReauth: boolean;
  refetch: () => Promise<void>;

  // Popover state
  showPopover: boolean;
  popoverIsSaveable: boolean;
  popoverTarget: { current: HTMLElement | null };
  activeEvent: AvailabilityEvent | null;
  eventEditorValues: Partial<AvailabilityEvent>;
  newEventButtonRef: React.RefObject<HTMLButtonElement | null>;

  // Event handlers
  handleEventClickFromGrid: (event: AvailabilityEvent, targetEl?: HTMLElement) => void;
  handleClosePopover: () => void;
  handleDayClick: (date: string) => void;
  handleNewEventClick: (date: string, targetEl: HTMLElement) => void;
  handleNewEventPopoverOpen: () => void;
  handleEventEditorChange: (data: Partial<AvailabilityEvent>) => void;
  handleSaveEvent: () => Promise<void>;
  handleDeleteEvent: () => Promise<void>;
  setPopoverIsSaveable: (saveable: boolean) => void;
}

export const useTeamMemberPageLogic = (memberId: string): UseTeamMemberPageLogicResult => {
  // Data hooks
  const { data: teamMembers, loading: teamMembersLoading, error: teamMembersError, needsJobberReauth, refetch } = useTeamMembers();
  const [teamMember, setTeamMember] = useState<TeamMember>();

  // Normal schedule hook (will be used when teamMember is set)
  // Only call hook when teamMember is actually available to avoid infinite re-renders
  const normalScheduleHook = useNormalSchedule(
    teamMember?.id || '',
    teamMember
  );

  // Calendar UI context for save state management
  const { setSaving, setSaved } = useCalendarUI();

  // Find team member when data loads
  useEffect(() => {
    if (teamMembers.length > 0) {
      console.log('Team members loaded, looking for memberId:', memberId);
      const decodedMemberId = decodeURIComponent(memberId);
      console.log('Decoded memberId:', decodedMemberId);

      const member = teamMembers.find(m =>
        m.id === memberId ||
        m.id === decodedMemberId ||
        `${m.firstName}-${m.lastName}`.toLowerCase() === memberId.toLowerCase() ||
        `${m.firstName}-${m.lastName}`.toLowerCase() === decodedMemberId.toLowerCase()
      );
      setTeamMember(member);
    }
  }, [memberId, teamMembers]);

  // Events data and CRUD functions - only fetch when we have a valid team member
  // Pass null when waiting for team member, pass the ID when ready
  const {
    data: availabilityEvents,
    loading: eventsLoading,
    error: eventsError,
    createEvent,
    updateEvent,
    deleteEvent
  } = useAvailabilityEvents(teamMember?.id || null);

  // Safe CRUD functions
  const safeCreateEvent = createEvent || (async () => { throw new Error('Create function not ready'); });
  const safeUpdateEvent = updateEvent || (async () => { throw new Error('Update function not ready'); });
  const safeDeleteEvent = deleteEvent || (async () => { throw new Error('Delete function not ready'); });

  // Expand normal schedule events to show on calendar dates
  const expandedNormalScheduleEvents = useMemo(() => {
    if (!normalScheduleHook.events || normalScheduleHook.events.length === 0) {
      return [];
    }

    // Import the RecurrenceExpander for proper recurrence handling
    const { expandRecurringEvent } = require('@/lib/recurrence/RecurrenceExpander');
    const { formatDateToLocalString, getSmartDefaultDate, extractTemplateDay } = require('@/utils/dateUtils');

    // Expand normal schedule events to show on actual calendar dates
    // Show them for the next 90 days starting from today
    const today = new Date();
    const todayStr = formatDateToLocalString(today);
    const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
    const endDateStr = formatDateToLocalString(endDate);
    const expandedEvents: AvailabilityEvent[] = [];

    for (const normalEvent of normalScheduleHook.events) {
      // Convert normal schedule event to proper recurring event format
      const templateDay = extractTemplateDay(normalEvent.startDate);

      if (templateDay) {
        // This is a template-based event, convert to real dates
        const actualStartDate = getSmartDefaultDate(templateDay, undefined);

        // Create a proper recurring event format
        const recurringEvent: AvailabilityEvent = {
          ...normalEvent,
          startDate: actualStartDate,
          endDate: actualStartDate,
          // Default to "Every Week" if no recurrence specified for normal schedule
          recurrence: normalEvent.recurrence || "Every Week",
          isNormalSchedule: true
        };

        // Use RecurrenceExpander to handle all recurrence patterns properly
        const instances = expandRecurringEvent(recurringEvent, todayStr, endDateStr);

        // Mark instances as expanded normal schedule events
        const normalScheduleInstances = instances.map((instance: any) => ({
          ...instance,
          isNormalSchedule: true,
          isExpandedNormalSchedule: true,
          id: `${normalEvent.id}-${instance.startDate}`, // Ensure unique ID
          originalEventId: normalEvent.id // Reference to original event for editing
        }));

        expandedEvents.push(...normalScheduleInstances);
      } else {
        // This is already a date-based normal schedule event with recurrence
        const instances = expandRecurringEvent(normalEvent, todayStr, endDateStr);

        // Mark instances as expanded normal schedule events
        const normalScheduleInstances = instances.map((instance: any) => ({
          ...instance,
          isNormalSchedule: true,
          isExpandedNormalSchedule: true,
          id: `${normalEvent.id}-${instance.startDate}`, // Ensure unique ID
          originalEventId: normalEvent.id // Reference to original event for editing
        }));

        expandedEvents.push(...normalScheduleInstances);
      }
    }

    return expandedEvents;
  }, [normalScheduleHook.events]);

  // Merge regular availability events with expanded normal schedule events
  const mergedAvailabilityEvents = useMemo(() => {
    return [...(availabilityEvents || []), ...expandedNormalScheduleEvents];
  }, [availabilityEvents, expandedNormalScheduleEvents]);

  // Popover state
  const [showPopover, setShowPopover] = useState(false);
  const [popoverIsSaveable, setPopoverIsSaveable] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<{ current: HTMLElement | null }>({ current: null });
  const [activeEventId, setActiveEventId] = useState<string | null>(null); // Store ID instead of object
  const [eventEditorValues, setEventEditorValues] = useState<Partial<AvailabilityEvent>>({});
  const newEventButtonRef = useRef<HTMLButtonElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute activeEvent from current data based on activeEventId
  // Check both merged events (expanded normal schedule + regular events) and original normal schedule events
  const activeEvent = activeEventId ?
    mergedAvailabilityEvents.find(e => e.id === activeEventId) ||
    normalScheduleHook.events.find(e => e.id === activeEventId) ||
    null : null;

  // Debug logging
  useEffect(() => {
    console.log('Popover state changed:', {
      showPopover,
      activeEventId,
      activeEventFound: !!activeEvent,
      availabilityEventsCount: availabilityEvents.length
    });
  }, [showPopover, activeEventId, activeEvent, availabilityEvents.length]);

  // Event handlers
  const handleEventClickFromGrid = useCallback((event: AvailabilityEvent, targetEl?: HTMLElement) => {
    if (targetEl) {
      setPopoverTarget({ current: targetEl });
      setActiveEventId(event.id || null);
      setEventEditorValues(event);
      setShowPopover(true);
    }
  }, []);

  const handleClosePopover = useCallback(() => {
    console.log('handleClosePopover called - closing popover');

    // Clear any pending auto-save timeout when closing popover
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    setShowPopover(false);
    setActiveEventId(null);
    setEventEditorValues({});
    setPopoverTarget({ current: null });
  }, []);

  const handleDayClick = useCallback((date: string) => {
    console.log('Day clicked:', date);
  }, []);

  const handleNewEventClick = useCallback((date: string, targetEl: HTMLElement) => {
    console.log('New event clicked for date:', date, 'Target:', targetEl);
    if (targetEl && teamMember) {
      setPopoverTarget({ current: targetEl });
      setActiveEventId(null);

      console.log('=== ORIGINAL TEAM MEMBER DEBUG ===');
      console.log('teamMember object:', teamMember);
      console.log('teamMember.id:', teamMember?.id);
      console.log('teamMember.firstName:', teamMember?.firstName);
      console.log('teamMember.lastName:', teamMember?.lastName);

      setEventEditorValues({
        startDate: date,
        endDate: date,
        teamMember: teamMember,
      });
      setShowPopover(true);
    }
  }, [teamMember]);

  const handleNewEventPopoverOpen = useCallback(() => {
    if (newEventButtonRef.current && teamMember) {
      setPopoverTarget({ current: newEventButtonRef.current });
      setActiveEventId(null);
      setEventEditorValues({
        teamMember: teamMember,
      });
      setShowPopover(true);
    }
  }, [teamMember]);

  const handleEventEditorChange = useCallback((data: Partial<AvailabilityEvent>) => {
    console.log('Event data updated:', data);
    setEventEditorValues(prev => {
      const newValues = { ...prev, ...data };

      // For existing events, trigger auto-save after state update
      if (activeEvent?.id) {
        // Clear any existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // Auto-save after a debounced delay
        autoSaveTimeoutRef.current = setTimeout(async () => {
          // Double-check that the event still exists and popover is still open
          // Check both regular events and normal schedule events
          const currentEvent = availabilityEvents.find(e => e.id === activeEvent.id) ||
                              normalScheduleHook.events.find(e => e.id === activeEvent.id) ||
                              mergedAvailabilityEvents.find(e => e.id === activeEvent.id);

          if (!currentEvent || !showPopover || activeEventId !== activeEvent.id) {
            console.log('Auto-save skipped: event no longer exists or popover closed', {
              currentEventFound: !!currentEvent,
              showPopover,
              activeEventId,
              expectedActiveEventId: activeEvent.id
            });
            return;
          }

          console.log('Auto-save triggered for existing event');
          const eventId = activeEvent.id || 'new';
          try {
            setSaving(eventId);

            // Handle expanded normal schedule events
            if (activeEvent.isExpandedNormalSchedule && activeEvent.originalEventId) {
              console.log('Auto-save: Updating normal schedule event with originalEventId:', activeEvent.originalEventId);
              await normalScheduleHook.updateEvent(activeEvent.originalEventId, newValues);
              console.log('Auto-save: Normal schedule event updated successfully');
            }
            // Handle direct normal schedule events
            else if (activeEvent.isNormalSchedule || activeEvent.startDate?.startsWith('template-')) {
              console.log('Auto-save: Updating direct normal schedule event with ID:', activeEvent.id);
              await normalScheduleHook.updateEvent(activeEvent.id!, newValues);
              console.log('Auto-save: Normal schedule event updated successfully');
            }
            // Handle recurring event instances differently
            else if (activeEvent.isInstance && activeEvent.originalEventId) {
              // For now, we can't update individual instances - only the whole series
              console.warn('Auto-save: Updating individual recurring instances not yet implemented');
              console.log('Auto-save: Would update the entire recurring series with ID:', activeEvent.originalEventId);

              // For now, update the original recurring event (entire series)
              const baseUuid = getBaseUuid(activeEvent.originalEventId || activeEvent.id || '');
              await safeUpdateEvent(baseUuid, newValues);
              console.log('Auto-save: Recurring series updated successfully');
            } else {
              // Regular event update
              await safeUpdateEvent(activeEvent.id!, newValues);
              console.log('Auto-save completed successfully');
            }
            setSaved(eventId);
          } catch (err: any) {
            console.error('Auto-save failed:', err);
            setSaving(null);
          }
        }, 1000);
      }

      return newValues;
    });
  }, [activeEvent, activeEventId, availabilityEvents, showPopover, safeUpdateEvent, setSaving, setSaved, normalScheduleHook, mergedAvailabilityEvents]);

  const handleSaveEvent = useCallback(async () => {
    console.log('handleSaveEvent called');
    console.log('popoverIsSaveable:', popoverIsSaveable);
    console.log('eventEditorValues:', eventEditorValues);
    console.log('eventEditorValues.teamMember:', eventEditorValues.teamMember);
    console.log('eventEditorValues.teamMember.id:', eventEditorValues.teamMember?.id);
    console.log('activeEvent:', activeEvent);

    if (!popoverIsSaveable) {
      console.log('Save aborted - not saveable');
      return;
    }

    const eventId = activeEvent?.id || 'new';

    try {
      setSaving(eventId);
      console.log('Starting save operation...');

      if (activeEvent?.id) {
        console.log('Updating existing event with ID:', activeEvent.id);

        // Handle expanded normal schedule events
        if (activeEvent.isExpandedNormalSchedule && activeEvent.originalEventId) {
          console.log('Updating normal schedule event with originalEventId:', activeEvent.originalEventId);

          // Import utility functions for date handling
          const { getSmartDefaultDate, extractTemplateDay } = require('@/utils/dateUtils');

          // Handle start date conversion for normal schedule events
          let actualStartDate = eventEditorValues.startDate;
          let templateDay = extractTemplateDay(eventEditorValues.startDate || '');

          // If this is a template-based event, convert to actual date
          if (templateDay) {
            actualStartDate = getSmartDefaultDate(templateDay, undefined);
            console.log('Converted template date', templateDay, 'to actual date:', actualStartDate);
          }

          // Create updated normal schedule event
          const updatedNormalScheduleEvent: AvailabilityEvent = {
            ...eventEditorValues,
            // Keep original template date for storage but also set actual start date
            startDate: actualStartDate || eventEditorValues.startDate,
            endDate: actualStartDate || eventEditorValues.endDate || eventEditorValues.startDate,
            // Ensure recurrence is set (default to "Every Week" if not specified)
            recurrence: eventEditorValues.recurrence || "Every Week",
            isNormalSchedule: true,
            teamMember: teamMember!
          } as AvailabilityEvent;

          // Update the original normal schedule event
          await normalScheduleHook.updateEvent(activeEvent.originalEventId, updatedNormalScheduleEvent);
          console.log('Normal schedule event updated successfully');
        }
        // Handle regular recurring event instances differently
        else if (activeEvent.isInstance && activeEvent.originalEventId) {
          // For now, we can't update individual instances - only the whole series
          console.warn('Updating individual recurring instances not yet implemented');
          console.log('Would update the entire recurring series with ID:', activeEvent.originalEventId);

          // For now, update the original recurring event (entire series)
          const baseUuid = getBaseUuid(activeEvent.originalEventId || activeEvent.id || '');
          await safeUpdateEvent(baseUuid, eventEditorValues);
          console.log('Recurring series updated successfully');
        } else {
          // Regular event update
          await safeUpdateEvent(activeEvent.id, eventEditorValues);
          console.log('Event updated successfully');
        }
      } else {
        // Check if this is a normal schedule event (either template date or has isNormalSchedule flag)
        const isNormalScheduleEvent = eventEditorValues.startDate?.startsWith('template-') ||
                                     eventEditorValues.isNormalSchedule ||
                                     eventEditorValues.endDate?.startsWith('template-');

        console.log('Creating new event - isNormalScheduleEvent check:', {
          startDate: eventEditorValues.startDate,
          endDate: eventEditorValues.endDate,
          isNormalSchedule: eventEditorValues.isNormalSchedule,
          startsWithTemplate: eventEditorValues.startDate?.startsWith('template-'),
          endStartsWithTemplate: eventEditorValues.endDate?.startsWith('template-'),
          result: isNormalScheduleEvent
        });

        if (isNormalScheduleEvent && teamMember?.id) {
          console.log('Creating normal schedule event...');

          // Import utility functions
          const { getSmartDefaultDate, extractTemplateDay } = require('@/utils/dateUtils');

          // Handle start date conversion for normal schedule events
          let actualStartDate = eventEditorValues.startDate;
          let templateDay = extractTemplateDay(eventEditorValues.startDate || '');

          // If this is a template-based event, convert to actual date
          if (templateDay) {
            actualStartDate = getSmartDefaultDate(templateDay, undefined);
            console.log('Converted template date', templateDay, 'to actual date:', actualStartDate);
          }

          // For normal schedule events, ensure endDate defaults to startDate if not provided
          const endDateForNormal = eventEditorValues.endDate || eventEditorValues.startDate;
          let actualEndDate = endDateForNormal;

          // If endDate is also template-based, convert it too
          if (endDateForNormal?.startsWith('template-')) {
            const endTemplateDay = extractTemplateDay(endDateForNormal);
            if (endTemplateDay) {
              actualEndDate = getSmartDefaultDate(endTemplateDay, undefined);
            }
          }

          // Create normal schedule event with proper flags and smart date
          const normalScheduleEvent: AvailabilityEvent = {
            ...eventEditorValues,
            id: `normal-${teamMember.id}-${eventEditorValues.startDate}-${Date.now()}`,
            teamMember: teamMember,
            // Keep original template date for storage but also set actual start date
            startDate: actualStartDate || eventEditorValues.startDate,
            endDate: actualEndDate || eventEditorValues.startDate,
            // Ensure recurrence is set (default to "Every Week" if not specified)
            recurrence: eventEditorValues.recurrence || "Every Week",
            isNormalSchedule: true
          } as AvailabilityEvent;

          // Save to normal schedule data using the hook (teamMember.id is the Jobber ID)
          await normalScheduleHook.addEvent(normalScheduleEvent);
          console.log('Normal schedule event created successfully:', normalScheduleEvent);
        } else {
          console.log('Creating regular event...');
          const result = await safeCreateEvent(eventEditorValues);
          console.log('Regular event created successfully:', result);
        }
      }

      setSaved(eventId);

      if (!activeEvent?.id) {
        handleClosePopover();
      }
    } catch (err) {
      console.error('Failed to save event:', err);
      console.error('Error details:', err);
      setSaving(null);
    }
  }, [eventEditorValues, activeEvent, safeUpdateEvent, safeCreateEvent, popoverIsSaveable, handleClosePopover, setSaving, setSaved]);

  const handleDeleteEvent = useCallback(async () => {
    if (!activeEvent?.id) return;

    const eventId = activeEvent.id;

    try {
      setSaving(eventId);

      // Clear any pending auto-save timeout before deletion
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // Handle recurring event instances differently
      if (activeEvent.isInstance && activeEvent.originalEventId) {
        // For now, we can't delete individual instances - only the whole series
        // In a full implementation, you'd create exception records or handle single instance deletion
        console.warn('Deleting individual recurring instances not yet implemented');
        console.log('Would delete the entire recurring series with ID:', activeEvent.originalEventId);

        // For now, delete the original recurring event (entire series)
        const baseUuid = getBaseUuid(activeEvent.originalEventId || activeEvent.id || '');
        await safeDeleteEvent(baseUuid);
        console.log('Recurring series deleted successfully');
      } else {
        // Check if this is a normal schedule event
        const isNormalScheduleEvent = activeEvent.isNormalSchedule || activeEvent.startDate?.startsWith('template-');

        if (isNormalScheduleEvent && teamMember?.id) {
          console.log('Deleting normal schedule event...');

          // For expanded normal schedule events, extract the original ID
          let eventIdToDelete = activeEvent.id;
          if (activeEvent.isExpandedNormalSchedule && activeEvent.id?.includes('-')) {
            // ID format: "original-id-YYYY-MM-DD", extract the original part
            const parts = activeEvent.id.split('-');
            if (parts.length > 3) {
              // Remove the last 3 parts (YYYY-MM-DD) to get original ID
              eventIdToDelete = parts.slice(0, -3).join('-');
            }
          }

          await normalScheduleHook.deleteEvent(eventIdToDelete);
          console.log('Normal schedule event deleted successfully');
        } else {
          // Regular event deletion
          await safeDeleteEvent(activeEvent.id);
          console.log('Regular event deleted successfully');
        }
      }

      handleClosePopover();
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setSaving(null);
    }
  }, [activeEvent, safeDeleteEvent, handleClosePopover, setSaving]);
  
  // Removed excessive logging for performance

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    teamMember,
    teamMembers,
    availabilityEvents: mergedAvailabilityEvents,
    loading: teamMembersLoading || eventsLoading || normalScheduleHook.loading,
    error: teamMembersError || eventsError || normalScheduleHook.error,
    needsJobberReauth,
    refetch,

    // Popover state
    showPopover,
    popoverIsSaveable,
    popoverTarget,
    activeEvent,
    eventEditorValues,
    newEventButtonRef,

    // Event handlers
    handleEventClickFromGrid,
    handleClosePopover,
    handleDayClick,
    handleNewEventClick,
    handleNewEventPopoverOpen,
    handleEventEditorChange,
    handleSaveEvent,
    handleDeleteEvent,
    setPopoverIsSaveable,
  };
};