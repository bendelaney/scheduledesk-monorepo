import { EventTypeType } from '@/types';

export interface EventTypeConfig {
  name: EventTypeType;
  color: string;
  displayName: string;
}

export const EVENT_TYPES: EventTypeConfig[] = [
  {
    name: "Starts Late",
    displayName: "Starts Late", 
    color: "#FF7F00" // --person-orange
  },
  {
    name: "Ends Early",
    displayName: "Ends Early",
    color: "#FF7F00" // --person-orange
  },
  {
    name: "Personal Appointment",
    displayName: "Personal Appointment",
    color: "#9D4DF2" // --person-purple
  },
  {
    name: "Not Working",
    displayName: "Not Working",
    color: "#A87360" // --person-brown
  },
  {
    name: "Vacation",
    displayName: "On Vacation",
    color: "#2BAA2E" // --person-green
  }
];

// Utility functions
export const getEventTypeConfig = (eventType: EventTypeType): EventTypeConfig | undefined => {
  return EVENT_TYPES.find(config => config.name === eventType);
};

export const getEventTypeColor = (eventType: EventTypeType): string => {
  return getEventTypeConfig(eventType)?.color || '#666666';
};

export const getEventTypeDisplayName = (eventType: EventTypeType): string => {
  return getEventTypeConfig(eventType)?.displayName || eventType;
};