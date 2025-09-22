'use client'

import React, {FC, useState} from 'react';
import SelectMenu, { SelectMenuProps } from './SelectMenu';
import { TeamMember } from '../../types';

interface TeamMemberOption {
  value: {
    firstName: string;
    lastName?: string;
  };                       // The team member object with firstName/lastName
  label: string;           // The display text
  id: string | number;     // The TeamMember ID
}

// A specialized version of SelectMenuProps for team members
interface TeamMemberSelectProps extends Omit<SelectMenuProps, 'onChange'> {
  onChange?: (selectedOption: TeamMemberOption | null) => void;
}

interface TeamMemberSelectMenuProps {
  teamMembers?: TeamMember[];
  selected?: {
    firstName: string;
    lastName?: string;
  };
  selectMenuProps?: SelectMenuProps;
}

const TeamMemberSelectMenu: FC<TeamMemberSelectMenuProps> = ({
  teamMembers = [],
  selected, 
  selectMenuProps,
}) => {
  const teamMemberOptions = teamMembers.map((teamMember) => ({
    value: {
      firstName: teamMember.firstName,
      lastName: teamMember.lastName
    },
    label: teamMember.firstName + ' ' + teamMember.lastName,
    id: teamMember.id,
  }));

  const selectedOption = selected ? teamMemberOptions.find(option => 
    option.value.firstName === selected.firstName && option.value.lastName === selected.lastName
  ) || null : undefined;
  
  return (
    <SelectMenu 
      options={teamMemberOptions}
      selectedOption={selectedOption}
      placeholder={selectMenuProps?.placeholder || "Team Member"}
      onChange={selectMenuProps?.onChange}
      {...selectMenuProps}
      selectProps={selectMenuProps?.selectProps}
    />
  );
};

export default TeamMemberSelectMenu;