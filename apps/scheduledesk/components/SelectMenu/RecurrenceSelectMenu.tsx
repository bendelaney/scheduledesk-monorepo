'use client'

import React, {FC, useState} from 'react';
import SelectMenu, { SelectMenuOption, getSelectMenuOption } from './SelectMenu';
import { RecurrenceType } from '@/types';

const recurrenceOptions = [
  {value: "Every Week", label: "Every Week"},
  {value: "Every Other Week", label: "Every Other Week"},
  {value: "Every Month", label: "Every Month"},
];

interface RecurrenceSelectMenuProps {
  selected?: RecurrenceType;
  onChange: (selectedOption:any) => void;
  selectMenuProps?: any;
  excludeEveryWeek?: boolean; // Option to exclude "Every Week" for normal schedules
}

const RecurrenceSelectMenu: FC<RecurrenceSelectMenuProps> = ({
  selected,
  onChange,
  selectMenuProps,
  excludeEveryWeek = false
}) => {
  // Filter out "Every Week" option if excluded
  const filteredOptions = excludeEveryWeek
    ? recurrenceOptions.filter(option => option.value !== "Every Week")
    : recurrenceOptions;

  const selectedOption = selected ? filteredOptions.find(option => option.value === selected) || null : undefined;

  return (
    <SelectMenu
      options={filteredOptions}
      value={selectedOption}
      selectedOption={selectedOption}
      placeholder="Recurrence"
      onChange={onChange}
      {...selectMenuProps}
    />
  );
};

export default RecurrenceSelectMenu;