'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import AppFrame from '@/components/AppFrame';
import { DragLockProvider } from '@/components/DragDrop/DragDrop';
import { PopoverProvider } from '@/components/Popover';
import MainNavigationConfig from '@/config/MainNavigation';
import ScheduleDocument from '@/components/ScheduleDocument/ScheduleDocument';
import { useSchedulePageLogic } from '@/lib/hooks/useSchedulePageLogic';
import './SchedulePage.scss';

// Dynamically import CalendarDateRangePicker to avoid SSR issues with Flatpickr
const CalendarDateRangePicker = dynamic(
  () => import('@/components/CalendarDateRangePicker'),
  { ssr: false }
);

function SchedulePage() {
  const router = useRouter();
  const pathname = usePathname();

  // Use custom hook to get all data and handlers
  const {
    startDate,
    endDate,
    scheduleData,
    isLoading,
    error,
    handleDateChange,
    handleRefresh,
  } = useSchedulePageLogic();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <AppFrame 
      className="schedule-page"
      sidebarWidth="340px"
      sidebarContent={
        <div className="schedule-page--sidebar">
          <div className="sidebar-section">
            {startDate && endDate && (
              <CalendarDateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
              />
            )}
          </div>
          
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
      }
      topBarMiddleContent={
        <div className="top-bar__navigation">
          {MainNavigationConfig.map((navItem) => {
            const Icon = navItem.icon;
            const isActive = pathname === navItem.path;
            
            return (
              <button
                key={navItem.id}
                id={`main-nav-${navItem.id}`}
                className={`main-nav-button ${navItem.className} ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(navItem.path)}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      }
    >
      <DragLockProvider>
        <PopoverProvider scrollContainerRef={{ current: null }}>
          <ScheduleDocument scheduleData={scheduleData} isLoading={isLoading} />
        </PopoverProvider>
      </DragLockProvider>
    </AppFrame>
  );
}

export default SchedulePage;