'use client'

import React, { useState, forwardRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { AngleDownIcon } from './angle-down-icon';
import { RotatingIcon } from './rotating-icon';
import "react-datepicker/dist/react-datepicker.css";

interface DateSelectorProps {
  date?: Date | null;
  value?: string;
  maxDate?: Date | null;
  minDate?: Date | null;
  dateFormat?: string;
  onChange?: (theDate: Date|null) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  date,
  value,
  maxDate=null,
  minDate=null,
  dateFormat = "M/d/yy",
  onChange
}) => {
  const [theDate, setTheDate] = useState<Date | null>(date || null);
  const [calendarIsOpen, setCalendarIsOpen] = useState(false);

  const handleDateChange = (date: Date | null) => {
    if (date === null) {
      setTheDate(null);
    } else {
      setTheDate(date);
    }    
  };

  const handleCalendarOpenState = (open: boolean) => {
    setCalendarIsOpen(open);
  };

  useEffect(() => {
    if (onChange) onChange(theDate);
  }, [theDate, onChange]);

  type DateSelectorButtonProps = {
    value?: string;
    onClick?: () => void;
    className?: string;
  };

  const DateSelectorButton = forwardRef<HTMLButtonElement, DateSelectorButtonProps>(
    ({ value, onClick }, ref) => (
      <button className={`date-selector-trigger start-date ${theDate ? 'active' : 'inactive'}`} onClick={onClick} ref={ref}>
        <span className="text">{value ? value : "Start Date"}</span>
        <RotatingIcon className="icon" rotate={calendarIsOpen} degrees={180} icon={<AngleDownIcon/>} />
      </button>
    )
  );
  DateSelectorButton.displayName = 'DateSelectorButton';

  return (
    <div className="date-selector">
      <div className="date-selector-control-wrapper">
        <DatePicker
          calendarClassName="date-selector_calendar"
          selected={theDate}
          value={value || ''}
          onChange={handleDateChange}
          startDate={theDate}
          minDate={minDate}
          maxDate={maxDate}
          customInput={<DateSelectorButton />}
          popperPlacement='auto-end'
          onCalendarClose={() => handleCalendarOpenState(false)}
          onCalendarOpen={() => handleCalendarOpenState(true)}
          dateFormat="M/d/yy"
          isClearable={true}
        />
      </div>
    </div>
  );
};

export { DateSelector };