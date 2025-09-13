'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import { getEventTypeColor } from '@/config/EventTypes';
import AvailabilityEventsData from '@/data/availabilityEventsData';
import { AngleUp, AngleDown, PlusCircle } from '../Icons';
import TeamMembersData from '@/data/teamMembersData';
import './CalendarGrid.scss';

// Calendar-specific types
interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: AvailabilityEvent[];
}

interface CalendarMonth {
  year: number;
  month: number; // 0-11
  days: CalendarDay[];
}

export interface CalendarGridProps {
  events?: AvailabilityEvent[];
  teamMembers?: TeamMember[];
  onEventClick?: (event: AvailabilityEvent, targetElement?: HTMLElement) => void;
  onDayClick?: (date: string) => void;
  onNewEventClick?: (date: string, targetElement: HTMLElement) => void;
  className?: string;
  infiniteScroll?: boolean;
  activeEvent?: AvailabilityEvent | null;
  showWeekends?: boolean;
}

// Helper functions
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

const getTodayInLocalTimezone = (): Date => {
  const now = new Date();
  // Create a new date using local date components to avoid timezone issues
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getEventTypeDisplayText = (event: AvailabilityEvent, isShort: boolean = false): string => {
  const { eventType, startTime, endTime, customEventName } = event;
  
  // Format time helper (remove seconds, convert to 12hr format)
  const formatTime = (time: string, showAMPM: boolean = !isShort): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) === 0 ? 12 : parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
    const ampm = parseInt(hours) < 12 ? (isShort ? 'a':'AM') : (isShort ? 'p':'PM');
    if (isShort) {
      return `${hour12}${minutes === '00' ? '' : ':'+minutes}${showAMPM ? ampm : ''}`;
    }
    return `${hour12}:${minutes}`;
  };
  const isAM = (time: string): boolean => {
    if (!time) return false;
    const [hours] = time.split(':');
    return parseInt(hours) < 12;
  };
  
  switch (eventType) {
    case "Starts Late":
      if (isShort) {
        return startTime ? `>${formatTime(startTime)}` : 'late';
      }
      return startTime ? `start: ${formatTime(startTime)}` : 'starts late';
      
    case "Ends Early":
      if (isShort) {
        return endTime ? `<${formatTime(endTime)}` : 'early';
      }
      return endTime ? `end: ${formatTime(endTime)}` : 'ends early';
      
    case "Not Working":
      return isShort ? '×' : 'off';
      
    case "Vacation":
      return isShort ? '⛱️' : 'vacation';
      
    case "Personal Appointment":
      if (startTime && endTime) {
        if (isShort) {
          if (isAM(startTime) === isAM(endTime)) {
            return `${formatTime(startTime, false)}-${formatTime(endTime, true)}`;
          } else {
            return `${formatTime(startTime)}-${formatTime(endTime)}`;
          }
        }
        return `${formatTime(startTime)}-${formatTime(endTime)}`;
      }
      return isShort ? 'appt' : 'personal appointment';
      
    case "Custom":
      return customEventName || (isShort ? 'cust' : 'custom');
      
    default:
      return isShort ? eventType.slice(0, 4) : eventType;
  }
};

// Calendar utilities
class CalendarUtils {
  static generateCalendarMonth(year: number, month: number, events: AvailabilityEvent[], showWeekends: boolean = true): CalendarMonth {
    const today = getTodayInLocalTimezone();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days from previous month
    let adjustedFirstDay = firstDayOfMonth;
    if (!showWeekends) {
      // Adjust for weekdays only (Mon=0, Tue=1, Wed=2, Thu=3, Fri=4)
      // Sunday (0) becomes -1, Saturday (6) becomes 4
      adjustedFirstDay = firstDayOfMonth === 0 ? -1 : firstDayOfMonth === 6 ? 4 : firstDayOfMonth - 1;
    }
    
    if (showWeekends) {
      for (let i = 0; i < firstDayOfMonth; i++) {
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
        const day = prevMonthDays - firstDayOfMonth + i + 1;
        const date = new Date(prevYear, prevMonth, day);
        
        days.push({
          date: formatDate(date),
          day,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          events: this.getEventsForDay(date, events)
        });
      }
    } else {
      // For weekdays only, add padding days from previous month if needed
      if (adjustedFirstDay > 0) {
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
        
        for (let i = 0; i < adjustedFirstDay; i++) {
          const day = prevMonthDays - adjustedFirstDay + i + 1;
          const date = new Date(prevYear, prevMonth, day);
          const dayOfWeek = date.getDay();
          
          // Only add weekdays
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            days.push({
              date: formatDate(date),
              day,
              isCurrentMonth: false,
              isToday: isSameDay(date, today),
              events: this.getEventsForDay(date, events)
            });
          }
        }
      }
    }
    
