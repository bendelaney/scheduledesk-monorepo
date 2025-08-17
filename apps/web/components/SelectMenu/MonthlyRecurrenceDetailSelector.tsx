'use client'

import React, {FC, useEffect, useState} from 'react';
import { 
  MonthlyRecurrenceType, 
  MonthlyDateType, 
  MonthlyWeekType, 
  MonthlyDayOfWeekType 
} from '@/types';
import SelectMenu from './SelectMenu';
import './MonthlyRecurrenceDetailSelector.scss';

const MonthlyDays = ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th","13th","14th","15th","16th","17th","18th","19th","20th","21st","22nd","23rd","24th","25th","26th","27th","28th","29th","30th","31st"];
const MonthlyWeeks = ["First","Second","Third","Fourth","Last"];
const MonthlyDayOfWeeks = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const monthlyDateOptions = MonthlyDays.map(day => ({ value: day, label: day }));
const monthlyWeekOptions = MonthlyWeeks.map(week => ({ value: week, label: week }));
const monthlyDayOfWeekOptions = MonthlyDayOfWeeks.map(day => ({ value: day, label: day }));

interface MonthlyRecurrenceDetailSelectorProps {
  monthlyRecurrenceType?: MonthlyRecurrenceType;
  monthlyDate?: MonthlyDateType;
  monthlyWeek?: MonthlyWeekType;
  monthlyDayOfWeek?: MonthlyDayOfWeekType;
  onMonthlyDateChange?: (selectedOption: any) => void;
  onMonthlyWeekChange?: (selectedOption: any) => void;
  onMonthlyDayOfWeekChange?: (selectedOption: any) => void;
  selectMenuProps?: any;
}

const MonthlyRecurrenceDetailSelector: FC<MonthlyRecurrenceDetailSelectorProps> = ({
  monthlyRecurrenceType,
  monthlyDate,
  monthlyWeek,
  monthlyDayOfWeek,
  onMonthlyDateChange,
  onMonthlyWeekChange,
  onMonthlyDayOfWeekChange,
  selectMenuProps
}) => {  
  const monthlyDateOption = monthlyDate ? monthlyDateOptions.find(opt => opt.value === monthlyDate) : undefined;
  const monthlyWeekOption = monthlyWeek ? monthlyWeekOptions.find(opt => opt.value === monthlyWeek) : undefined;
  const monthlyDayOfWeekOption = monthlyDayOfWeek ? monthlyDayOfWeekOptions.find(opt => opt.value === monthlyDayOfWeek) : undefined;

  if (monthlyRecurrenceType === "Exact Date") {
    return (
      <div className="monthly-recurrence-detail-selector">
        <SelectMenu
          options={monthlyDateOptions}
          value={monthlyDateOption}
          selectedOption={monthlyDateOption}
          placeholder="Day of Month"
          onChange={onMonthlyDateChange}
          {...selectMenuProps}
        />
      </div>
    );
  }

  if (monthlyRecurrenceType === "Week & Day") {
    return (
      <div className="monthly-recurrence-detail-selector">
        <div className="week-day-selectors">
          <SelectMenu
            options={monthlyWeekOptions}
            value={monthlyWeekOption}
            selectedOption={monthlyWeekOption}
            placeholder="Week"
            onChange={onMonthlyWeekChange}
            {...selectMenuProps}
          />
          <SelectMenu
            options={monthlyDayOfWeekOptions}
            value={monthlyDayOfWeekOption}
            selectedOption={monthlyDayOfWeekOption}
            placeholder="Day"
            onChange={onMonthlyDayOfWeekChange}
            {...selectMenuProps}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default MonthlyRecurrenceDetailSelector;