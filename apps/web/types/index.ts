export type Client = {
  id: number;
  name: string;
}

export type User = {
  accountName: string;
}

export type PhoneNumber = {
  id?: string;
  number: string;
  normalizedPhoneNumber?: string;
  type?: string;
  primary?: boolean;
  smsAllowed?: boolean;
}

export type Email = {
  id?: string;
  address: string;
  description?: string;
  primary?: boolean;
}

export type JobClient = {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  emails?: Email[];
  phones?: PhoneNumber[];
  company?: string;
}

// TODO: this needs to be updated to match Jobber fields:
export type JobNoteAttachment = {
  fileName: string;
  url: string;
  thumbnailUrl: string;
}

export type JobNote = {
  id: string;
  message: string;
  dateTime: string;
  createdAt: string;
  createdBy: string;
  lastEditedBy?: {};
  fileAttachments?: JobNoteAttachment;
}

interface CustomField {
  __typename: string;
  label: string;
  valueText: string;
}

export interface JobVisit {
  id: string;
  jobNumber: string | number;
  title: string;
  date?: string;
  shortDate?: string;
  dayName?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  location?: JobLocation;
  instructions?: string;
  webUri?: string;
  client?: JobClient;
  total?: number;
  customFields?: CustomField[];
  jobInfo?: string;
  salesperson?: string;
  geoCode?: string;
  workCode?: string;
  highlightId?: string;
  confirmationStatus?: JobVisitConfirmationStatus;
  assignedMembers?: TeamMemberInstance[];
  notes?: JobNote[];
  assignedDate?: string;
}

export interface JobLocation {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  mapWebUri?: string;
  coordinates?: {
    latitudeString: string;
    longitudeString: string;
  } | null;
}

export type JobVisitConfirmationStatus =
  "Unconfirmed"
  | "Confirmed"
  | "Partially Confirmed"
  | "Confirmation Pending"
  | "Important"
  | "Problems"
  | "Questions";

export interface StatusIconMapping {
  [key: string]: React.ReactElement;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phone?: string;
  avatarUri?: string;
}

export interface TeamMemberInstance {
  member: TeamMember;
  highlightId?: string;
  instanceId?: string; // To differentiate multiple instances of the same member
  displayName?: string;
  isAnimatingIn?: boolean; // Flag for initial hidden state during drop animation
}

export type EventTypeName = 
  | "Starts Late" 
  | "Ends Early" 
  | "Personal Appointment" 
  | "Not Working" 
  | "Vacation"
  | "Custom";

export type RecurrenceType = 
  | "Every Week"
  | "Every Other Week"
  | "Every Month";
  
export type MonthlyRecurrenceType = 
  | "Exact Date" 
  | "Week & Day";
  
export type MonthlyDateType = "1st" | "2nd" | "3rd" | "4th" | "5th" | "6th" | "7th" | "8th" | "9th" | "10th" | "11th" | "12th" | "13th" | "14th" | "15th" | "16th" | "17th" | "18th" | "19th" | "20th" | "21st" | "22nd" | "23rd" | "24th" | "25th" | "26th" | "27th" | "28th" | "29th" | "30th" | "31st";
export type MonthlyWeekType = "First" | "Second" | "Third" | "Fourth" | "Last";
export type MonthlyDayOfWeekType = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  
export type MonthlyRecurrenceDataType = {
  type?: MonthlyRecurrenceType;
  monthlyDate?: MonthlyDateType;
  monthlyWeek?: MonthlyWeekType;
  monthlyDayOfWeek?: MonthlyDayOfWeekType;
}

export interface AvailabilityEvent {
  id?: string;
  teamMember: Partial<TeamMember>;
  eventType: EventTypeName;
  customEventName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  recurrence?: RecurrenceType;
  monthlyRecurrence?: {
    type?: MonthlyRecurrenceType;
    monthlyDate?: MonthlyDateType;
    monthlyWeek?: MonthlyWeekType;
    monthlyDayOfWeek?: MonthlyDayOfWeekType;
  };
  // Recurring event metadata
  isRecurring?: boolean;      // True if this is a recurring event (base or instance)
  isInstance?: boolean;       // True if this is a generated recurring instance
  originalEventId?: string;   // ID of the base recurring event (for instances)
}
export interface TeamMembersWithAvailability extends TeamMember {
  available: boolean;
  availabilityEvents: AvailabilityEvent[]
}

export interface ScheduleDay {
  id: string;
  name: string;
  date: string;
  shortDate: string;
  weather?: string;
  teamMembers?: TeamMembersWithAvailability[];
  unassignedTeamMembers?: TeamMemberInstance[];
  jobVisits?: JobVisit[];
}

export interface ScheduleDocument {
  id: string;
  title: string;
  date_created: string;
  date_modified: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  scheduleDays: ScheduleDay[];
  jobQueue: JobVisit[];
}

// For the BlockManager component
export interface Block {
  id: string;
  content: string;
  children?: Block[];
  parentId?: string | null;
}

export interface MainNavigationItem {
  id: string;
  className: string;
  label: string;
  path: string;
  icon: React.ComponentType;
}