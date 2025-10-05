'use client';

import { TeamMember } from "@/types";
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import LoadingSpinner from '@/components/LoadingSpinner';
import JobberReauthModal from '@/components/JobberReauthModal';
import { useRouter, usePathname } from 'next/navigation';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import MainNavigationConfig from '@/config/MainNavigation';
import './TeamPage.scss';

function TeamPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: teamMembers, loading, error, needsJobberReauth, refetch } = useTeamMembers();

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
      showSidebarToggle={false}
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
        {!loading && teamMembers.map((member, index) => {
          return (
            <TeamMemberId
              key={member.id || `member-${index}`}
              teamMember={member}
              avatarPlacement="top"
              stackNames={false}
              onClick={() => handleTeamMemberClick(member)}
            />
          );
        })}
      </div>
      {needsJobberReauth && (
        <JobberReauthModal
          onClose={() => {}}
          onReauthSuccess={refetch}
        />
      )}
    </AppFrame>
  );
}

export default TeamPage;