'use client'

import React, { useState, forwardRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { AngleDown } from '../Icons';
import RotatingIcon from '@/components/RotatingIcon';
import "react-datepicker/dist/react-datepicker.css";
import './DateRangeSelector.scss';

interface DateRangeSelectorProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange?: (startDate: Date|null, endDate: Date|null) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onChange
}) => {
  const [theStartDate, setTheStartDate] = useState<Date | null>(startDate || null);
  const [theEndDate, setTheEndDate] = useState<Date | null>(endDate || null);
  const [startCalOpen, setStartCalOpen] = useState(false);
  const [endCalOpen, setEndCalOpen] = useState(false);

  const handleStartDateChange = (date: Date | null) => {
    if (date === null) {
      setTheStartDate(null);
      setTheEndDate(null);
    } else {
      setTheStartDate(date);
    }    
  };
  
  const handleEndDateChange = (date: Date | null) => {
    if (date === null) {
      setTheEndDate(null);
    } else {
      setTheEndDate(date);
    } 
  };

  const handleStartCalOpenState = (open: boolean) => {
    setStartCalOpen(open);
  };
  
  const handleEndCalOpenState = (open: boolean) => {
    setEndCalOpen(open);
  };

  useEffect(() => {
    if (onChange) onChange(theStartDate, theEndDate);
  }, [theStartDate, theEndDate]);

  type DateSelectorButtonProps = {
    value?: string;
    onClick?: () => void;
    className?: string;
  };

  const StartDateSelectorButton = forwardRef<HTMLButtonElement, DateSelectorButtonProps>(
    ({ value, onClick }, ref) => (
      <button className={`date-selector-trigger start-date ${theStartDate ? 'active' : 'inactive'}`} onClick={onClick} ref={ref}>
        <span className="text">{value ? value : "Start Date"}</span>
        <RotatingIcon className="icon" rotate={startCalOpen} degrees={180} icon={<AngleDown/>} />
      </button>
    )
  );
  StartDateSelectorButton.displayName = 'StartDateSelectorButton';
  
  const EndDateSelectorButton = forwardRef<HTMLButtonElement, DateSelectorButtonProps>(
    ({ value, onClick }, ref) => (
      <button className={`date-selector-trigger end-date ${theEndDate ? 'active' : 'inactive'}`} onClick={onClick} ref={ref}>
        <span className="text">{value ? value : "End Date"}</span>
        <RotatingIcon className="icon" rotate={endCalOpen} degrees={180} icon={<AngleDown/>} />
      </button>
    )
  );
  EndDateSelectorButton.displayName = 'EndDateSelectorButton';

  const sharedProps = {
    dateFormat:"M/d/yy",
    isClearable: true
  };

  return (
    <div className="date-range-selector">
      <div className="date-range-selector-control-wrapper">
        <DatePicker
          calendarClassName="date-selector_calendar"
          selected={theStartDate}        
          onChange={handleStartDateChange}
          selectsStart
          startDate={theStartDate}
          endDate={theEndDate}
          maxDate={theEndDate || undefined}
          customInput={<StartDateSelectorButton />}
          popperPlacement='top-start'
          onCalendarClose={() => handleStartCalOpenState(false)}
          onCalendarOpen={() => handleStartCalOpenState(true)}
          {...sharedProps}
        />
      </div>
      <div className="date-range-selector-control-wrapper">
        <DatePicker
          selected={theEndDate}
          onChange={handleEndDateChange}
          selectsEnd
          startDate={theStartDate}
          endDate={theEndDate}
          minDate={theStartDate || undefined}
          customInput={<EndDateSelectorButton />}
          popperPlacement='top-start'
          onCalendarClose={() => handleEndCalOpenState(false)}
          onCalendarOpen={() => handleEndCalOpenState(true)}
          {...sharedProps}
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;