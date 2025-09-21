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

interface UseAvailabilityEventsResult {
  data: AvailabilityEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createEvent: (eventData: Partial<AvailabilityEvent>) => Promise<AvailabilityEvent>;
  updateEvent: (id: string, updates: Partial<AvailabilityEvent>) => Promise<AvailabilityEvent>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useAvailabilityEvents = (teamMemberId?: string): UseAvailabilityEventsResult => {
  const [data, setData] = useState<AvailabilityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: teamMembers } = useTeamMembers();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

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
      console.log('Fetched events from database:', dbEvents.length);

      // Convert database events to frontend format
      const convertedEvents = await Promise.all(
        dbEvents.map(dbEvent => eventFromDatabase(dbEvent, teamMembers))
      );

      console.log('Converted events to frontend format:', convertedEvents.length);
      setData(convertedEvents);
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

        setData(filteredStaticData);
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
      setData(prev => [...prev, newEvent]);
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
      setData(prev => prev.map(event =>
        event.id === id ? updatedEvent : event
      ));
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
      setData(prev => prev.filter(event => event.id !== id));
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