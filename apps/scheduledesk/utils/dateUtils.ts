// filepath: /Users/ben/Code/scheduledesk-monorepo/apps/web/utils/dateUtils.ts
export const getTodayInLocalTimezone = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate smart default date for normal schedule events
 * @param templateDay - The template day clicked (e.g., 'template-tue')
 * @param selectedDate - User-selected specific date (optional override)
 * @returns Next occurrence of the template day or the selected date
 */
export const getSmartDefaultDate = (templateDay: string, selectedDate?: string): string => {
  // If user has selected a specific date, use that
  if (selectedDate) return selectedDate;

  // Map template days to weekday numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap: Record<string, number> = {
    'template-sun': 0,
    'template-mon': 1,
    'template-tue': 2,
    'template-wed': 3,
    'template-thu': 4,
    'template-fri': 5,
    'template-sat': 6
  };

  const targetDay = dayMap[templateDay];
  if (targetDay === undefined) {
    // Fallback to today if invalid template day
    return getTodayInLocalTimezone();
  }

  // Calculate next occurrence of target weekday
  const today = new Date();
  const currentDay = today.getDay();

  // Days to add: if target day is today, add 7 days (next week)
  // Otherwise, add days to reach next occurrence
  let daysToAdd = (targetDay - currentDay + 7) % 7;
  if (daysToAdd === 0) daysToAdd = 7; // If today is target day, go to next week

  const nextOccurrence = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return formatDateToLocalString(nextOccurrence);
};

/**
 * Extract template day from a date string that might be a template (e.g., 'template-tue')
 * @param dateString - Either a template date like 'template-tue' or regular date 'YYYY-MM-DD'
 * @returns The template day or null if it's a regular date
 */
export const extractTemplateDay = (dateString: string): string | null => {
  if (dateString.startsWith('template-')) {
    return dateString;
  }
  return null;
};