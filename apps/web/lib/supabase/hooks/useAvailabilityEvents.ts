import { useState, useEffect } from 'react';
import { getAvailabilityEvents } from '../services/availabilityEvents';

interface UseAvailabilityEventsResult {
  data: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAvailabilityEvents = (teamMemberId?: string): UseAvailabilityEventsResult => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const events = await getAvailabilityEvents(teamMemberId);
      setData(events);
    } catch (err: any) {
      console.error('useAvailabilityEvents error:', err);
      setError(err.message || 'Failed to fetch availability events');
      
      // Fallback to static data on error
      try {
        const { default: staticData } = await import('@/data/availabilityEventsData');
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
    await fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, [teamMemberId]);

  return {
    data,
    loading,
    error,
    refetch
  };
};