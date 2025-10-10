# Drag & Drop Updates for Job Queue Implementation

## Objective
Implement comprehensive drag-and-drop functionality for the hierarchical job queue system, including:
1. Job movement between schedule days and job queue groups
2. Job movement between different queue day groups
3. Job movement between custom groups within a queue day
4. Team member assignment dialog when dragging jobs from schedule days to job queue
5. Proper handling of team member assignments during job movements

## Context

### Current Drag & Drop State
- File: `/apps/scheduledesk/components/ScheduleDocument/ScheduleDocument.tsx`
- `handleJobDrag()` function (line 415) handles job movement between schedule days
- When jobs move between days, team members are automatically unassigned and returned to `unassignedTeamMembers`
- Block IDs follow pattern: `day:dayId:job:jobId`
- No current support for job queue as a drag target

### New Requirements
With the hierarchical job queue (queue days → custom groups → jobs), we need to support:
- Jobs dragged FROM schedule days TO any job queue location
- Jobs dragged FROM job queue TO schedule days
- Jobs dragged BETWEEN different queue day groups
- Jobs dragged BETWEEN custom groups (same or different queue days)
- User choice dialog for team member assignments when moving jobs to queue

---

## Implementation Plan

---

## Phase 1: Team Member Assignment Dialog Component

### File: Create `/apps/scheduledesk/components/TeamMemberAssignmentDialog/TeamMemberAssignmentDialog.tsx`

```tsx
'use client'

import React from 'react';
import Dialog from '@/components/Dialog';

interface TeamMemberAssignmentDialogProps {
  jobTitle: string;
  assignedMemberCount: number;
  onKeepAssignments: () => void;
  onRemoveAssignments: () => void;
  onCancel: () => void;
}

const TeamMemberAssignmentDialog: React.FC<TeamMemberAssignmentDialogProps> = ({
  jobTitle,
  assignedMemberCount,
  onKeepAssignments,
  onRemoveAssignments,
  onCancel
}) => {
  return (
    <Dialog
      title="Team Member Assignments"
      yesButtonText="Keep Assignments"
      noButtonText="Remove Assignments"
      onConfirm={onKeepAssignments}
      onCancel={onRemoveAssignments}
    >
      <div className="team-member-assignment-dialog">
        <p>
          <strong>{jobTitle}</strong> has <strong>{assignedMemberCount}</strong>{' '}
          team {assignedMemberCount === 1 ? 'member' : 'members'} assigned.
        </p>
        <p>
          What would you like to do with the team member assignments?
        </p>
        <ul>
          <li>
            <strong>Keep Assignments:</strong> Team members remain assigned to this job
            in the queue, but will also be added to the Unassigned section on the
            original day.
          </li>
          <li>
            <strong>Remove Assignments:</strong> All team members will be unassigned
            and moved to the Unassigned section on the original day.
          </li>
        </ul>
      </div>
    </Dialog>
  );
};

export default TeamMemberAssignmentDialog;
```

### File: Create `/apps/scheduledesk/components/TeamMemberAssignmentDialog/index.ts`

```typescript
export { default } from './TeamMemberAssignmentDialog';
```

### File: Create `/apps/scheduledesk/components/TeamMemberAssignmentDialog/TeamMemberAssignmentDialog.scss`

```scss
.team-member-assignment-dialog {
  padding: 16px 0;

  p {
    margin-bottom: 12px;
    line-height: 1.5;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 16px 0 0 0;

    li {
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: 4px;
      margin-bottom: 8px;

      strong {
        display: block;
        margin-bottom: 4px;
      }
    }
  }
}
```

---

## Phase 2: Update Drag State Management

### File: `/apps/scheduledesk/components/ScheduleDocument/ScheduleDocument.tsx`

**Add to drag state interface (around line 82):**

```typescript
interface DragState {
  activeDragItem: { id: string | null, type: BlockType, sourceDay: string | null };
  draggedContent: React.ReactNode | null;
  pointerPosition: { x: number; y: number };
  isDragging: boolean;
  isInvalidDropZone: boolean;
  memberDragTarget: {
    blockId: string | null;
    jobId: string | null;
    position: 'before' | 'after' | 'first' | 'last' | null;
    refMemberId: string | null;
  };
  jobDragTarget: {
    jobId: string | null;
    position: 'before' | 'after' | null;
    refJobId: string | null;
  };
  // NEW: Pending drag action state for dialog confirmation
  pendingJobDrag: {
    active: boolean;
    activeData: ScheduleBlockId | null;
    overId: string | null;
    job: JobVisit | null;
    sourceDayDate: string | null;
  } | null;
}
```

