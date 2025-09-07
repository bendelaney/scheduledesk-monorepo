'use client';

import { TeamMember } from "@/types";
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import './TeamPage.scss';

export default function TeamPage() {
  const router = useRouter();
  const { data: teamMembers, loading, error } = useTeamMembers();

  const handleMemberClick = (member: TeamMember) => {
    // Navigate using member ID or create a slug
    const memberSlug = `${member.firstName}-${member.lastName}`.toLowerCase();
    router.push(`/team/${memberSlug}`);
  };

  return (
    <AppFrame className="team-page">
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
            onClick={() => handleMemberClick(member)}
          />
        ))}
      </div>
    </AppFrame>
  );
}