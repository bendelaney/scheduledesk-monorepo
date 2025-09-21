import { useState, useEffect, useRef, useCallback } from 'react';
import { TeamMember, AvailabilityEvent } from '@/types';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import { useAvailabilityEvents } from '@/lib/supabase/hooks/useAvailabilityEvents';

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
  const [activeEvent, setActiveEvent] = useState<AvailabilityEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const newEventButtonRef = useRef<HTMLButtonElement>(null);

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
    setNewEventData(data);
    console.log('New event data changed:', data);
    console.log('Team member in data:', data.teamMember);
  }, []);

  const handleEventClickFromGrid = useCallback((event: AvailabilityEvent, targetEl?: HTMLElement) => {
    if (targetEl) {
      setPopoverTarget({ current: targetEl });
      setActiveEvent(event);
      setNewEventData(event);
      setShowNewEventPopover(true);
    }
  }, []);

  const handleClosePopover = useCallback(() => {
    setShowNewEventPopover(false);
    setActiveEvent(null);
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
      setActiveEvent(null);

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
    console.log('newEventData.teamMember:', newEventData.teamMember);
    console.log('activeEvent:', activeEvent);

    if (!popoverIsSaveable || saving) return;

    try {
      setSaving(true);

      if (activeEvent?.id) {
        // Update existing event
        console.log('Updating event with data:', newEventData);
        await safeUpdateEvent(activeEvent.id, newEventData);
        console.log('Event updated successfully');
      } else {
        // Create new event
        console.log('Creating event with data:', newEventData);
        await safeCreateEvent(newEventData);
        console.log('Event created successfully');
      }

      handleClosePopover();
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
      await safeDeleteEvent(activeEvent.id);
      console.log('Event deleted successfully');
      handleClosePopover();
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setSaving(false);
    }
  }, [activeEvent, safeDeleteEvent, saving, handleClosePopover]);

  console.log('TeamCalendarPage - All events from database:', availabilityEvents.length);
  console.log('TeamCalendarPage - Event details:', availabilityEvents.map(e => ({
    id: e.id,
    teamMemberObject: e.teamMember,
    teamMember: `${e.teamMember.firstName} ${e.teamMember.lastName}`,
    eventType: e.eventType,
    startDate: e.startDate
  })));

  console.log('TeamCalendarPage - Selected team members:', selectedTeamMembers);
  console.log('TeamCalendarPage - Available team members:', teamMembers.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim()));

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