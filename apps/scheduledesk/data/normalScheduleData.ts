import { NormalSchedule, AvailabilityEvent, TeamMember } from '@/types';

// Persistent storage for normal schedules using localStorage
const STORAGE_KEY = 'normalSchedules';

// Helper functions for localStorage persistence
const loadFromStorage = (): Map<string, NormalSchedule> => {
  if (typeof window === 'undefined') return new Map(); // SSR safety

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return new Map(Object.entries(data));
    }
  } catch (error) {
    console.error('Error loading normal schedules from localStorage:', error);
  }
  return new Map();
};

const saveToStorage = (storage: Map<string, NormalSchedule>): void => {
  if (typeof window === 'undefined') return; // SSR safety

  try {
    const data = Object.fromEntries(storage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving normal schedules to localStorage:', error);
  }
};

// Initialize storage from localStorage
let normalSchedulesStorage = loadFromStorage();

// Helper function to create template dates for days of week
export const getTemplateDateForDay = (dayOfWeek: string): string => {
  return `template-${dayOfWeek.toLowerCase()}`;
};

// Helper function to get day of week from template date
export const getDayOfWeekFromTemplateDate = (templateDate: string): string => {
  return templateDate.replace('template-', '');
};

// Create a new normal schedule event
export const createNormalScheduleEvent = (
  teamMember: TeamMember,
  dayOfWeek: string,
  eventData: Partial<AvailabilityEvent>
): AvailabilityEvent => {
  const templateDate = getTemplateDateForDay(dayOfWeek);

  return {
    id: `normal-${teamMember.id}-${dayOfWeek}-${Date.now()}`,
    teamMember: teamMember,
    startDate: templateDate,
    endDate: templateDate,
    isNormalSchedule: true,
    ...eventData
  } as AvailabilityEvent;
};

// Get normal schedule for a team member
export const getNormalSchedule = (teamMemberId: string): NormalSchedule | null => {
  return normalSchedulesStorage.get(teamMemberId) || null;
};

// Save normal schedule for a team member
export const saveNormalSchedule = (schedule: NormalSchedule): void => {
  normalSchedulesStorage.set(schedule.teamMemberId, {
    ...schedule,
    lastUpdated: new Date().toISOString()
  });
  // Persist to localStorage after every save
  saveToStorage(normalSchedulesStorage);
};

// Add event to normal schedule
export const addEventToNormalSchedule = (teamMemberId: string, event: AvailabilityEvent): void => {
  console.log('addEventToNormalSchedule called with:', { teamMemberId, event });
  const existingSchedule = getNormalSchedule(teamMemberId);

  if (existingSchedule) {
    existingSchedule.events.push(event);
    console.log('Added to existing schedule, now has events:', existingSchedule.events.length);
    saveNormalSchedule(existingSchedule);
  } else {
    // Create new normal schedule
    const newSchedule: NormalSchedule = {
      teamMemberId,
      events: [event],
      isEnabled: true
    };
    console.log('Created new schedule with 1 event');
    saveNormalSchedule(newSchedule);
  }

  // Verify it was saved
  const savedSchedule = getNormalSchedule(teamMemberId);
  console.log('After save, schedule has events:', savedSchedule?.events.length || 0);
};

// Remove event from normal schedule
export const removeEventFromNormalSchedule = (teamMemberId: string, eventId: string): void => {
  const schedule = getNormalSchedule(teamMemberId);
  if (schedule) {
    schedule.events = schedule.events.filter(event => event.id !== eventId);
    saveNormalSchedule(schedule); // This will automatically persist to localStorage
  }
};

// Get all normal schedule events for a team member
export const getNormalScheduleEvents = (teamMemberId: string): AvailabilityEvent[] => {
  const schedule = getNormalSchedule(teamMemberId);
  return schedule?.events || [];
};

// Toggle normal schedule visibility on main calendar
export const toggleNormalScheduleVisibility = (teamMemberId: string): boolean => {
  const schedule = getNormalSchedule(teamMemberId);
  if (schedule) {
    schedule.isEnabled = !schedule.isEnabled;
    saveNormalSchedule(schedule);
    return schedule.isEnabled;
  }
  return false;
};

// Clear all events from normal schedule
export const clearNormalSchedule = (teamMemberId: string): void => {
  const schedule = getNormalSchedule(teamMemberId);
  if (schedule) {
    schedule.events = [];
    saveNormalSchedule(schedule); // This will automatically persist to localStorage
  }
};