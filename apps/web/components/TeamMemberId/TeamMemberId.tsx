'use client'

import React from 'react';
import { TeamMember } from '@/types';
import TeamMembersData from '@/data/teamMembersData';
import './TeamMemberId.scss';

interface TeamMemberIdProps {
  teamMember: TeamMember;
  showAvatar?: boolean;
  showName?: boolean;
  showFirstName?: boolean;
  showLastName?: boolean;
  avatarPlacement?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

const TeamMemberId: React.FC<TeamMemberIdProps> = ({
  teamMember,
  showAvatar = true,
  showName = true,
  showFirstName = true,
  showLastName = true,
  avatarPlacement = 'left',
  className = ''
}) => {
  const getInitials = (member: TeamMember) => {
    if (member.displayName) {
      return member.displayName.split(' ').map(name => name[0]).join('').toUpperCase();
    }
    const firstName = member.firstName?.[0] || '';
    const lastName = member.lastName?.[0] || '';
    return (firstName + lastName).toUpperCase();
  };

  const getDisplayName = () => {
    if (teamMember.displayName && showName) {
      return teamMember.displayName;
    }

    const parts = [];
    if (showFirstName && teamMember.firstName) {
      parts.push(teamMember.firstName);
    }
    if (showLastName && teamMember.lastName) {
      parts.push(teamMember.lastName);
    }
    
    return parts.join(' ').trim();
  };

  const displayName = getDisplayName();
  const shouldShowName = (showName || showFirstName || showLastName) && displayName;

  const renderAvatar = () => {
    if (!showAvatar) return null;

    return (
      <div className="team-member-id__avatar">
        {teamMember.avatarUri ? (
          <img
            src={teamMember.avatarUri}
            alt={displayName}
            className="team-member-id__avatar-image"
          />
        ) : (
          <div className="team-member-id__avatar-initials">
            {getInitials(teamMember)}
          </div>
        )}
      </div>
    );
  };

  const renderName = () => {
    if (!shouldShowName) return null;

    return (
      <span className="team-member-id__name">{displayName}</span>
    );
  };

  const getLayoutClass = () => {
    return `team-member-id--avatar-${avatarPlacement}`;
  };

  return (
    <div className={`team-member-id ${getLayoutClass()} ${className}`}>
      {avatarPlacement === 'top' && renderAvatar()}
      
      <div className="team-member-id__content">
        {avatarPlacement === 'left' && renderAvatar()}
        {shouldShowName && renderName()}
        {avatarPlacement === 'right' && renderAvatar()}
      </div>
      
      {avatarPlacement === 'bottom' && renderAvatar()}
    </div>
  );
};

export default TeamMemberId;