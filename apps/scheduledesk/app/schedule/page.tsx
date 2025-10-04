'use client';

import React, { useState, useEffect } from 'react';
import AppFrame from '@/components/AppFrame';
import TeamMemberList from '@/components/TeamMemberList';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import { useRouter, usePathname } from 'next/navigation';
import MainNavigationConfig from '@/config/MainNavigation';

export default function SchedulePage() {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <AppFrame 
        sidebarOpen={false} 
        sidebarWidth="260px"
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
            showToggleAll={true}
            showFilterField={true}
          />
        </div>
      }
      sidebarOpen={false}
      sidebarWidth="260px"
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
      <div>SchedulePad goes here</div>
    </AppFrame>
  );
}

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';