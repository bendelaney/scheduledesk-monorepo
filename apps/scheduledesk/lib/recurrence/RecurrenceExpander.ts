import { AvailabilityEvent } from '@/types';

/**
 * Simple recurrence expansion service
 * Generates virtual event instances for recurring events within a date range
 */

// Utility function to extract base UUID from recurring instance IDs
const getBaseUuid = (id: string): string => {
  // If it's an instance ID (format: uuid-instance-YYYY-MM-DD), extract the base UUID
  const instanceMatch = id.match(/^(.+)-instance-\d{4}-\d{2}-\d{2}$/);
  return instanceMatch ? instanceMatch[1] : id;
};

interface ExpandedEvent extends AvailabilityEvent {
  isRecurring: boolean;
  isInstance: boolean;
  originalEventId?: string; // ID of the base recurring event
}

/**
 * Expands a single recurring event into multiple instances within the given date range
 */
export const expandRecurringEvent = (
  event: AvailabilityEvent,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): ExpandedEvent[] => {
  // If event has no recurrence, return as-is with metadata
  if (!event.recurrence) {
    return [{
      ...event,
      isRecurring: false,
      isInstance: false
    }];
  }

  const instances: ExpandedEvent[] = [];
  const eventStartDate = new Date(event.startDate + 'T00:00:00');
  const rangeStart = new Date(startDate + 'T00:00:00');
  const rangeEnd = new Date(endDate + 'T23:59:59');

  // For recurring events, use the full expansion range
  // The event.endDate should only affect individual instance duration, not recurrence limit
  let effectiveEndDate = rangeEnd;

  // Start from the event's actual start date, not the display range
  let currentDate = new Date(eventStartDate.getTime());

  // Generate instances starting from the event start date
  let iterationCount = 0;
  const maxIterations = 100; // Safety limit

  while (currentDate <= effectiveEndDate && iterationCount < maxIterations) {
    iterationCount++;
    const instanceDate = formatDate(currentDate);

    // Only include instances that fall within the display range
    if (currentDate >= rangeStart && currentDate <= rangeEnd) {

      // For recurring instances, the endDate should be the duration of the original event, not the recurrence end date
      let instanceEndDate = instanceDate; // Default to same day (single-day event)

      // Only use calculateEndDate if the original event was actually multi-day
      // (i.e., endDate != startDate and both exist)
      if (event.endDate && event.startDate && event.endDate !== event.startDate) {
        const originalStart = new Date(event.startDate);
        const originalEnd = new Date(event.endDate);
        const daysDifference = Math.ceil((originalEnd.getTime() - originalStart.getTime()) / (24 * 60 * 60 * 1000));

        // If the original event was truly multi-day (not just a recurrence end date)
        if (daysDifference > 0 && daysDifference < 30) { // Reasonable multi-day event (less than 30 days)
          instanceEndDate = calculateEndDate(instanceDate, event.startDate!, event.endDate);
        }
      }

      const newInstance = {
        ...event,
        id: event.id ? `${event.id}-instance-${instanceDate}` : `instance-${instanceDate}`,
        startDate: instanceDate,
        endDate: instanceEndDate,
        isRecurring: true,
        isInstance: true,
        originalEventId: event.id
      };
      instances.push(newInstance);
    }

    // Calculate next occurrence
    const nextDate = getNextOccurrence(currentDate, event.recurrence, event.monthlyRecurrence);

    // Safety check: if next date is not advancing, break to prevent infinite loop
    if (nextDate.getTime() <= currentDate.getTime()) {
      console.error('INFINITE LOOP DETECTED: nextDate is not advancing!', {
        current: formatDate(currentDate),
        next: formatDate(nextDate),
        recurrence: event.recurrence
      });
      break;
    }

    currentDate = nextDate;
  }

  return instances;
};

/**
 * Expands all recurring events in an array
 */
export const expandAllRecurringEvents = (
  events: AvailabilityEvent[],
  startDate: string,
  endDate: string
): ExpandedEvent[] => {
  const expandedEvents: ExpandedEvent[] = [];

  for (const event of events) {
    const instances = expandRecurringEvent(event, startDate, endDate);
    expandedEvents.push(...instances);
  }

  return expandedEvents;
};

/**
 * Calculate the next occurrence date based on recurrence pattern
 */
function getNextOccurrence(
  currentDate: Date,
  recurrence: string,
  monthlyRecurrence?: any
): Date {
  const next = new Date(currentDate);

  switch (recurrence) {
    case 'Every Week':
      // Use setTime() instead of setDate() to avoid month boundary issues
      next.setTime(next.getTime() + (7 * 24 * 60 * 60 * 1000));
      break;

    case 'Every Other Week':
      // Use setTime() instead of setDate() to avoid month boundary issues
      next.setTime(next.getTime() + (14 * 24 * 60 * 60 * 1000));
      break;

    case 'Every Month':
      if (monthlyRecurrence?.type === 'Exact Date') {
        // Move to same date next month
        next.setMonth(next.getMonth() + 1);
      } else if (monthlyRecurrence?.type === 'Week & Day') {
        // Move to same week & day of next month (e.g., "2nd Tuesday")
        next.setMonth(next.getMonth() + 1);
        // This is simplified - real implementation would calculate nth weekday
      } else {
        // Default: same date next month
        next.setMonth(next.getMonth() + 1);
      }
      break;

    default:
      // Unknown recurrence pattern, stop recurring
      next.setFullYear(next.getFullYear() + 100); // Far future to break loop
      break;
  }

  return next;
}

/**
 * Calculate end date for multi-day events
 */
function calculateEndDate(newStartDate: string, originalStartDate: string, originalEndDate: string): string {
  const start = new Date(originalStartDate);
  const end = new Date(originalEndDate);
  const duration = end.getTime() - start.getTime();

  const newStart = new Date(newStartDate);
  const newEnd = new Date(newStart.getTime() + duration);

  return formatDate(newEnd);
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get a reasonable date range for calendar expansion (current month ± 2 months)
 */
export const getDefaultExpansionRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 3, 0); // Last day of month +2

  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  };
};