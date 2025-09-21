import { useState, useEffect, useRef, useCallback } from 'react';
import { TeamMember, AvailabilityEvent } from '@/types';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import { useAvailabilityEvents } from '@/lib/supabase/hooks/useAvailabilityEvents';

// Utility function to extract base UUID from recurring instance IDs
const getBaseUuid = (id: string): string => {
  // If it's an instance ID (format: uuid-instance-YYYY-MM-DD), extract the base UUID
  const instanceMatch = id.match(/^(.+)-instance-\d{4}-\d{2}-\d{2}$/);
  return instanceMatch ? instanceMatch[1] : id;
};

interface UseTeamCalendarPageLogicResult {
  // Data
  teamMembers: TeamMember[];
  availabilityEvents: AvailabilityEvent[];
  loading: boolean;
  error: string | null;

  // Team member selection
  selectedTeamMembers: string[];
  handleSelectionChange: (selected: string[]) => void;
  handleTeamMemberFilter: (filter: string, filteredTeamMembers: TeamMember[]) => void;

  // Popover state
  showNewEventPopover: boolean;
  popoverIsSaveable: boolean;
  newEventData: Partial<AvailabilityEvent>;
  popoverTarget: { current: HTMLElement | null };
  activeEvent: AvailabilityEvent | null;
  saving: boolean;
  newEventButtonRef: React.RefObject<HTMLButtonElement | null>;

  // Event handlers
  handleNewEventPopoverOpen: () => void;
  handleNewEventDataChange: (data: Partial<AvailabilityEvent>) => void;
  handleEventClickFromGrid: (event: AvailabilityEvent, targetEl?: HTMLElement) => void;
  handleClosePopover: () => void;
  handleDayClick: (date: string) => void;
  handleNewEventClick: (date: string, targetEl: HTMLElement) => void;
  handleSaveEvent: () => Promise<void>;
  handleDeleteEvent: () => Promise<void>;
  setPopoverIsSaveable: (saveable: boolean) => void;
}

