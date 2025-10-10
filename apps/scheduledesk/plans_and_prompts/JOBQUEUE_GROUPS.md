# Job Queue Groups Implementation Plan

## Objective
Implement hierarchical job queue grouping with auto-generated Queue Day groups and user-defined Custom Groups. This allows jobs to be organized by their queue day (e.g., multiple Sundays when date range spans weeks) and further subdivided into custom categories.

## Context
Currently, the job queue is a flat array that only shows jobs for one queue day (Sunday by default). When users select a date range spanning multiple weeks, we need to:
1. Show separate queue day groups (e.g., "Sunday 10/12", "Sunday 10/19", "Sunday 10/26")
2. Allow users to create custom subgroups within each queue day (e.g., "Emergency Jobs", "Follow-ups")
3. Store custom group metadata in Supabase while job data remains in Jobber

## Implementation Phases

---

## Phase 1: Type Definitions

### File: `/apps/scheduledesk/types/index.ts`

Add new types after the existing `JobVisit` interface:

```typescript
export interface CustomJobGroup {
  id: string;
  name: string;
  color: string;              // hex color code
  sortOrder: number;
  jobs: JobVisit[];
}

export interface JobQueueGroup {
  id: string;
  queueDate: string;          // ISO date string (e.g., "2025-10-12")
  queueDayName: string;        // Display name (e.g., "Sunday 10/12")
  customGroups?: CustomJobGroup[];
  ungroupedJobs: JobVisit[];   // Jobs not assigned to any custom group
}
```

Update the `ScheduleDocument` interface by replacing:
```typescript
jobQueue: JobVisit[];
```

With:
```typescript
jobQueueGroups: JobQueueGroup[];
```

---

## Phase 2: Data Transformation Logic

### File: `/apps/scheduledesk/utils/jobberTransform.ts`

Update the `transformJobberToScheduleDocument` function:

**Current logic (lines 93-112):**
- Single `jobQueue` array
- Only adds jobs matching the configured queue day

**New logic:**

```typescript
export function transformJobberToScheduleDocument(
  jobberResponse: JobberResponse,
  startDate: Date,
  endDate: Date
): ScheduleDocument {
  const visits = jobberResponse.data.visits.edges.map(edge => edge.node);

  // NEW: Collect all queue day dates within the range
  const queueDayDates = new Set<string>();
  const jobsByQueueDate = new Map<string, JobberVisitNode[]>();

  visits.forEach(visit => {
    const visitDate = new Date(visit.startAt);
    const dateKey = visitDate.toISOString().split('T')[0];
    const dateName = visitDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

    // Check if this visit falls on the configured queue day
    if (dateName === APP_SETTINGS.jobQueueDay) {
      queueDayDates.add(dateKey);

      if (!jobsByQueueDate.has(dateKey)) {
        jobsByQueueDate.set(dateKey, []);
      }
      jobsByQueueDate.get(dateKey)!.push(visit);
    }
  });

  // NEW: Create JobQueueGroup for each queue day
  const jobQueueGroups: JobQueueGroup[] = [];

  queueDayDates.forEach(dateKey => {
    const date = new Date(dateKey);
    const jobs = jobsByQueueDate.get(dateKey) || [];

    jobQueueGroups.push({
      id: `queue-${dateKey}`,
      queueDate: dateKey,
      queueDayName: `${formatDayName(date)} ${formatShortDate(date)}`,
      customGroups: [],  // Empty for now - will be populated from Supabase
      ungroupedJobs: jobs.map(transformJobberVisitToJobVisit)
    });
  });

  // Sort queue groups by date
  jobQueueGroups.sort((a, b) =>
    new Date(a.queueDate).getTime() - new Date(b.queueDate).getTime()
  );

  // ... rest of the function (scheduleDays creation)

  return {
    id: `schedule-${startDate.toISOString()}-${endDate.toISOString()}`,
    title: `Schedule ${formatDateRange(startDate, endDate)}`,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    dateRangeStart: startDate.toISOString(),
    dateRangeEnd: endDate.toISOString(),
    scheduleDays,
    jobQueueGroups  // Changed from jobQueue
  };
}
```

---

## Phase 3: UI Components - Basic Structure

### File: `/apps/scheduledesk/components/ScheduleDocument/ScheduleDocument.tsx`

**Current structure (lines 1352-1383):**
- Single job queue section
- Flat list of jobs

