import { useState, useEffect } from 'react';
import { TeamMember } from '@/types';
import { getMergedTeamMembers } from '../services/teamMembers';

interface UseTeamMembersResult {
  data: TeamMember[];
  loading: boolean;
  error: string | null;
  needsJobberReauth: boolean;
  refetch: () => Promise<void>;
}

export const useTeamMembers = (): UseTeamMembersResult => {
  const [data, setData] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsJobberReauth, setNeedsJobberReauth] = useState(false);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsJobberReauth(false);
      const teamMembers = await getMergedTeamMembers();
      setData(teamMembers);
    } catch (err: any) {
      console.error('useTeamMembers error:', err);

      // Check if it's a 401 auth error
      if (err.status === 401) {
        setNeedsJobberReauth(true);
        setError('Jobber authentication required');

        // Try to load from cache
        try {
          const { getJobberUsersFromCache, getTeamMembersFromDb } = await import('../services/teamMembers');
          const [jobberUsers, teamMembers] = await Promise.all([
            getJobberUsersFromCache(),
            getTeamMembersFromDb()
          ]);

          // Simple merge for cached data
          const mergedData = jobberUsers.map((jobberUser: any) => {
            const jobberId = jobberUser.jobber_id;
            const internalData = teamMembers.find((tm: any) => tm.jobber_user_id === jobberId);
            return {
              id: jobberId,
              firstName: internalData?.first_name || jobberUser.name?.first || '',
              lastName: internalData?.last_name || jobberUser.name?.last || '',
              displayName: internalData?.display_name || jobberUser.name?.full,
              email: typeof jobberUser.email === 'string' ? jobberUser.email : jobberUser.email?.raw || '',
              phone: '',
              jobberId: jobberId,
              avatarUri: internalData?.avatar_uri || '',
              highlightId: '',
            } as TeamMember;
          });

          setData(mergedData.sort((a, b) => (a.firstName > b.firstName) ? 1 : -1));
        } catch (cacheErr) {
          console.error('Cache fallback failed:', cacheErr);
          setData([]);
        }
      } else {
        setError(err.message || 'Failed to fetch team members');

        // Fallback to static data on other errors
        try {
          const { default: staticData } = await import('@/data/teamMembersData');
          setData(staticData);
          setError('Using fallback data - database connection failed');
        } catch (staticErr) {
          console.error('Static data fallback failed:', staticErr);
          setData([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchTeamMembers();
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    data,
    loading,
    error,
    needsJobberReauth,
    refetch
  };
};