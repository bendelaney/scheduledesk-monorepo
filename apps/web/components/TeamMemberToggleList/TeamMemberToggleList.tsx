'use client'

import React, { useCallback } from 'react';
import { TeamMember } from '@/types';
import TeamMemberId from '@/components/TeamMemberId';
import './TeamMemberToggleList.scss';

interface TeamMemberToggleListProps {
  teamMembers: TeamMember[];
  selectedMembers: string[];
  onSelectionChange: (selected: string[]) => void;
}

const TeamMemberToggleList: React.FC<TeamMemberToggleListProps> = ({
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


  return (
    <div className="team-member-toggle-list">
      <div className="team-member-toggle-list__header">
        <button className="team-member-toggle-list__toggle-all" onClick={handleToggleAll}>
          {getToggleButtonText()}
        </button>
      </div>
      
      <div className="team-member-toggle-list__list">
        {teamMembers.map((member) => {
          const memberName = member.displayName || `${member.firstName} ${member.lastName || ''}`.trim();
          const isSelected = selectedMembers.includes(memberName);
          
          return (
            <div 
              key={member.id}
              className={`team-member-toggle-list__item ${isSelected ? 'team-member-toggle-list__item--selected' : ''}`}
              onClick={() => handleMemberToggle(memberName)}
            >
              <TeamMemberId
                teamMember={member}
                className="team-member-toggle-list__item-content"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMemberToggleList;