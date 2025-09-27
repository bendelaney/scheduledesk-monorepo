import { supabase } from '../client';

// Database schema for normal_schedule_events table
export interface NormalScheduleEventDB {
  id: string;
  jobber_user_id: string; // Changed from team_member_id UUID to Jobber ID
  day_of_week: string; // 'sunday', 'monday', etc.
  event_type: string;
  custom_event_name?: string;
  start_time?: string;
  end_time?: string;
  all_day: boolean;
  recurrence?: string;
  monthly_recurrence?: any; // JSON field
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const getNormalScheduleEvents = async (jobberUserId: string) => {
  const { data, error } = await supabase
    .from('normal_schedule_events')
    .select('*')
    .eq('jobber_user_id', jobberUserId);

  if (error) {
    console.error('Error fetching normal schedule events:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      jobberUserId: jobberUserId
    });
    throw error;
  }

  return data || [];
};

export const createNormalScheduleEvent = async (event: Omit<NormalScheduleEventDB, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('normal_schedule_events')
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error('Error creating normal schedule event:', error);
    throw error;
  }

  return data;
};

export const updateNormalScheduleEvent = async (id: string, updates: Partial<NormalScheduleEventDB>) => {
  const { data, error } = await supabase
    .from('normal_schedule_events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating normal schedule event:', error);
    throw error;
  }

  return data;
};

export const deleteNormalScheduleEvent = async (id: string) => {
  const { error } = await supabase
    .from('normal_schedule_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting normal schedule event:', error);
    throw error;
  }
};