**Update initial drag state:**

```typescript
const [dragState, setDragState] = useState<DragState>({
  activeDragItem: { id: null, type: null, sourceDay: null },
  draggedContent: null,
  pointerPosition: { x: 0, y: 0 },
  isDragging: false,
  isInvalidDropZone: false,
  memberDragTarget: { blockId: null, jobId: null, position: null, refMemberId: null },
  jobDragTarget: { jobId: null, position: null, refJobId: null },
  pendingJobDrag: null  // NEW
});
```

**Add state for showing dialog:**

```typescript
const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
```

---

## Phase 3: Enhanced Block ID Parsing

### File: `/apps/scheduledesk/components/ScheduleDocument/utils.ts`

Already updated in JOBQUEUE_GROUPS.md, but ensure these are implemented:

```typescript
export interface ScheduleBlockId {
  type: BlockType;
  dayId: string;
  blockId: string;
  assignment?: string;
  queueDate?: string;
  isQueueJob?: boolean;      // NEW: true if this is in the job queue
  customGroupId?: string;    // NEW: ID of custom group if applicable
}

export const parseBlockId = (blockId: string): ScheduleBlockId | null => {
  const parts = blockId.split(':');

  // Queue with custom group: queue:queue-2025-10-12:group:uuid:job:123
  if (parts[0] === 'queue' && parts[2] === 'group' && parts[4] === 'job') {
    return {
      type: 'job',
      dayId: parts[1],
      blockId: parts[5],
      assignment: parts[3],
      queueDate: parts[1].replace('queue-', ''),
      isQueueJob: true,
      customGroupId: parts[3]
    };
  }

  // Queue ungrouped: queue:queue-2025-10-12:job:123
  if (parts[0] === 'queue' && parts[2] === 'job') {
    return {
      type: 'job',
      dayId: parts[1],
      blockId: parts[3],
      assignment: 'ungrouped',
      queueDate: parts[1].replace('queue-', ''),
      isQueueJob: true,
      customGroupId: undefined
    };
  }

  // Existing day parsing logic (add isQueueJob: false)
  if (parts[0] === 'day' && parts[2] === 'job') {
    return {
      type: 'job',
      dayId: parts[1],
      blockId: parts[3],
      assignment: undefined,
      isQueueJob: false
    };
  }

  // ... rest of existing parsing logic
};
```

---

## Phase 4: Core Drag Logic - Job Movement

### File: `/apps/scheduledesk/components/ScheduleDocument/ScheduleDocument.tsx`

**Create new handler for job-to-queue drags:**

