import { supabase } from '../client';

export const getAvailabilityEvents = async (teamMemberId?: string) => {
  let query = supabase
    .from('availability_events')
    .select('*');
    
  if (teamMemberId) {
    query = query.eq('team_member_id', teamMemberId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching availability events:', error);
    throw error;
  }
  
  return data || [];
};

export const createAvailabilityEvent = async (event: {
  team_member_id: string;
  event_type: string;
  custom_event_name?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  recurrence?: string;
  monthly_recurrence?: any;
}) => {
  const { data, error } = await supabase
    .from('availability_events')
    .insert(event)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating availability event:', error);
    throw error;
  }
  
  return data;
};

export const updateAvailabilityEvent = async (id: string, updates: {
  event_type?: string;
  custom_event_name?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  recurrence?: string;
  monthly_recurrence?: any;
}) => {
  const { data, error } = await supabase
    .from('availability_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating availability event:', error);
    throw error;
  }
  
  return data;
};

export const deleteAvailabilityEvent = async (id: string) => {
  const { error } = await supabase
    .from('availability_events')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting availability event:', error);
    throw error;
  }
};