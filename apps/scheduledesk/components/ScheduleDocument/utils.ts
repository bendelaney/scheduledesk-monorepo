export type BlockType = 'member' | 'job' | 'day' | 'group' | null;

export interface ScheduleBlockId {
  type: BlockType;
  dayId: string;
  blockId: string;
  assignment?: string; // 'unassigned' or jobId if member is assigned to a job
  highlightId?: string; // Optional highlight ID for the block
}
export interface MemberDragTarget {
  blockId: string | null;
  jobId: string | null;
  position: 'before' | 'after' | 'first' | 'last' | null;
  refMemberId: string | null;
}
export interface JobDragTarget {
  jobId: string | null;
  position: 'before' | 'after' | 'first' | 'last' | null;
  refJobId: string | null;
}
export interface ActiveDragItem {
  id: string | null,
  type: BlockType,
  sourceDay: string | null
}

// Deep clone utility function
export function deepClone<T>(obj: T): T {
  // Handle null/undefined and primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  // Handle regular objects - use a type assertion to avoid TypeScript errors
  const clonedObj = {} as any;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone((obj as any)[key]);
    }
  }

  return clonedObj as T;
}

// Working with Block IDs
export function createBlockId(params: ScheduleBlockId): string {
  let id = `day:${params.dayId}_type:${params.type}_id:${params.blockId}`;
  if (params.assignment) {
    id += `_assignment:${params.assignment}`;
  }
  if (params.highlightId) {
    id += `_highlightId:${params.highlightId}`;
  }
  return id;
}
export function parseBlockId(id: string): ScheduleBlockId | null {
  try {
    const parts = id.split('_');
    const result: Partial<ScheduleBlockId & { instance?: number }> = {};

    for (let i = 0; i < parts.length; i++) {
      const [key, value] = parts[i].split(':');

      if (key === 'day') {
        result.dayId = value;
      } else if (key === 'type') {
        result.type = value as BlockType;
      } else if (key === 'id') {
        result.blockId = value;
      } else if (key === 'assignment') {
        result.assignment = value;
      } else if (key === 'instance') {
        result.instance = parseInt(value, 10);
      } else if (key === 'highlightId') {
        result.highlightId = value;
      }
    }

    // Ensure we have the required fields
    if (result.dayId && result.type && result.blockId) {
      return result as ScheduleBlockId;
    }
    return null;
  } catch (e) {
    console.error('Error parsing schedule block ID:', e);
    return null;
  }
}
export function createMemberBlockId(dayId: string, memberId: string, assignment?: string, uniqueInstance?: number): string {
  return createBlockId({
    dayId,
    type: 'member',
    blockId: memberId,
    assignment: assignment
  }) + (uniqueInstance !== undefined ? `_instance:${uniqueInstance}` : '');
}
export function createJobBlockId(dayId: string, jobId: string, highlightId?: string): string {
  return createBlockId({
    dayId,
    type: 'job',
    blockId: jobId,
    highlightId: highlightId
  });
}
export function getBlockId(id: string): string | null {
  const parsed = parseBlockId(id);
  return parsed ? parsed.blockId : null;
}

// Boolean checks for blocks
export function isMemberBlock(id: string): boolean {
  const parsed = parseBlockId(id);
  return parsed?.type === 'member';
}
export function isJobBlock(id: string): boolean {
  const parsed = parseBlockId(id);
  return parsed?.type === 'job';
}
export function isGroupBlock(id: string): boolean {
  const parsed = parseBlockId(id);
  return parsed?.type === 'group';
}
export function areBlocksFromSameDay(sourceId: string, targetId: string): boolean {
  const source = parseBlockId(sourceId);
  const target = parseBlockId(targetId);
  return !!(source && target && source.dayId === target.dayId);
}
// Determine if a job is being moved between days or reordered
export function isJobChangingDays(sourceId: string, targetId: string): boolean {
  const source = parseBlockId(sourceId);
  const target = parseBlockId(targetId);

  return !!(source && target && source.dayId !== target.dayId);
}

// Dealing with Drop Targets
export function createDropTargetId(id: string): string {
  return `drop_${id}`;
}
export function createJobDropTargetId(dayId: string, position: number): string {
  return `drop_day:${dayId}_position:${position}`;
}
export function parseJobDropTargetId(id: string): { dayId: string; position: number } | null {
  const match = id.match(/^drop_day:(.+)_position:(\d+)$/);
  if (match) {
    return { dayId: match[1], position: parseInt(match[2], 10) };
  }
  return null;
}
export function isDropTarget(id: string): boolean {
  return id.startsWith('drop_');
}
export function extractIdFromDropTarget(id: string): string {
  return isDropTarget(id) ? id.substring(5) : id;
}

// Getters...
export function getBlockDay(id: string): string | null {
  const parsed = parseBlockId(id);
  return parsed ? parsed.dayId : null;
}
export function getBlockAssignment(id: string): string | null {
  const parsed = parseBlockId(id);
  return parsed ? parsed.assignment || null : null;
}
