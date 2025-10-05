import {
  ScheduleDocument,
  ScheduleDay,
  JobVisit,
  JobClient,
  JobLocation,
  TeamMemberInstance,
  TeamMember,
  JobVisitConfirmationStatus
} from '@/types';
import APP_SETTINGS from '@/data/appSettings';

interface JobberVisitNode {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  instructions?: string;
  assignedUsers?: {
    nodes: Array<{
      id: string;
      name: {
        full: string;
      };
    }>;
  };
  client?: {
    id: string;
    firstName?: string;
    lastName?: string;
    emails?: Array<{
      address: string;
      primary?: boolean;
    }>;
    phones?: Array<{
      number: string;
      primary?: boolean;
      smsAllowed?: boolean;
    }>;
    companyName?: string;
  };
  property?: {
    id: string;
    address?: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      coordinates?: {
        latitudeString: string;
        longitudeString: string;
      };
    };
  };
  job?: {
    id: string;
    jobberWebUri: string;
    jobNumber: number;
    total: number;
    salesperson?: {
      name?: {
        first?: string;
      };
    };
    customFields?: Array<{
      __typename: string;
      label: string;
      valueText: string;
    }>;
  };
}

interface JobberResponse {
  data: {
    visits: {
      edges: Array<{
        node: JobberVisitNode;
      }>;
    };
  };
}

/**
 * Transform Jobber GraphQL response to ScheduleDocument format
 */
export function transformJobberToScheduleDocument(
  jobberResponse: JobberResponse,
  startDate: Date,
  endDate: Date
): ScheduleDocument {
  const visits = jobberResponse.data.visits.edges.map(edge => edge.node);
  
  // Job Queue and Schedule Days
  const jobQueue: JobVisit[] = [];
  const visitsByDate = new Map<string, JobberVisitNode[]>();
  
  // Group visits by date and populate job queue
  visits.forEach(visit => {
    const visitDate = new Date(visit.startAt);
    const dateKey = visitDate.toISOString().split('T')[0];
    const dateName = visitDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    
    // Add to job queue if it matches the configured job queue day (e.g., Sunday)
    if (dateName === APP_SETTINGS.jobQueueDay) {
      jobQueue.push(transformJobberVisitToJobVisit(visit));
    }
    
    if (!visitsByDate.has(dateKey)) {
      visitsByDate.set(dateKey, []);
    }
    visitsByDate.get(dateKey)!.push(visit);
  });
  
  // Create ScheduleDays for each date in range
  const scheduleDays: ScheduleDay[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayVisits = visitsByDate.get(dateKey) || [];
    
    scheduleDays.push({
      id: `day-${dateKey}`,
      name: formatDayName(currentDate),
      date: dateKey,
      shortDate: formatShortDate(currentDate),
      jobVisits: dayVisits.map(transformJobberVisitToJobVisit)
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    id: `schedule-${startDate.toISOString()}-${endDate.toISOString()}`,
    title: `Schedule ${formatDateRange(startDate, endDate)}`,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    dateRangeStart: startDate.toISOString(),
    dateRangeEnd: endDate.toISOString(),
    scheduleDays,
    jobQueue
  };
}

/**
 * Transform individual Jobber visit to JobVisit format
 */
function transformJobberVisitToJobVisit(visit: JobberVisitNode): JobVisit {
  const startDate = new Date(visit.startAt);
  const endDate = new Date(visit.endAt);
  
  // Extract custom fields
  const workCode = visit.job?.customFields?.find(f => f.label === 'WorkCode')?.valueText;
  const geoCode = visit.job?.customFields?.find(f => f.label === 'GeoCode')?.valueText;
  const jobInfo = visit.job?.customFields?.find(f => f.label === 'Job Information')?.valueText;
  
  // Transform client data
  const client: JobClient | undefined = visit.client ? {
    id: visit.client.id,
    firstName: visit.client.firstName,
    lastName: visit.client.lastName,
    fullName: `${visit.client.firstName || ''} ${visit.client.lastName || ''}`.trim(),
    emails: visit.client.emails,
    phones: visit.client.phones,
    company: visit.client.companyName
  } : undefined;
  
  // Transform location data
  const location: JobLocation | undefined = visit.property?.address ? {
    street: visit.property.address.street,
    city: visit.property.address.city,
    province: visit.property.address.province,
    postalCode: visit.property.address.postalCode,
    coordinates: visit.property.address.coordinates ? {
      latitudeString: visit.property.address.coordinates.latitudeString,
      longitudeString: visit.property.address.coordinates.longitudeString
    } : null
  } : undefined;
  
  // Transform assigned team members
  const assignedMembers: TeamMemberInstance[] | undefined = visit.assignedUsers?.nodes.map(user => {
    const nameParts = user.name.full.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      member: {
        id: user.id,
        firstName,
        lastName,
        displayName: user.name.full
      },
      instanceId: `${visit.id}-${user.id}`
    };
  });
  
  return {
    id: visit.id,
    jobNumber: visit.job?.jobNumber || 0,
    title: visit.title,
    date: startDate.toISOString().split('T')[0],
    shortDate: formatShortDate(startDate),
    dayName: formatDayName(startDate),
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    allDay: false,
    location,
    instructions: visit.instructions,
    webUri: visit.job?.jobberWebUri,
    client,
    total: visit.job?.total,
    customFields: visit.job?.customFields,
    jobInfo,
    salesperson: visit.job?.salesperson?.name?.first,
    geoCode,
    workCode,
    assignedMembers,
    confirmationStatus: 'Unconfirmed' as JobVisitConfirmationStatus
  };
}

/**
 * Format helpers
 */
function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(date: Date): string {
  // Return time in HH:mm:ss format (24-hour) for TimeRangeSelectMenu
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}
