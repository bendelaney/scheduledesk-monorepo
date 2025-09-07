'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import { TeamMember } from '@/types';

export default function TeamMemberPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const { data: teamMembers, loading, error } = useTeamMembers();
  
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (teamMembers.length > 0) {
      // Find the team member by ID (or slug)
      const member = teamMembers.find(m => 
        m.id === memberId || 
        `${m.firstName}-${m.lastName}`.toLowerCase() === memberId
      );
      setTeamMember(member || null);
    }
  }, [memberId, teamMembers]);

  if (loading) {
    return (
      <AppFrame>
        <div>Loading team member...</div>
      </AppFrame>
    );
  }

  if (error) {
    return (
      <AppFrame>
        <div style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}>
          <h4>⚠️ Database Connection Issue</h4>
          <p>{error}</p>
        </div>
        <button onClick={() => window.location.href = '/team'}>Back to Team</button>
      </AppFrame>
    );
  }

  if (!teamMember) {
    return (
      <AppFrame>
        <div>Team member not found</div>
        <button onClick={() => window.location.href = '/team'}>Back to Team</button>
      </AppFrame>
    );
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