    // Add days for current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends if showWeekends is false
      if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }
      
      days.push({
        date: formatDate(date),
        day,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        events: this.getEventsForDay(date, events)
      });
    }
    
    // Add days from next month to complete the last week
    if (showWeekends) {
      const totalCells = Math.ceil(days.length / 7) * 7;
      const remainingCells = totalCells - days.length;
      
      for (let day = 1; day <= remainingCells; day++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const date = new Date(nextYear, nextMonth, day);
        
        days.push({
          date: formatDate(date),
          day,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          events: this.getEventsForDay(date, events)
        });
      }
    } else {
      // For weekdays only, complete to fill a 5-day week if needed
      const totalCells = Math.ceil(days.length / 5) * 5;
      const remainingCells = totalCells - days.length;
      
      let day = 1;
      let addedCells = 0;
      while (addedCells < remainingCells) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const date = new Date(nextYear, nextMonth, day);
        const dayOfWeek = date.getDay();
        
        // Only add weekdays
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          days.push({
            date: formatDate(date),
            day,
            isCurrentMonth: false,
            isToday: isSameDay(date, today),
            events: this.getEventsForDay(date, events)
          });
          addedCells++;
        }
        day++;
      }
    }
    
    return { year, month, days };
  }
  
  static getEventsForDay(date: Date, events: AvailabilityEvent[]): AvailabilityEvent[] {
    const dateStr = formatDate(date);
    return events.filter(event => {
      if (!event.startDate) return false;
      
      const startDate = event.startDate;
      const endDate = event.endDate || event.startDate; // Use startDate if no endDate (single-day event)
      
      return dateStr >= startDate && dateStr <= endDate;
    });
  }
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events = AvailabilityEventsData,
  onEventClick,
  onDayClick,
  onNewEventClick,
  className = '',
  infiniteScroll = true,
  activeEvent = null,
  showWeekends = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [months, setMonths] = useState<CalendarMonth[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate] = useState(getTodayInLocalTimezone());
  const lastScrollTopRef = useRef<number>(0);
  const scrollDirectionRef = useRef<'up' | 'down' | 'none'>('none');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  
  // Generate initial months with buffer for both directions
  const generateInitialMonths = useCallback(() => {
    const initialMonths: CalendarMonth[] = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    if (!infiniteScroll) {
      // For single month mode, only generate current month
      initialMonths.push(CalendarUtils.generateCalendarMonth(currentYear, currentMonth, events, showWeekends));
      return initialMonths;
    }
    
    // For infinite scroll mode, load previous 3 months + current + next 3 months (7 total)
    const bufferMonths = 3;
    const startOffset = -bufferMonths; // Start 3 months before current
    const endOffset = bufferMonths; // End 3 months after current
    
    for (let offset = startOffset; offset <= endOffset; offset++) {
      let month = currentMonth + offset;
      let year = currentYear;
      
      // Handle year transitions
      while (month < 0) {
        month += 12;
        year -= 1;
      }
      while (month > 11) {
        month -= 12;
        year += 1;
      }
      
      initialMonths.push(CalendarUtils.generateCalendarMonth(year, month, events, showWeekends));
    }
    
    return initialMonths;
  }, [currentDate, events, infiniteScroll, showWeekends]);
  
  // Load more months when scrolling with subtle loading
  const loadMoreMonths = useCallback((direction: 'before' | 'after') => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    if (direction === 'after') {
      // Loading future months is straightforward
      setMonths(prevMonths => {
        const newMonths = [...prevMonths];
        const lastMonth = newMonths[newMonths.length - 1];
        let nextMonth = lastMonth.month + 1;
        let nextYear = lastMonth.year;
        
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear += 1;
        }
        
        newMonths.push(CalendarUtils.generateCalendarMonth(nextYear, nextMonth, events, showWeekends));
        return newMonths;
      });
      setIsLoading(false);
    } else {
      // Loading previous months requires careful scroll position handling
      const container = containerRef.current;
      if (!container) {
        setIsLoading(false);
        return;
      }
      
      // Disable scroll listening during content addition
      isProgrammaticScrollRef.current = true;
      
      // Capture scroll position relative to a stable element
      const currentScrollTop = container.scrollTop;
      const currentScrollHeight = container.scrollHeight;
      
      setMonths(prevMonths => {
        const newMonths = [...prevMonths];
        const firstMonth = newMonths[0];
        let prevMonth = firstMonth.month - 1;
        let prevYear = firstMonth.year;
        
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear -= 1;
        }
        
        newMonths.unshift(CalendarUtils.generateCalendarMonth(prevYear, prevMonth, events, showWeekends));
        
        // Use multiple animation frames for more reliable scroll position maintenance
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              const heightDifference = newScrollHeight - currentScrollHeight;
              // Maintain exact scroll position
              container.scrollTop = currentScrollTop + heightDifference;
              
              // Re-enable scroll listening after position is set
              setTimeout(() => {
                isProgrammaticScrollRef.current = false;
              }, 200);
            }
          });
        });
        
        return newMonths;
      });
      
      setIsLoading(false);
    }
  }, [isLoading, events, showWeekends]);
  
  // Navigation for single month mode
  const navigateToMonth = useCallback((direction: 'prev' | 'next') => {
    if (infiniteScroll) return; // Only for single month mode
    
    setMonths(prevMonths => {
      const currentMonth = prevMonths[0];
      if (!currentMonth) return prevMonths;
      
      let newMonth = currentMonth.month;
      let newYear = currentMonth.year;
      
      if (direction === 'next') {
        newMonth += 1;
        if (newMonth > 11) {
          newMonth = 0;
          newYear += 1;
        }
      } else {
        newMonth -= 1;
        if (newMonth < 0) {
          newMonth = 11;
          newYear -= 1;
        }
      }
      
      return [CalendarUtils.generateCalendarMonth(newYear, newMonth, events, showWeekends)];
    });
  }, [infiniteScroll, events, showWeekends]);
  
  const goToPreviousMonth = useCallback(() => navigateToMonth('prev'), [navigateToMonth]);
  const goToNextMonth = useCallback(() => navigateToMonth('next'), [navigateToMonth]);
  
  // Smooth scrolling to specific month
  const fastSmoothScroll = (element: HTMLElement, targetScrollTop: number, duration: number = 300) => {
    isProgrammaticScrollRef.current = true;
    const startScrollTop = element.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeOutCubic for snappy feel
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      element.scrollTop = startScrollTop + (distance * easeOutCubic);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Reset flag after animation completes
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 100);
      }
    };
    
    requestAnimationFrame(animateScroll);
  };

  const scrollToMonth = useCallback((targetYear: number, targetMonth: number) => {
    if (!containerRef.current || !infiniteScroll) return;
    
    const monthElements = containerRef.current.querySelectorAll('.calendar-month');
    const targetElement = Array.from(monthElements).find(element => {
      const key = element.getAttribute('data-month-key');
      return key === `${targetYear}-${targetMonth}`;
    });
    
    if (targetElement) {
      // Position the month so its header aligns perfectly with the sticky position (top: 0)
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const elementTop = targetElement.getBoundingClientRect().top;
      
      const targetScrollTop = containerRef.current.scrollTop + (elementTop - containerTop);
      
      // Use custom fast scrolling (200ms instead of default ~500ms)
      fastSmoothScroll(containerRef.current, targetScrollTop, 200);
    }
  }, [infiniteScroll]);
  
  // Navigate to previous month with smooth scrolling
  const scrollToPreviousMonth = useCallback((currentYear: number, currentMonth: number) => {
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    
    // Check if previous month exists in current months array
    const prevMonthExists = months.some(m => m.year === prevYear && m.month === prevMonth);
    
    if (prevMonthExists) {
      scrollToMonth(prevYear, prevMonth);
    } else {
      // Load previous month if not exists
      loadMoreMonths('before');
      // Use a longer delay and retry logic for upward scrolling
      const attemptScroll = (attempts = 0) => {
        if (attempts > 10) return; // Give up after 10 attempts
        
        const monthNowExists = containerRef.current?.querySelector(`[data-month-key="${prevYear}-${prevMonth}"]`);
        if (monthNowExists) {
          scrollToMonth(prevYear, prevMonth);
        } else {
          setTimeout(() => attemptScroll(attempts + 1), 50);
        }
      };
      
      setTimeout(() => attemptScroll(), 100);
    }
  }, [months, scrollToMonth, loadMoreMonths]);
  
  // Navigate to next month with smooth scrolling  
  const scrollToNextMonth = useCallback((currentYear: number, currentMonth: number) => {
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    
    // Check if next month exists in current months array
    const nextMonthExists = months.some(m => m.year === nextYear && m.month === nextMonth);
    
    if (nextMonthExists) {
      scrollToMonth(nextYear, nextMonth);
    } else {
      // Load next month if not exists
      loadMoreMonths('after');
      // Use retry logic for consistent behavior
      const attemptScroll = (attempts = 0) => {
        if (attempts > 10) return; // Give up after 10 attempts
        
        const monthNowExists = containerRef.current?.querySelector(`[data-month-key="${nextYear}-${nextMonth}"]`);
        if (monthNowExists) {
          scrollToMonth(nextYear, nextMonth);
        } else {
          setTimeout(() => attemptScroll(attempts + 1), 50);
        }
      };
      
      setTimeout(() => attemptScroll(), 100);
    }
  }, [months, scrollToMonth, loadMoreMonths]);

  // Function to scroll to current month for external use
  const scrollToCurrentMonth = useCallback(() => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    scrollToMonth(currentYear, currentMonth);
  }, [currentDate, scrollToMonth]);
  
  // Handle scroll for infinite loading with predictive triggers
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !infiniteScroll || isProgrammaticScrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Track scroll direction
    const lastScrollTop = lastScrollTopRef.current;
    const currentScrollDirection = scrollTop > lastScrollTop ? 'down' : scrollTop < lastScrollTop ? 'up' : 'none';
    scrollDirectionRef.current = currentScrollDirection;
    lastScrollTopRef.current = scrollTop;
    
    // More aggressive predictive loading - load content well before user reaches it
    // Load more months when approaching bottom (within 800px - about 2 months worth)
    if (scrollHeight - scrollTop - clientHeight < 800) {
      loadMoreMonths('after');
    }
    
    // Load previous months when approaching top (within 400px - about 1 month worth)  
    if (scrollTop < 400) {
      loadMoreMonths('before');
    }
  }, [loadMoreMonths, infiniteScroll]);
  
  // Initialize months on mount
  useEffect(() => {
    setMonths(generateInitialMonths());
  }, [generateInitialMonths]);

  // Scroll to current month only on initial load for infinite scroll mode
  useEffect(() => {
    if (infiniteScroll && months.length === 7 && containerRef.current) {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Find the current month element and scroll to it smoothly (only on first load)
      setTimeout(() => {
        scrollToMonth(currentYear, currentMonth);
      }, 100);
    }
  }, [infiniteScroll, months.length, currentDate, scrollToMonth]);
  
  // Set up scroll listener
  useEffect(() => {
    if (!infiniteScroll) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, infiniteScroll]);
  
  const handleDayClick = useCallback((day: CalendarDay) => {
    onDayClick?.(day.date);
  }, [onDayClick]);
  
  const handleEventClick = useCallback((event: AvailabilityEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetElement = e.currentTarget as HTMLElement;
    onEventClick?.(event, targetElement);
  }, [onEventClick]);

  const handleNewEventClick = useCallback((date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetElement = e.currentTarget as HTMLElement;
    onNewEventClick?.(date, targetElement);
  }, [onNewEventClick]);
  
  const renderEvent = (event: AvailabilityEvent) => {
    const isActive = activeEvent && activeEvent.id === event.id;
    
    return (
      <div
        key={event.id}
        className={`calendar-event calendar-event--${event.eventType.toLowerCase().replace(/\s+/g, '-')} ${isActive ? 'calendar-event--active' : ''}`}
        onClick={(e) => handleEventClick(event, e)}
        title={`${event.teamMember.firstName} ${event.teamMember.lastName || ''}: ${event.eventType}${event.allDay ? '' : ` (${event.startTime} - ${event.endTime})`}`}
        style={{ backgroundColor: getEventTypeColor(event.eventType) }}
      >
        <span className="calendar-event__member">{event.teamMember.firstName} {/*{event.teamMember.lastName || ''}*/}</span>
        {/* <span className="calendar-event__type">{event.eventType}</span> */}
        <span className="calendar-event__eventType--full">
          {getEventTypeDisplayText(event)}
        </span>
        <span className="calendar-event__eventType--short">
          {getEventTypeDisplayText(event, true)}
        </span>
      </div>
    );
  };
  
  const renderDay = (day: CalendarDay) => (
    <div
      key={day.date}
      className={`calendar-day ${day.isCurrentMonth ? 'calendar-day--current-month' : 'calendar-day--other-month'} ${day.isToday ? 'calendar-day--today' : ''}`}
      onClick={() => handleDayClick(day)}
    >
      <div className="calendar-day__number">{day.day}</div>
      <div className="calendar-day__events">
        {day.events.map(renderEvent)}
      </div>
      {onNewEventClick && (
        <button
          className="calendar-day__new-event-button"
          onClick={(e) => handleNewEventClick(day.date, e)}
          title={`Add new event for ${day.date}`}
        >
          <PlusCircle />
        </button>
      )}
    </div>
  );
  
  const renderWeek = (days: CalendarDay[], weekIndex: number) => (
    <div key={weekIndex} className="calendar-week">
      {days.map(renderDay)}
    </div>
  );
  
  const renderMonth = (month: CalendarMonth) => {
    const weeks: CalendarDay[][] = [];
    const daysPerWeek = showWeekends ? 7 : 5;
    for (let i = 0; i < month.days.length; i += daysPerWeek) {
      weeks.push(month.days.slice(i, i + daysPerWeek));
    }
    
    return (
      <div key={`${month.year}-${month.month}`} className="calendar-month" data-month-key={`${month.year}-${month.month}`}>
        <div className="calendar-month__header">
          <div className="calendar-month__title-row">
            <div className="calendar-month__title">
              {getMonthName(month.month)} {month.year}
            </div>
            {infiniteScroll && (
              <div className="calendar-month__nav">
                <button
                  className="calendar-month__nav-button calendar-month__nav-button--prev"
                  onClick={() => scrollToPreviousMonth(month.year, month.month)}
                  aria-label="Previous month"
                >
                  <AngleUp />
                </button>
                <button
                  className="calendar-month__nav-button calendar-month__nav-button--today"
                  onClick={scrollToCurrentMonth}
                  aria-label="Go to current month"
                >
                  Today
                </button>
                <button
                  className="calendar-month__nav-button calendar-month__nav-button--next"
                  onClick={() => scrollToNextMonth(month.year, month.month)}
                  aria-label="Next month"
                >
                  <AngleDown />
                </button>
              </div>
            )}
          </div>
          <div className="calendar-weekdays">
            {(showWeekends ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>
        </div>
        <div className="calendar-month__grid">
          <div className="calendar-weeks">
            {weeks.map((week, index) => renderWeek(week, index))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className={`calendar-grid ${infiniteScroll ? 'calendar-grid--infinite' : 'calendar-grid--single'} ${className}`}
      style={{
        '--calendar-columns': showWeekends ? '7' : '5'
      } as React.CSSProperties}
    >
      {!infiniteScroll && months.length > 0 && (
        <div className="calendar-navigation">
          <button 
            className="calendar-nav-button calendar-nav-button--prev"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="calendar-nav-title">
            {getMonthName(months[0].month)} {months[0].year}
          </div>
          <button 
            className="calendar-nav-button calendar-nav-button--next"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      )}
      <div className="calendar-months">
        {months.map(renderMonth)}
      </div>
    </div>
  );
};

export default CalendarGrid;
