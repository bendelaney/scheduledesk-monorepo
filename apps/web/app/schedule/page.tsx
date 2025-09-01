'use client';

import React, { useState } from 'react';
import AppFrame from '@/components/AppFrame';
import TeamMemberList from '@/components/TeamMemberList';
import TeamMembersData from '@/data/teamMembersData';

export default function SchedulePage() {
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
  );

  const handleSelectionChange = (selected: string[]) => {
    setSelectedTeamMembers(selected);
  };

  const handleTeamMemberFilter = (filter: string) => {
    console.log('Team member filter changed:', filter);
  };

  return (
    <AppFrame 
      sidebar={
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
      sidebarWidth="260px"
    >
      <div>SchedulePad goes here</div>
    </AppFrame>
  );
}