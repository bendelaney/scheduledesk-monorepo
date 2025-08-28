# ScheduleDesk Supabase Setup Plan

**Date Created**: 2025-01-28  
**Status**: Planning Phase  
**Next Action**: Ready for implementation when needed

## Overview

This document outlines the complete plan for migrating ScheduleDesk from static data files to a Supabase-powered database with Jobber integration. The architecture supports both internal data management and external Jobber API integration.

## Current Data Analysis

### Existing Data Files
- `teamMembersData.ts` - Internal team member profiles
- `availabilityEventsData.ts` - Team scheduling constraints
- `jobNotesData.ts` - Jobber GraphQL job notes with attachments
- `scheduleDocumentData.ts` - Complex scheduling sessions with job visits
- `scheduleListData.ts` - Historical schedule versions
- `jobHighlightsData.ts` - Job categorization system
- `teamMemberHighlightsData.ts` - Skills and specializations
- `appSettings.ts` - Application configuration

### Key Insights
- **Jobber Integration**: Real data from Jobber's GraphQL API (job visits, notes, users)
- **Mixed Data Sources**: Jobber data (read-only) + Internal data (full CRUD)
- **Complex Relationships**: Jobs → Visits → Team Assignments → Notes → Attachments
- **Complete Workflow**: From Jobber job visits to internal team scheduling

## Implementation Plan

### Phase 1: Supabase Configuration & Setup

#### Dependencies Installation
```bash
pnpm add @supabase/supabase-js
```

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Client Configuration
- TypeScript integration
- Connection utilities in `/lib/supabase/`
- Error handling setup

### Phase 2: Database Schema Design - Hybrid Architecture

#### Internal Data Tables (Full CRUD)
```sql
-- Core internal entities that you fully control
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  display_name TEXT,
  avatar_uri TEXT,
  jobber_user_id TEXT, -- Link to Jobber user if applicable
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE availability_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  all_day BOOLEAN DEFAULT false,
  recurrence TEXT, -- JSON or enum
  monthly_recurrence JSONB, -- For complex monthly patterns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE schedule_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  data JSONB, -- Store complex schedule data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE schedule_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT NOW(),
  schedule_document_id UUID REFERENCES schedule_documents(id)
);

CREATE TABLE job_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  priority_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_member_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  type TEXT DEFAULT 'object',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationship tables
CREATE TABLE team_member_skills (
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  highlight_id UUID REFERENCES team_member_highlights(id) ON DELETE CASCADE,
  PRIMARY KEY (team_member_id, highlight_id)
);
```

#### Jobber Cache Tables (Read-Only Sync)
```sql
-- Cached Jobber data for performance and offline capability
CREATE TABLE jobber_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobber_id TEXT UNIQUE NOT NULL,
  title TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  instructions TEXT,
  client_data JSONB,
  assigned_users JSONB,
  status TEXT,
  last_sync TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobber_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobber_id TEXT UNIQUE NOT NULL,
  job_id TEXT,
  message TEXT,
  file_attachments JSONB,
  created_by JSONB,
  created_at TIMESTAMPTZ,
  last_edited_by JSONB,
  last_sync TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobber_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobber_id TEXT UNIQUE NOT NULL,
  name JSONB,
  email TEXT,
  last_sync TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 3: API Service Layer Architecture

#### File Structure
```
/lib/supabase/
  ├── client.ts              # Supabase client configuration
  ├── types.ts               # Generated TypeScript types
  ├── services/
  │   ├── teamMembers.ts     # Team member CRUD operations
  │   ├── availabilityEvents.ts # Availability event operations
  │   ├── scheduleDocuments.ts # Schedule management
  │   ├── jobberSync.ts      # Jobber integration services
  │   ├── appSettings.ts     # Settings management
  │   └── index.ts           # Service exports
  └── hooks/
      ├── useTeamMembers.ts  # React hooks for data fetching
      ├── useAvailabilityEvents.ts
      └── useScheduleDocuments.ts
```

#### Service Functions

**Internal Data Services**
```typescript
// Team Members
export const getTeamMembers = async () => Promise<TeamMember[]>
export const createTeamMember = async (data: CreateTeamMemberData) => Promise<TeamMember>
export const updateTeamMember = async (id: string, data: UpdateTeamMemberData) => Promise<TeamMember>
export const deleteTeamMember = async (id: string) => Promise<void>

// Availability Events
export const getAvailabilityEvents = async (filters?: EventFilters) => Promise<AvailabilityEvent[]>
export const createAvailabilityEvent = async (data: CreateEventData) => Promise<AvailabilityEvent>
export const updateAvailabilityEvent = async (id: string, data: UpdateEventData) => Promise<AvailabilityEvent>
export const deleteAvailabilityEvent = async (id: string) => Promise<void>

