'use client'

import React, {FC, useState} from 'react';
import SelectMenu from './SelectMenu';
import { EventTypeType } from "@/types";
import { EVENT_TYPES } from '@/config/EventTypes';

const eventTypeOptions = EVENT_TYPES.map((eventType) => ({
  value: eventType.name,
  label: eventType.displayName,
  color: eventType.color,
}));

interface EventTypeSelectMenuProps {
  selected?: EventTypeType;
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
      isSearchable={true}
      options={eventTypeOptions} 
      onChange={onChange}
      {...selectMenuProps}
    />
  );
};

export default EventTypeSelectMenu;