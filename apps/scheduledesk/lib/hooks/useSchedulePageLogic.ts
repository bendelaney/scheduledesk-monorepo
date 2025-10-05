import { useState, useEffect, useCallback, useRef } from 'react';
import { transformJobberToScheduleDocument } from '@/utils/jobberTransform';
import { ScheduleDocument } from '@/types';

// Helper functions for date handling
const getNextSunday = (): Date => {
  const now = new Date();
  const day = now.getDay();
  let daysUntilSunday = (7 - day) % 7;
  if (daysUntilSunday === 0) daysUntilSunday = 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0);
  return nextSunday;
};

const getFollowingFriday = (fromSunday: Date): Date => {
  const friday = new Date(fromSunday);
  friday.setDate(fromSunday.getDate() + 5);
  friday.setHours(23, 59, 59, 999);
  return friday;
};

interface UseSchedulePageLogicResult {
  // Data
  startDate: Date | null;
  endDate: Date | null;
  scheduleData: ScheduleDocument | null;
  isLoading: boolean;
  error: string | null;
  
  // Handlers
  handleDateChange: (newStartDate: Date, newEndDate: Date) => void;
  handleRefresh: () => void;
}

export const useSchedulePageLogic = (): UseSchedulePageLogicResult => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Initialize with default Sunday-Friday range
  useEffect(() => {
    const defaultStart = getNextSunday();
    const defaultEnd = getFollowingFriday(defaultStart);
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  const fetchScheduleData = useCallback(async (start: Date, end: Date) => {
    setIsLoading(true);
    setError(null);

    // Format dates for API call using UTC
    const formatUTCDate = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Create end date + 1 day for proper range
    const endDatePlusOne = new Date(end);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
    endDatePlusOne.setHours(0, 0, 0, 0);

    const startDateStr = formatUTCDate(start);
    const extendedEndDate = formatUTCDate(endDatePlusOne);

    const startParam = startDateStr + "T00:00:00Z";
    const endParam = extendedEndDate + "T00:00:00Z";

    try {
      const response = await fetch(
        `/api/schedule-visits?startDate=${encodeURIComponent(startParam)}&endDate=${encodeURIComponent(endParam)}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (response.status === 401) {
        setError('Not authenticated. Please connect to Jobber first.');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch schedule data.");
      }

      const responseData = await response.json();
      console.log('Schedule API Response:', responseData);

      if (responseData.errors) {
        console.error('GraphQL Errors:', responseData.errors);
        setError('Error fetching schedule data from Jobber.');
        setIsLoading(false);
        return;
      }
      
      // Transform Jobber data to ScheduleDocument format
      const transformedData = transformJobberToScheduleDocument(responseData, start, end);
      console.log('Transformed Schedule Data:', transformedData);
      setScheduleData(transformedData);
      
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      setError("Error fetching schedule data. Please try again.");
    } finally {
      setIsLoading(false);
      lastFetchRef.current = Date.now();
    }
  }, []);

  // Fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchScheduleData(startDate, endDate);
    }
  }, [startDate, endDate, fetchScheduleData]);

  // Handlers
  const handleDateChange = useCallback((newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  const handleRefresh = useCallback(() => {
    if (startDate && endDate) {
      fetchScheduleData(startDate, endDate);
    }
  }, [startDate, endDate, fetchScheduleData]);

  return {
    // Data
    startDate,
    endDate,
    scheduleData,
    isLoading,
    error,
    
    // Handlers
    handleDateChange,
    handleRefresh,
  };
};
