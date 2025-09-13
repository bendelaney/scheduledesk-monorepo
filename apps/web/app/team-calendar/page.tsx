'use client';

import React, { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {TeamMember, AvailabilityEvent} from '@/types';
import AppFrame from '@/components/AppFrame';
import TeamCalendar from '@/components/TeamCalendar';
import TeamMemberList from '@/components/TeamMemberList';
import TeamMembersData from '@/data/teamMembersData';
import MainNavigationConfig from '@/config/MainNavigation';
import Popover from '@/components/Popover';
import Button from '@/components/Button';
import EventEditor from '@/components/EventEditor';
import {
  SidebarClosed,
  SidebarOpen,
} from "@/components/Icons";
import './TeamCalendarPage.scss';
import PlusCircle from '@/components/Icons/PlusCircle';

export default function CalendarPage() {
    const router = useRouter();
    const pathname = usePathname();
  
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // New Event Popover state
  const [showNewEventPopover, setShowNewEventPopover] = useState(false);
  const [newEventData, setNewEventData] = useState<Partial<AvailabilityEvent>>({});
  const newEventButtonRef = useRef<HTMLButtonElement>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    setShowNewEventPopover(true);
  };

  const handleNewEventPopoverClose = () => {
    setShowNewEventPopover(false);
    setNewEventData({});
  };

  const handleNewEventDataChange = (data: Partial<AvailabilityEvent>) => {
    setNewEventData(data);
    console.log('New event data:', data);
  };

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
          teamMembers={TeamMembersData}
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
      />
      
      {/* New Event Popover */}
      {showNewEventPopover && newEventButtonRef.current && (
        <Popover
          className="team-calendar__new-event-popover"
          targetRef={newEventButtonRef as React.RefObject<HTMLElement>}
          position="topLeft"
          edge="topLeft"
          offset={{ x: -8, y: -8 }}
          onShow={() => {
            // Focus the SmartEventInput after popover is shown
            setTimeout(() => {
              const smartEventInput = document.querySelector('.team-calendar__new-event-popover .smart-event-input-input');
              if (smartEventInput) {
                (smartEventInput as HTMLElement).focus();
              }
            }, 0);
          }}
          onHide={handleNewEventPopoverClose}
          closeButton={true}
          // width={400}
        >
          <EventEditor
            formConfig={[
              'smartEventInput',
              'teamMember',
              'eventType',
              'customEventNameInput',
              'dateRange',
              'allDaySwitch',
              'timeRange',
              'recurrence',
              'monthlyRecurrence',
            ]}
            values={newEventData}
            onChange={handleNewEventDataChange}
          />
          <div className="event-editor__actions">
            <Button 
              variant="primary"
              onClick={() => {
              // Handle save logic here
              console.log('Saving event:', newEventData);
              handleNewEventPopoverClose();
              }}
            >
              Save
            </Button>
          </div>
        </Popover>
      )}
    </AppFrame>
  );
}