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
export const getJobberUsers = async () => {
  const { data, error } = await supabase
    .from('jobber_users')
    .select('*');
    
  if (error) {
    console.error('Error fetching jobber users:', error);
    throw error;
  }
  
  return data || [];
};

export const syncJobberUser = async (jobberUser: {
  jobber_id: string;
  name: any;
  email?: string;
}) => {
  const { data, error } = await supabase
    .from('jobber_users')
    .upsert({
      jobber_id: jobberUser.jobber_id,
      name: jobberUser.name,
      email: jobberUser.email,
      last_sync: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error syncing jobber user:', error);
    throw error;
  }
  
  return data;
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
      // Find matching internal team member data
      const internalData = teamMembers.find((tm: any) => tm.jobber_user_id === jobberUser.jobber_id);
      
      const merged = {
        id: jobberUser.jobber_id,
        firstName: internalData?.first_name || jobberUser.name?.first || '',
        lastName: internalData?.last_name || jobberUser.name?.last || '',
        displayName: internalData?.display_name || jobberUser.name?.full,
        email: jobberUser.email || '',
        phone: '', // Phone not in current migration
        jobberId: jobberUser.jobber_id,
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