**New structure:**

Replace the existing job queue section with:

```tsx
{scheduleData.jobQueueGroups && scheduleData.jobQueueGroups.length > 0 && (
  <section className="job-queue">
    <header className="job-queue-header">
      <h2>Job Queue</h2>
    </header>

    {scheduleData.jobQueueGroups.map((queueGroup) => (
      <div key={queueGroup.id} className="queue-day-group">
        <header
          className="queue-day-header"
          onClick={() => toggleGroupFold(queueGroup.id)}
        >
          <div className="toggle">
            <RotatingIcon rotate={foldState[queueGroup.id]} icon={<FoldCaret />} />
          </div>
          <h3>{queueGroup.queueDayName}</h3>
          <button
            className="manage-groups-button"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open custom group management modal
            }}
          >
            <Gear />
          </button>
        </header>

        <div className={`queue-day-inner ${foldState[queueGroup.id] ? 'open' : 'closed'}`}>
          {/* Custom Groups */}
          {queueGroup.customGroups && queueGroup.customGroups.length > 0 && (
            queueGroup.customGroups.map((customGroup) => (
              <div
                key={customGroup.id}
                className="custom-job-group"
                style={{ '--group-color': customGroup.color } as React.CSSProperties}
              >
                <header
                  className="custom-group-header"
                  onClick={() => toggleGroupFold(customGroup.id)}
                >
                  <div className="toggle">
                    <RotatingIcon rotate={foldState[customGroup.id]} icon={<FoldCaret />} />
                  </div>
                  <h4>{customGroup.name}</h4>
                  <span className="job-count">({customGroup.jobs.length})</span>
                </header>

                <div className={`custom-group-inner ${foldState[customGroup.id] ? 'open' : 'closed'}`}>
                  {customGroup.jobs.map((job) => {
                    const jobBlockId = createJobBlockId(queueGroup.id, customGroup.id, job.id.toString());
                    return (
                      <Draggable
                        id={jobBlockId}
                        key={`drag-${job.id}`}
                        className="job-draggable"
                        data-type="job"
                        data-queue-date={queueGroup.queueDate}
                        data-custom-group-id={customGroup.id}
                      >
                        <JobBlock
                          id={job.id.toString()}
                          key={`job-${job.id}`}
                          job={job}
                          showTimeInputs={false}
                          onModalStateChange={handleModalStateChange}
                        />
                      </Draggable>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Ungrouped Jobs */}
          {queueGroup.ungroupedJobs && queueGroup.ungroupedJobs.length > 0 && (
            <div className="ungrouped-jobs">
              {queueGroup.ungroupedJobs.map((job) => {
                const jobBlockId = createJobBlockId(queueGroup.id, 'ungrouped', job.id.toString());
                return (
                  <Draggable
                    id={jobBlockId}
                    key={`drag-${job.id}`}
                    className="job-draggable"
                    data-type="job"
                    data-queue-date={queueGroup.queueDate}
                  >
                    <JobBlock
                      id={job.id.toString()}
                      key={`job-${job.id}`}
                      job={job}
                      showTimeInputs={false}
                      onModalStateChange={handleModalStateChange}
                    />
                  </Draggable>
                );
              })}
            </div>
          )}
        </div>
      </div>
    ))}
  </section>
)}
```

**Update fold state initialization:**

In `buildInitialFoldState` function, add:
```typescript
const buildInitialFoldState = (
  scheduleDays: ScheduleDay[],
  jobQueueGroups: JobQueueGroup[]
): GroupFoldState => {
  const state = { ...initialFoldState };

  scheduleDays.forEach((day) => {
    state[day.date] = true;
    state[day.date + "unassignedGroup"] = false;
  });

  // Add job queue groups to fold state
  jobQueueGroups.forEach((queueGroup) => {
    state[queueGroup.id] = true;  // Start expanded

    queueGroup.customGroups?.forEach((customGroup) => {
      state[customGroup.id] = true;  // Start expanded
    });
  });

  return state;
};
```

**Update the call sites:**
```typescript
const [foldState, setFoldState] = useState<GroupFoldState>(
  buildInitialFoldState(scheduleDays || [], scheduleData?.jobQueueGroups || [])
);
```

---

## Phase 4: Update Block ID Utilities

### File: `/apps/scheduledesk/components/ScheduleDocument/utils.ts`

Update `createJobBlockId` to support the new hierarchy:

