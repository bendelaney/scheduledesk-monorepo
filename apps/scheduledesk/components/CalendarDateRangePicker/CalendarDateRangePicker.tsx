'use client';

import React, { useEffect, useRef } from 'react';
import './CalendarDateRangePicker.scss';

declare global {
  interface Window {
    flatpickr: any;
  }
}

interface CalendarDateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (startDate: Date, endDate: Date) => void;
}

const CalendarDateRangePicker: React.FC<CalendarDateRangePickerProps> = ({
  startDate,
  endDate,
  onChange
}) => {
  const dateRangeRef = useRef<HTMLDivElement>(null);
  const flatpickrInstance = useRef<any>(null);

  useEffect(() => {
    // Load flatpickr from CDN if not already loaded
    if (!window.flatpickr && typeof window !== 'undefined') {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
      script.onload = () => {
        if (startDate && endDate && dateRangeRef.current) {
          initializeFlatpickr();
        }
      };
      document.head.appendChild(script);
    } else if (startDate && endDate && window.flatpickr && dateRangeRef.current) {
      initializeFlatpickr();
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }
    };
  }, [startDate, endDate]);

  const initializeFlatpickr = () => {
    if (flatpickrInstance.current) {
      flatpickrInstance.current.destroy();
    }

    if (dateRangeRef.current && window.flatpickr) {
      flatpickrInstance.current = window.flatpickr(dateRangeRef.current, {
        inline: true,
        mode: 'range',
        defaultDate: [startDate, endDate],
        onReady: function(_selectedDates: Date[], _dateStr: string, instance: any) {
          // Prevent text selection
          instance.calendarContainer.style.userSelect = 'none';
          
          // Simple drag selection implementation
          let isDragging = false;
          let startElement: HTMLElement | null = null;
          let currentHoverElement: HTMLElement | null = null;
          
          const dayElements = instance.calendarContainer.querySelectorAll('.flatpickr-day:not(.flatpickr-disabled)');
          
          dayElements.forEach((dayEl: HTMLElement) => {
            // Mouse events
            dayEl.addEventListener('mousedown', (e: MouseEvent) => {
              e.preventDefault();
              isDragging = true;
              startElement = dayEl;
              currentHoverElement = dayEl;
              dayEl.click();
            });
            
            dayEl.addEventListener('mouseenter', () => {
              if (isDragging) {
                currentHoverElement = dayEl;
              }
            });
            
            // Touch events for mobile support
            dayEl.addEventListener('touchstart', (e: TouchEvent) => {
              e.preventDefault();
              isDragging = true;
              startElement = dayEl;
              currentHoverElement = dayEl;
              dayEl.click();
            }, { passive: false });
          });
          
          // Track mouse movement
          instance.calendarContainer.addEventListener('mousemove', (e: MouseEvent) => {
            if (isDragging) {
              const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
              if (elementUnderMouse && elementUnderMouse.classList.contains('flatpickr-day') && !elementUnderMouse.classList.contains('flatpickr-disabled')) {
                currentHoverElement = elementUnderMouse;
              }
            }
          });
          
          // Track touch movement
          instance.calendarContainer.addEventListener('touchmove', (e: TouchEvent) => {
            if (isDragging) {
              e.preventDefault();
              const touch = e.touches[0];
              const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
              if (elementUnderTouch && elementUnderTouch.classList.contains('flatpickr-day') && !elementUnderTouch.classList.contains('flatpickr-disabled')) {
                currentHoverElement = elementUnderTouch;
              }
            }
          }, { passive: false });
          
          // Global mouseup
          document.addEventListener('mouseup', () => {
            if (isDragging && startElement && currentHoverElement && currentHoverElement !== startElement) {
              currentHoverElement.click();
            }
            isDragging = false;
            startElement = null;
            currentHoverElement = null;
          });
          
          // Global touchend
          document.addEventListener('touchend', () => {
            if (isDragging && startElement && currentHoverElement && currentHoverElement !== startElement) {
              currentHoverElement.click();
            }
            isDragging = false;
            startElement = null;
            currentHoverElement = null;
          });
        },
        onChange: function(selectedDates: Date[]) {
          if (selectedDates.length === 2) {
            const start = new Date(selectedDates[0]);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(selectedDates[1]);
            end.setHours(23, 59, 59, 999);
            
            onChange(start, end);
          }
        }
      });
    }
  };

  return (
    <div className="calendar-date-range-picker">
      <div ref={dateRangeRef} className="date-range-calendar"></div>
    </div>
  );
};

export default CalendarDateRangePicker;
