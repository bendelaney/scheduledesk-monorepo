import { AvailabilityEvent } from "../types";
import TeamMembersData from '@/data/teamMembersData';

const AvailabilityEventsData: AvailabilityEvent[] = [
  {
    id: "1",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz", firstName: "Ben", lastName: "Delaney" },
    eventType: "Personal Appointment",
    startDate: "2025-08-20",
    startTime: "09:00:00",
    endTime: "11:00:00",
    allDay: false
  },
  {
    id: "2",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE2", firstName: "Isaiah", lastName: "Crandall" },
    eventType: "Vacation",
    startDate: "2025-08-25",
    endDate: "2025-08-29",
    allDay: true
  },
  {
    id: "3",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx", firstName: "Kelly", lastName: "Chadwick" },
    eventType: "Starts Late",
    startDate: "2025-08-22",
    startTime: "10:00:00",
    allDay: false
  },
  {
    id: "4",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvNDU0NzYw", firstName: "Krystn", lastName: "Parmley" },
    eventType: "Not Working",
    startDate: "2025-08-23",
    allDay: true
  },
  {
    id: "5",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz", firstName: "Ben", lastName: "Delaney" },
    eventType: "Ends Early",
    startDate: "2025-08-26",
    endTime: "14:00:00",
    allDay: false
  },
  {
    id: "6",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE2", firstName: "Isaiah", lastName: "Crandall" },
    eventType: "Personal Appointment",
    startDate: "2025-09-02",
    startTime: "13:00:00",
    endTime: "15:00:00",
    allDay: false
  },
  {
    id: "7",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx", firstName: "Kelly", lastName: "Chadwick" },
    eventType: "Vacation",
    startDate: "2025-09-15",
    endDate: "2025-09-19",
    allDay: true
  },
  {
    id: "8",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvNTM2MDYx", firstName: "Dario", lastName: "Ré" },
    eventType: "Not Working",
    startDate: "2025-09-08",
    allDay: true
  },
  {
    id: "9",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE4", firstName: "Anthony", lastName: "Morrow" },
    eventType: "Starts Late",
    startDate: "2025-09-10",
    startTime: "11:30:00",
    allDay: false
  },
  {
    id: "10",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy", firstName: "Felix", lastName: "Gayton" },
    eventType: "Personal Appointment",
    startDate: "2025-09-12",
    startTime: "14:00:00",
    endTime: "16:30:00",
    allDay: false
  },
  {
    id: "11",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTA5", firstName: "Jose", lastName: "Villa" },
    eventType: "Ends Early",
    startDate: "2025-09-11",
    endTime: "13:00:00",
    allDay: false
  },
  {
    id: "12",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvNDc1NDUx", firstName: "Tal", lastName: "Weisenburger" },
    eventType: "Vacation",
    startDate: "2025-09-16",
    endDate: "2025-09-20",
    allDay: true
  },
  {
    id: "13",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz", firstName: "Ben", lastName: "Delaney" },
    eventType: "Personal Appointment",
    startDate: "2025-09-13",
    startTime: "10:00:00",
    endTime: "12:00:00",
    allDay: false
  },
  {
    id: "14",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTEx", firstName: "Wakan", lastName: "Burrows" },
    eventType: "Not Working",
    startDate: "2025-09-14",
    allDay: true
  },
  {
    id: "15",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMTg5NjI2OA==", firstName: "Peter", lastName: "Sherman" },
    eventType: "Starts Late",
    startDate: "2025-09-17",
    startTime: "12:00:00",
    allDay: false
  },
  {
    id: "16",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvNjAzMzI2", firstName: "Zayren", lastName: "Bubb" },
    eventType: "Ends Early",
    startDate: "2025-09-18",
    endTime: "15:00:00",
    allDay: false
  },
  {
    id: "17",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzMxMzczOA==", firstName: "Justin", lastName: "Howe" },
    eventType: "Personal Appointment",
    startDate: "2025-09-19",
    startTime: "15:30:00",
    endTime: "17:00:00",
    allDay: false
  },
  {
    id: "18",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMjgyMTI3Mw==", firstName: "Coty", lastName: "Newby" },
    eventType: "Vacation",
    startDate: "2025-09-22",
    endDate: "2025-09-26",
    allDay: true
  },
  {
    id: "19",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzMxMzczOA==", firstName: "Justin", lastName: "Howe" },
    eventType: "Not Working",
    startDate: "2025-09-21",
    allDay: true
  },
  {
    id: "20",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzMxMzczOA==", firstName: "Justin", lastName: "Howe" },
    eventType: "Starts Late",
    startDate: "2025-09-24",
    startTime: "10:30:00",
    allDay: false
  },
  {
    id: "21",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzMxMzczOA==", firstName: "Justin", lastName: "Howe" },
    eventType: "Personal Appointment",
    startDate: "2025-09-25",
    startTime: "09:00:00",
    endTime: "11:30:00",
    allDay: false
  },
  {
    id: "22",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzMxMzczOA==", firstName: "Justin", lastName: "Howe" },
    eventType: "Ends Early",
    startDate: "2025-09-27",
    endTime: "14:30:00",
    allDay: false
  },
  {
    id: "23",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz", firstName: "Ben", lastName: "Delaney" },
    eventType: "Custom",
    customEventName: "Bidding",
    startDate: "2025-09-01",
    startTime: "09:00:00",
    endTime: "12:00:00",
    allDay: false
  },
  {
    id: "24",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE2", firstName: "Isaiah", lastName: "Crandall" },
    eventType: "Custom",
    customEventName: "Working",
    startDate: "2025-09-05",
    allDay: true
  },
  {
    id: "25",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx", firstName: "Kelly", lastName: "Chadwick" },
    eventType: "Custom",
    customEventName: "Available",
    startDate: "2025-09-07",
    startTime: "10:00:00",
    endTime: "16:00:00",
    allDay: false
  },
  {
    id: "26",
    teamMember: {id: "Z2lkOi8vSm9iYmVyL1VzZXIvNDU0NzYw", firstName: "Krystn", lastName: "Parmley" },
    eventType: "Custom",
    customEventName: "Maintenance Day",
    startDate: "2025-09-04",
    allDay: true
  }
];

const combinedAvailabilityEventsData = AvailabilityEventsData.map(event => {
  const teamMember = TeamMembersData.find(member => member.id === event.teamMember.id);
  return {
    ...event,
    teamMember: teamMember || event.teamMember
  };
});

export default combinedAvailabilityEventsData;