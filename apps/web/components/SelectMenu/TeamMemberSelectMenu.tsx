'use client'

import React, {FC, useState} from 'react';
import SelectMenu, { SelectMenuProps } from './SelectMenu';
import { TeamMember } from '../../types';

interface TeamMemberOption {
  value: string;           // The string representation of the name
  label: string;           // The display text
  id: string | number;     // The TeamMember ID
}

// A specialized version of SelectMenuProps for team members
interface TeamMemberSelectProps extends Omit<SelectMenuProps, 'onChange'> {
  onChange?: (selectedOption: TeamMemberOption | null) => void;
}

interface TeamMemberSelectMenuProps {
  teamMembers?: TeamMember[];
  selected?: string;
  selectMenuProps?: SelectMenuProps;
}

const TeamMemberSelectMenu: FC<TeamMemberSelectMenuProps> = ({
  teamMembers = [],
  selected, 
  selectMenuProps,
}) => {
  const selectProps = {
    isSearchable: true,
    ...selectMenuProps?.selectProps,
  };

  const teamMemberOptions = teamMembers.map((teamMember) => ({
    value: teamMember.firstName + ' ' + teamMember.lastName,
    label: teamMember.firstName + ' ' + teamMember.lastName,
    id: teamMember.id,
  }));

  const selectedOption = selected ? teamMemberOptions.find(option => option.value === selected) || null : undefined;
  
  return (
    <SelectMenu 
      options={teamMemberOptions}
      selectedOption={selectedOption}
      placeholder={selectMenuProps?.placeholder || "Team Member"}
      onChange={selectMenuProps?.onChange}
      {...selectMenuProps}
      selectProps={selectProps}
    />
  );
};

export default TeamMemberSelectMenu;