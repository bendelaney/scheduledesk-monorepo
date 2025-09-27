import { AvailabilityEvent, TeamMember } from '@/types';
import { NormalScheduleEventDB } from '../services/normalSchedules';

// Mapping between short day names (used in UI) and full day names (used in database)
const dayNameMapping = {
  'sun': 'sunday',
  'mon': 'monday',
  'tue': 'tuesday',
  'wed': 'wednesday',
  'thu': 'thursday',
  'fri': 'friday',
  'sat': 'saturday'
} as const;

const reverseDayNameMapping = {
  'sunday': 'sun',
  'monday': 'mon',
  'tuesday': 'tue',
  'wednesday': 'wed',
  'thursday': 'thu',
  'friday': 'fri',
  'saturday': 'sat'
} as const;

// Convert AvailabilityEvent to database format
export const normalEventToDatabase = (event: AvailabilityEvent, jobberUserId: string): Omit<NormalScheduleEventDB, 'id' | 'created_at' | 'updated_at'> => {
  // For normal schedule events, dayOfWeek should be passed directly
  // Multiple possible sources: startDate with template format, dayOfWeek property, or actual date
  let dayOfWeek = '';

  if (event.startDate?.startsWith('template-')) {
    // Extract from template format: "template-mon" -> "monday"
    const shortDayName = event.startDate.replace('template-', '');
    dayOfWeek = dayNameMapping[shortDayName as keyof typeof dayNameMapping] || shortDayName;
  } else if ((event as any).dayOfWeek) {
    // Use dayOfWeek property directly if available
    const dow = (event as any).dayOfWeek;
    // Check if it's already a full name or needs conversion
    if (dow.length <= 3) {
      dayOfWeek = dayNameMapping[dow as keyof typeof dayNameMapping] || dow;
    } else {
      dayOfWeek = dow;
    }
  } else if (event.startDate) {
    // Try to extract day of week from actual date
    try {
      const date = new Date(event.startDate);
      if (!isNaN(date.getTime())) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        dayOfWeek = dayNames[date.getDay()];
      }
    } catch (err) {
      console.warn('Could not parse date for day of week:', event.startDate);
    }
  }

  // Log for debugging
  console.log('normalEventToDatabase:', {
    inputStartDate: event.startDate,
    inputDayOfWeek: (event as any).dayOfWeek,
    resolvedDayOfWeek: dayOfWeek,
    eventType: event.eventType
  });

  return {
    jobber_user_id: jobberUserId,
    day_of_week: dayOfWeek,
    event_type: event.eventType,
    custom_event_name: event.customEventName,
    start_time: event.startTime,
    end_time: event.endTime,
    all_day: event.allDay || false,
    recurrence: event.recurrence,
    monthly_recurrence: event.monthlyRecurrence ? JSON.stringify(event.monthlyRecurrence) : null,
    notes: ''
  };
};

// Convert database format to AvailabilityEvent
export const normalEventFromDatabase = (dbEvent: NormalScheduleEventDB, teamMember: TeamMember): AvailabilityEvent => {
  // Convert full day name back to short name for template date compatibility
  const shortDayName = reverseDayNameMapping[dbEvent.day_of_week as keyof typeof reverseDayNameMapping] || dbEvent.day_of_week;
  const templateDate = `template-${shortDayName}`;

  return {
    id: dbEvent.id,
    teamMember: teamMember,
    eventType: dbEvent.event_type as any,
    customEventName: dbEvent.custom_event_name,
    // Store both dayOfWeek and template dates for flexibility
    dayOfWeek: dbEvent.day_of_week,
    startDate: templateDate,
    endDate: templateDate,
    startTime: dbEvent.start_time,
    endTime: dbEvent.end_time,
    allDay: dbEvent.all_day,
    recurrence: dbEvent.recurrence as any,
    monthlyRecurrence: dbEvent.monthly_recurrence ? JSON.parse(dbEvent.monthly_recurrence) : undefined,
    isNormalSchedule: true
  };
};