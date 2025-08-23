'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import AvailabilityEventsData from '@/data/availabilityEventsData';
import TeamMembersData from '@/data/teamMembersData';
import AngleUp from '@/components/Icons/AngleUp';
import AngleDown from '@/components/Icons/AngleDown';
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
  monthsToLoad?: number;
  className?: string;
  infiniteScroll?: boolean;
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

// Calendar utilities
class CalendarUtils {
  static generateCalendarMonth(year: number, month: number, events: AvailabilityEvent[]): CalendarMonth {
    const today = getTodayInLocalTimezone();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days from previous month
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
    
    // Add days for current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      days.push({
        date: formatDate(date),
        day,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        events: this.getEventsForDay(date, events)
      });
    }
    
    // Add days from next month to complete the last week
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
    
    return { year, month, days };
  }
  
  static getEventsForDay(date: Date, events: AvailabilityEvent[]): AvailabilityEvent[] {
    const dateStr = formatDate(date);
    return events.filter(event => {
      if (!event.startDate || !event.endDate) return false;
      
      const startDate = event.startDate;
      const endDate = event.endDate;
      
      return dateStr >= startDate && dateStr <= endDate;
    });
  }
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events = AvailabilityEventsData,
  teamMembers = TeamMembersData,
  onEventClick,
  onDayClick,
  monthsToLoad = 6,
  className = '',
  infiniteScroll = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [months, setMonths] = useState<CalendarMonth[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate] = useState(getTodayInLocalTimezone());
  const lastScrollTopRef = useRef<number>(0);
  const scrollDirectionRef = useRef<'up' | 'down' | 'none'>('none');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  
  // Generate initial months
  const generateInitialMonths = useCallback(() => {
    const initialMonths: CalendarMonth[] = [];
    const startMonth = currentDate.getMonth(); // Current month
    const startYear = currentDate.getFullYear();
    
    // For single month mode, only generate current month
    const monthCount = infiniteScroll ? monthsToLoad : 1;
    
    for (let i = 0; i < monthCount; i++) {
      let month = startMonth + i;
      let year = startYear;
      
      if (month > 11) {
        month = month % 12;
        year += Math.floor((startMonth + i) / 12);
      }
      
      initialMonths.push(CalendarUtils.generateCalendarMonth(year, month, events));
    }
    
    return initialMonths;
  }, [currentDate, monthsToLoad, events, infiniteScroll]);
  
  // Load more months when scrolling
  const loadMoreMonths = useCallback((direction: 'before' | 'after') => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Store current scroll position for 'before' loading
    const currentScrollTop = containerRef.current?.scrollTop || 0;
    const currentScrollHeight = containerRef.current?.scrollHeight || 0;
    
    setTimeout(() => {
      setMonths(prevMonths => {
        const newMonths = [...prevMonths];
        
        if (direction === 'after') {
          const lastMonth = newMonths[newMonths.length - 1];
          let nextMonth = lastMonth.month + 1;
          let nextYear = lastMonth.year;
          
          if (nextMonth > 11) {
            nextMonth = 0;
            nextYear += 1;
          }
          
          newMonths.push(CalendarUtils.generateCalendarMonth(nextYear, nextMonth, events));
        } else {
          const firstMonth = newMonths[0];
          let prevMonth = firstMonth.month - 1;
          let prevYear = firstMonth.year;
          
          if (prevMonth < 0) {
            prevMonth = 11;
            prevYear -= 1;
          }
          
          newMonths.unshift(CalendarUtils.generateCalendarMonth(prevYear, prevMonth, events));
          
          // Maintain scroll position when adding content to the top
          // Use requestAnimationFrame for more reliable timing
          requestAnimationFrame(() => {
            if (containerRef.current) {
              const newScrollHeight = containerRef.current.scrollHeight;
              const heightDifference = newScrollHeight - currentScrollHeight;
              containerRef.current.scrollTop = currentScrollTop + heightDifference;
            }
          });
        }
        
        return newMonths;
      });
      
      setIsLoading(false);
    }, 100); // Small delay to show loading state
  }, [isLoading, events]);
  
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
      
      return [CalendarUtils.generateCalendarMonth(newYear, newMonth, events)];
    });
  }, [infiniteScroll, events]);
  
  const goToPreviousMonth = useCallback(() => navigateToMonth('prev'), [navigateToMonth]);
  const goToNextMonth = useCallback(() => navigateToMonth('next'), [navigateToMonth]);
  
  // Smooth scrolling to specific month
  const fastSmoothScroll = (element: HTMLElement, targetScrollTop: number, duration: number = 300) => {
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
      // Calculate offset to prevent header cutoff
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const elementTop = targetElement.getBoundingClientRect().top;
      const offset = 20; // Add 20px padding from top
      
      const targetScrollTop = containerRef.current.scrollTop + (elementTop - containerTop - offset);
      
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
  
  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !infiniteScroll) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Track scroll direction
    const lastScrollTop = lastScrollTopRef.current;
    const currentScrollDirection = scrollTop > lastScrollTop ? 'down' : scrollTop < lastScrollTop ? 'up' : 'none';
    scrollDirectionRef.current = currentScrollDirection;
    lastScrollTopRef.current = scrollTop;
    
    // console.log('Scroll values:', { scrollTop, scrollHeight, clientHeight, direction: currentScrollDirection });
    // console.log('Bottom distance:', scrollHeight - scrollTop - clientHeight);
    // console.log('Top distance:', scrollTop);
    
    // Load more months when near bottom (within 300px)
    if (scrollHeight - scrollTop - clientHeight < 300) {
      console.log('Loading more months after...');
      loadMoreMonths('after');
    }
    
    // Only load previous months when actively scrolling UP and near the top (within 50px)
    if (scrollTop < 50 && currentScrollDirection === 'up') {
      console.log('Loading more months before... (scrolling up)');
      loadMoreMonths('before');
    }
  }, [loadMoreMonths, infiniteScroll]);
  
  // Initialize months on mount
  useEffect(() => {
    setMonths(generateInitialMonths());
  }, [generateInitialMonths]);
  
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
  
  const renderEvent = (event: AvailabilityEvent) => (
    <div
      key={event.id}
      className={`calendar-event calendar-event--${event.eventType.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={(e) => handleEventClick(event, e)}
      title={`${event.teamMember.firstName} ${event.teamMember.lastName || ''}: ${event.eventType}${event.allDay ? '' : ` (${event.startTime} - ${event.endTime})`}`}
    >
      <span className="calendar-event__member">{event.teamMember.firstName} {event.teamMember.lastName || ''}</span>
      <span className="calendar-event__type">{event.eventType}</span>
    </div>
  );
  
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
    </div>
  );
  
  const renderWeek = (days: CalendarDay[], weekIndex: number) => (
    <div key={weekIndex} className="calendar-week">
      {days.map(renderDay)}
    </div>
  );
  
  const renderMonth = (month: CalendarMonth) => {
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < month.days.length; i += 7) {
      weeks.push(month.days.slice(i, i + 7));
    }
    
    return (
      <div key={`${month.year}-${month.month}`} className="calendar-month" data-month-key={`${month.year}-${month.month}`}>
        <div className="calendar-month__header">
          <h2 className="calendar-month__title">
            <button
              className="calendar-month__nav-button calendar-month__nav-button--prev"
              onClick={() => infiniteScroll ? scrollToPreviousMonth(month.year, month.month) : goToPreviousMonth()}
              aria-label="Previous month"
            >
              <AngleUp />
            </button>
            {getMonthName(month.month)} {month.year}
            <button
              className="calendar-month__nav-button calendar-month__nav-button--next"
              onClick={() => infiniteScroll ? scrollToNextMonth(month.year, month.month) : goToNextMonth()}
              aria-label="Next month"
            >
              <AngleDown />
            </button>
          </h2>
        </div>
        <div className="calendar-month__grid">
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>
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
