import { useState, useEffect } from 'react';
import { TeamMember } from '@/types';
import { getMergedTeamMembers } from '../services/teamMembers';

interface UseTeamMembersResult {
  data: TeamMember[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeamMembers = (): UseTeamMembersResult => {
  const [data, setData] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamMembers = await getMergedTeamMembers();
      setData(teamMembers);
    } catch (err: any) {
      console.error('useTeamMembers error:', err);
      setError(err.message || 'Failed to fetch team members');
      
      // Fallback to static data on error (for now)
      try {
        const { default: staticData } = await import('@/data/teamMembersData');
        setData(staticData);
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
    await fetchTeamMembers();
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    data,
    loading,
    error,
    refetch
  };
};