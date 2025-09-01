'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import TeamMembersData from '@/data/teamMembersData';
import { TeamMember } from '@/types';

export default function TeamMemberPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  useEffect(() => {
    // Find the team member by ID (or slug)
    const member = TeamMembersData.find(m => 
      m.id === memberId || 
      `${m.firstName}-${m.lastName}`.toLowerCase() === memberId
    );
    setTeamMember(member || null);
  }, [memberId]);

  if (!teamMember) {
    return <div>Team member not found</div>;
  }

  return (
    <AppFrame>
      <button onClick={() => window.location.href = '/team'}>Back to Team</button>
      <div className="team-member-detail">
        <TeamMemberId teamMember={teamMember} showName={true} showAvatar={true} />
      </div>
    </AppFrame>
  );
}