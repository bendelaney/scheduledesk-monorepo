'use client'

import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { TeamMember } from '@/types';
import TeamMemberId from '@/components/TeamMemberId';
import { SearchIcon } from '@/components/Icons';
import './TeamMemberList.scss';
import { set } from 'react-datepicker/dist/date_utils';

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  selectedMembers?: string[];
  onSelectionChange?: (selected: string[]) => void;
  togglable?: boolean;
  filterable?: boolean;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({
  teamMembers,
  selectedMembers = [],
  onSelectionChange,
  togglable = false,
  filterable = false
}) => {
  const [filterText, setFilterText] = useState('');
  const [filterIsFocused, setFilterIsFocused] = useState(false);
  const filterInputRef = useRef<HTMLInputElement>(null);

  const allMemberNames = teamMembers.map(member => 
    member.displayName || `${member.firstName} ${member.lastName || ''}`.trim()
  );

  const filteredTeamMembers = useMemo(() => {
    if (!filterable || !filterText.trim()) {
      return teamMembers;
    }
    return teamMembers.filter(member => {
      const memberName = member.displayName || `${member.firstName} ${member.lastName || ''}`.trim();
      return memberName.toLowerCase().includes(filterText.toLowerCase());
    });
  }, [teamMembers, filterText, filterable]);

  const isAllSelected = togglable && selectedMembers.length === allMemberNames.length && 
    allMemberNames.every(name => selectedMembers.includes(name));
  const isNoneSelected = togglable && selectedMembers.length === 0;

  const handleToggleAll = useCallback(() => {
    if (!togglable || !onSelectionChange) return;
    if (isAllSelected || (!isNoneSelected && selectedMembers.length > 0)) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allMemberNames);
    }
  }, [isAllSelected, isNoneSelected, selectedMembers.length, allMemberNames, onSelectionChange, togglable]);

  const handleMemberToggle = useCallback((memberName: string) => {
    if (!togglable || !onSelectionChange) return;
    const isSelected = selectedMembers.includes(memberName);
    if (isSelected) {
      onSelectionChange(selectedMembers.filter(name => name !== memberName));
    } else {
      onSelectionChange([...selectedMembers, memberName]);
    }
  }, [selectedMembers, onSelectionChange, togglable]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  }, []);

  const handleFilterFocus = useCallback(() => {
    filterInputRef.current?.focus();
  }, []);

  const handleInputFocus = useCallback(() => {
    setFilterIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setFilterIsFocused(false);
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      filterInputRef.current?.blur();
    }
  }, []);

  const handleClearFilter = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFilterText('');
  }, []);

  const getToggleButtonText = () => {
    if (!togglable) return '';
    if (isNoneSelected) return 'Show All';
    if (isAllSelected) return 'Hide All';
    return 'Hide All';
  };


  useEffect(() => {
    if (!filterable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== filterInputRef.current) {
        e.preventDefault();
        handleFilterFocus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filterable, handleFilterFocus]);


  return (
    <div className="team-member-list">
      {(togglable || filterable) && (
        <div className="team-member-list__header">
          {filterable && (
            <div className="team-member-list__filter" onClick={handleFilterFocus}>
              <SearchIcon className="team-member-list__filter-icon"/>
              <input
              ref={filterInputRef}
              type="text"
              placeholder=""
              value={filterText}
              onChange={handleFilterChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="team-member-list__filter-input"
              />
              {filterText && (
              <button
                className="team-member-list__filter-clear"
                onClick={handleClearFilter}
                aria-label="Clear filter"
              >
                ✕
              </button>
              )}
              {(!filterText && !filterIsFocused) && (
                <span className="team-member-list__filter-key-tip">/</span>
              )}
            </div>
          )}
          {togglable && (
            <button className="team-member-list__toggle-all" onClick={handleToggleAll}>
              {getToggleButtonText()}
            </button>
          )}
        </div>
      )}
      
      <div className="team-member-list__list">
        {filteredTeamMembers.map((member) => {
          const memberName = member.displayName || `${member.firstName} ${member.lastName || ''}`.trim();
          const isSelected = togglable && selectedMembers.includes(memberName);
          
          return (
            <div 
              key={member.id}
              className={`team-member-list__item ${isSelected ? 'team-member-list__item--selected' : ''} ${togglable ? 'team-member-list__item--toggleable' : ''}`}
              onClick={togglable ? () => handleMemberToggle(memberName) : undefined}
            >
              <TeamMemberId
                teamMember={member}
                className="team-member-list__item-content"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMemberList;