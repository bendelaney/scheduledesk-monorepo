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
    color: "#8c8e90ff"
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