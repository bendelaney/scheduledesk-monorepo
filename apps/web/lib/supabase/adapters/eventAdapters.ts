import { AvailabilityEvent, TeamMember } from '@/types';
import { supabase } from '../client';

/**
 * Data adapters for converting between frontend AvailabilityEvent format
 * and database availability_events table format
 */

// Database record type based on the schema
export interface DatabaseAvailabilityEvent {
  id: string;
  team_member_id: string;
  event_type: string;
  custom_event_name?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  all_day: boolean;
  recurrence?: string;
  monthly_recurrence?: any;
  created_at?: string;
  updated_at?: string;
}

/**
 * Convert frontend AvailabilityEvent to database format
 * teamMemberId should be the database UUID, not the Jobber ID
 */
export const eventToDatabase = (
  event: Partial<AvailabilityEvent>,
  teamMemberDbId?: string
): Partial<DatabaseAvailabilityEvent> => {
  return {
    team_member_id: teamMemberDbId || event.teamMember?.id,
    event_type: event.eventType,
    custom_event_name: event.eventType === 'Custom' ? event.customEventName : undefined,
    start_date: event.startDate,
    end_date: event.endDate || event.startDate, // Use startDate as fallback for single-day events
    start_time: event.startTime,
    end_time: event.endTime,
    all_day: event.allDay || false,
    recurrence: event.recurrence,
    monthly_recurrence: event.monthlyRecurrence ? JSON.stringify(event.monthlyRecurrence) : undefined
  };
};

/**
 * Convert database record to frontend AvailabilityEvent
 */
export const eventFromDatabase = async (
  dbEvent: DatabaseAvailabilityEvent,
  teamMembers: TeamMember[]
): Promise<AvailabilityEvent> => {
  // First try direct match (should not work since IDs are different)
  let teamMember = teamMembers.find(tm => tm.id === dbEvent.team_member_id);

  // If not found, we need to find the team member by reverse-mapping the database ID
  if (!teamMember) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('jobber_user_id')
        .eq('id', dbEvent.team_member_id)
        .single();

      if (!error && data?.jobber_user_id) {
        teamMember = teamMembers.find(tm => tm.id === data.jobber_user_id);
      }
    } catch (err) {
      console.warn('Failed to reverse-lookup team member:', err);
    }
  }

  return {
    id: dbEvent.id,
    teamMember: teamMember || { id: dbEvent.team_member_id },
    eventType: dbEvent.event_type as any,
    customEventName: dbEvent.event_type === 'Custom' ? dbEvent.custom_event_name : undefined,
    startDate: dbEvent.start_date,
    endDate: dbEvent.end_date,
    startTime: dbEvent.start_time,
    endTime: dbEvent.end_time,
    allDay: dbEvent.all_day,
    recurrence: dbEvent.recurrence as any,
    monthlyRecurrence: dbEvent.monthly_recurrence ?
      (typeof dbEvent.monthly_recurrence === 'string' ?
        JSON.parse(dbEvent.monthly_recurrence) :
        dbEvent.monthly_recurrence) :
      undefined
  };
};

/**
 * Validate event data before database operations
 */
export const validateEvent = (event: Partial<AvailabilityEvent>): string[] => {
  const errors: string[] = [];

  // Check if team member exists (either with id or with name fields)
  if (!event.teamMember?.id && !(event.teamMember?.firstName && event.teamMember?.lastName)) {
    errors.push('Team member is required');
  }
  if (!event.eventType) errors.push('Event type is required');
  if (!event.startDate) errors.push('Start date is required');

  if (event.eventType === 'Custom' && !event.customEventName) {
    errors.push('Custom event name is required');
  }

  if (!event.allDay && event.startTime && event.endTime) {
    if (event.startTime >= event.endTime) {
      errors.push('End time must be after start time');
    }
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (event.startDate && !dateRegex.test(event.startDate)) {
    errors.push('Start date must be in YYYY-MM-DD format');
  }
  if (event.endDate && !dateRegex.test(event.endDate)) {
    errors.push('End date must be in YYYY-MM-DD format');
  }

  // Validate time format (HH:MM:SS)
  const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
  if (event.startTime && !timeRegex.test(event.startTime)) {
    errors.push('Start time must be in HH:MM:SS format');
  }
  if (event.endTime && !timeRegex.test(event.endTime)) {
    errors.push('End time must be in HH:MM:SS format');
  }

  return errors;
};

/**
 * Get database UUID for a team member by Jobber ID
 */
export const getTeamMemberDbId = async (jobberUserId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('id')
      .eq('jobber_user_id', jobberUserId)
      .single();

    if (error) {
      console.error('Error finding team member by Jobber ID:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Error in getTeamMemberDbId:', err);
    return null;
  }
};