```typescript
const handleJobToQueueDrag = useCallback((
  activeData: ScheduleBlockId,
  targetData: ScheduleBlockId,
  currentScheduleDays: ScheduleDay[],
  jobQueueGroups: JobQueueGroup[],
  assignmentChoice: 'keep' | 'remove'
): { updatedDays: ScheduleDay[], updatedQueue: JobQueueGroup[] } | null => {

  // Find source day and job
  const sourceDay = currentScheduleDays.find(day => day.id === activeData.dayId);
  if (!sourceDay) return null;

  const job = sourceDay.jobVisits?.find(j => j.id.toString() === activeData.blockId);
  if (!job) return null;

  // Clone data
  const updatedSourceDay = deepClone(sourceDay);
  const updatedJobQueueGroups = deepClone(jobQueueGroups);

  // Find target queue group
  const targetQueueGroup = updatedJobQueueGroups.find(
    g => g.id === targetData.dayId || g.queueDate === targetData.queueDate
  );

  if (!targetQueueGroup) return null;

  // Remove job from source day
  const jobIndex = updatedSourceDay.jobVisits?.findIndex(j => j.id.toString() === activeData.blockId);
  if (jobIndex !== undefined && jobIndex >= 0 && updatedSourceDay.jobVisits) {
    const [movedJob] = updatedSourceDay.jobVisits.splice(jobIndex, 1);

    // Handle team member assignments
    if (movedJob.assignedMembers && movedJob.assignedMembers.length > 0) {
      const membersToHandle = [...movedJob.assignedMembers];

      if (assignmentChoice === 'remove') {
        // Remove all assignments from job
        movedJob.assignedMembers = [];
      }
      // If 'keep', leave movedJob.assignedMembers intact

      // Either way, add members to unassigned on source day
      // (if 'keep', they're assigned to queue job but not to anything on this day)
      // (if 'remove', they're fully unassigned)
      membersToHandle.forEach(memberInstance => {
        const memberId = memberInstance.member.id.toString();

        // Check if member is in other jobs on source day
        const memberExistsInOtherJobs = updatedSourceDay.jobVisits?.some(otherJob =>
          otherJob.assignedMembers?.some(m => m.member.id.toString() === memberId)
        );

        // Check if already in unassigned
        const memberExistsInUnassigned = updatedSourceDay.unassignedTeamMembers?.some(
          m => m.member.id.toString() === memberId
        );

        // Add to unassigned if not already there and not in other jobs
        if (!memberExistsInOtherJobs && !memberExistsInUnassigned) {
          if (!updatedSourceDay.unassignedTeamMembers) {
            updatedSourceDay.unassignedTeamMembers = [];
          }
          updatedSourceDay.unassignedTeamMembers.push(memberInstance);
        }
      });
    }

    // Add job to target queue group
    if (targetData.customGroupId && targetData.customGroupId !== 'ungrouped') {
      // Add to specific custom group
      const customGroup = targetQueueGroup.customGroups?.find(
        g => g.id === targetData.customGroupId
      );
      if (customGroup) {
        customGroup.jobs.push(movedJob);
      }
    } else {
      // Add to ungrouped
      targetQueueGroup.ungroupedJobs.push(movedJob);
    }

    // Update schedule days
    const updatedDays = currentScheduleDays.map(day =>
      day.id === updatedSourceDay.id ? updatedSourceDay : day
    );

    return { updatedDays, updatedQueue: updatedJobQueueGroups };
  }

  return null;
}, []);
```

**Create handler for queue-to-day drags:**

```typescript
const handleQueueToDayDrag = useCallback((
  activeData: ScheduleBlockId,
  targetData: ScheduleBlockId,
  currentScheduleDays: ScheduleDay[],
  jobQueueGroups: JobQueueGroup[]
): { updatedDays: ScheduleDay[], updatedQueue: JobQueueGroup[] } | null => {

  // Find source queue group
  const sourceQueueGroup = jobQueueGroups.find(
    g => g.id === activeData.dayId || g.queueDate === activeData.queueDate
  );

  if (!sourceQueueGroup) return null;

  // Find the job in queue (either in custom group or ungrouped)
  let job: JobVisit | undefined;
  let sourceCustomGroup: CustomJobGroup | undefined;

  if (activeData.customGroupId && activeData.customGroupId !== 'ungrouped') {
    sourceCustomGroup = sourceQueueGroup.customGroups?.find(
      g => g.id === activeData.customGroupId
    );
    job = sourceCustomGroup?.jobs.find(j => j.id.toString() === activeData.blockId);
  } else {
    job = sourceQueueGroup.ungroupedJobs.find(j => j.id.toString() === activeData.blockId);
  }

  if (!job) return null;

  // Clone data
  const updatedJobQueueGroups = deepClone(jobQueueGroups);
  const updatedTargetDay = deepClone(
    currentScheduleDays.find(day => day.id === targetData.dayId)
  );

  if (!updatedTargetDay) return null;

  // Remove job from queue
  const updatedSourceQueueGroup = updatedJobQueueGroups.find(
    g => g.id === sourceQueueGroup.id
  );

  if (!updatedSourceQueueGroup) return null;

  if (sourceCustomGroup) {
    const customGroup = updatedSourceQueueGroup.customGroups?.find(
      g => g.id === sourceCustomGroup.id
    );
    if (customGroup) {
      const jobIndex = customGroup.jobs.findIndex(j => j.id.toString() === activeData.blockId);
      if (jobIndex >= 0) {
        customGroup.jobs.splice(jobIndex, 1);
      }
    }
  } else {
    const jobIndex = updatedSourceQueueGroup.ungroupedJobs.findIndex(
      j => j.id.toString() === activeData.blockId
    );
    if (jobIndex >= 0) {
      updatedSourceQueueGroup.ungroupedJobs.splice(jobIndex, 1);
    }
  }

  // Add job to target day
  if (!updatedTargetDay.jobVisits) {
    updatedTargetDay.jobVisits = [];
  }

  // Insert at proper position if targeting specific job
  if (targetData.type === 'job') {
    const targetJobIndex = updatedTargetDay.jobVisits.findIndex(
      j => j.id.toString() === targetData.blockId
    );
    if (targetJobIndex >= 0) {
      updatedTargetDay.jobVisits.splice(targetJobIndex, 0, job);
    } else {
      updatedTargetDay.jobVisits.push(job);
    }
  } else {
    updatedTargetDay.jobVisits.push(job);
  }

  const updatedDays = currentScheduleDays.map(day =>
    day.id === updatedTargetDay.id ? updatedTargetDay : day
  );

  return { updatedDays, updatedQueue: updatedJobQueueGroups };
}, []);
```

