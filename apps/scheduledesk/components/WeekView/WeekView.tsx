'use client';

import React, { useCallback } from 'react';
import { AvailabilityEvent } from '@/types';
import { getEventTypeColor, getEventTypeCalendarDisplayText } from '@/config/EventTypes';
import { CirclePlus } from '@/components/Icons';
import './WeekView.scss';

// Template week structure for Normal Schedule
interface TemplateDay {
  dayName: string;
  dayShort: string;
  templateDate: string; // Used for event storage/reference
  events: AvailabilityEvent[];
}

interface WeekViewProps {
  events?: AvailabilityEvent[];
  onEventClick?: (event: AvailabilityEvent, targetElement?: HTMLElement) => void;
  onDayClick?: (date: string) => void;
  onNewEventClick?: (date: string, targetElement: HTMLElement) => void;
  activeEvent?: AvailabilityEvent | null;
  className?: string;
}

const WeekView: React.FC<WeekViewProps> = ({
  events = [],
  onEventClick,
  onDayClick,
  onNewEventClick,
  activeEvent,
  className = ''
}) => {

  // Create template week (Sunday to Saturday)
  const templateWeek: TemplateDay[] = [
    { dayName: 'Sunday', dayShort: 'Sun', templateDate: 'template-sun', events: [] },
    { dayName: 'Monday', dayShort: 'Mon', templateDate: 'template-mon', events: [] },
    { dayName: 'Tuesday', dayShort: 'Tue', templateDate: 'template-tue', events: [] },
    { dayName: 'Wednesday', dayShort: 'Wed', templateDate: 'template-wed', events: [] },
    { dayName: 'Thursday', dayShort: 'Thu', templateDate: 'template-thu', events: [] },
    { dayName: 'Friday', dayShort: 'Fri', templateDate: 'template-fri', events: [] },
    { dayName: 'Saturday', dayShort: 'Sat', templateDate: 'template-sat', events: [] }
  ];

  // Distribute events to their respective template days
  templateWeek.forEach(day => {
    day.events = events.filter(event => {
      // Match events to days by template date (e.g., 'template-sunday', 'template-monday')
      return event.startDate === day.templateDate && event.isNormalSchedule;
    });

    // Debug logging
    if (day.events.length > 0) {
      console.log(`WeekView: ${day.dayName} has ${day.events.length} events:`, day.events);
    }
  });

  console.log('WeekView: Total events received:', events.length);
  console.log('WeekView: Events with isNormalSchedule:', events.filter(e => e.isNormalSchedule).length);

  const handleDayClick = useCallback((templateDate: string) => {
    onDayClick?.(templateDate);
  }, [onDayClick]);

  const handleEventClick = useCallback((event: AvailabilityEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetElement = e.currentTarget as HTMLElement;
    onEventClick?.(event, targetElement);
  }, [onEventClick]);

  const handleNewEventClick = useCallback((templateDate: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetElement = e.currentTarget as HTMLElement;
    onNewEventClick?.(templateDate, targetElement);
  }, [onNewEventClick]);

  const renderEvent = (event: AvailabilityEvent) => {
    const isActive = activeEvent && activeEvent.id === event.id;
    const eventColors = getEventTypeColor(event.eventType);

    return (
      <div
        key={event.id}
        className={`week-view-event week-view-event--${event.eventType.toLowerCase().replace(/\s+/g, '-')} normal-schedule ${isActive ? 'week-view-event--active' : ''}`}
        onClick={(e) => handleEventClick(event, e)}
        title={`Normal Schedule: ${event.eventType}${event.allDay ? '' : ` (${event.startTime} - ${event.endTime})`}`}
        style={{
          color: eventColors.dark,
          background: `linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.45)), ${eventColors.base}`,
        }}
      >
        <span className="week-view-event__eventType--full">
          {getEventTypeCalendarDisplayText(event)}
        </span>
        <span className="week-view-event__eventType--short">
          {getEventTypeCalendarDisplayText(event, true)}
        </span>
      </div>
    );
  };

  const renderDay = (day: TemplateDay) => (
    <div
      key={day.templateDate}
      className="week-view-day"
      onClick={() => handleDayClick(day.templateDate)}
    >
      <div className="week-view-day__header">
        <div className="week-view-day__name">{day.dayName}</div>
        <div className="week-view-day__short">{day.dayShort}</div>
      </div>

      <div className="week-view-day__content">
        <div className="week-view-day__events">
          {day.events.map(renderEvent)}
        </div>

        {onNewEventClick && (
          <button
            className="week-view-day__new-event-button"
            onClick={(e) => handleNewEventClick(day.templateDate, e)}
            title={`Add normal schedule event for ${day.dayName}`}
          >
            <CirclePlus />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`week-view ${className}`}>
      <div className="week-view__grid">
        {templateWeek.map(renderDay)}
      </div>
    </div>
  );
};

export default WeekView;