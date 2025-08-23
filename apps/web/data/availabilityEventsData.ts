import { AvailabilityEvent } from "../types";

const AvailabilityEventsData: AvailabilityEvent[] = [
  {
    id: "1",
    teamMember: { firstName: "Ben", lastName: "Delaney" },
    eventType: "Personal Appointment",
    startDate: "2025-08-20",
    endDate: "2025-08-20",
    startTime: "09:00:00",
    endTime: "11:00:00",
    allDay: false
  },
  {
    id: "2",
    teamMember: { firstName: "Isaiah", lastName: "Crandall" },
    eventType: "Vacation",
    startDate: "2025-08-25",
    endDate: "2025-08-29",
    allDay: true
  },
  {
    id: "3",
    teamMember: { firstName: "Kelly", lastName: "Chadwick" },
    eventType: "Arrives Late",
    startDate: "2025-08-22",
    endDate: "2025-08-22",
    startTime: "10:00:00",
    endTime: "17:00:00",
    allDay: false
  },
  {
    id: "4",
    teamMember: { firstName: "Krystn", lastName: "Parmley" },
    eventType: "Not Working",
    startDate: "2025-08-23",
    endDate: "2025-08-23",
    allDay: true
  },
  {
    id: "5",
    teamMember: { firstName: "Ben", lastName: "Delaney" },
    eventType: "Leaves Early",
    startDate: "2025-08-26",
    endDate: "2025-08-26",
    startTime: "08:00:00",
    endTime: "14:00:00",
    allDay: false
  },
  {
    id: "6",
    teamMember: { firstName: "Isaiah", lastName: "Crandall" },
    eventType: "Personal Appointment",
    startDate: "2025-09-02",
    endDate: "2025-09-02",
    startTime: "13:00:00",
    endTime: "15:00:00",
    allDay: false
  },
  {
    id: "7",
    teamMember: { firstName: "Kelly", lastName: "Chadwick" },
    eventType: "Vacation",
    startDate: "2025-09-15",
    endDate: "2025-09-19",
    allDay: true
  }
];

export default AvailabilityEventsData;