**Create handler for queue-to-queue drags:**

```typescript
const handleQueueToQueueDrag = useCallback((
  activeData: ScheduleBlockId,
  targetData: ScheduleBlockId,
  jobQueueGroups: JobQueueGroup[]
): JobQueueGroup[] | null => {

  // Find source queue group
  const sourceQueueGroup = jobQueueGroups.find(
    g => g.id === activeData.dayId || g.queueDate === activeData.queueDate
  );

  // Find target queue group
  const targetQueueGroup = jobQueueGroups.find(
    g => g.id === targetData.dayId || g.queueDate === targetData.queueDate
  );

  if (!sourceQueueGroup || !targetQueueGroup) return null;

  // Find the job in source
  let job: JobVisit | undefined;
  let sourceCustomGroup: CustomJobGroup | undefined;

  if (activeData.customGroupId && activeData.customGroupId !== 'ungrouped') {
    sourceCustomGroup = sourceQueueGroup.customGroups?.find(
      g => g.id === activeData.customGroupId
    );
    job = sourceCustomGroup?.jobs.find(j => j.id.toString() === activeData.blockId);
  } else {
    job = sourceQueueGroup.ungroupedJobs.find(j => j.id.toString() === activeData.blockId);
  }

  if (!job) return null;

  const updatedJobQueueGroups = deepClone(jobQueueGroups);

  // Remove from source
  const updatedSourceQueueGroup = updatedJobQueueGroups.find(
    g => g.id === sourceQueueGroup.id
  );

  if (!updatedSourceQueueGroup) return null;

  if (sourceCustomGroup) {
    const customGroup = updatedSourceQueueGroup.customGroups?.find(
      g => g.id === sourceCustomGroup.id
    );
    if (customGroup) {
      const jobIndex = customGroup.jobs.findIndex(j => j.id.toString() === activeData.blockId);
      if (jobIndex >= 0) {
        customGroup.jobs.splice(jobIndex, 1);
      }
    }
  } else {
    const jobIndex = updatedSourceQueueGroup.ungroupedJobs.findIndex(
      j => j.id.toString() === activeData.blockId
    );
    if (jobIndex >= 0) {
      updatedSourceQueueGroup.ungroupedJobs.splice(jobIndex, 1);
    }
  }

  // Add to target
  const updatedTargetQueueGroup = updatedJobQueueGroups.find(
    g => g.id === targetQueueGroup.id
  );

  if (!updatedTargetQueueGroup) return null;

  if (targetData.customGroupId && targetData.customGroupId !== 'ungrouped') {
    const customGroup = updatedTargetQueueGroup.customGroups?.find(
      g => g.id === targetData.customGroupId
    );
    if (customGroup) {
      customGroup.jobs.push(job);

      // TODO: Call API to update job assignment
      // POST /api/job-queue-groups/[customGroupId]/assign
    }
  } else {
    updatedTargetQueueGroup.ungroupedJobs.push(job);

    // TODO: Call API to unassign job from any custom groups
    // DELETE /api/job-queue-groups/unassign/[jobId]
  }

  return updatedJobQueueGroups;
}, []);
```

---

## Phase 5: Update handleDragEnd

### File: `/apps/scheduledesk/components/ScheduleDocument/ScheduleDocument.tsx`

**Modify the existing `handleDragEnd` function (starting around line 607):**

Replace the job dragging section with enhanced logic:

```typescript
const handleDragEnd = useCallback(async (event: DragEndEvent) => {
  const { active, over } = event;

  // ... existing cleanup code (lines 609-630) ...

  if (!over) {
    cleanupDrag();
    return;
  }

  const activeId = active.id as string;
  const overId = over.id as string;

  const activeData = memoizedParseBlockId(activeId);
  if (!activeData) {
    cleanupDrag();
    return;
  }

  const targetData = memoizedParseBlockId(overId);
  if (!targetData) {
    cleanupDrag();
    return;
  }

  cancelAnimation();

  // ============================================
  // JOB DRAGGING LOGIC
  // ============================================
  if (activeData.type === 'job') {

    // CASE 1: Job from schedule day TO job queue
    if (!activeData.isQueueJob && targetData.isQueueJob) {
      // Find the job and check for assigned members
      const sourceDay = scheduleDays.find(day => day.id === activeData.dayId);
      const job = sourceDay?.jobVisits?.find(j => j.id.toString() === activeData.blockId);

      if (job && job.assignedMembers && job.assignedMembers.length > 0) {
        // Show dialog - store pending drag action
        setDragState(prev => ({
          ...prev,
          pendingJobDrag: {
            active: true,
            activeData,
            overId,
            job,
            sourceDayDate: sourceDay.date
          }
        }));
        setShowAssignmentDialog(true);

        // Don't cleanup drag yet - wait for dialog response
        return;
      } else {
        // No assigned members - proceed directly
        const result = handleJobToQueueDrag(
          activeData,
          targetData,
          scheduleDays,
          scheduleData.jobQueueGroups,
          'remove'  // Doesn't matter since no members
        );

        if (result) {
          setScheduleDays(result.updatedDays);
          // TODO: Update jobQueueGroups state
          // setJobQueueGroups(result.updatedQueue);
        }
      }
    }

    // CASE 2: Job from job queue TO schedule day
    else if (activeData.isQueueJob && !targetData.isQueueJob) {
      const result = handleQueueToDayDrag(
        activeData,
        targetData,
        scheduleDays,
        scheduleData.jobQueueGroups
      );

      if (result) {
        setScheduleDays(result.updatedDays);
        // TODO: Update jobQueueGroups state
        // setJobQueueGroups(result.updatedQueue);

        // TODO: Optionally show dialog asking if members should be assigned to day
      }
    }

    // CASE 3: Job between queue groups (queue-to-queue)
    else if (activeData.isQueueJob && targetData.isQueueJob) {
      const result = handleQueueToQueueDrag(
        activeData,
        targetData,
        scheduleData.jobQueueGroups
      );

      if (result) {
        // TODO: Update jobQueueGroups state
        // setJobQueueGroups(result);
      }
    }

    // CASE 4: Job between schedule days (existing logic)
    else if (!activeData.isQueueJob && !targetData.isQueueJob) {
      // Use existing handleJobDrag logic
      const result = handleJobDrag(activeData, overId, scheduleDays, dragState.jobDragTarget);
      if (result) {
        setScheduleDays(result);
        // ... existing animation logic ...
      }
    }
  }

  // ============================================
  // MEMBER DRAGGING LOGIC (existing)
  // ============================================
  else if (activeData.type === 'member') {
    // ... existing member drag logic (lines 847-1130) ...
  }

  cleanupDrag();
}, [
  scheduleDays,
  scheduleData,
  dragState.jobDragTarget,
  dragState.memberDragTarget,
  memoizedParseBlockId,
  handleJobDrag,
  handleJobToQueueDrag,
  handleQueueToDayDrag,
  handleQueueToQueueDrag,
  handleMemberDrag,
  // ... other dependencies
]);
```

---

## Phase 6: Dialog Response Handlers

### File: `/apps/scheduledesk/components/ScheduleDocument/ScheduleDocument.tsx`

**Add dialog response handlers:**

