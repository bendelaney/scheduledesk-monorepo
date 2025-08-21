'use client'

import React, { useCallback } from 'react';
import { TeamMember } from '../../types';
import './TeamMemberFilter.scss';

interface TeamMemberFilterProps {
  teamMembers: TeamMember[];
  selectedMembers: string[];
  onSelectionChange: (selected: string[]) => void;
}

const TeamMemberFilter: React.FC<TeamMemberFilterProps> = ({
  teamMembers,
  selectedMembers,
  onSelectionChange
}) => {
  const allMemberNames = teamMembers.map(member => 
    member.displayName || `${member.firstName} ${member.lastName || ''}`.trim()
  );

  const isAllSelected = selectedMembers.length === allMemberNames.length && 
    allMemberNames.every(name => selectedMembers.includes(name));
  const isNoneSelected = selectedMembers.length === 0;

  const handleToggleAll = useCallback(() => {
    if (isAllSelected || (!isNoneSelected && selectedMembers.length > 0)) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allMemberNames);
    }
  }, [isAllSelected, isNoneSelected, selectedMembers.length, allMemberNames, onSelectionChange]);

  const handleMemberToggle = useCallback((memberName: string) => {
    const isSelected = selectedMembers.includes(memberName);
    if (isSelected) {
      onSelectionChange(selectedMembers.filter(name => name !== memberName));
    } else {
      onSelectionChange([...selectedMembers, memberName]);
    }
  }, [selectedMembers, onSelectionChange]);

  const getToggleButtonText = () => {
    if (isNoneSelected) return 'Show All';
    if (isAllSelected) return 'Hide All';
    return 'Hide All';
  };

  const getInitials = (member: TeamMember) => {
    if (member.displayName) {
      return member.displayName.split(' ').map(name => name[0]).join('').toUpperCase();
    }
    const firstName = member.firstName?.[0] || '';
    const lastName = member.lastName?.[0] || '';
    return (firstName + lastName).toUpperCase();
  };

  const getHighlightColor = (highlightId?: string) => {
    const colorMap: { [key: string]: string } = {
      '1': '#FF6B6B',
      '2': '#4ECDC4', 
      '3': '#45B7D1',
      '4': '#96CEB4',
      '5': '#FFEAA7',
      '6': '#DDA0DD',
      '7': '#98D8C8',
      '8': '#F7DC6F'
    };
    return colorMap[highlightId || '1'] || '#FF6B6B';
  };

  return (
    <div className="team-member-filter">
      <div className="team-member-filter__header">
        <h3 className="team-member-filter__title">Team Members</h3>
        <button 
          className="team-member-filter__toggle-all"
          onClick={handleToggleAll}
        >
          {getToggleButtonText()}
        </button>
      </div>
      
      <div className="team-member-filter__list">
        {teamMembers.map((member) => {
          const memberName = member.displayName || `${member.firstName} ${member.lastName || ''}`.trim();
          const isSelected = selectedMembers.includes(memberName);
          
          return (
            <div 
              key={member.id}
              className={`team-member-filter__item ${isSelected ? 'team-member-filter__item--selected' : ''}`}
              onClick={() => handleMemberToggle(memberName)}
            >
              <div className="team-member-filter__item-content">
                <div 
                  className="team-member-filter__avatar"
                  style={{ backgroundColor: getHighlightColor(member.highlightId) }}
                >
                  {getInitials(member)}
                </div>
                <span className="team-member-filter__name">{memberName}</span>
              </div>
              <div className={`team-member-filter__checkbox ${isSelected ? 'team-member-filter__checkbox--checked' : ''}`}>
                {isSelected && (
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path 
                      fill="currentColor" 
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMemberFilter;