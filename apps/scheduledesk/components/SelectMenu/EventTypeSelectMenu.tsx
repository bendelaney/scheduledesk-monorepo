'use client'

import React, {FC, useState} from 'react';
import SelectMenu from './SelectMenu';
import { EventTypeName } from "@/types";
import { EventTypes } from '@/config/EventTypes';

const eventTypeOptions = EventTypes.map((eventType) => ({
  value: eventType.name,
  label: eventType.displayName,
  color: eventType.color,
}));

interface EventTypeSelectMenuProps {
  selected?: EventTypeName;
  onChange: (selectedOption: any) => void;
  selectMenuProps?: any;
}

const EventTypeSelectMenu: FC<EventTypeSelectMenuProps> = ({
  selected, 
  onChange, 
  selectMenuProps 
}) => {
  let selectedOption;
  if (selected) {
    const foundOption = eventTypeOptions.find((option) => option.value === selected);
    selectedOption = foundOption ? foundOption : null;
  }
  return (
    <SelectMenu 
      selectedOption={selectedOption}
      value={selectedOption}
      placeholder="Event Type"
      options={eventTypeOptions} 
      onChange={onChange}
      {...selectMenuProps}
      selectProps={selectMenuProps?.selectProps}
    />
  );
};

export default EventTypeSelectMenu;