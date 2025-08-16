'use client'

import React, {FC, useState} from 'react';
import SelectMenu, { SelectMenuOption, getSelectMenuOption } from './SelectMenu';
import { RecurrenceType } from '../EventEditor/types';

const recurrenceOptions = [
  {value: "Every Week", label: "Every Week"},
  {value: "Every Other Week", label: "Every Other Week"},
  {value: "Every Month", label: "Every Month"},
];

interface RecurrenceSelectMenuProps {
  selected?: RecurrenceType;
  onChange: (selectedOption:any) => void;
  selectMenuProps?: any;
}

const RecurrenceSelectMenu: FC<RecurrenceSelectMenuProps> = ({
  selected, 
  onChange, 
  selectMenuProps
}) => {
  const selectedOption = selected ? recurrenceOptions.find(option => option.value === selected) || null : undefined;
  
  return (
    <SelectMenu 
      options={recurrenceOptions} 
      value={selectedOption}
      selectedOption={selectedOption}
      placeholder="Recurrence"
      onChange={onChange}
      {...selectMenuProps}
    />
  );
};

export default RecurrenceSelectMenu;