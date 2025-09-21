# CRUD Implementation Plan for Availability Events

## PROMPT FOR CLAUDE CODE

When you're ready to implement CRUD operations for availability events, use this prompt:

---

**TASK**: Implement full CRUD operations for availability events in the ScheduleDesk web app. The goal is to replace static data usage with live Supabase database operations while maintaining all existing UI functionality.

## CURRENT STATE ANALYSIS

### ✅ ALREADY IMPLEMENTED

**Database Layer:**
- Complete Supabase schema at `/lib/supabase/schema.sql`
- `availability_events` table with proper structure
- Database client setup at `/lib/supabase/client.ts`
- Row Level Security policies configured

**Service Layer:**
- Full CRUD service functions in `/lib/supabase/services/availabilityEvents.ts`:
  - `getAvailabilityEvents(teamMemberId?)`
  - `createAvailabilityEvent(event)`
  - `updateAvailabilityEvent(id, updates)`
  - `deleteAvailabilityEvent(id)`

**Data Hooks:**
- `useAvailabilityEvents` hook at `/lib/supabase/hooks/useAvailabilityEvents.ts`
- Includes loading states, error handling, and static data fallback
- `useTeamMembers` hook for team member data

**UI Components:**
- `EventEditor` - Comprehensive form component for event creation/editing
- `CalendarPopover` - Popup interface for event management
- `TeamMemberCalendar` - Individual member calendar view
- `CalendarGrid` - Grid display component
- Complete type definitions in `/types/index.ts`

### ❌ MISSING INTEGRATION

**Data Flow Issues:**
- UI components use static data from `/data/availabilityEventsData.ts`
- `CalendarPopover` save button shows "STUB" placeholder
- No real-time refetching after mutations
- Team member ID mapping needs conversion between frontend and database

**Specific Gaps:**
- `TeamMemberCalendar.tsx:28` - Uses `AvailabilityEventsData` static import
- `CalendarPopover.tsx:92` - Shows "STUB: Save new event" console log
- `TeamMemberPage.tsx:92` - Shows "STUB: Save event data to backend"

## IMPLEMENTATION REQUIREMENTS

### Phase 1: Data Type Mapping & Conversion

**Files to Create/Modify:**
- Create `/lib/supabase/adapters/eventAdapters.ts`

**Required Functions:**

```typescript
// Convert frontend AvailabilityEvent to database format
export const eventToDatabase = (event: Partial<AvailabilityEvent>) => {
  return {
    team_member_id: event.teamMember?.id, // Map to actual team member UUID
    event_type: event.eventType,
    start_date: event.startDate,
    end_date: event.endDate,
    start_time: event.startTime,
    end_time: event.endTime,
    all_day: event.allDay || false,
    recurrence: event.recurrence,
    monthly_recurrence: event.monthlyRecurrence ? JSON.stringify(event.monthlyRecurrence) : null
  };
};

// Convert database record to frontend AvailabilityEvent
export const eventFromDatabase = (dbEvent: any, teamMembers: TeamMember[]) => {
  const teamMember = teamMembers.find(tm => tm.id === dbEvent.team_member_id);
  return {
    id: dbEvent.id,
    teamMember: teamMember || { id: dbEvent.team_member_id },
    eventType: dbEvent.event_type,
    customEventName: dbEvent.event_type === 'Custom' ? dbEvent.custom_event_name : undefined,
    startDate: dbEvent.start_date,
    endDate: dbEvent.end_date,
    startTime: dbEvent.start_time,
    endTime: dbEvent.end_time,
    allDay: dbEvent.all_day,
    recurrence: dbEvent.recurrence,
    monthlyRecurrence: dbEvent.monthly_recurrence ? JSON.parse(dbEvent.monthly_recurrence) : undefined
  } as AvailabilityEvent;
};
```

### Phase 2: Enhanced Hook with Mutations

**File to Modify:** `/lib/supabase/hooks/useAvailabilityEvents.ts`

**Add These Functions:**

```typescript
const createEvent = async (eventData: Partial<AvailabilityEvent>) => {
  try {
    setLoading(true);
    const dbFormat = eventToDatabase(eventData);
    const newEvent = await createAvailabilityEvent(dbFormat);

    // Optimistic update
    setData(prev => [...prev, eventFromDatabase(newEvent, teamMembers)]);

    return newEvent;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};

const updateEvent = async (id: string, updates: Partial<AvailabilityEvent>) => {
  try {
    setLoading(true);
    const dbFormat = eventToDatabase(updates);
    const updatedEvent = await updateAvailabilityEvent(id, dbFormat);

    // Optimistic update
    setData(prev => prev.map(event =>
      event.id === id ? eventFromDatabase(updatedEvent, teamMembers) : event
    ));

    return updatedEvent;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};

const deleteEvent = async (id: string) => {
  try {
    setLoading(true);
    await deleteAvailabilityEvent(id);

    // Optimistic update
    setData(prev => prev.filter(event => event.id !== id));
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};

// Return these in the hook result
return {
  data,
  loading,
  error,
  refetch,
  createEvent,
  updateEvent,
  deleteEvent
};
```

### Phase 3: UI Integration

**File to Modify:** `/components/TeamMemberCalendar/TeamMemberCalendar.tsx`

**Replace Static Data:**
```typescript
// REPLACE this static import:
// import AvailabilityEventsData from '@/data/availabilityEventsData';

// WITH this hook usage:
import { useAvailabilityEvents } from '@/lib/supabase/hooks';

const TeamMemberCalendar: React.FC<TeamMemberCalendarProps> = ({
  teamMember,
  // ... other props
}) => {
  const { data: availabilityEvents, loading, error } = useAvailabilityEvents(teamMember.id);

  // Filter is now done by the hook based on teamMemberId parameter
  const filteredEvents = availabilityEvents;

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error loading events: {error}</div>;
  }

  // ... rest of component
};
```

**File to Modify:** `/app/team/[memberId]/page.tsx`

**Replace Save Stubs:**
```typescript
// Add hook usage at top of component:
const { createEvent, updateEvent } = useAvailabilityEvents();

// REPLACE the stub save function:
const handleEventEditorChange = useCallback(async (data: Partial<AvailabilityEvent>) => {
  console.log('Event data updated:', data);
  setEventEditorValues(prev => ({ ...prev, ...data }));

  try {
    if (activeEvent?.id) {
      // Update existing event
      await updateEvent(activeEvent.id, data);
      console.log('Event updated successfully');
    } else {
      // Create new event
      await createEvent({ ...eventEditorValues, ...data });
      console.log('Event created successfully');
      handleClosePopover(); // Close popover after successful creation
    }
  } catch (err) {
    console.error('Failed to save event:', err);
    // Add user-facing error handling here
  }
}, [eventEditorValues, activeEvent, updateEvent, createEvent]);
```

**File to Modify:** `/components/CalendarPopover/CalendarPopover.tsx`

**Replace Save Button Stub:**
```typescript
// Add these props to the component interface:
interface CalendarPopoverProps {
  // ... existing props
  onSave?: (eventData: Partial<AvailabilityEvent>) => Promise<void>;
  saving?: boolean;
}

// REPLACE the stub save button:
{!activeEvent && (
  <Button
    disabled={!isSaveable || saving}
    size="small"
    onClick={async () => {
      if (isSaveable && onSave) {
        try {
          await onSave(eventEditorValues);
        } catch (err) {
          console.error('Save failed:', err);
          // Add error handling UI
        }
      }
    }}
    className="calendar-popover__save-button"
  >
    {saving ? 'Saving...' : 'Save'}
  </Button>
)}
```

### Phase 4: Database Schema Updates

**Potential Schema Additions Needed:**

Check if the database schema needs these fields that are used in the frontend:

```sql
-- Add custom_event_name field if missing
ALTER TABLE availability_events
ADD COLUMN IF NOT EXISTS custom_event_name TEXT;

-- Ensure monthly_recurrence is JSONB not TEXT
ALTER TABLE availability_events
ALTER COLUMN monthly_recurrence TYPE JSONB USING monthly_recurrence::JSONB;
```

### Phase 5: Error Handling & Validation

**Add Client-Side Validation:**

```typescript
const validateEvent = (event: Partial<AvailabilityEvent>): string[] => {
  const errors: string[] = [];

  if (!event.teamMember?.id) errors.push('Team member is required');
  if (!event.eventType) errors.push('Event type is required');
  if (!event.startDate) errors.push('Start date is required');
  if (event.eventType === 'Custom' && !event.customEventName) {
    errors.push('Custom event name is required');
  }
  if (!event.allDay && event.startTime && event.endTime) {
    if (event.startTime >= event.endTime) {
      errors.push('End time must be after start time');
    }
  }

  return errors;
};
```

**Add Error UI Components:**

```typescript
const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="error-message" style={{ color: 'red', padding: '8px' }}>
    {error}
  </div>
);
```

### Phase 6: Testing Checklist

**Test These Scenarios:**

1. **Create Events:**
   - [ ] Create all-day event
   - [ ] Create timed event
   - [ ] Create recurring event
   - [ ] Create custom event with name
   - [ ] Verify data persists after page refresh

2. **Update Events:**
   - [ ] Edit existing event details
   - [ ] Change from all-day to timed
   - [ ] Update recurrence settings
   - [ ] Verify optimistic updates work

3. **Delete Events:**
   - [ ] Delete single event
   - [ ] Verify removal from UI
   - [ ] Check database deletion

4. **Error Handling:**
   - [ ] Network failure scenarios
   - [ ] Invalid data submission
   - [ ] Concurrent editing
   - [ ] Fallback to static data when needed

5. **UI/UX:**
   - [ ] Loading states display properly
   - [ ] Save button enables/disables correctly
   - [ ] Success feedback appears
   - [ ] Error messages are helpful

### Phase 7: Performance & Polish

**Optimizations to Consider:**

1. **Caching Strategy:**
   - Add React Query or SWR for better caching
   - Implement stale-while-revalidate pattern

2. **Real-time Updates:**
   - Consider Supabase real-time subscriptions
   - Handle concurrent editing scenarios

3. **Data Pagination:**
   - Add date range filtering for large datasets
   - Implement virtual scrolling if needed

## IMPLEMENTATION ORDER

1. Start with Phase 1 (Data Adapters) - Foundation for everything
2. Move to Phase 2 (Enhanced Hook) - Core functionality
3. Phase 3 (UI Integration) - Connect the pieces
4. Phase 4 (Schema) - Handle any database adjustments
5. Phase 5 (Validation) - Add safety and UX polish
6. Phase 6 (Testing) - Verify everything works
7. Phase 7 (Polish) - Performance and real-time features

## CRITICAL SUCCESS CRITERIA

- [ ] No more static data imports in event-related components
- [ ] All CRUD operations work through Supabase
- [ ] Data persists across page refreshes
- [ ] Loading and error states provide good UX
- [ ] Event creation/editing flows work seamlessly
- [ ] Team member calendars show live data
- [ ] Performance remains acceptable

## ROLLBACK PLAN

If issues arise:
1. Static data fallback is already implemented in hooks
2. Can revert UI components to static imports temporarily
3. Database operations are isolated in service layer
4. No destructive schema changes planned

---

**Execute this plan systematically, testing each phase before moving to the next. Focus on getting basic CRUD working first, then add polish and optimizations.**