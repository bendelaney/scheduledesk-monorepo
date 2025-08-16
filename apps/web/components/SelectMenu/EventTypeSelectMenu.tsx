'use client'

import React, {FC, useState} from 'react';
import SelectMenu from './SelectMenu';
import { EventTypeType } from "@/types";

const eventTypes: any[] = [
  {name: "Starts Late", color: "#FF7F00"},
  {name: "Ends Early", color: "#FF7F00"},
  {name: "Personal Appointment", color: "#9D4DF2"},
  {name: "Not Working", color: "#A87360"},
  {name: "On Vacation", color: "#2BAA2E"},
];

const eventTypeOptions = eventTypes.map((eventType) => ({
  value: eventType.name,
  label: eventType.name,
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