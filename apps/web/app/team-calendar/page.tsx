'use client';

import React, { useState } from 'react';
import {TeamMember} from '@/types';
import AppFrame from '@/components/AppFrame';
import TeamCalendar from '@/components/TeamCalendar';
import TeamMemberList from '@/components/TeamMemberList';
import TeamMembersData from '@/data/teamMembersData';
import './TeamCalendarPage.scss';

export default function CalendarPage() {
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
  );

  const handleSelectionChange = (selected: string[]) => {
    setSelectedTeamMembers(selected);
  };

  const handleTeamMemberFilter = (filter: string, filteredTeamMembers: TeamMember[]) => {
    console.log('Team member filter changed:', filter, filteredTeamMembers);
    // I want to make it so that the TeamCalendar automatically shows only the filtered team membrers
    setSelectedTeamMembers(filteredTeamMembers.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim()));
  };

  return (
    <AppFrame
      className="team-calendar-page"
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
    </AppFrame>
  );
}