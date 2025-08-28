// EventEditor component
// by Ben Delaney

'use client'

import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import { DateTime } from 'luxon';
import { 
  EventTypeSelectMenu,
  TeamMemberSelectMenu, 
  TimeRangeSelectMenu,
  RecurrenceSelectMenu,
  MonthlyRecurrenceSelectMenu,
  MonthlyRecurrenceDetailSelector
} from "@/components/SelectMenu";
import { SelectMenuStylePresets } from '@/components/SelectMenu/SelectMenu';
import {
  EventTypeType,
  RecurrenceType,
  MonthlyRecurrenceDataType,
  AvailabilityEvent
} from "@/types";
import SmartEventInput from '@/components/SmartEventInput';
import DateRangeSelector from '@/components/DateRangeSelector';
import SlideSwitch from '@/components/SlideSwitch';
import './EventEditor.scss';

// Team member data
import TeamMembersData from '@/data/teamMembersData';

// Form config types
type FormConfigItem = string | {
  component: string;
  props?: Record<string, any>;
};

interface EventEditorProps {
  formConfig?: FormConfigItem[];
  values?: Partial<AvailabilityEvent>;
  onChange?: (data: Partial<AvailabilityEvent>) => void; 
}

const EventEditor: FC<EventEditorProps> = ({
  formConfig=[
    'smartEventInput',
    'teamMember',
    'eventType',
    'dateRange',
    'allDaySwitch',
    'timeRange',
    'recurrence',
    'monthlyRecurrence',
  ],
  values,
  onChange 
}) => {
  // Lifecycle tracking refs
  const isInitializedRef = useRef(false);
  const isInternalUpdateRef = useRef(false);
  const prevValuesStringRef = useRef<string>('{}');
  const lastOutputStringRef = useRef<string>('{}');
  
  // Create a single state object for all form values
  const [formState, setFormState] = useState<Partial<AvailabilityEvent>>(() => {
    const initialState = {
      teamMember: values?.teamMember,
      eventType: values?.eventType,
      startDate: values?.startDate,
      endDate: values?.endDate,
      allDay: values?.allDay ?? false,
      startTime: values?.startTime,
      endTime: values?.endTime,
      recurrence: values?.recurrence,
      monthlyRecurrence: values?.monthlyRecurrence
    };
    
    // Store the initial values string representation
    if (values) {
      prevValuesStringRef.current = JSON.stringify(values);
    }
    
    return initialState;
  });
  
  // Mark component as initialized after first render
  useEffect(() => {
    isInitializedRef.current = true;
    
    // Return cleanup to handle unmounting
    return () => {
      isInitializedRef.current = false;
    };
  }, []);
  
  // Function to update individual fields with dependency handling
  const updateField = useCallback((
    key: keyof AvailabilityEvent, 
    value: any, 
    skipDependencies = false
  ) => {    
    setFormState(prev => {
      const newState = { ...prev, [key]: value };
      
      // Handle field dependencies if not skipped
      if (!skipDependencies) {
        // If allDay is set to true, clear time fields
        if (key === 'allDay' && value === true) {
          newState.startTime = undefined;
          newState.endTime = undefined;
        }
        
        // If recurrence is changed, handle monthlyRecurrence
        if (key === 'recurrence' && value !== 'Every Month') {
          newState.monthlyRecurrence = undefined;
        }
        
        // Handle monthlyRecurrence type changes
        if (key === 'monthlyRecurrence' && value && value.type) {
          if (value.type === 'Exact Date') {
            // Keep only monthlyDate for Exact Date
            newState.monthlyRecurrence = {
              type: value.type,
              monthlyDate: value.monthlyDate
            };
          } else if (value.type === 'Week & Day') {
            // Keep only week and day fields for Week & Day
            newState.monthlyRecurrence = {
              type: value.type,
              monthlyWeek: value.monthlyWeek,
              monthlyDayOfWeek: value.monthlyDayOfWeek
            };
          }
        }
      }
      
      return newState;
    });
  }, []);
  
  // Sync incoming prop values with internal state
  useEffect(() => {
    // Skip if component is not initialized yet
    if (!isInitializedRef.current) {
      return;
    }
    
    // Skip if values is undefined
    if (!values) {
      return;
    }
    
    // Convert values to a stable string for comparison
    const currentValuesString = JSON.stringify(values);
    
    // Skip if values haven't changed
    if (currentValuesString === prevValuesStringRef.current) {
      return;
    }
    
    // IMPORTANT: Skip if this matches our last output - prevents feedback loop
    if (currentValuesString === lastOutputStringRef.current) {
      console.log("Skipping values sync - matches last output (feedback prevention)");
      prevValuesStringRef.current = currentValuesString;
      return;
    }
    // Update the previous values reference
    prevValuesStringRef.current = currentValuesString;
    
    console.log('setting formState from values:', values);
    // Process incoming values

    isInternalUpdateRef.current = true; // Flag as internal update to prevent onChange firing

    setFormState({
      teamMember: values.teamMember,
      eventType: values.eventType,
      startDate: values.startDate,
      endDate: values.endDate,
      allDay: values.allDay ?? false,
      startTime: values.startTime,
      endTime: values.endTime,
      recurrence: values.recurrence,
      monthlyRecurrence: values.monthlyRecurrence
    });
  }, [values]);
  
  // Memoize the onChange callback to prevent infinite re-renders
  // const stableOnChange = useCallback(onChange || (() => {}), [onChange]);
  
  // Send data back to parent component
  useEffect(() => {
    // Skip if not initialized or no onChange handler
    if (!isInitializedRef.current || !onChange) {
      return;
    }
    
    // Skip if this update was triggered by external values prop change
    if (isInternalUpdateRef.current) {
      console.log("Skipping onChange - internal update");
      isInternalUpdateRef.current = false;
      return;
    }
    
    // Build output data
    const output: Partial<AvailabilityEvent> = {};
    
    // Only include defined fields with proper typing
    if (formState.teamMember) output.teamMember = formState.teamMember;
    if (formState.eventType) output.eventType = formState.eventType as EventTypeType;

    // Store dates as YYYY-MM-DD strings without time components
    if (formState.startDate) {
      // Ensure date is in YYYY-MM-DD format
      const dt = DateTime.fromISO(formState.startDate);
      output.startDate = dt.isValid ? dt.toISODate() : formState.startDate;
    }
    
    if (formState.endDate) {
      const dt = DateTime.fromISO(formState.endDate);
      output.endDate = dt.isValid ? dt.toISODate() : formState.endDate;
    }

    if (formState.allDay !== undefined) output.allDay = formState.allDay;

    // Only include time fields if NOT allDay
    if (!formState.allDay) {
      if (formState.startTime) output.startTime = formState.startTime;
      if (formState.endTime) output.endTime = formState.endTime;
    } else {
      // For all-day events, explicitly remove time fields from parent state
      output.startTime = undefined;
      output.endTime = undefined;
    }

    if (formState.recurrence) output.recurrence = formState.recurrence as RecurrenceType;
    
    // Only include monthlyRecurrence if recurrence is Monthly
    if (formState.monthlyRecurrence && formState.recurrence === "Every Month") {
      output.monthlyRecurrence = formState.monthlyRecurrence;
    }
    
    // Prevent unnecessary onChange calls
    const outputString = JSON.stringify(output);
    if (outputString !== lastOutputStringRef.current) {
      console.log("Calling onChange with output:", output);
      lastOutputStringRef.current = outputString;
      onChange(output);
    }
  }, [formState, onChange]);
  
  // Special handlers for complex interactions
  const handleAllDay = (isAllDay: boolean) => {
    updateField('allDay', isAllDay);
  };
  
  const handleTimeRange = (startTime: string | undefined, endTime: string | undefined) => {
    // Update both time fields at once to prevent multiple renders
    setFormState(prev => ({
      ...prev,
      startTime,
      endTime
    }));
  };
  
  const handleRecurrenceChange = (selectedOption: any) => {
    if (selectedOption === null) {
      updateField('recurrence', undefined);
      updateField('monthlyRecurrence', undefined);
      return;
    }
    const recurrence = selectedOption?.value as RecurrenceType;
    console.log("Recurrence changed to:", recurrence);

    setFormState(prev => {
      // Reset monthlyRecurrence if recurrence is not "Every Month"
      const updatedMonthlyRecurrence = recurrence === "Every Month" ? prev.monthlyRecurrence : undefined;
      
      return {
        ...prev,
        recurrence,
        monthlyRecurrence: updatedMonthlyRecurrence
      };
    });
  }; 

  const handleMonthlyRecurrenceType = (selectionOption: any) => {
    if (selectionOption === null) {
      updateField('monthlyRecurrence', undefined);
      return;
    }
    
    const type = selectionOption?.value;
    
    setFormState(prev => {
      let updatedMonthlyRecurrence: MonthlyRecurrenceDataType = {
        type
      };
      
      console.log('Monthly recurrence type changed to:', type);
      
      // Clear all fields first, then only set relevant ones
      if (type === 'Exact Date') {
        // Only preserve monthlyDate if it exists, clear week/day fields
        if (prev.monthlyRecurrence?.monthlyDate) {
          updatedMonthlyRecurrence.monthlyDate = prev.monthlyRecurrence.monthlyDate;
        }
        // Explicitly clear week/day fields
        updatedMonthlyRecurrence.monthlyWeek = undefined;
        updatedMonthlyRecurrence.monthlyDayOfWeek = undefined;
      } else if (type === 'Week & Day') {
        // Only preserve week/day fields, clear date field
        if (prev.monthlyRecurrence?.monthlyWeek) {
          updatedMonthlyRecurrence.monthlyWeek = prev.monthlyRecurrence.monthlyWeek;
        }
        if (prev.monthlyRecurrence?.monthlyDayOfWeek) {
          updatedMonthlyRecurrence.monthlyDayOfWeek = prev.monthlyRecurrence.monthlyDayOfWeek;
        }
        // Explicitly clear date field
        updatedMonthlyRecurrence.monthlyDate = undefined;
      }
      
      return {
        ...prev,
        monthlyRecurrence: updatedMonthlyRecurrence
      };
    });
  };
  
  const handleMonthlyDateChange = (selectedOption: any) => {
    setFormState(prev => ({
      ...prev,
      monthlyRecurrence: {
        ...prev.monthlyRecurrence,
        monthlyDate: selectedOption?.value
      }
    }));
  };
  
  const handleMonthlyWeekChange = (selectedOption: any) => {
    setFormState(prev => ({
      ...prev,
      monthlyRecurrence: {
        ...prev.monthlyRecurrence,
        monthlyWeek: selectedOption?.value
      }
    }));
  };
  
  const handleMonthlyDayOfWeekChange = (selectedOption: any) => {
    setFormState(prev => ({
      ...prev,
      monthlyRecurrence: {
        ...prev.monthlyRecurrence,
        monthlyDayOfWeek: selectedOption?.value
      }
    }));
  };
  
  // Form control renderers
  const formControlRenderers: { [key: string]: (customProps?: Record<string, any>) => React.ReactElement | null } = {
    smartEventInput: (customProps = {}) => (
      <SmartEventInput 
        onParse={(data: AvailabilityEvent[], prompt: string) => {
          // console.log('SmartEventInput onParse prompt:', prompt);
          // console.log('SmartEventInput onParse data:', data);
        
          // Only process if we have data
          if (data && data.length > 0) {
            const normalizedData = data.map(event => ({
              ...event,
              // we might need this... ? 
              // or other normalizations..? 
              // startDate: event.startDate,
              // endDate: event.endDate
            }))[0]; // Take the first event
            
            // Set as form state directly
            setFormState(prev => ({
              ...normalizedData
            }));
          }
        }}
        additionalRules={`When a name is mentioned, check it against this list: ${TeamMembersData.map(member => 
        member.firstName + " " + member.lastName).join(", ")}. If only the first name is found, return an object with firstName and lastName properties.`}
        {...customProps}
      />
    ),
    teamMember: (customProps = {}) => (
      <TeamMemberSelectMenu
        key={`team-member-${formState.teamMember ? (formState.teamMember.firstName || '') + (formState.teamMember.lastName || '') : 'none'}`}
        selected={formState.teamMember && formState.teamMember.firstName ? formState.teamMember as { firstName: string; lastName?: string } : undefined}
        teamMembers={TeamMembersData}
        selectMenuProps={{
          placeholder: "Team Member", 
          styles: SelectMenuStylePresets.Large,
          instanceId: "event-editor-team-member",
          onChange: (selected) => updateField('teamMember', selected?.value),
          ...customProps.selectMenuProps
        }}
        {...customProps}
      />
    ),
    eventType: (customProps = {}) => (
      <EventTypeSelectMenu
        key={`event-type-${formState.eventType || 'none'}`}
        selected={formState.eventType}
        onChange={(selected) => updateField('eventType', selected?.value)}
        selectMenuProps={{
          styles: SelectMenuStylePresets.Large,
          instanceId: "event-editor-event-type",
          ...customProps.selectMenuProps
        }}
        {...customProps}
      />
    ),
    dateRange: (customProps = {}) => {
      // Parse dates safely, stripping any time components
      const parseDate = (dateString?: string) => {
        if (!dateString) return null;
        
        try {
          // Parse the date string and reset to midnight local time
          const dt = DateTime.fromISO(dateString);
          return dt.isValid ? dt.startOf('day').toJSDate() : null;
        } catch (e) {
          console.error("Invalid date format:", dateString);
          return null;
        }
      };
      
      const startDateObj = parseDate(formState.startDate);
      const endDateObj = parseDate(formState.endDate);
      
      return (
        <DateRangeSelector
          key={`date-range-${formState.startDate || formState.endDate || 'none'}`}
          startDate={startDateObj}
          endDate={endDateObj}
          onChange={(startDate, endDate) => {
            console.log('DateRangeSelector onChange:', startDate, endDate);
            
            // Convert dates to our format with safe null handling
            let startDateString: string | undefined = undefined;
            let endDateString: string | undefined = undefined;
            
            // Only process non-null dates
            if (startDate !== null) {
              const isoDate = DateTime.fromJSDate(startDate).toISODate();
              startDateString = isoDate === null ? undefined : isoDate;
            }
            
            if (endDate !== null) {
              const isoDate = DateTime.fromJSDate(endDate).toISODate();
              endDateString = isoDate === null ? undefined : isoDate;
            }

            setFormState(prev => ({
              ...prev,
              startDate: startDateString,
              endDate: endDateString
            }));
          }}
          {...customProps}
        />
      );
    },
    allDaySwitch: (customProps = {}) => (
      <SlideSwitch
        key={`all-day-switch-${formState.allDay}`}
        isOn={formState.allDay}
        labelText="All Day"
        onToggle={handleAllDay}
        {...customProps}
      />
    ),
    timeRange: (customProps = {}) =>
      (formState.allDay === false || formState.allDay === undefined) ? (
        <TimeRangeSelectMenu
          key={`time-range-${formState.startTime || formState.endTime || 'none'}`}
          startTime={formState.startTime}
          endTime={formState.endTime}
          onChange={handleTimeRange}
          interval={30}
          selectMenuProps={{
            styles: SelectMenuStylePresets.Large,
            instanceId: "event-editor-time-range",
            ...customProps.selectMenuProps
          }}
          {...customProps}
        />
      ) : null,
    recurrence: (customProps = {}) => (
      <RecurrenceSelectMenu
        key={`recurrence-${formState.recurrence || 'none'}`}
        selected={formState.recurrence}
        onChange={handleRecurrenceChange}
        selectMenuProps={{
          styles: SelectMenuStylePresets.Large,
          instanceId: "event-editor-recurrence",
          ...customProps.selectMenuProps
        }}
        {...customProps}
      />
    ),
    monthlyRecurrence: (customProps = {}) =>
      formState.recurrence === "Every Month" ? (
        <>
          <MonthlyRecurrenceSelectMenu
            key={`monthly-recurrence-${formState.monthlyRecurrence?.type || 'none'}`}
            selected={formState.monthlyRecurrence?.type}
            onChange={handleMonthlyRecurrenceType}
            selectMenuProps={{
              styles: SelectMenuStylePresets.Large,
              instanceId: "event-editor-monthly-recurrence",
              ...customProps.selectMenuProps
            }}
            {...customProps}
          />
          <MonthlyRecurrenceDetailSelector
            key={`monthly-recurrence-detail-${formState.monthlyRecurrence?.type || 'none'}`}
            monthlyRecurrenceType={formState.monthlyRecurrence?.type}
            monthlyDate={formState.monthlyRecurrence?.monthlyDate}
            monthlyWeek={formState.monthlyRecurrence?.monthlyWeek}
            monthlyDayOfWeek={formState.monthlyRecurrence?.monthlyDayOfWeek}
            onMonthlyDateChange={handleMonthlyDateChange}
            onMonthlyWeekChange={handleMonthlyWeekChange}
            onMonthlyDayOfWeekChange={handleMonthlyDayOfWeekChange}
            selectMenuProps={{
              styles: SelectMenuStylePresets.Large,
              instanceId: "event-editor-monthly-recurrence-detail",
              ...customProps.detailSelectorProps?.selectMenuProps
            }}
            {...customProps.detailSelectorProps}
          />
        </>
      ) : null,
  };

  return (
    <div className="event-editor">
      {formConfig?.map((configItem, index) => {
        // Handle both string and object format
        const componentName = typeof configItem === 'string' ? configItem : configItem.component;
        const customProps = typeof configItem === 'object' ? configItem.props || {} : {};
        
        const renderFunction = formControlRenderers[componentName];
        return renderFunction ? <React.Fragment key={index}>{renderFunction(customProps)}</React.Fragment> : null;
      })}
    </div>
  );
};

export default EventEditor;


/* Example usage:
<EventEditor
  formConfig={[
    'smartEventInput',
    'teamMember',
    'eventType',
    'dateRange',
    'allDaySwitch',
    'timeRange',
    'recurrence',
    'monthlyRecurrence',
  ]}
  values={eventEditorValues}
  onChange={updateEventData}
/>
<DataViewer data={eventEditorOutput} log={false}/>
*/