```typescript
const handleKeepAssignments = useCallback(() => {
  setShowAssignmentDialog(false);

  if (!dragState.pendingJobDrag) return;

  const { activeData, overId, job } = dragState.pendingJobDrag;
  const targetData = memoizedParseBlockId(overId);

  if (!activeData || !targetData) {
    cleanupDrag();
    return;
  }

  const result = handleJobToQueueDrag(
    activeData,
    targetData,
    scheduleDays,
    scheduleData.jobQueueGroups,
    'keep'  // Keep assignments
  );

  if (result) {
    setScheduleDays(result.updatedDays);
    // TODO: Update jobQueueGroups state
    // setJobQueueGroups(result.updatedQueue);

    // Open unassigned group on source day to show the members
    if (dragState.pendingJobDrag.sourceDayDate) {
      setFoldState(prev => ({
        ...prev,
        [dragState.pendingJobDrag.sourceDayDate + "unassignedGroup"]: true
      }));
    }
  }

  // Clear pending drag
  setDragState(prev => ({
    ...prev,
    pendingJobDrag: null
  }));

  cleanupDrag();
}, [dragState.pendingJobDrag, scheduleDays, scheduleData, handleJobToQueueDrag]);

const handleRemoveAssignments = useCallback(() => {
  setShowAssignmentDialog(false);

  if (!dragState.pendingJobDrag) return;

  const { activeData, overId } = dragState.pendingJobDrag;
  const targetData = memoizedParseBlockId(overId);

  if (!activeData || !targetData) {
    cleanupDrag();
    return;
  }

  const result = handleJobToQueueDrag(
    activeData,
    targetData,
    scheduleDays,
    scheduleData.jobQueueGroups,
    'remove'  // Remove assignments
  );

  if (result) {
    setScheduleDays(result.updatedDays);
    // TODO: Update jobQueueGroups state
    // setJobQueueGroups(result.updatedQueue);

    // Open unassigned group on source day to show the members
    if (dragState.pendingJobDrag.sourceDayDate) {
      setFoldState(prev => ({
        ...prev,
        [dragState.pendingJobDrag.sourceDayDate + "unassignedGroup"]: true
      }));
    }
  }

  // Clear pending drag
  setDragState(prev => ({
    ...prev,
    pendingJobDrag: null
  }));

  cleanupDrag();
}, [dragState.pendingJobDrag, scheduleDays, scheduleData, handleJobToQueueDrag]);

const handleCancelDialog = useCallback(() => {
  setShowAssignmentDialog(false);

  // Clear pending drag
  setDragState(prev => ({
    ...prev,
    pendingJobDrag: null
  }));

  cleanupDrag();
}, []);
```

---

## Phase 7: Render Dialog

### File: `/apps/scheduledesk/components/ScheduleDocument/ScheduleDocument.tsx`

**Add dialog to render (around line 1420, inside the DndContext but outside other sections):**

```tsx
{/* Team Member Assignment Dialog */}
{showAssignmentDialog && dragState.pendingJobDrag?.job && (
  <TeamMemberAssignmentDialog
    jobTitle={dragState.pendingJobDrag.job.title}
    assignedMemberCount={dragState.pendingJobDrag.job.assignedMembers?.length || 0}
    onKeepAssignments={handleKeepAssignments}
    onRemoveAssignments={handleRemoveAssignments}
    onCancel={handleCancelDialog}
  />
)}
```

**Import the component at the top of the file:**

```typescript
import TeamMemberAssignmentDialog from '@/components/TeamMemberAssignmentDialog';
```

---

## Phase 8: API Integration

### Persistent Storage Updates

When jobs are moved between custom groups or unassigned in the queue, call the appropriate APIs:

**Helper function to persist queue job assignment:**

```typescript
const persistJobQueueAssignment = async (
  jobId: string,
  groupId: string | null
): Promise<void> => {
  try {
    if (groupId === null || groupId === 'ungrouped') {
      // Unassign from any custom groups
      await fetch(`/api/job-queue-groups/unassign/${jobId}`, {
        method: 'DELETE'
      });
    } else {
      // Assign to custom group
      await fetch(`/api/job-queue-groups/${groupId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
    }
  } catch (error) {
    console.error('Failed to persist job queue assignment:', error);
    // TODO: Show error toast to user
  }
};
```

**Call this function in `handleQueueToQueueDrag` after state updates:**

```typescript
// Inside handleQueueToQueueDrag, after updating state:

