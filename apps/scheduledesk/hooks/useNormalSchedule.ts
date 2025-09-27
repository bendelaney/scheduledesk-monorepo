'use client';

import { useState, useEffect, useCallback } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import {
  getNormalScheduleEvents,
  createNormalScheduleEvent,
  updateNormalScheduleEvent,
  deleteNormalScheduleEvent
} from '@/lib/supabase/services/normalSchedules';
import { normalEventFromDatabase, normalEventToDatabase } from '@/lib/supabase/adapters/normalScheduleAdapters';

export const useNormalSchedule = (teamMemberId: string, teamMember: TeamMember | null | undefined) => {
  const [events, setEvents] = useState<AvailabilityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load normal schedule events
  const loadEvents = useCallback(async () => {
    if (!teamMemberId || !teamMember?.id) {
      console.log('useNormalSchedule: Skipping load - no teamMemberId or teamMember');
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('useNormalSchedule: Loading events for teamMemberId:', teamMemberId);
      const dbEvents = await getNormalScheduleEvents(teamMemberId);
      const normalEvents = dbEvents.map(dbEvent => normalEventFromDatabase(dbEvent, teamMember));
      setEvents(normalEvents);
      console.log('useNormalSchedule: Successfully loaded', normalEvents.length, 'events');
    } catch (err) {
      console.error('Error loading normal schedule events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load normal schedule');
    } finally {
      setLoading(false);
    }
  }, [teamMemberId, teamMember?.id]); // Only depend on teamMember.id, not the whole object

  // Add new event to normal schedule
  const addEvent = useCallback(async (event: AvailabilityEvent) => {
    if (!teamMemberId || !teamMember) return;

    setLoading(true);
    setError(null);

    try {
      // Use teamMemberId (which is actually the Jobber ID) directly
      const dbEvent = normalEventToDatabase(event, teamMemberId);
      const createdEvent = await createNormalScheduleEvent(dbEvent);
      const normalEvent = normalEventFromDatabase(createdEvent, teamMember);

      setEvents(prev => [...prev, normalEvent]);
      return normalEvent;
    } catch (err) {
      console.error('Error adding normal schedule event:', err);
      setError(err instanceof Error ? err.message : 'Failed to add event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [teamMemberId, teamMember?.id]);

  // Update existing event
  const updateEvent = useCallback(async (eventId: string, updates: Partial<AvailabilityEvent>) => {
    if (!teamMemberId || !teamMember) return;

    setLoading(true);
    setError(null);

    try {
      // Convert updates to database format, using teamMemberId as Jobber ID
      const dbUpdates = normalEventToDatabase({ ...updates } as AvailabilityEvent, teamMemberId);
      const updatedDbEvent = await updateNormalScheduleEvent(eventId, dbUpdates);
      const updatedEvent = normalEventFromDatabase(updatedDbEvent, teamMember);

      setEvents(prev => prev.map(event =>
        event.id === eventId ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (err) {
      console.error('Error updating normal schedule event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [teamMemberId, teamMember?.id]);

  // Delete event from normal schedule
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!teamMemberId) return;

    setLoading(true);
    setError(null);

    try {
      await deleteNormalScheduleEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      console.error('Error deleting normal schedule event:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [teamMemberId]);

  // Load events when hook is initialized or teamMemberId changes
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: loadEvents
  };
};