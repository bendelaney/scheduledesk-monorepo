'use client';

import React, { useState, useEffect } from 'react';
import AppFrame from '@/components/AppFrame';
import TeamMemberList from '@/components/TeamMemberList';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';

export default function SchedulePage() {
  const { data: teamMembers, loading, error } = useTeamMembers();
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  
  // Update selected team members when data loads
  useEffect(() => {
    if (teamMembers.length > 0) {
      setSelectedTeamMembers(
        teamMembers.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
      );
    }
  }, [teamMembers]);

  const handleSelectionChange = (selected: string[]) => {
    setSelectedTeamMembers(selected);
  };

  const handleTeamMemberFilter = (filter: string) => {
    console.log('Team member filter changed:', filter);
  };

  if (loading) {
    return (
      <AppFrame sidebarOpen={false} sidebarWidth="260px">
        <div>Loading team members...</div>
      </AppFrame>
    );
  }

  return (
    <AppFrame 
      sidebarContent={
        <div>
          {error && (
            <div style={{ padding: '10px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', marginBottom: '10px' }}>
              <small>{error}</small>
            </div>
          )}
          <TeamMemberList 
            teamMembers={teamMembers}
            selectedMembers={selectedTeamMembers}
            onSelectionChange={handleSelectionChange}
            onFilterChange={handleTeamMemberFilter}
            togglable={true}
            filterable={true}
          />
        </div>
      }
      sidebarOpen={false}
      sidebarWidth="260px"
    >
      <div>SchedulePad goes here</div>
    </AppFrame>
  );
}