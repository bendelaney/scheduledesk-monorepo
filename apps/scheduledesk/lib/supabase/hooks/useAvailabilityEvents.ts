import { useState, useEffect } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import {
  getAvailabilityEvents,
  createAvailabilityEvent,
  updateAvailabilityEvent,
  deleteAvailabilityEvent
} from '../services/availabilityEvents';
import { eventToDatabase, eventFromDatabase, validateEvent, getTeamMemberDbId } from '../adapters/eventAdapters';
import { useTeamMembers } from './useTeamMembers';
import { expandAllRecurringEvents, getDefaultExpansionRange } from '@/lib/recurrence/RecurrenceExpander';

interface UseAvailabilityEventsResult {
  data: AvailabilityEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createEvent: (eventData: Partial<AvailabilityEvent>) => Promise<AvailabilityEvent>;
  updateEvent: (id: string, updates: Partial<AvailabilityEvent>) => Promise<AvailabilityEvent>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useAvailabilityEvents = (teamMemberId?: string | null): UseAvailabilityEventsResult => {
  const [data, setData] = useState<AvailabilityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: teamMembers } = useTeamMembers();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // If teamMemberId is null, don't fetch anything yet (team member page waiting for member to be found)
      // If teamMemberId is undefined, fetch all events (team calendar page)
      // If teamMemberId is a string, fetch filtered events (team member page with specific member)
      if (teamMemberId === null) {
        setData([]);
        setLoading(false);
        return;
      }

      let dbTeamMemberId = teamMemberId;

      // If teamMemberId is provided and looks like a Jobber ID, convert it to database UUID
      if (teamMemberId && teamMemberId.startsWith('Z2lk')) {
        console.log('Converting Jobber ID to database UUID:', teamMemberId);
        const dbId = await getTeamMemberDbId(teamMemberId);
        if (!dbId) {
          throw new Error(`Could not find database record for team member: ${teamMemberId}`);
        }
        dbTeamMemberId = dbId;
        console.log('Using database UUID for query:', dbTeamMemberId);
      }

      const dbEvents = await getAvailabilityEvents(dbTeamMemberId);
      // console.log('Fetched events from database:', dbEvents.length);

      // Convert database events to frontend format
      const convertedEvents = await Promise.all(
        dbEvents.map(dbEvent => eventFromDatabase(dbEvent, teamMembers))
      );

      // Expand recurring events for calendar display
      const { startDate, endDate } = getDefaultExpansionRange();
      const expandedEvents = expandAllRecurringEvents(convertedEvents, startDate, endDate);