// Schedule Documents
export const getScheduleDocuments = async () => Promise<ScheduleDocument[]>
export const saveScheduleDocument = async (data: ScheduleDocumentData) => Promise<ScheduleDocument>
```

**Jobber Integration Services**
```typescript
// Sync Services
export const syncJobberData = async () => Promise<SyncResult>
export const syncJobVisits = async (dateRange: DateRange) => Promise<JobVisit[]>
export const syncJobNotes = async (jobId: string) => Promise<JobNote[]>

// Hybrid Query Services
export const getScheduleWithJobData = async (scheduleId: string) => Promise<EnrichedSchedule>
export const getTeamMemberWithAssignments = async (memberId: string) => Promise<TeamMemberWithJobs>
```

### Phase 4: Migration & Integration Strategy

#### Step 1: Data Migration
1. **Create Migration Scripts**: Convert existing data files to SQL inserts
2. **Preserve Relationships**: Maintain foreign key relationships during migration
3. **Validate Data**: Ensure all migrated data maintains integrity

#### Step 2: Component Updates
```typescript
// Before (static import)
import TeamMembersData from '@/data/teamMembersData';

// After (API service)
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';

const MyComponent = () => {
  const { data: teamMembers, loading, error } = useTeamMembers();
  // Component logic...
};
```

#### Step 3: Real-time Updates
```typescript
// Supabase subscriptions for live updates
const { data: events } = useSupabaseSubscription(
  'availability_events',
  {
    event: '*',
    schema: 'public',
  }
);
```

#### Step 4: Save Functionality Implementation
```typescript
// Connect EventEditor to database
const updateEventData = useCallback(async (data: Partial<AvailabilityEvent>) => {
  try {
    if (selectedEvent?.id) {
      await updateAvailabilityEvent(selectedEvent.id, data);
    } else {
      await createAvailabilityEvent(data as CreateEventData);
    }
    // Show success feedback
  } catch (error) {
    // Handle error
    console.error('Failed to save event:', error);
  }
}, [selectedEvent]);
```

### Phase 5: Advanced Features

#### Conflict Detection
- **Jobber vs Internal Changes**: Detect when Jobber data conflicts with internal schedules
- **Last Modified Tracking**: Track when data was last synced vs last modified internally
- **Conflict Resolution UI**: Allow users to resolve conflicts manually

#### Optimistic Updates
- **Fast UI Updates**: Update UI immediately, sync in background
- **Error Recovery**: Roll back optimistic updates if sync fails
- **Loading States**: Show appropriate loading indicators

#### Offline Support
- **Local Caching**: Cache frequently accessed data locally
- **Queue Operations**: Queue write operations when offline
- **Sync on Reconnect**: Automatic sync when connection restored

#### Data Validation
- **Schema Validation**: Ensure data consistency between systems
- **Business Rules**: Enforce scheduling business logic
- **Data Integrity**: Maintain referential integrity across tables

## Implementation Checklist

### Phase 1: Setup ✅
- [ ] Install Supabase dependencies
- [ ] Configure environment variables
- [ ] Set up Supabase client
- [ ] Create database project

### Phase 2: Database ✅
- [ ] Create internal data tables
- [ ] Create Jobber cache tables  
- [ ] Set up Row Level Security policies
- [ ] Create database functions/triggers

### Phase 3: Services ✅
- [ ] Implement team member services
- [ ] Implement availability event services
- [ ] Implement schedule document services
- [ ] Create Jobber sync services
- [ ] Build React hooks for data fetching

### Phase 4: Migration ✅
- [ ] Create data migration scripts
- [ ] Migrate existing data
- [ ] Update components to use new services
- [ ] Test all existing functionality

### Phase 5: Advanced ✅
- [ ] Implement real-time subscriptions
- [ ] Add conflict detection
- [ ] Build offline support
- [ ] Add comprehensive error handling

## Benefits of This Architecture

1. **Scalability**: Real database vs static files
2. **Real-time Updates**: Multiple users can collaborate
3. **Data Persistence**: Actual save functionality
4. **Jobber Integration**: Seamless integration with existing Jobber data
5. **Offline Capability**: Cached data for offline use
6. **Type Safety**: Generated TypeScript types from database schema
7. **Performance**: Optimized queries and caching
8. **Future-Proof**: Easy to extend and modify

## Next Steps

When ready to implement:
1. Start with Phase 1 (Supabase setup)
2. Create a simple test table first
3. Implement one service at a time
4. Migrate components incrementally
5. Test thoroughly at each step

---

**Note**: This plan can be implemented incrementally. You can start with basic CRUD operations and gradually add more sophisticated features like Jobber sync and real-time updates.