export const useTeamCalendarPageLogic = (): UseTeamCalendarPageLogicResult => {
  // Data hooks
  const { data: teamMembers, loading: teamMembersLoading, error: teamMembersError } = useTeamMembers();
  const { data: availabilityEvents, createEvent, updateEvent, deleteEvent } = useAvailabilityEvents();

  // Team member selection state
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const hasInitialized = useRef(false);

  // Initialize selected team members when data loads (only once)
  useEffect(() => {
    if (teamMembers.length > 0 && !hasInitialized.current) {
      setSelectedTeamMembers(
        teamMembers.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
      );
      hasInitialized.current = true;
    }
  }, [teamMembers]);

  // Event Popover state
  const [showNewEventPopover, setShowNewEventPopover] = useState(false);
  const [popoverIsSaveable, setPopoverIsSaveable] = useState(false);
  const [newEventData, setNewEventData] = useState<Partial<AvailabilityEvent>>({});
  const [popoverTarget, setPopoverTarget] = useState<{ current: HTMLElement | null }>({ current: null });
  const [activeEventId, setActiveEventId] = useState<string | null>(null); // Store ID instead of object
  const [saving, setSaving] = useState(false);
  const newEventButtonRef = useRef<HTMLButtonElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute activeEvent from current data based on activeEventId
  const activeEvent = activeEventId ? availabilityEvents.find(e => e.id === activeEventId) || null : null;

  // Debug logging
  useEffect(() => {
    console.log('TEAM CALENDAR: Popover state changed:', {
      showNewEventPopover,
      activeEventId,
      activeEventFound: !!activeEvent,
      availabilityEventsCount: availabilityEvents.length
    });
  }, [showNewEventPopover, activeEventId, activeEvent, availabilityEvents.length]);

  // Sync newEventData with activeEvent when data refreshes
  useEffect(() => {
    if (activeEvent && activeEventId) {
      console.log('TEAM CALENDAR: Syncing newEventData with refreshed activeEvent');
      setNewEventData(activeEvent);
    }
  }, [activeEvent, activeEventId]);

  // Safe CRUD functions
  const safeCreateEvent = createEvent || (async () => { throw new Error('Create function not ready'); });
  const safeUpdateEvent = updateEvent || (async () => { throw new Error('Update function not ready'); });
  const safeDeleteEvent = deleteEvent || (async () => { throw new Error('Delete function not ready'); });

  // Team member selection handlers
  const handleSelectionChange = useCallback((selected: string[]) => {
    setSelectedTeamMembers(selected);
  }, []);

  const handleTeamMemberFilter = useCallback((filter: string, filteredTeamMembers: TeamMember[]) => {
    console.log('Team member filter changed:', filter, filteredTeamMembers);
    setSelectedTeamMembers(filteredTeamMembers.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim()));
  }, []);

  // Popover handlers
  const handleNewEventPopoverOpen = useCallback(() => {
    if (newEventButtonRef.current) {
      setPopoverTarget({ current: newEventButtonRef.current });
      setNewEventData({}); // Start with empty data
      setShowNewEventPopover(true);
    }
  }, []);

  const handleNewEventDataChange = useCallback((data: Partial<AvailabilityEvent>) => {
    setNewEventData(prev => {
      const newValues = { ...prev, ...data };

      // For existing events, trigger auto-save after state update
      if (activeEvent?.id && !saving) {
        // Clear any existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // Auto-save after a debounced delay
        autoSaveTimeoutRef.current = setTimeout(async () => {
          console.log('Auto-save triggered for existing event');
          try {
            setSaving(true);

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
          } catch (err: any) {
            console.error('Auto-save failed:', err);
          } finally {
            setSaving(false);
          }
        }, 1000);
      }

      console.log('New event data changed:', newValues);
      console.log('Team member in data:', newValues.teamMember);
      return newValues;
    });
  }, [activeEvent, saving, safeUpdateEvent]);

  const handleEventClickFromGrid = useCallback((event: AvailabilityEvent, targetEl?: HTMLElement) => {
    if (targetEl) {
      setPopoverTarget({ current: targetEl });
      setActiveEventId(event.id || null);
      setNewEventData(event);
      setShowNewEventPopover(true);
    }
  }, []);

  const handleClosePopover = useCallback(() => {
    console.log('TEAM CALENDAR: handleClosePopover called - closing popover');
    setShowNewEventPopover(false);
    setActiveEventId(null);
    setNewEventData({});
    setPopoverTarget({ current: null });
  }, []);

  const handleDayClick = useCallback((date: string) => {
    console.log('Day clicked:', date);
  }, []);

  const handleNewEventClick = useCallback((date: string, targetEl: HTMLElement) => {
    console.log('New event clicked for date:', date, 'Target:', targetEl);
    if (targetEl) {
      setPopoverTarget({ current: targetEl });
      setActiveEventId(null);

      // Pre-populate with the clicked date only
      setNewEventData({
        startDate: date,
        endDate: date,
      });
      setShowNewEventPopover(true);
    }
  }, []);

  const handleSaveEvent = useCallback(async () => {
    console.log('=== SAVE EVENT DEBUG ===');
    console.log('popoverIsSaveable:', popoverIsSaveable);
    console.log('saving:', saving);
    console.log('newEventData:', newEventData);
    // console.log('newEventData.teamMember:', newEventData.teamMember);
    console.log('activeEvent:', activeEvent);
    
    // For existing events, always allow save. For new events, require validation.
    if (saving || (!activeEvent?.id && !popoverIsSaveable)) return;
    
    try {
      setSaving(true);
      console.log('saving:', saving);      
      if (activeEvent?.id) {
        // Update existing event
        console.log('Updating event with data:', newEventData);

        // Handle recurring event instances differently
        if (activeEvent.isInstance && activeEvent.originalEventId) {
          // For now, we can't update individual instances - only the whole series
          console.warn('Updating individual recurring instances not yet implemented');
          console.log('Would update the entire recurring series with ID:', activeEvent.originalEventId);

          // For now, update the original recurring event (entire series)
          const baseUuid = getBaseUuid(activeEvent.originalEventId || activeEvent.id || '');
          await safeUpdateEvent(baseUuid, newEventData);
          console.log('Recurring series updated successfully');
        } else {
          // Regular event update
          await safeUpdateEvent(activeEvent.id, newEventData);
          console.log('Event updated successfully');
        }
      } else {
        // Create new event
        console.log('Creating event with data:', newEventData);
        await safeCreateEvent(newEventData);
        console.log('Event created successfully');
      }

      // Only close popover for new events, keep it open for existing event updates
      if (!activeEvent?.id) {
        handleClosePopover();
      }
    } catch (err) {
      console.error('Failed to save event:', err);
    } finally {
      setSaving(false);
    }
  }, [newEventData, activeEvent, safeUpdateEvent, safeCreateEvent, popoverIsSaveable, saving, handleClosePopover]);

  const handleDeleteEvent = useCallback(async () => {
    if (!activeEvent?.id || saving) return;

    try {
      setSaving(true);

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
      setSaving(false);
    }
  }, [activeEvent, safeDeleteEvent, saving, handleClosePopover]);

  // console.log('TeamCalendarPage - All events from database:', availabilityEvents.length);
  // console.log('TeamCalendarPage - Event details:', availabilityEvents.map(e => ({
  //   id: e.id,
  //   teamMemberObject: e.teamMember,
  //   teamMember: `${e.teamMember.firstName} ${e.teamMember.lastName}`,
  //   eventType: e.eventType,
  //   startDate: e.startDate
  // })));

  // console.log('TeamCalendarPage - Selected team members:', selectedTeamMembers);
  // console.log('TeamCalendarPage - Available team members:', teamMembers.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim()));

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
    teamMembers,
    availabilityEvents,
    loading: teamMembersLoading,
    error: teamMembersError,

    // Team member selection
    selectedTeamMembers,
    handleSelectionChange,
    handleTeamMemberFilter,

    // Popover state
    showNewEventPopover,
    popoverIsSaveable,
    newEventData,
    popoverTarget,
    activeEvent,
    saving,
    newEventButtonRef,

    // Event handlers
    handleNewEventPopoverOpen,
    handleNewEventDataChange,
    handleEventClickFromGrid,
    handleClosePopover,
    handleDayClick,
    handleNewEventClick,
    handleSaveEvent,
    handleDeleteEvent,
    setPopoverIsSaveable,
  };
};