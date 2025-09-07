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
  },
  {
    name: "Custom",
    displayName: "Custom",
    color: "#0087ff" // --primary-blue
  }
];

// Utility functions
export const getEventTypeConfig = (eventType: EventTypeName): EventTypeConfig | undefined => {
  return EventTypes.find(config => config.name === eventType);
};

export const getEventTypeColor = (eventType: EventTypeName): string => {
  return getEventTypeConfig(eventType)?.color || '#666666';
};

export const getEventTypeDisplayName = (eventType: EventTypeName): string => {
  return getEventTypeConfig(eventType)?.displayName || eventType;
};