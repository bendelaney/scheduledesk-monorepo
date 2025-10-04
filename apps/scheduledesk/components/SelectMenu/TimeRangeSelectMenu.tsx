'use client'

import React, { FC, useEffect, useState, useRef } from 'react';
import SelectMenu from '@/components/SelectMenu';
import './TimeRangeSelectMenu.scss';
import { DateTime } from 'luxon';
import { SelectInstance } from 'react-select';

interface TimeOption {
  value: string;
  label: string;
  iso: string;
}

function timeRangeOptionsArray(startTime: string, endTime: string, interval: number): TimeOption[] {
  const format = 'HH:mm:ss';
  let start = DateTime.fromISO(startTime, { zone: 'utc' });
  const end = DateTime.fromISO(endTime, { zone: 'utc' });
  const timeOptions = [];

  const interv = interval || 30;

  while (start <= end) {
    const value = start.toFormat('h:mm a');
    const iso = start.toFormat(format);
    timeOptions.push({ value, label: value, iso });
    start = start.plus({ minutes: interv });
  }

  return timeOptions;
}

// This will always return a TimeOption object, which has the "simple time" ('h:mm a' or '1:30 PM') format as both value and label
const getTimeOptionFrom = (isoTimeString: string | undefined): TimeOption | null => {
  if (isoTimeString === undefined) return null;
  const simpleTime = DateTime.fromISO(isoTimeString).toLocaleString(DateTime.TIME_SIMPLE) as string;
  const timeOption = {
    value: simpleTime,
    label: simpleTime,
    iso: isoTimeString
  }
  return timeOption;
};

interface TimeRangeSelectMenuProps {
  startTime?: string; // must be in format 'HH:mm:ss'
  endTime?: string; // must be in format 'HH:mm:ss'
  minStartTime?: string; // must be in format 'HH:mm:ss'
  maxEndTime?: string; // must be in format 'HH:mm:ss'
  interval?: number; // in minutes
  onChange?: (startTime: string | undefined, endTime: string | undefined) => void;
  selectMenuProps?: any;
  instanceId?: string;
}

const TimeRangeSelectMenu: FC<TimeRangeSelectMenuProps> = ({
  startTime,
  endTime,
  minStartTime = '05:00:00',
  maxEndTime = '21:00:00',
  interval = 30, // in minutes
  onChange,
  selectMenuProps,
  instanceId
}) => {
  const startTimeOptions = timeRangeOptionsArray(minStartTime, maxEndTime, interval);
  const endTimeOptions = timeRangeOptionsArray(minStartTime, maxEndTime, interval);

  const [theStartTimeOpt, setTheStartTimeOpt] = useState<TimeOption | null>(getTimeOptionFrom(startTime));
  const [theEndTimeOpt, setTheEndTimeOpt] = useState<TimeOption | null>(getTimeOptionFrom(endTime));
  const [theEndTimeOptions, setTheEndTimeOptions] = useState<TimeOption[] | null>(endTimeOptions);

  const startRef = useRef<SelectInstance>(null);
  const endRef = useRef<SelectInstance>(null);
  const firstRender = useRef(true);
  const isUserInteraction = useRef(false);

  // This takes in a TimeOption object and sets the state to the corresponding time string
  const handleStartTime = (startTime: TimeOption | undefined) => {
    isUserInteraction.current = true;

    // Handle the case where the start time is cleared, and clear the end time as well
    if (startTime === null) {
      if (theEndTimeOpt) handleEndTime(null);
      setTheStartTimeOpt(null);
      return;
    } else if (startTime) {
      const newStartTimeOption = startTimeOptions.find(option => option.value === startTime.value) || null;
      setTheStartTimeOpt(newStartTimeOption);

      // Clearing end time if it's before start time
      if (theEndTimeOpt) {
        const stTime = DateTime.fromISO(startTime.iso);
        const endTime = DateTime.fromISO(theEndTimeOpt.iso);
        if (stTime > endTime) {
          handleEndTime(null);
        }
      }

      // Filter the list of options for the end time
      // so that the end time is always after the start time
      if (newStartTimeOption) {
        const newEndTimeOptions = endTimeOptions.filter(option => {
          const optionTime = DateTime.fromISO(option.iso);
          const startTime = DateTime.fromISO(newStartTimeOption.iso);
          return (optionTime > startTime);
        });
        setTheEndTimeOptions(newEndTimeOptions);
      }

      // Activate the end time selector
      const endMenu = endRef.current;
      endMenu && endMenu.focus();
    }
  }

  const handleEndTime = (endTime: TimeOption | null) => {
    isUserInteraction.current = true;

    if (endTime === null) {
      setTheEndTimeOpt(null);
    } else {
      const newEndTimeOption = endTimeOptions.find(option => option.value === endTime.value) || null;
      setTheEndTimeOpt(newEndTimeOption);
    }
  }

  // useEffects
  useEffect(() => {
    // Skip the initial render
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (isUserInteraction.current) {
      onChange && onChange(theStartTimeOpt?.iso, theEndTimeOpt?.iso);
      isUserInteraction.current = false; // Reset the flag
    }
  }, [theStartTimeOpt, theEndTimeOpt, onChange]);

  useEffect(() => {
    setTheStartTimeOpt(getTimeOptionFrom(startTime));
  }, [startTime]);

  useEffect(() => {
    setTheEndTimeOpt(getTimeOptionFrom(endTime));
  }, [endTime]);

  return (
    <div className="time-range-selector">
      <div className="time-range-selector-control-wrapper">
        <SelectMenu
          ref={startRef}
          options={startTimeOptions}
          value={theStartTimeOpt}
          selectedOption={theStartTimeOpt}
          placeholder="Start Time"
          onChange={handleStartTime}
          className="time-range-selector-trigger start"
          instanceId={instanceId ? `${instanceId}-start` : 'time-range-start'}
          selectProps={{ isSearchable: true }}
          {...selectMenuProps}
        />
      </div>
      <div className="time-range-selector-control-wrapper">
        <SelectMenu
          ref={endRef}
          options={theEndTimeOptions}
          value={theEndTimeOpt}
          selectedOption={theEndTimeOpt}
          placeholder="End Time"
          onChange={handleEndTime}
          className="time-range-selector-trigger end"
          instanceId={instanceId ? `${instanceId}-end` : 'time-range-end'}
          selectProps={{ isSearchable: true }}
          {...selectMenuProps}
        />
      </div>
    </div>
  );
};

export default TimeRangeSelectMenu;