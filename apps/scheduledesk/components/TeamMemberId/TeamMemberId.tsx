'use client'

import React from 'react';
import { TeamMember } from '@/types';
// import TeamMembersData from '@/data/teamMembersData';
import './TeamMemberId.scss';

interface TeamMemberIdProps {
  teamMember: TeamMember;
  showAvatar?: boolean;
  showName?: boolean;
  showFirstName?: boolean;
  showLastName?: boolean;
  stackNames?: boolean;
  avatarPlacement?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  onClick?: () => void;
}

const TeamMemberId: React.FC<TeamMemberIdProps> = ({
  teamMember,
  showAvatar = true,
  showName = true,
  showFirstName = true,
  showLastName = true,
  stackNames = false,
  avatarPlacement = 'left',
  className = '',
  onClick
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
    
    if (stackNames && teamMember.firstName && teamMember.lastName) {
      return (
        <div className="team-member-id__name team-member-id__name--stacked">
          <span className="team-member-id__name-first">{teamMember.firstName}</span>
          <span className="team-member-id__name-last">{teamMember.lastName}</span>
        </div>
      );
    } else {
      return (
        <span className="team-member-id__name">{displayName}</span>
      );
    }
  };

  const getLayoutClass = () => {
    return `team-member-id--avatar-${avatarPlacement}`;
  };

  return (
    <div className={`team-member-id ${getLayoutClass()} ${className} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      {(avatarPlacement === 'top' || avatarPlacement === 'left') && renderAvatar()}
      {shouldShowName && renderName()}
      {(avatarPlacement === 'bottom' || avatarPlacement === 'right') && renderAvatar()}
    </div>
  );
};

export default TeamMemberId;