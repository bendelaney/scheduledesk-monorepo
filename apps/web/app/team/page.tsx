'use client';

import { TeamMember } from "@/types";
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter, usePathname } from 'next/navigation';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import MainNavigationConfig from '@/config/MainNavigation';
import './TeamPage.scss';

export default function TeamPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: teamMembers, loading, error } = useTeamMembers();

  const handleTeamMemberClick = (member: TeamMember) => {
    // Navigate using member ID or create a slug
    const memberSlug = `${member.firstName}-${member.lastName}`.toLowerCase();
    router.push(`/team/${memberSlug}`);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <AppFrame 
      className="team-page"
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
      <LoadingSpinner isLoading={loading} />
      <div className="team-grid">
        {error && (
          <div style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', marginBottom: '20px' }}>
            <h4>⚠️ Database Connection Issue</h4>
            <p>{error}</p>
          </div>
        )}
        {!loading && teamMembers.map((member) => (
          <TeamMemberId
            key={member.id}
            teamMember={member}
            avatarPlacement="top"
            stackNames={false}
            onClick={() => handleTeamMemberClick(member)}
          />
        ))}
      </div>
    </AppFrame>
  );
}