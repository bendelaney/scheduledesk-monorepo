import { useState, useEffect, useRef, useCallback } from 'react';
import { TeamMember, AvailabilityEvent } from '@/types';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import { useAvailabilityEvents } from '@/lib/supabase/hooks/useAvailabilityEvents';

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
  saving: boolean;
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

  // Events data and CRUD functions
  const {
    data: availabilityEvents,
    loading: eventsLoading,
    error: eventsError,
    createEvent,
    updateEvent,
    deleteEvent
  } = useAvailabilityEvents(teamMember?.id);

  // Safe CRUD functions
  const safeCreateEvent = createEvent || (async () => { throw new Error('Create function not ready'); });
  const safeUpdateEvent = updateEvent || (async () => { throw new Error('Update function not ready'); });
  const safeDeleteEvent = deleteEvent || (async () => { throw new Error('Delete function not ready'); });

  // Popover state
  const [showPopover, setShowPopover] = useState(false);
  const [popoverIsSaveable, setPopoverIsSaveable] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<{ current: HTMLElement | null }>({ current: null });
  const [activeEvent, setActiveEvent] = useState<AvailabilityEvent | null>(null);
  const [eventEditorValues, setEventEditorValues] = useState<Partial<AvailabilityEvent>>({});
  const [saving, setSaving] = useState(false);
  const newEventButtonRef = useRef<HTMLButtonElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Event handlers
  const handleEventClickFromGrid = useCallback((event: AvailabilityEvent, targetEl?: HTMLElement) => {
    if (targetEl) {
      setPopoverTarget({ current: targetEl });
      setActiveEvent(event);
      setEventEditorValues(event);
      setShowPopover(true);
    }
  }, []);

  const handleClosePopover = useCallback(() => {
    setShowPopover(false);
    setActiveEvent(null);
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
      setActiveEvent(null);

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
      setActiveEvent(null);
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
            await safeUpdateEvent(activeEvent.id!, newValues);
            console.log('Auto-save completed successfully');
          } catch (err: any) {
            console.error('Auto-save failed:', err);
          } finally {
            setSaving(false);
          }
        }, 1000);
      }

      return newValues;
    });
  }, [activeEvent, saving, safeUpdateEvent]);

  const handleSaveEvent = useCallback(async () => {
    console.log('handleSaveEvent called');
    console.log('popoverIsSaveable:', popoverIsSaveable);
    console.log('saving:', saving);
    console.log('eventEditorValues:', eventEditorValues);
    console.log('eventEditorValues.teamMember:', eventEditorValues.teamMember);
    console.log('eventEditorValues.teamMember.id:', eventEditorValues.teamMember?.id);
    console.log('activeEvent:', activeEvent);

    if (!popoverIsSaveable || saving) {
      console.log('Save aborted - not saveable or already saving');
      return;
    }

    try {
      setSaving(true);
      console.log('Starting save operation...');

      if (activeEvent?.id) {
        console.log('Updating existing event with ID:', activeEvent.id);
        await safeUpdateEvent(activeEvent.id, eventEditorValues);
        console.log('Event updated successfully');
      } else {
        console.log('Creating new event...');
        const result = await safeCreateEvent(eventEditorValues);
        console.log('Event created successfully:', result);
      }

      handleClosePopover();
    } catch (err) {
      console.error('Failed to save event:', err);
      console.error('Error details:', err);
    } finally {
      setSaving(false);
    }
  }, [eventEditorValues, activeEvent, safeUpdateEvent, safeCreateEvent, popoverIsSaveable, saving, handleClosePopover]);

  const handleDeleteEvent = useCallback(async () => {
    if (!activeEvent?.id || saving) return;

    try {
      setSaving(true);
      await safeDeleteEvent(activeEvent.id);
      console.log('Event deleted successfully');
      handleClosePopover();
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setSaving(false);
    }
  }, [activeEvent, safeDeleteEvent, saving, handleClosePopover]);

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
    saving,
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