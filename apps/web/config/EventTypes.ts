import { EventTypeName } from '@/types';

export interface EventTypeConfig {
  name: EventTypeName;
  color: string;
  displayName: string;
}

export const EventTypes: EventTypeConfig[] = [
  {
    name: "Starts Late",
    displayName: "Starts Late", 
    color: "#feb816" // 
  },
  {
    name: "Ends Early",
    displayName: "Ends Early",
    color: "#FF7F00" // 
  },
  {
    name: "Personal Appointment",
    displayName: "Personal Appointment",
    color: "#9D4DF2" // 
  },
  {
    name: "Not Working",
    displayName: "Not Working",
    color: "#A87360" // 
  },
  {
    name: "Vacation",
    displayName: "On Vacation",
    color: "#2BAA2E" // 
  },
  {
    name: "Custom",
    displayName: "Custom",
    // color: "#4babff"
    color: "#8c8e90"
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