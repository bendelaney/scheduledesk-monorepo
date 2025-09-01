'use client';

import { TeamMember } from "@/types";
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import { useRouter } from 'next/navigation';
import TeamMembersData from '@/data/teamMembersData';
import './TeamPage.scss';

export default function TeamPage() {
  const router = useRouter();

  const handleMemberClick = (member: TeamMember) => {
    // Navigate using member ID or create a slug
    const memberSlug = `${member.firstName}-${member.lastName}`.toLowerCase();
    router.push(`/team/${memberSlug}`);
  };

  return (
    <AppFrame className="team-page">
      <div className="team-grid">
        {TeamMembersData.map((member) => (
          <TeamMemberId
            key={member.id}
            teamMember={member}
            avatarPlacement="left"
            stackNames={true}
            onClick={() => handleMemberClick(member)}
          />
        ))}
      </div>
    </AppFrame>
  );
}