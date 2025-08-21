'use client';

import React, { useState } from 'react';
import AppFrame from '@/components/AppFrame';
import { TeamCalendar, TeamMemberFilter } from '@/components/TeamCalendar';
import TeamMembersData from '@/data/teamMembersData';
import { AvailabilityEvent } from '@/types';
import './page.scss';

export default function Sandbox() {
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
  );

  const handleSelectionChange = (selected: string[]) => {
    console.log('Team member selection changed:', selected);
    setSelectedTeamMembers(selected);
  };

  return (
    <AppFrame 
      sidebar={
        <TeamMemberFilter 
          teamMembers={TeamMembersData}
          selectedMembers={selectedTeamMembers}
          onSelectionChange={handleSelectionChange}
        />
      }
      sidebarWidth="280px"
    >
      <TeamCalendar 
        selectedTeamMembers={selectedTeamMembers}
        onSelectionChange={handleSelectionChange}
      />
    </AppFrame>
  );
}