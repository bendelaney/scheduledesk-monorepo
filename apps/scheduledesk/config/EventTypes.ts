import { EventTypeName } from '@/types';

export interface EventTypeConfig {
  name: EventTypeName;
  color: string;
  displayName: string;
  shortDisplayName: string;
}

export const EventTypes: EventTypeConfig[] = [
  {
    name: "Starts Late",
    displayName: "Starts Late",
    shortDisplayName: "late",
    color: "#feb816" //
  },
  {
    name: "Ends Early",
    displayName: "Ends Early",
    shortDisplayName: "early",
    color: "#FF7F00" //
  },
  {
    name: "Personal Appointment",
    displayName: "Personal Appointment",
    shortDisplayName: "appt",
    color: "#9D4DF2" //
  },
  {
    name: "Not Working",
    displayName: "Not Working",
    shortDisplayName: "×",
    color: "#815646" //
  },
  {
    name: "Vacation",
    displayName: "Vacation",
    shortDisplayName: "⛱️",
    color: "#2BAA2E" //
  },
  {
    name: "Working",
    displayName: "Working",
    shortDisplayName: "✓",
    color: "#529e4c"
  },
  {
    name: "Custom",
    displayName: "Custom",
    shortDisplayName: "",
    color: "#4babff"
  }
];

// Utility functions
export const getEventTypeConfig = (eventType: EventTypeName): EventTypeConfig | undefined => {
  return EventTypes.find(config => config.name === eventType);
};

export const getEventTypeColor = (eventType: EventTypeName): { base: string; dark: string; light: string } => {
  // Option 1: Simple hex darkening function
  const darkenHex = (hex: string, percent: number): string => {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const lightenHex = (hex: string, percent: number): string => {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const baseColor = getEventTypeConfig(eventType)?.color || '#666666';
  const darkenedColor = darkenHex(baseColor, 40); // percent to darken
  const lightenedColor = lightenHex(baseColor, 30); // percent to lighten
  const colors = { base: baseColor, dark: darkenedColor, light: lightenedColor };
  return colors; 
};

export const getEventTypeDisplayName = (eventType: EventTypeName): string => {
  return getEventTypeConfig(eventType)?.displayName || eventType;
};

export const getEventTypeShortDisplayName = (eventType: EventTypeName): string => {
  return getEventTypeConfig(eventType)?.shortDisplayName || eventType;
};

export const getEventTypeCalendarDisplayText = (event: { eventType: EventTypeName; startTime?: string; endTime?: string; customEventName?: string }, isShort: boolean = false): string => {
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
        return startTime ? `>${formatTime(startTime, true)}` : getEventTypeShortDisplayName(eventType);
      }
      return startTime ? `starts @ ${formatTime(startTime)}` : getEventTypeDisplayName(eventType);

    case "Ends Early":
      if (isShort) {
        return endTime ? `<${formatTime(endTime, true)}` : getEventTypeShortDisplayName(eventType);
      }
      return endTime ? `ends @ ${formatTime(endTime)}` : getEventTypeDisplayName(eventType);

    case "Personal Appointment":
      if (startTime && endTime) {
        if (isShort) {
          if (isAM(startTime) === isAM(endTime)) {
            return `${formatTime(startTime, false)}-${formatTime(endTime, true)}`;
          } else {
            return `${formatTime(startTime)}-${formatTime(endTime)}`;
          }
        }
        return `appt: ${formatTime(startTime, true)}-${formatTime(endTime, true)}`;
      }
      return isShort ? getEventTypeShortDisplayName(eventType) : getEventTypeDisplayName(eventType);

    case "Custom":
      return customEventName || (isShort ? getEventTypeShortDisplayName(eventType) : getEventTypeDisplayName(eventType));

    default:
      return isShort ? getEventTypeShortDisplayName(eventType) : getEventTypeDisplayName(eventType);
  }
};