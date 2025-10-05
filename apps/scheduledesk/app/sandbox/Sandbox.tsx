'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import AppFrame from '@/components/AppFrame';
import { DragLockProvider } from '@/components/DragDrop/DragDrop';
import { PopoverProvider } from '@/components/Popover';
import ScheduleDocument from '@/components/ScheduleDocument/ScheduleDocument';
import { transformJobberToScheduleDocument } from '@/utils/jobberTransform';

// Dynamically import CalendarDateRangePicker to avoid SSR issues with Flatpickr
const CalendarDateRangePicker = dynamic(
  () => import('@/components/CalendarDateRangePicker'),
  { ssr: false }
);

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

export default function Sandbox() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);
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

  // Refresh data when window regains focus (cooldown to reduce API calls)
  // useEffect(() => {
  //   const handleWindowFocus = () => {
  //     if (startDate && endDate && Date.now() - lastFetchRef.current > 10000) {
  //       fetchScheduleData(startDate, endDate);
  //     }
  //   };

  //   window.addEventListener('focus', handleWindowFocus);
  //   return () => window.removeEventListener('focus', handleWindowFocus);
  // }, [startDate, endDate, fetchScheduleData]);

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleRefresh = () => {
    if (startDate && endDate) {
      fetchScheduleData(startDate, endDate);
    }
  };

  const sidebarContent = (
    <div className="sandbox-sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Date Range</h3>
        {startDate && endDate && (
          <CalendarDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
        )}
      </div>
      
      {/* <div className="sidebar-section">
        <button 
          className={`refresh-button ${isLoading ? 'loading' : ''}`}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div> */}

      {error && (
        <div className="sidebar-section error">
          <p>{error}</p>
          {error.includes('Not authenticated') && (
            <button 
              className="refresh-button"
              onClick={() => window.location.href = '/api/auth/jobber'}
              style={{ marginTop: '0.5rem' }}
            >
              Connect to Jobber
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <AppFrame sidebarContent={sidebarContent}>
      <DragLockProvider>
        <PopoverProvider scrollContainerRef={{ current: null }}>
          <ScheduleDocument scheduleData={scheduleData} isLoading={isLoading} />
        </PopoverProvider>
      </DragLockProvider>
    </AppFrame>
  );
}