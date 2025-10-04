'use client'

import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { TeamMember } from '@/types';
import TeamMemberId from '@/components/TeamMemberId';
import { SearchIcon } from '@/components/Icons';
import { useKeyboardShortcut, useEscapeKey } from '@/hooks/useKeyboardShortcut';
import './TeamMemberList.scss';

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  selectedMembers?: string[];
  onSelectionChange?: (selected: string[]) => void;
  onFilterChange?: (filter: string, filteredTeamMembers: TeamMember[]) => void;
  showToggleAll?: boolean;
  showFilterField?: boolean;
  initialFilter?: string;
  selectionMode?: 'toggle' | 'filter';
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({
  teamMembers,
  selectedMembers = [],
  onSelectionChange,
  onFilterChange,
  showToggleAll = false,
  showFilterField = false,
  initialFilter = '',
  selectionMode = 'toggle'
}) => {
  const [filterText, setFilterText] = useState(initialFilter);
  const [filterIsFocused, setFilterIsFocused] = useState(false);
  const filterInputRef = useRef<HTMLInputElement>(null);

  const allMemberNames = teamMembers.map(member =>
    member.displayName || `${member.firstName} ${member.lastName || ''}`.trim()
  );

  const filteredTeamMembers = useMemo(() => {
    if (!showFilterField || !filterText.trim()) {
      return teamMembers;
    }
    return teamMembers.filter(member => {
      const memberName = member.displayName || `${member.firstName} ${member.lastName || ''}`.trim();
      return memberName.toLowerCase().includes(filterText.toLowerCase());
    });
  }, [teamMembers, filterText, showFilterField]);

  const isAllSelected = showToggleAll && selectedMembers.length === allMemberNames.length &&
    allMemberNames.every(name => selectedMembers.includes(name));
  const isNoneSelected = showToggleAll && selectedMembers.length === 0;

  const handleToggleAll = useCallback(() => {
    if (!showToggleAll || !onSelectionChange) return;
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allMemberNames);
    }
  }, [isAllSelected, allMemberNames, onSelectionChange, showToggleAll]);

  const handleMemberToggle = useCallback((memberName: string) => {
    if (!onSelectionChange) return;
    const isSelected = selectedMembers.includes(memberName);
    const isAllSelected = selectedMembers.length === allMemberNames.length;

    if (selectionMode === 'filter') {
      // Filter mode: solo when all selected, otherwise additive/remove
      if (isAllSelected) {
        // If all are selected, solo this member
        onSelectionChange([memberName]);
      } else if (isSelected) {
        // Deselect this member
        const newSelection = selectedMembers.filter(name => name !== memberName);
        // If nothing is selected, select all
        if (newSelection.length === 0) {
          onSelectionChange(allMemberNames);
        } else {
          onSelectionChange(newSelection);
        }
      } else {
        // Add to existing selection
        onSelectionChange([...selectedMembers, memberName]);
      }
    } else {
      // Toggle mode: simple add/remove
      if (isSelected) {
        onSelectionChange(selectedMembers.filter(name => name !== memberName));
      } else {
        onSelectionChange([...selectedMembers, memberName]);
      }
    }
  }, [selectedMembers, onSelectionChange, allMemberNames, selectionMode]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const newFilter = e.target.value;
  setFilterText(newFilter);

  // Calculate filtered members inline to avoid stale closure
  const filtered = !showFilterField || !newFilter.trim()
    ? teamMembers
    : teamMembers.filter(member => {
        const memberName = member.displayName || `${member.firstName} ${member.lastName || ''}`.trim();
        return memberName.toLowerCase().includes(newFilter.toLowerCase());
      });
    onFilterChange?.(newFilter, filtered);
  }, [onFilterChange, teamMembers, showFilterField]);

  const handleFilterFocus = useCallback(() => {
    filterInputRef.current?.focus();
  }, []);

  const handleInputFocus = useCallback(() => {
    setFilterIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setFilterIsFocused(false);
  }, []);

  const handleClearFilter = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFilterText('');
    onFilterChange?.('', teamMembers);
  }, [onFilterChange, teamMembers]);

  // Handle external filter changes
  useEffect(() => {
    if (initialFilter !== filterText) {
      setFilterText(initialFilter);
    }
  }, [initialFilter]);

  // CMD+/ to toggle all team members (Priority 60)
  useKeyboardShortcut(
    '/',
    () => {
      handleToggleAll();
    },
    60,
    [handleToggleAll],
    { meta: true, id: 'team-member-list-toggle-all' }
  );

  // Escape to blur filter input (Priority 60)
  useEscapeKey(
    () => {
      if (showFilterField) {
        filterInputRef.current?.blur();
      }
    },
    60,
    [showFilterField],
    'team-member-list-escape'
  );

  // / to focus filter input (Priority 60) - non-exclusive
  useKeyboardShortcut(
    '/',
    () => {
      if (showFilterField && document.activeElement !== filterInputRef.current) {
        handleFilterFocus();
      }
    },
    60,
    [showFilterField, handleFilterFocus],
    { id: 'team-member-list-filter-focus', exclusive: false }
  );

  return (
    <div className="team-member-list">
      {(showToggleAll || showFilterField) && (
        <div className="team-member-list__header">
          {showFilterField && (
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
                className="team-member-list__filter-input"
                title={'Filter team members'}
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
                <span
                  className="team-member-list__filter-key-tip"
                  title={'Hit the \'/\' key to start searching'}>/</span>
              )}
            </div>
          )}
          {showToggleAll && (
            <button
              className="team-member-list__toggle-all"
              onClick={handleToggleAll}
              title="Toggle all team members - CMD+/"
              aria-label="Toggle all team members - CMD+/"
            >
              {isAllSelected ? 'Hide All' : 'Show All'}
            </button>
          )}
        </div>
      )}

      <div className="team-member-list__list">
        {filteredTeamMembers.length === 0 && showFilterField && filterText ? (
          <div className="team-member-list__empty">
            No team members match "{filterText}"
          </div>
        ) : (
          filteredTeamMembers.map((member) => {
            const memberName = member.displayName || `${member.firstName} ${member.lastName || ''}`.trim();
            const isSelected = showToggleAll && selectedMembers.includes(memberName);

            return (
              <div
                key={member.id}
                className={`team-member-list__item ${isSelected ? 'team-member-list__item--selected' : ''} ${showToggleAll ? 'team-member-list__item--toggleable' : ''}`}
                onClick={showToggleAll ? () => handleMemberToggle(memberName) : undefined}
              >
                <TeamMemberId
                  teamMember={member}
                  className="team-member-list__item-content"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeamMemberList;