      setData(expandedEvents);
      setError(null); // Clear any previous errors on successful fetch
    } catch (err: any) {
      console.error('useAvailabilityEvents error:', err);
      setError(err.message || 'Failed to fetch availability events');

      // Fallback to static data on error
      try {
        const { default: staticData } = await import('@/data/availabilityEventsData');
        console.log('Using static fallback data:', staticData.length, 'events');

        // Filter static data by teamMemberId if provided
        const filteredStaticData = teamMemberId
          ? staticData.filter(event => event.teamMember.id === teamMemberId)
          : staticData;

        // Expand recurring events in static data too
        const { startDate, endDate } = getDefaultExpansionRange();
        const expandedStaticData = expandAllRecurringEvents(filteredStaticData, startDate, endDate);

        setData(expandedStaticData);
        setError('Using fallback data - database connection failed');
      } catch (staticErr) {
        console.error('Static data fallback failed:', staticErr);
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchEvents();
  };

  const createEvent = async (eventData: Partial<AvailabilityEvent>): Promise<AvailabilityEvent> => {
    console.log('createEvent called with:', eventData);

    // Validate the event data
    const validationErrors = validateEvent(eventData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    try {
      // Get the database UUID for the team member using their Jobber ID
      let jobberUserId = eventData.teamMember?.id;

      // If no ID, try to find the team member by name
      if (!jobberUserId && eventData.teamMember?.firstName && eventData.teamMember?.lastName) {
        const fullName = `${eventData.teamMember.firstName} ${eventData.teamMember.lastName}`.trim();
        const foundMember = teamMembers.find(tm => {
          const memberName = `${tm.firstName} ${tm.lastName || ''}`.trim();
          return memberName === fullName;
        });

        if (foundMember) {
          jobberUserId = foundMember.id;
          console.log('Found team member by name:', fullName, '-> ID:', jobberUserId);
        }
      }

      if (!jobberUserId) {
        throw new Error('Team member ID is required');
      }

      console.log('Looking up database ID for Jobber ID:', jobberUserId);
      const teamMemberDbId = await getTeamMemberDbId(jobberUserId);

      if (!teamMemberDbId) {
        throw new Error(`Could not find database record for team member: ${jobberUserId}`);
      }

      console.log('Found database ID:', teamMemberDbId);

      // Convert to database format with correct team member ID
      const dbFormat = eventToDatabase(eventData, teamMemberDbId);
      console.log('Database format:', dbFormat);

      const newDbEvent = await createAvailabilityEvent(dbFormat as any);
      console.log('Created event in database:', newDbEvent);

      // Convert back to frontend format
      const newEvent = await eventFromDatabase(newDbEvent, teamMembers);
      console.log('Converted new event to frontend format:', newEvent);

      // Use optimistic update for immediate UI feedback
      console.log('Adding new event to state optimistically');

      if (newEvent.recurrence) {
        // If it's a recurring event, expand it immediately
        console.log('New event is recurring, expanding instances...');
        const { startDate, endDate } = getDefaultExpansionRange();
        const expandedEvents = expandAllRecurringEvents([newEvent], startDate, endDate);
        console.log('Expanded new recurring event into', expandedEvents.length, 'instances');

        setData(prev => [...prev, ...expandedEvents]);
      } else {
        // Regular event
        setData(prev => [...prev, newEvent]);
      }

      setError(null);

      return newEvent;
    } catch (err: any) {
      console.error('createEvent error:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<AvailabilityEvent>): Promise<AvailabilityEvent> => {
    try {

      // If updating team member, need to get database ID
      let teamMemberDbId: string | undefined;
      if (updates.teamMember?.id) {
        const dbId = await getTeamMemberDbId(updates.teamMember.id);
        if (!dbId) {
          throw new Error(`Could not find database record for team member: ${updates.teamMember.id}`);
        }
        teamMemberDbId = dbId;
      }

      const dbFormat = eventToDatabase(updates, teamMemberDbId);
      const updatedDbEvent = await updateAvailabilityEvent(id, dbFormat as any);

      // Convert back to frontend format
      const updatedEvent = await eventFromDatabase(updatedDbEvent, teamMembers);

      // Use optimistic update for immediate UI feedback
      if (updatedEvent.recurrence) {
        // If updating a recurring event, we need to re-expand all instances
        console.log('Updated event is recurring, re-expanding all events...');
        setData(prev => {
          // Remove all instances of the event being updated
          const withoutUpdatedEvent = prev.filter(event =>
            !(event.originalEventId === id || event.id === id)
          );

          // Group remaining events by originalEventId to reconstruct base events
          const eventGroups = new Map<string, any[]>();
          const nonRecurringEvents: any[] = [];

          for (const event of withoutUpdatedEvent) {
            if (event.isInstance && event.originalEventId) {
              // This is a recurring event instance
              if (!eventGroups.has(event.originalEventId)) {
                eventGroups.set(event.originalEventId, []);
              }
              eventGroups.get(event.originalEventId)!.push(event);
            } else {
              // This is a non-recurring event
              nonRecurringEvents.push(event);
            }
          }

          // Reconstruct base events from the first instance of each group
          const baseEvents: any[] = [];
          for (const [originalEventId, instances] of Array.from(eventGroups)) {
            if (instances.length > 0) {
              const firstInstance = instances[0];
              const baseEvent = {
                ...firstInstance,
                id: originalEventId,
                isInstance: false,
                isRecurring: false,
                originalEventId: undefined
              };
              baseEvents.push(baseEvent);
            }
          }

          // Combine non-recurring events, reconstructed base events, and the updated event
          const allBaseEvents = [...nonRecurringEvents, ...baseEvents, updatedEvent];

          // Re-expand all recurring events
          const { startDate, endDate } = getDefaultExpansionRange();
          return expandAllRecurringEvents(allBaseEvents, startDate, endDate);
        });
      } else {
        // Regular event update
        setData(prev => prev.map(event =>
          event.id === id ? updatedEvent : event
        ));
      }
      setError(null);

      return updatedEvent;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      await deleteAvailabilityEvent(id);

      // Use optimistic update for immediate UI feedback
      // Remove the base event and all its instances
      setData(prev => prev.filter(event =>
        event.id !== id && event.originalEventId !== id
      ));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchEvents();
    }
  }, [teamMemberId, teamMembers]);

  return {
    data,
    loading,
    error,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent
  };
};