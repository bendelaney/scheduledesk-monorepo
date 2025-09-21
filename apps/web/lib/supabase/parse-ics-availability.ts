// ICS Parser for Availability Events
// Run with: npx tsx lib/supabase/parse-ics-availability.ts

const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Filtered Spirit Pruners Sept-Nov 2025//EN
BEGIN:VEVENT
DTSTART:20250901
DTEND:20250906
SUMMARY:Carson Off
END:VEVENT
BEGIN:VEVENT
DTSTART:20250902
DTEND:20250903
SUMMARY:Ben - NOT Bidding
END:VEVENT
BEGIN:VEVENT
DTSTART:20250902
DTEND:20250903
SUMMARY:Kelly Bidding
END:VEVENT
BEGIN:VEVENT
DTSTART:20250902
DTEND:20250903
SUMMARY:Felix 9:45-3:30
END:VEVENT
BEGIN:VEVENT
DTSTART:20250903
DTEND:20250904
SUMMARY:Felix 8:45-3:30
END:VEVENT
BEGIN:VEVENT
DTSTART:20250904
DTEND:20250905
SUMMARY:Felix < 2:00
END:VEVENT
BEGIN:VEVENT
DTSTART:20250908
DTEND:20250913
SUMMARY:Carson Off
END:VEVENT
BEGIN:VEVENT
DTSTART:20250908
DTEND:20250909
SUMMARY:Peter Off
END:VEVENT
BEGIN:VEVENT
DTSTART:20250924
DTEND:20250925
SUMMARY:Wakan NOT working
END:VEVENT
BEGIN:VEVENT
DTSTART:20250925
DTEND:20250927
SUMMARY:Stephanie Schreiber JOb
END:VEVENT
BEGIN:VEVENT
DTSTART:20251010
DTEND:20251010
SUMMARY:Admin Meeting
LOCATION:Cedar Coffee\n701 N Monroe St\, Spokane\, WA  99201\, United St
END:VEVENT
BEGIN:VEVENT
DTSTART:20251029
DTEND:20251030
SUMMARY:Wakan NOT working
END:VEVENT
END:VCALENDAR`;

interface ParsedEvent {
  originalSummary: string;
  startDate: string;
  endDate: string;
  teamMemberName: string | null;
  eventType: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

function parseICSDate(icsDate: string): string {
  // Convert YYYYMMDD to YYYY-MM-DD
  return `${icsDate.slice(0, 4)}-${icsDate.slice(4, 6)}-${icsDate.slice(6, 8)}`;
}

function parseICS(): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = icsData.split('\n');
  
  let currentEvent: any = {};
  let inEvent = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (trimmed === 'END:VEVENT') {
      inEvent = false;
      
      if (currentEvent.DTSTART && currentEvent.SUMMARY) {
        const parsed = parseEvent(currentEvent);
        if (parsed) {
          events.push(parsed);
        }
      }
    } else if (inEvent && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':');
      currentEvent[key] = value;
    }
  }
  
  return events;
}

function parseEvent(event: any): ParsedEvent | null {
  const summary = event.SUMMARY;
  const startDate = parseICSDate(event.DTSTART);
  const endDate = event.DTEND ? parseICSDate(event.DTEND) : startDate;
  
  // Skip admin meetings and non-team events
  if (summary.includes('Admin Meeting') || summary.includes('Stephanie Schreiber')) {
    return null;
  }
  
  // Extract team member name (first word)
  const firstWord = summary.split(' ')[0];
  let teamMemberName = firstWord;
  let eventType = 'Unavailable';
  let startTime: string | undefined;
  let endTime: string | undefined;
  let notes: string | undefined;
  
  // Pattern matching
  if (summary.includes(' > ')) {
    // "Name > Time" = Starts Late
    const match = summary.match(/(\w+)\s*>\s*(\d{1,2}:?\d{0,2})/);
    if (match) {
      teamMemberName = match[1];
      eventType = 'Starts Late';
      startTime = normalizeTime(match[2]);
    }
  } else if (summary.includes(' < ')) {
    // "Name < Time" = Ends Early
    const match = summary.match(/(\w+)\s*<\s*(\d{1,2}:?\d{0,2})/);
    if (match) {
      teamMemberName = match[1];
      eventType = 'Ends Early';
      endTime = normalizeTime(match[2]);
    }
  } else if (summary.includes(' Off')) {
    // "Name Off" = Time Off
    eventType = 'Time Off';
    teamMemberName = summary.replace(' Off', '');
  } else if (summary.includes('NOT working') || summary.includes('NOT Bidding')) {
    // "Name NOT working" = Unavailable
    eventType = 'Unavailable';
    teamMemberName = summary.split(' ')[0];
    notes = summary;
  } else if (summary.includes('Bidding')) {
    // "Name Bidding" = Special assignment
    eventType = 'Special Assignment';
    teamMemberName = summary.split(' ')[0];
    notes = 'Bidding';
  } else if (summary.match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/)) {
    // "Name HH:MM-HH:MM" = Custom hours
    const timeMatch = summary.match(/(\w+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
    if (timeMatch) {
      teamMemberName = timeMatch[1];
      eventType = 'Custom Hours';
      startTime = timeMatch[2];
      endTime = timeMatch[3];
    }
  }
  
  return {
    originalSummary: summary,
    startDate,
    endDate,
    teamMemberName,
    eventType,
    startTime,
    endTime,
    notes
  };
}

function normalizeTime(time: string): string {
  // Convert various time formats to HH:MM
  if (time.includes(':')) {
    return time;
  }
  
  // Handle formats like "830" -> "8:30"
  if (time.length === 3) {
    return `${time[0]}:${time.slice(1)}`;
  } else if (time.length === 4) {
    return `${time.slice(0, 2)}:${time.slice(2)}`;
  }
  
  return time;
}

function displayParsedEvents() {
  const events = parseICS();
  
  console.log('📅 PARSED AVAILABILITY EVENTS');
  console.log('=' .repeat(50));
  console.log();
  
  events.forEach((event, index) => {
    console.log(`${index + 1}. ${event.teamMemberName} - ${event.eventType}`);
    console.log(`   📆 ${event.startDate} to ${event.endDate}`);
    if (event.startTime) console.log(`   ⏰ Start: ${event.startTime}`);
    if (event.endTime) console.log(`   ⏰ End: ${event.endTime}`);
    if (event.notes) console.log(`   📝 Notes: ${event.notes}`);
    console.log(`   📋 Original: "${event.originalSummary}"`);
    console.log();
  });
  
  // Summary
  const teamMembers = Array.from(new Set(events.map(e => e.teamMemberName).filter(Boolean)));
  const eventTypes = Array.from(new Set(events.map(e => e.eventType).filter(Boolean)));
  
  console.log('📊 SUMMARY');
  console.log('=' .repeat(20));
  console.log(`Total Events: ${events.length}`);
  console.log(`Team Members: ${teamMembers.join(', ')}`);
  console.log(`Event Types: ${eventTypes.join(', ')}`);
  
  return events;
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  displayParsedEvents();
}

export { parseICS, displayParsedEvents };