```typescript
// Old signature:
export const createJobBlockId = (dayId: string, jobId: string): string => {
  return `day:${dayId}:job:${jobId}`;
};

// New signature:
export const createJobBlockId = (
  context: string,       // e.g., "queue-2025-10-12", "day-2025-10-12"
  groupId: string,       // e.g., "custom-uuid", "ungrouped"
  jobId: string
): string => {
  if (context.startsWith('queue-')) {
    if (groupId === 'ungrouped') {
      return `queue:${context}:job:${jobId}`;
    }
    return `queue:${context}:group:${groupId}:job:${jobId}`;
  }
  // Legacy day format
  return `day:${context}:job:${jobId}`;
};
```

Update `parseBlockId` to handle new formats:

```typescript
export const parseBlockId = (blockId: string): ScheduleBlockId | null => {
  const parts = blockId.split(':');

  // Queue with custom group: queue:queue-2025-10-12:group:uuid:job:123
  if (parts[0] === 'queue' && parts[2] === 'group' && parts[4] === 'job') {
    return {
      type: 'job',
      dayId: parts[1],        // queue-2025-10-12
      blockId: parts[5],      // job ID
      assignment: parts[3],   // custom group ID
      queueDate: parts[1].replace('queue-', '')
    };
  }

  // Queue ungrouped: queue:queue-2025-10-12:job:123
  if (parts[0] === 'queue' && parts[2] === 'job') {
    return {
      type: 'job',
      dayId: parts[1],        // queue-2025-10-12
      blockId: parts[3],      // job ID
      assignment: 'ungrouped',
      queueDate: parts[1].replace('queue-', '')
    };
  }

  // Existing day logic...
  // ... rest of existing parsing logic
};
```

Add `queueDate` to `ScheduleBlockId` type:
```typescript
export interface ScheduleBlockId {
  type: BlockType;
  dayId: string;
  blockId: string;
  assignment?: string;
  queueDate?: string;  // NEW
}
```

---

## Phase 5: Database Schema

Create a new migration file: `/apps/scheduledesk/supabase/migrations/YYYYMMDDHHMMSS_job_queue_custom_groups.sql`