// Persist to database
await persistJobQueueAssignment(
  job.id.toString(),
  targetData.customGroupId && targetData.customGroupId !== 'ungrouped'
    ? targetData.customGroupId
    : null
);
```

---

## Phase 9: Validation and Edge Cases

### Drop Zone Validation

**Add validation to prevent invalid drops:**

```typescript
const isValidJobDrop = useCallback((
  activeData: ScheduleBlockId,
  targetData: ScheduleBlockId
): boolean => {
  // Can't drop job onto itself
  if (activeData.blockId === targetData.blockId) {
    return false;
  }

  // If dropping into queue, validate the queue date matches job's actual date
  if (targetData.isQueueJob && targetData.queueDate) {
    const sourceDay = scheduleDays.find(day => day.id === activeData.dayId);
    const job = sourceDay?.jobVisits?.find(j => j.id.toString() === activeData.blockId);

    if (job && job.date) {
      const jobDate = new Date(job.date);
      const jobDayName = jobDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Only allow dropping into queue if the job's day matches APP_SETTINGS.jobQueueDay
      if (jobDayName !== APP_SETTINGS.jobQueueDay) {
        console.warn(`Cannot move ${jobDayName} job to ${APP_SETTINGS.jobQueueDay} queue`);
        return false;
      }

      // Queue date should match job date
      const targetQueueDate = new Date(targetData.queueDate);
      if (jobDate.toDateString() !== targetQueueDate.toDateString()) {
        console.warn('Job date does not match target queue date');
        return false;
      }
    }
  }

  return true;
}, [scheduleDays]);
```

**Use validation in handleDragOver and handleDragEnd:**

```typescript
// In handleDragOver:
if (!isValidJobDrop(activeBlock, overBlock)) {
  setDragState(prev => ({
    ...prev,
    isInvalidDropZone: true
  }));
  return;
}

// In handleDragEnd:
if (!isValidJobDrop(activeData, targetData)) {
  cleanupDrag();
  return;
}
```

---

## Testing Checklist

### Job Queue Dragging
- [ ] Job can be dragged from schedule day to job queue ungrouped section
- [ ] Job can be dragged from schedule day to custom group in job queue
- [ ] Dialog appears when dragging job with assigned members to queue
- [ ] "Keep Assignments" keeps members on job AND adds to unassigned on day
- [ ] "Remove Assignments" removes members from job and adds to unassigned on day
- [ ] Unassigned group opens automatically after dialog confirmation
- [ ] Job can be dragged from job queue back to schedule day
- [ ] Job can be dragged between different queue day groups
- [ ] Job can be dragged between custom groups (same queue day)
- [ ] Job can be dragged between custom groups (different queue days)
- [ ] Job can be dragged from custom group to ungrouped
- [ ] Job can be dragged from ungrouped to custom group

### Edge Cases & Validation
- [ ] Cannot drop job onto itself
- [ ] Cannot drop non-Sunday job into Sunday queue (or whatever queue day is configured)
- [ ] Cannot drop job into wrong queue day group (date validation)
- [ ] Animation works smoothly for all drag scenarios
- [ ] Hover effects show correct drop indicators
- [ ] Invalid drop zones show red "no-drop" cursor
- [ ] API calls succeed and update database
- [ ] API failures show appropriate error messages
- [ ] Optimistic UI updates revert if API call fails

### State Management
- [ ] Drag state clears properly after all scenarios
- [ ] Pending drag state clears when dialog is canceled
- [ ] Fold states persist correctly after drags
- [ ] Schedule data remains consistent after multiple operations

---

## Notes

- **jobQueueGroups State**: You'll need to add state management for `jobQueueGroups` similar to how `scheduleDays` is managed. Consider lifting this up or using context if needed.

- **Optimistic Updates**: Current implementation does optimistic UI updates. Consider adding rollback logic if API calls fail.

- **Animation**: The existing FLIP animation system should work for queue-to-queue drags. Extend it to handle queue-to-day and day-to-queue drags.

- **Performance**: If queue gets very large, consider debouncing API calls or batching multiple drag operations.

- **Future Enhancement**: Add visual feedback during API calls (loading spinner on the dragged job).

---

## Important Implementation Order

1. **Phase 1** - Create dialog component
2. **Phase 2** - Update drag state
3. **Phase 3** - Enhance block ID parsing
4. **Phase 4** - Implement core drag handlers
5. **Phase 5** - Update handleDragEnd
6. **Phase 6** - Add dialog response handlers
7. **Phase 7** - Render dialog in UI
8. **Phase 9** - Add validation
9. **Phase 8** - Integrate API calls (can be done last since state updates work without persistence)

This order ensures the UI is functional before adding persistence, making debugging easier.
