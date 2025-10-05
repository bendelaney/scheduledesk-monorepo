import { supabase } from '../client';
import { TeamMember } from '@/types';

// Team member CRUD operations for internal data
export const getTeamMembersFromDb = async () => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*');
    
  if (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
  
  return data || [];
};

export const createTeamMember = async (teamMember: {
  first_name: string;
  last_name?: string;
  display_name?: string;
  avatar_uri?: string;
  jobber_user_id?: string;
}) => {
  const { data, error } = await supabase
    .from('team_members')
    .insert(teamMember)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
  
  return data;
};

export const updateTeamMember = async (id: string, updates: {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_uri?: string;
  jobber_user_id?: string;
}) => {
  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
  
  return data;
};

export const deleteTeamMember = async (id: string) => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

// Jobber data caching operations
export const getJobberUsersFromCache = async () => {
  const { data, error } = await supabase
    .from('jobber_users')
    .select('*');

  if (error) {
    console.error('Error fetching jobber users from cache:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetches users from Jobber API via server route
 * This will also update the cache in Supabase
 * Throws with status code if authentication fails (401)
 */
export const getJobberUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/jobber/users');

    // Handle 401 specially - throw to trigger reauth
    if (response.status === 401) {
      const error = new Error('Jobber authentication required');
      (error as any).status = 401;
      throw error;
    }

    if (!response.ok) {
      console.warn('Failed to fetch from Jobber API, falling back to cache');
      return getJobberUsersFromCache();
    }

    const result = await response.json();
    return result.users || [];
  } catch (error: any) {
    // Re-throw 401 errors to trigger reauth modal
    if (error.status === 401) {
      throw error;
    }

    console.error('Error fetching Jobber users from API:', error);
    console.log('Falling back to cached data...');
    return getJobberUsersFromCache();
  }
};

export const syncJobberUser = async (jobberUser: {
  jobber_id: string;
  name: any;
  email?: string;
}) => {
  // Check if user exists
  const { data: existing } = await supabase
    .from('jobber_users')
    .select('id')
    .eq('jobber_id', jobberUser.jobber_id)
    .single();

  const userData = {
    jobber_id: jobberUser.jobber_id,
    name: jobberUser.name,
    email: jobberUser.email,
    last_sync: new Date().toISOString()
  };

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('jobber_users')
      .update(userData)
      .eq('jobber_id', jobberUser.jobber_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating jobber user:', error);
      throw error;
    }
    return data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('jobber_users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting jobber user:', error);
      throw error;
    }
    return data;
  }
};

// Core service: Merge Jobber data with internal team member data
// This replaces your convertAndMergeData function
export const getMergedTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    // console.log('🔄 Fetching team members from Supabase...');
    
    // Fetch both data sources in parallel
    const [jobberUsers, teamMembers] = await Promise.all([
      getJobberUsers(),
      getTeamMembersFromDb()
    ]);
    
    // console.log(`📊 Found ${jobberUsers.length} Jobber users, ${teamMembers.length} internal team members`);
    
    // Merge the data similar to your convertAndMergeData function
    const mergedData = jobberUsers.map((jobberUser: any) => {
      // Normalize ID - could be from API (user.id) or cache (user.jobber_id)
      const jobberId = jobberUser.id || jobberUser.jobber_id;

      // Find matching internal team member data
      const internalData = teamMembers.find((tm: any) => tm.jobber_user_id === jobberId);

      // Get email - handle both raw string and nested object
      const emailValue = typeof jobberUser.email === 'string'
        ? jobberUser.email
        : jobberUser.email?.raw || '';

      const merged = {
        id: jobberId,
        firstName: internalData?.first_name || jobberUser.name?.first || '',
        lastName: internalData?.last_name || jobberUser.name?.last || '',
        displayName: internalData?.display_name || jobberUser.name?.full,
        email: emailValue,
        phone: '', // Phone not in current migration
        jobberId: jobberId,
        avatarUri: internalData?.avatar_uri || '',
        highlightId: '', // Will add this field later
      } as TeamMember;

      // console.log('🔗 Merged member:', merged.firstName, merged.lastName);
      return merged;
    });
    
    // Sort by firstName like your original code
    const sorted = mergedData.sort((a, b) => (a.firstName > b.firstName) ? 1 : -1);
    
    // console.log(`✅ Returning ${sorted.length} merged team members`);
    return sorted;
    
  } catch (error) {
    console.error('❌ Error getting merged team members:', error);
    throw error;
  }
};