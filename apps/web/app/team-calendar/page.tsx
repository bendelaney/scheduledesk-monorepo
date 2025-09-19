'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {TeamMember, AvailabilityEvent} from '@/types';
import AppFrame from '@/components/AppFrame';
import TeamCalendar from '@/components/TeamCalendar';
import TeamMemberList from '@/components/TeamMemberList';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import MainNavigationConfig from '@/config/MainNavigation';
import CalendarPopover from '@/components/CalendarPopover';
import './TeamCalendarPage.scss';
import PlusCircle from '@/components/Icons/PlusCircle';

export default function TeamCalendarPage() {
  const router = useRouter();
  const pathname = usePathname();
  // TODO: we should integrate the loading and error states below somewhere.
  const { data: teamMembersData, loading: teamMembersLoading, error: teamMembersError } = useTeamMembers();

  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  
  // Event Popover state
  const [showNewEventPopover, setShowNewEventPopover] = useState(false);
  const [popoverIsSaveable, setPopoverIsSaveable] = useState(false);
  const [newEventData, setNewEventData] = useState<Partial<AvailabilityEvent>>({});
  const [popoverTarget, setPopoverTarget] = useState<{ current: HTMLElement | null }>({ current: null });
  const [activeEvent, setActiveEvent] = useState<AvailabilityEvent | null>(null);
  const newEventButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize selected team members when data loads
  useEffect(() => {
    if (teamMembersData.length > 0 && selectedTeamMembers.length === 0) {
      setSelectedTeamMembers(
        teamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
      );
    }
  }, [teamMembersData, selectedTeamMembers.length]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleSelectionChange = (selected: string[]) => {
    setSelectedTeamMembers(selected);
  };

  const handleTeamMemberFilter = (filter: string, filteredTeamMembers: TeamMember[]) => {
    console.log('Team member filter changed:', filter, filteredTeamMembers);
    // I want to make it so that the TeamCalendar automatically shows only the filtered team membrers
    setSelectedTeamMembers(filteredTeamMembers.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim()));
  };

  const handleNewEventPopoverOpen = () => {
    if (newEventButtonRef.current) {
      setPopoverTarget({ current: newEventButtonRef.current });
      setShowNewEventPopover(true);
    }
  };

  const handleNewEventDataChange = (data: Partial<AvailabilityEvent>) => {
    setNewEventData(data);
    console.log('New event data:', data);
  };

  const handleEventClickFromGrid = useCallback((event: AvailabilityEvent, targetEl?: HTMLElement) => {
    if (targetEl) {
      setPopoverTarget({ current: targetEl });
      setActiveEvent(event);
      setNewEventData(event);
      setShowNewEventPopover(true);
    }
  }, []);

  const handleClosePopover = useCallback(() => {
    setShowNewEventPopover(false);
    setActiveEvent(null);
    setNewEventData({});
    setPopoverTarget({ current: null });
  }, []);

  const handleDayClick = useCallback((date: string) => {
    console.log('Day clicked:', date);
  }, []);

  const handleNewEventClick = useCallback((date: string, targetEl: HTMLElement) => {
    console.log('New event clicked for date:', date, 'Target:', targetEl);
    if (targetEl) {
      setPopoverTarget({ current: targetEl });
      setActiveEvent(null);
      setNewEventData({
        startDate: date,
        endDate: date,
      });
      setShowNewEventPopover(true);
    }
  }, []);

  return (
    <AppFrame
      className="team-calendar-page"
      topBarLeftContent={
        <button
          ref={newEventButtonRef}
          className="new-event-button"
          onClick={() => handleNewEventPopoverOpen()}
          title="Add new event"
        >
          <PlusCircle />
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
          teamMembers={teamMembersData}
          selectedMembers={selectedTeamMembers}
          onSelectionChange={handleSelectionChange}
          onFilterChange={handleTeamMemberFilter}
          togglable={true}
          filterable={true}
        />
      }
      sidebarOpen={false}
      // sidebarWidth="240px"
    >
      <TeamCalendar
        selectedTeamMembers={selectedTeamMembers}
        onSelectionChange={handleSelectionChange}
        onEventClick={handleEventClickFromGrid}
        onDayClick={handleDayClick}
        onNewEventClick={handleNewEventClick}
        activeEvent={activeEvent}
      />
      
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
      />
    </AppFrame>
  );
}