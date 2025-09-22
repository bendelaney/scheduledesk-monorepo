import { useState, useEffect, useRef, useCallback } from 'react';
import { TeamMember, AvailabilityEvent } from '@/types';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import { useAvailabilityEvents } from '@/lib/supabase/hooks/useAvailabilityEvents';
import { useCalendarUI } from '@/contexts/CalendarUIContext';

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
  const { data: teamMembers, loading: teamMembersLoading, error: teamMembersError } = useTeamMembers();
  const [teamMember, setTeamMember] = useState<TeamMember>();

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

  // Popover state
  const [showPopover, setShowPopover] = useState(false);
  const [popoverIsSaveable, setPopoverIsSaveable] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<{ current: HTMLElement | null }>({ current: null });
  const [activeEventId, setActiveEventId] = useState<string | null>(null); // Store ID instead of object
  const [eventEditorValues, setEventEditorValues] = useState<Partial<AvailabilityEvent>>({});
  const newEventButtonRef = useRef<HTMLButtonElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute activeEvent from current data based on activeEventId
  const activeEvent = activeEventId ? availabilityEvents.find(e => e.id === activeEventId) || null : null;

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
          const currentEvent = availabilityEvents.find(e => e.id === activeEvent.id);
          if (!currentEvent || !showPopover || activeEventId !== activeEvent.id) {
            console.log('Auto-save skipped: event no longer exists or popover closed');
            return;
          }

          console.log('Auto-save triggered for existing event');
          const eventId = activeEvent.id || 'new';
          try {
            setSaving(eventId);

            // Handle recurring event instances differently
            if (activeEvent.isInstance && activeEvent.originalEventId) {
              // For now, we can't update individual instances - only the whole series
              console.warn('Updating individual recurring instances not yet implemented');
              console.log('Would update the entire recurring series with ID:', activeEvent.originalEventId);

              // For now, update the original recurring event (entire series)
              const baseUuid = getBaseUuid(activeEvent.originalEventId || activeEvent.id || '');
              await safeUpdateEvent(baseUuid, newValues);
              console.log('Recurring series updated successfully');
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
  }, [activeEvent, activeEventId, availabilityEvents, showPopover, safeUpdateEvent, setSaving, setSaved]);

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

        // Handle recurring event instances differently
        if (activeEvent.isInstance && activeEvent.originalEventId) {
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
        console.log('Creating new event...');
        const result = await safeCreateEvent(eventEditorValues);
        console.log('Event created successfully:', result);
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
        // Regular event deletion
        await safeDeleteEvent(activeEvent.id);
        console.log('Event deleted successfully');
      }

      handleClosePopover();
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setSaving(null);
    }
  }, [activeEvent, safeDeleteEvent, handleClosePopover, setSaving]);
  
  console.log('TeamMemberPage - Events for', teamMember?.firstName, teamMember?.lastName, ':', availabilityEvents.length);
  console.log('TeamMemberPage - Event details:', availabilityEvents.map(e => ({
    id: e.id,
    teamMember: `${e.teamMember.firstName} ${e.teamMember.lastName}`,
    eventType: e.eventType,
    startDate: e.startDate
  })));

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
    availabilityEvents,
    loading: teamMembersLoading || eventsLoading,
    error: teamMembersError || eventsError,

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