```sql
-- Custom job queue groups
CREATE TABLE IF NOT EXISTS job_queue_custom_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  queue_date DATE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job assignments to custom groups
CREATE TABLE IF NOT EXISTS job_queue_group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES job_queue_custom_groups(id) ON DELETE CASCADE NOT NULL,
  job_id TEXT NOT NULL,  -- Jobber job visit ID
  sort_order INTEGER NOT NULL DEFAULT 0,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(group_id, job_id)  -- Prevent duplicate assignments
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_groups_user_date
  ON job_queue_custom_groups(user_id, queue_date);

CREATE INDEX IF NOT EXISTS idx_custom_groups_user
  ON job_queue_custom_groups(user_id);

CREATE INDEX IF NOT EXISTS idx_group_assignments_group
  ON job_queue_group_assignments(group_id);

CREATE INDEX IF NOT EXISTS idx_group_assignments_job
  ON job_queue_group_assignments(job_id);

-- Row Level Security
ALTER TABLE job_queue_custom_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_queue_group_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for job_queue_custom_groups
CREATE POLICY "Users can view their own custom groups"
  ON job_queue_custom_groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom groups"
  ON job_queue_custom_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom groups"
  ON job_queue_custom_groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom groups"
  ON job_queue_custom_groups FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for job_queue_group_assignments
CREATE POLICY "Users can view assignments for their groups"
  ON job_queue_group_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_queue_custom_groups
      WHERE id = group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assignments for their groups"
  ON job_queue_group_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_queue_custom_groups
      WHERE id = group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assignments for their groups"
  ON job_queue_group_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM job_queue_custom_groups
      WHERE id = group_id AND user_id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_queue_custom_groups_updated_at
  BEFORE UPDATE ON job_queue_custom_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Phase 6: API Routes

### 1. GET Custom Groups
**File:** `/apps/scheduledesk/app/api/job-queue-groups/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queueDate = searchParams.get('queueDate');

  if (!queueDate) {
    return NextResponse.json({ error: 'queueDate is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch custom groups for the queue date
  const { data: groups, error: groupsError } = await supabase
    .from('job_queue_custom_groups')
    .select('*')
    .eq('user_id', user.id)
    .eq('queue_date', queueDate)
    .order('sort_order', { ascending: true });

  if (groupsError) {
    console.error('Error fetching custom groups:', groupsError);
    return NextResponse.json({ error: 'Failed to fetch custom groups' }, { status: 500 });
  }

  // Fetch job assignments for each group
  const groupsWithJobs = await Promise.all(
    (groups || []).map(async (group) => {
      const { data: assignments, error: assignError } = await supabase
        .from('job_queue_group_assignments')
        .select('job_id, sort_order')
        .eq('group_id', group.id)
        .order('sort_order', { ascending: true });

      if (assignError) {
        console.error(`Error fetching assignments for group ${group.id}:`, assignError);
        return { ...group, jobIds: [] };
      }

      return {
        ...group,
        jobIds: (assignments || []).map(a => a.job_id)
      };
    })
  );

  return NextResponse.json({ groups: groupsWithJobs });
}
```

### 2. POST Create Custom Group
**File:** `/apps/scheduledesk/app/api/job-queue-groups/route.ts` (add to same file)

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, color, queueDate, sortOrder = 0 } = body;

  if (!name || !color || !queueDate) {
    return NextResponse.json({ error: 'name, color, and queueDate are required' }, { status: 400 });
  }

  const { data: group, error: insertError } = await supabase
    .from('job_queue_custom_groups')
    .insert({
      user_id: user.id,
      name,
      color,
      queue_date: queueDate,
      sort_order: sortOrder
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating custom group:', insertError);
    return NextResponse.json({ error: 'Failed to create custom group' }, { status: 500 });
  }

  return NextResponse.json({ group });
}
```

### 3. PUT Update Custom Group
**File:** `/apps/scheduledesk/app/api/job-queue-groups/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, color, sortOrder } = body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (color !== undefined) updateData.color = color;
  if (sortOrder !== undefined) updateData.sort_order = sortOrder;

  const { data: group, error: updateError } = await supabase
    .from('job_queue_custom_groups')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating custom group:', updateError);
    return NextResponse.json({ error: 'Failed to update custom group' }, { status: 500 });
  }

  return NextResponse.json({ group });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete group (assignments will cascade)
  const { error: deleteError } = await supabase
    .from('job_queue_custom_groups')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Error deleting custom group:', deleteError);
    return NextResponse.json({ error: 'Failed to delete custom group' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

### 4. POST Assign Job to Group
**File:** `/apps/scheduledesk/app/api/job-queue-groups/[id]/assign/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { jobId, sortOrder = 0 } = body;

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  // Verify group belongs to user
  const { data: group, error: groupError } = await supabase
    .from('job_queue_custom_groups')
    .select('id')
    .eq('id', groupId)
    .eq('user_id', user.id)
    .single();

  if (groupError || !group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  // Remove job from any other group first (upsert would fail due to UNIQUE constraint)
  await supabase
    .from('job_queue_group_assignments')
    .delete()
    .eq('job_id', jobId);

  // Assign job to new group
  const { data: assignment, error: assignError } = await supabase
    .from('job_queue_group_assignments')
    .insert({
      group_id: groupId,
      job_id: jobId,
      sort_order: sortOrder
    })
    .select()
    .single();

  if (assignError) {
    console.error('Error assigning job to group:', assignError);
    return NextResponse.json({ error: 'Failed to assign job' }, { status: 500 });
  }

  return NextResponse.json({ assignment });
}
```

### 5. DELETE Unassign Job from Groups
**File:** `/apps/scheduledesk/app/api/job-queue-groups/unassign/[jobId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete assignment (only if it belongs to user's group)
  const { error: deleteError } = await supabase
    .from('job_queue_group_assignments')
    .delete()
    .eq('job_id', jobId)
    .in('group_id',
      supabase
        .from('job_queue_custom_groups')
        .select('id')
        .eq('user_id', user.id)
    );

  if (deleteError) {
    console.error('Error unassigning job:', deleteError);
    return NextResponse.json({ error: 'Failed to unassign job' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

## Phase 7: Integrate Custom Groups into Data Flow

### File: `/apps/scheduledesk/utils/jobberTransform.ts`

Create a new function to enrich job queue groups with custom group data:

```typescript
export async function enrichJobQueueGroupsWithCustomGroups(
  jobQueueGroups: JobQueueGroup[],
  userId: string
): Promise<JobQueueGroup[]> {
  const enrichedGroups = await Promise.all(
    jobQueueGroups.map(async (queueGroup) => {
      // Fetch custom groups for this queue date
      const response = await fetch(
        `/api/job-queue-groups?queueDate=${queueGroup.queueDate}`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );

      if (!response.ok) {
        console.error(`Failed to fetch custom groups for ${queueGroup.queueDate}`);
        return queueGroup;
      }

      const { groups } = await response.json();

      // Map custom groups and assign jobs from ungroupedJobs
      const customGroups: CustomJobGroup[] = (groups || []).map((group: any) => {
        const jobIds = new Set(group.jobIds || []);

        // Find jobs in ungroupedJobs that belong to this custom group
        const groupJobs = queueGroup.ungroupedJobs.filter(job =>
          jobIds.has(job.id.toString())
        );

        return {
          id: group.id,
          name: group.name,
          color: group.color,
          sortOrder: group.sort_order,
          jobs: groupJobs
        };
      });

      // Remove jobs that are in custom groups from ungroupedJobs
      const assignedJobIds = new Set(
        customGroups.flatMap(g => g.jobs.map(j => j.id.toString()))
      );

      const remainingUngroupedJobs = queueGroup.ungroupedJobs.filter(
        job => !assignedJobIds.has(job.id.toString())
      );

      return {
        ...queueGroup,
        customGroups,
        ungroupedJobs: remainingUngroupedJobs
      };
    })
  );

  return enrichedGroups;
}
```

### Update the page that fetches schedule data

**File:** Wherever you're calling `transformJobberToScheduleDocument` (likely in a page component or API route)

After transforming:
```typescript
const scheduleDocument = transformJobberToScheduleDocument(jobberData, startDate, endDate);

// Enrich with custom groups
const enrichedScheduleDocument = {
  ...scheduleDocument,
  jobQueueGroups: await enrichJobQueueGroupsWithCustomGroups(
    scheduleDocument.jobQueueGroups,
    user.id
  )
};
```

---

## Phase 8: Styling

### File: `/apps/scheduledesk/components/ScheduleDocument/ScheduleDocument.scss`

Add styles for the new hierarchical structure:

```scss
.job-queue {
  // Existing styles...

  .queue-day-group {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 16px;

    .queue-day-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-secondary);
      cursor: pointer;
      border-bottom: 1px solid var(--border-color);

      h3 {
        flex: 1;
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .manage-groups-button {
        padding: 6px;
        background: transparent;
        border: none;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }
    }

    .queue-day-inner {
      padding: 16px;

      &.closed {
        display: none;
      }

      &.open {
        display: block;
      }
    }
  }

  .custom-job-group {
    margin-bottom: 16px;
    border-left: 4px solid var(--group-color, #ccc);
    padding-left: 12px;

    .custom-group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(var(--group-color-rgb), 0.1);
      cursor: pointer;
      border-radius: 4px;

      h4 {
        flex: 1;
        margin: 0;
        font-size: 14px;
        font-weight: 500;
      }

      .job-count {
        font-size: 12px;
        opacity: 0.7;
      }
    }

    .custom-group-inner {
      margin-top: 8px;

      &.closed {
        display: none;
      }

      &.open {
        display: block;
      }
    }
  }

  .ungrouped-jobs {
    margin-top: 16px;
  }
}
```

---

## Testing Checklist

- [ ] Multiple queue days appear when date range spans multiple weeks
- [ ] Jobs are correctly grouped by their queue date
- [ ] Custom groups can be created via API
- [ ] Custom groups appear in the UI with correct styling
- [ ] Jobs can be assigned to custom groups via API
- [ ] Assigned jobs move from ungrouped to custom group
- [ ] Unassigning jobs moves them back to ungrouped
- [ ] Deleting a custom group moves jobs back to ungrouped
- [ ] Fold/collapse state works for all hierarchy levels
- [ ] RLS policies prevent users from accessing other users' groups

---

## Notes

- **Color system**: Define a predefined palette of 8-10 colors that users can choose from when creating custom groups
- **Sorting**: Custom groups have a `sortOrder` field for manual reordering within a queue day
- **Performance**: If job queue grows very large (>100 jobs), consider implementing virtualization
- **Data sync**: Custom group assignments are local to your app - if a job is deleted in Jobber, clean up orphaned assignments periodically
- **Future enhancement**: Allow dragging to reorder custom groups and jobs within groups
