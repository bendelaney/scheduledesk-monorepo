'use client'

import React, { FC, useEffect, useState } from 'react';
import SelectMenu, { SelectMenuStylePresets } from '@/components/SelectMenu';
import './TimeRangeSelectMenu.scss';

interface TimeOption {
  value: string;
  label: string;
}

// Generate time options from 5AM to 9PM in 30-minute intervals
function generateTimeOptions(interval = 30): TimeOption[] {
  const options = [];
  for (let hour = 5; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayMinute = minute === 0 ? '00' : minute.toString();
      const display = `${displayHour}:${displayMinute} ${ampm}`;
      
      options.push({ value: time24, label: display });
    }
  }
  return options;
}

interface TimeRangeSelectMenuProps {
  startTime?: string;
  endTime?: string;
  interval?: number;
  onChange?: (startTime: string | undefined, endTime: string | undefined) => void;
  selectMenuProps?: any;
  instanceId?: string;
}

const TimeRangeSelectMenu: FC<TimeRangeSelectMenuProps> = ({
  startTime,
  endTime,
  interval = 30,
  onChange,
  selectMenuProps,
  instanceId
}) => {
  const timeOptions = generateTimeOptions(interval);

  const startOption = startTime ? timeOptions.find(opt => opt.value === startTime) : undefined;
  const endOption = endTime ? timeOptions.find(opt => opt.value === endTime) : undefined;

  // Filter end time options to only show times after the selected start time
  const getFilteredEndTimeOptions = () => {
    if (!startTime) return timeOptions;

    return timeOptions.filter(option => option.value > startTime);
  };

  const filteredEndTimeOptions = getFilteredEndTimeOptions();

  const handleStartChange = (option: any) => {
    const newStartTime = option?.value;

    // If the current end time is now invalid (before the new start time), clear it
    const newEndTime = (endTime && newStartTime && endTime <= newStartTime) ? undefined : endTime;

    onChange?.(newStartTime, newEndTime);
  };

  const handleEndChange = (option: any) => {
    onChange?.(startTime, option?.value);
  };

  return (
    <div className="time-range-selector">
      <div className="time-range-selector-control-wrapper">
        <SelectMenu
          options={timeOptions}
          value={startOption}
          selectedOption={startOption}
          placeholder="Start Time"
          onChange={handleStartChange}
          className="time-range-selector-trigger start"
          selectProps={{isSearchable: true}}
          instanceId={`${instanceId}-start`}
          {...selectMenuProps}
        />
      </div>
      <div className="time-range-selector-control-wrapper">
        <SelectMenu
          options={filteredEndTimeOptions}
          value={endOption}
          selectedOption={endOption}
          placeholder="End Time"
          onChange={handleEndChange}
          className="time-range-selector-trigger end"
          selectProps={{isSearchable: true}}
          instanceId={`${instanceId}-end`}
          {...selectMenuProps}
        />
      </div>
    </div>
  );
};

export default TimeRangeSelectMenu;