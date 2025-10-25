'use client';

import React, {useEffect} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import AppFrame from '@/components/AppFrame';
import JobberReauthModal from '@/components/JobberReauthModal';
import TeamCalendar from '@/components/TeamCalendar';
import TeamMemberList from '@/components/TeamMemberList';
import MainNavigationConfig from '@/config/MainNavigation';
import CalendarPopover from '@/components/CalendarPopover';
import './TeamCalendarPage.scss';
import { CirclePlus } from '@/components/Icons';
import { useTeamCalendarPageLogic } from '@/lib/hooks/useTeamCalendarPageLogic';
import { CalendarUIProvider } from '@/contexts/CalendarUIContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useSidebarState } from '@/hooks/useSidebarState';

function TeamCalendarPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useSidebarState('sidebar:team-calendar', false);

  // Format date from 'YYYY-MM-DD' to 'Month Day'
  const formatDate = (dateStr: string): string => {
    return format(parseISO(dateStr), 'MMMM d');
  };

  // Use custom hook to get all data and handlers (now inside the provider)
  const {
    teamMembers,
    availabilityEvents,
    loading,
    error,
    needsJobberReauth,
    refetch,
    selectedTeamMembers,
    showNewEventPopover,
    popoverIsSaveable,
    newEventData,
    popoverTarget,
    activeEvent,
    newEventButtonRef,
    handleSelectionChange,
    handleTeamMemberFilter,
    handleNewEventPopoverOpen,
    handleNewEventDataChange,
    handleEventClickFromGrid,
    handleClosePopover,
    handleDayClick,
    handleNewEventClick,
    handleSaveEvent,
    handleDeleteEvent,
    setPopoverIsSaveable,
    dayViewOpen,
    selectedDates
  } = useTeamCalendarPageLogic();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // 'n' key to create new event (Priority 20)
  useKeyboardShortcut(
    'n',
    () => { handleNewEventPopoverOpen(); },
    20,
    [handleNewEventPopoverOpen],
    { id: 'team-calendar-new-event' }
  );

  return (
    <AppFrame
      className="team-calendar-page"
      sidebarOpen={sidebarOpen}
      onSidebarToggle={setSidebarOpen}
      topBarLeftContent={
        <button
          ref={newEventButtonRef}
          className="new-event-button"
          onClick={() => handleNewEventPopoverOpen()}
          title="Add new event - N"
        >
          <CirclePlus />
        </button>
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
      // topBarRightContent={<div>Right</div>}
      sidebarContent={
        <TeamMemberList
          teamMembers={teamMembers}
          selectedMembers={selectedTeamMembers}
          onSelectionChange={handleSelectionChange}
          onFilterChange={handleTeamMemberFilter}
          showToggleAll={true}
          showFilterField={true}
          selectionMode="filter"
        />
      }
    >
      <TeamCalendar
        className={`${sidebarOpen ? 'with-sidebar' : 'full-width'} team-calendar-component ${dayViewOpen ? 'day-view-open' : ''}`}
        selectedTeamMembers={selectedTeamMembers}
        onSelectionChange={handleSelectionChange}
        onEventClick={handleEventClickFromGrid}
        onDayClick={handleDayClick}
        onNewEventClick={handleNewEventClick}
        activeEvent={activeEvent}
        events={availabilityEvents}
        loading={loading}
        error={error || null}
        selectedDates={selectedDates}
      />

      {/* Day View */}
      {dayViewOpen && (
        <div className="day-view-panel">
          <h2>{selectedDates[0] ? format(parseISO(selectedDates[0]), 'MMMM d') : ''}</h2>
        </div>
      )}

      {/* New Event Popover */}
      <CalendarPopover
        show={showNewEventPopover}
        target={popoverTarget}
        activeEvent={activeEvent}
        eventEditorValues={newEventData}
        onClose={handleClosePopover}
        onChange={handleNewEventDataChange}
        onSaveableChange={setPopoverIsSaveable}
        isSaveable={popoverIsSaveable}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        teamMembers={teamMembers}
      />
      {needsJobberReauth && (
        <JobberReauthModal
          onClose={() => {}}
          onReauthSuccess={refetch}
        />
      )}
    </AppFrame>
  );
}

export default function TeamCalendarPage() {
  return (
    <CalendarUIProvider>
      <TeamCalendarPageContent />
    </CalendarUIProvider>
  );
}