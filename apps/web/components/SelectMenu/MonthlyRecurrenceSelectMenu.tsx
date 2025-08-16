'use client'

import React, {FC, useEffect, useState} from 'react';
import SelectMenu, { getSelectMenuOption } from './SelectMenu';
import { MonthlyRecurrenceType } from '../EventEditor/types';

const monthlyRecurrenceOptions = [
  {value: "Exact Date", label: "Exact Date"},
  {value: "Week & Day", label: "Week & Day"}
];

interface MonthlyRecurrenceSelectMenuProps {
  selected?: MonthlyRecurrenceType;
  onChange: (selectedOption:any) => void;
  selectMenuProps?: any;
}

const MonthlyRecurrenceSelectMenu: FC<MonthlyRecurrenceSelectMenuProps> = ({
  selected,
  onChange,
  selectMenuProps 
}) => {
  const selectedOption = selected ? monthlyRecurrenceOptions.find(option => option.value === selected) || null : undefined;
  
  return (
    <SelectMenu 
      options={monthlyRecurrenceOptions} 
      value={selectedOption}
      selectedOption={selectedOption}
      onChange={onChange}
      placeholder="Monthly Recurrence"
      className="monthly-recurrence-trigger"
      {...selectMenuProps}
    />
  );
};

export default MonthlyRecurrenceSelectMenu;