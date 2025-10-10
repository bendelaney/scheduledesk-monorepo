'use client'
import React, { useState, FC, useEffect, useRef, useCallback, use } from "react";
import { createPortal } from 'react-dom';
import { ScheduleDay, ScheduleDocument as ScheduleDocumentType, TeamMemberInstance } from "@/types";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useFlipAnimation } from "@/hooks/useFlipAnimation";
import { gsap } from "gsap";
import { Draggable } from "@/components/DragDrop";
import { 
  BlockType,
  ScheduleBlockId,
  parseBlockId, 
  createJobBlockId,
  deepClone,
} from "./utils";
import APP_SETTINGS from "@/data/appSettings";
import { FoldCaret, Gear } from "@/components/Icons";
import JobBlock from "@/components/JobBlock";
import TeamMemberBlock from "@/components/TeamMemberBlock";
import ScheduleDocumentDay from "@/components/ScheduleDocumentDay";
import RotatingIcon from "@/components/RotatingIcon";
import "./ScheduleDocument.scss";

import LoadingSpinner from "../LoadingSpinner";

// Optimized helper functions
const findAndRemoveMemberFromJob = (updatedScheduleDay: ScheduleDay, sourceAssignment: string, memberId: string): TeamMemberInstance | undefined => {
  const job = updatedScheduleDay.jobVisits?.find(job => job.id.toString() === sourceAssignment);
  
  if (job?.assignedMembers) {
    const memberIndex = job.assignedMembers.findIndex(member => member.member.id.toString() === memberId);
    
    if (memberIndex >= 0) {
      return job.assignedMembers.splice(memberIndex, 1)[0];
    }
  }
  
  return undefined;
};

const handleMemberToUnassignedDrop = (draggedBlock: ScheduleBlockId, updatedScheduleDay: ScheduleDay): boolean => {
  const memberId = draggedBlock.blockId;
  const sourceAssignment = draggedBlock.assignment;

  let memberToMove: TeamMemberInstance | undefined;

  if (sourceAssignment && sourceAssignment !== 'unassigned') {
    memberToMove = findAndRemoveMemberFromJob(updatedScheduleDay, sourceAssignment, memberId);
  }

  if (memberToMove) {
    if (!updatedScheduleDay.unassignedTeamMembers) {
      updatedScheduleDay.unassignedTeamMembers = [];
    }
    updatedScheduleDay.unassignedTeamMembers.push(memberToMove);
    return true;
  }

  return false;
};

// Type for cached drop zone data
interface CachedDropZone {
  element: Element;
  rect: DOMRect;
  memberId?: string | null;
  jobId?: string | null;
  blockId?: string | null;
}

// Optimized drag state interface
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
}

// Fold state interface
interface GroupFoldState {
  teamMembers: boolean;
  jobQueue: boolean;
  [key: string]: boolean;
}

const initialFoldState: GroupFoldState = {
  teamMembers: false,
  jobQueue: true,
};

const buildInitialFoldState = (scheduleDays: ScheduleDay[]): GroupFoldState => {
  const state = { ...initialFoldState };
  scheduleDays.forEach((day) => {
    state[day.date] = true;
    state[day.date + "unassignedGroup"] = false;
  });
  return state;
};

interface ScheduleDocumentProps {
  dates?: [string, string];
  scheduleData?: ScheduleDocumentType | null;
  isLoading?: boolean;
}

const ScheduleDocument: FC<ScheduleDocumentProps> = ({
  scheduleData = null,
  isLoading = false
}) => {
  const [scheduleDays, setScheduleDays] = useState(scheduleData?.scheduleDays || []);
  const [haveJobQueue, setHaveJobQueue] = useState(false);
  const [foldState, setFoldState] = useState<GroupFoldState>(buildInitialFoldState(scheduleDays || []));
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update scheduleDays when scheduleData prop changes
  useEffect(() => {
    if (scheduleData) {
      console.log('Updating schedule days from props');
      setScheduleDays(scheduleData.scheduleDays);
      setFoldState(buildInitialFoldState(scheduleData.scheduleDays || []));

      setHaveJobQueue((scheduleData.jobQueue && scheduleData.jobQueue.length > 0));
    }
  }, [scheduleData]);

  useEffect(() => {
    console.log('job queue state:', haveJobQueue);
  }, [haveJobQueue]);

  // Initialize FLIP animation hook
  const { flipAnimate, captureState, animateFromState, cancelAnimation, isAnimating } = useFlipAnimation();

  // Consolidated drag state
  const [dragState, setDragState] = useState<DragState>({
    activeDragItem: { id: null, type: null, sourceDay: null },
    draggedContent: null,
    pointerPosition: { x: 0, y: 0 },
    isDragging: false,
    isInvalidDropZone: false,
    memberDragTarget: { blockId: null, jobId: null, position: null, refMemberId: null },
    jobDragTarget: { jobId: null, position: null, refJobId: null }
  });

  // Optimized caching with position data
  const dropZoneCache = useRef(new Map<string, CachedDropZone>());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const pointerTrackingRef = useRef<((e: PointerEvent) => void) | null>(null);

  // Memoized functions
  const memoizedParseBlockId = useCallback((id: string) => parseBlockId(id), []);

  // Optimized pointer tracking with reduced frequency
  const trackPointer = useCallback((e: PointerEvent) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setDragState(prev => ({
        ...prev,
        pointerPosition: { x: e.clientX, y: e.clientY }
      }));
    });
  }, []);

  // Cache job elements only (members need real-time detection)
  const cacheJobElements = useCallback(() => {
    dropZoneCache.current.clear();
    
    // Cache job elements for job-to-job dragging
    document.querySelectorAll('[data-type="job"]').forEach(element => {
      const id = element.getAttribute('data-job-id');
      if (id) {
        const rect = element.getBoundingClientRect();
        dropZoneCache.current.set(`job-${id}`, {
          element,
          rect,
          jobId: id
        });
      }
    });
  }, []);

  // Real-time position detection using elementsFromPoint (like original)
  const updateDragTargets = useCallback(() => {
    if (!dragState.isDragging || !dragState.activeDragItem.id) return;

    const { x, y } = dragState.pointerPosition;
    
    if (dragState.activeDragItem.type === 'member') {
      // Use elementsFromPoint to find elements under pointer (original approach)
      const elementsUnderPointer = document.elementsFromPoint(x, y);
      const memberEl = elementsUnderPointer.find(el => el.getAttribute('data-type') === 'member');
      
      // Check if we're over a different day - look for day container
      const dayEl = elementsUnderPointer.find(el => el.getAttribute('data-day-id'));
      const currentDayId = dayEl?.getAttribute('data-day-id');
      const sourceDayId = dragState.activeDragItem.sourceDay;
      const isInvalidDropZone = currentDayId && currentDayId !== sourceDayId;
      
      if (memberEl && !isInvalidDropZone) {
        const memberBlockId = memberEl.getAttribute('data-block-id');
        const memberId = memberEl.getAttribute('data-member-id');
        const jobId = memberEl.getAttribute('data-job-id');
        const isEmptyZone = memberEl.getAttribute('data-empty-zone') === 'true';
        
        if (jobId) {
          let position: 'before' | 'after' | 'first' | 'last' = 'last';
          
          if (isEmptyZone) {
            // For empty zones, always use 'first' position
            position = 'first';
          } else if (memberBlockId) {
            // For existing members, calculate position based on pointer
            const rect = memberEl.getBoundingClientRect();
            const memberCenter = rect.top + rect.height / 2;
            position = y < memberCenter ? 'before' : 'after';
          }
          
          setDragState(prevState => {
            const prevTarget = prevState.memberDragTarget;
            // Only update if something changed to avoid unnecessary re-renders
            if (prevTarget.blockId !== memberBlockId || 
                prevTarget.position !== position ||
                prevTarget.jobId !== jobId ||
                prevState.isInvalidDropZone !== false) {
              return {
                ...prevState,
                isInvalidDropZone: false,
                memberDragTarget: {
                  blockId: memberBlockId,
                  jobId: jobId,
                  position: position,
                  refMemberId: memberId
                }
              };
            }
            return prevState;
          });
        }
      } else {
        // Clear member drag target and set invalid drop zone if needed
        setDragState(prevState => {
          if (prevState.memberDragTarget.blockId !== null || prevState.isInvalidDropZone !== !!isInvalidDropZone) {
            return {
              ...prevState,
              isInvalidDropZone: !!isInvalidDropZone,
              memberDragTarget: { blockId: null, jobId: null, position: null, refMemberId: null }
            };
          }
          return prevState;
        });
      }
    } else if (dragState.activeDragItem.type === 'job' && dragState.jobDragTarget.refJobId) {
      // Use cached approach for jobs (less critical for real-time feedback)
      const jobKey = `job-${dragState.jobDragTarget.refJobId}`;
      const jobData = dropZoneCache.current.get(jobKey);
      
      if (jobData && jobData.rect) {
        const rect = jobData.rect;
        const midpoint = rect.top + rect.height / 2;
        const newPosition = y < midpoint ? 'before' : 'after';
        
        if (newPosition !== dragState.jobDragTarget.position) {
          setDragState(prev => ({
            ...prev,
            jobDragTarget: { ...prev.jobDragTarget, position: newPosition }
          }));
        }
      }
    }
  }, [dragState.isDragging, dragState.activeDragItem, dragState.pointerPosition, dragState.jobDragTarget.refJobId, dragState.jobDragTarget.position]);

  // Optimized drag start handler
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    const blockData = memoizedParseBlockId(activeId);
    if (!blockData) return;
    
    // Cancel any ongoing animations before starting new drag
    cancelAnimation();
    
    // Cache job elements for job dragging
    cacheJobElements();
    
    // Find and style the source element being dragged
    let sourceElement: HTMLElement | null = null;
    if (blockData.type === 'job') {
      sourceElement = document.querySelector(`[data-job-id="${blockData.blockId}"]`) as HTMLElement;
    } else if (blockData.type === 'member') {
      sourceElement = document.querySelector(`[data-instance-id="${activeId}"]`) as HTMLElement;
    }
    
    // Apply dragging visual feedback to source element
    if (sourceElement) {
      sourceElement.style.opacity = '0.5';
      sourceElement.classList.add('dragging-source');
    }
    
    // Create drag content
    let draggedContent: React.ReactNode = null;
    
    if (blockData.type === 'job') {
      const sourceDay = scheduleDays.find(day => day.id === blockData.dayId);
      const job = sourceDay?.jobVisits?.find(job => job.id.toString() === blockData.blockId);
      
      if (job) {
        draggedContent = (
          <div className="job-block-clone">
            <JobBlock id={`cloned:${job.id}`} job={job} isClone={true} />
          </div>
        );
      }
    } else if (blockData.type === 'member') {
      const memberId = blockData.blockId;
      const sourceDay = scheduleDays.find(day => day.id === blockData.dayId);
      if (!sourceDay) return;
      
      let member: TeamMemberInstance | undefined;
      
      if (blockData.assignment === 'unassigned') {
        member = sourceDay.unassignedTeamMembers?.find(m => m.member.id.toString() === memberId);
      } else if (blockData.assignment) {
        const job = sourceDay.jobVisits?.find(j => j.id.toString() === blockData.assignment);
        if (job) {
          member = job.assignedMembers?.find(m => m.member.id.toString() === memberId);
        }
      }
      
      if (member) {
        draggedContent = (
          <div className="team-member-block-clone">
            <TeamMemberBlock id={`cloned:${member.member.id}`} teamMember={member} isClone={true} />
          </div>
        );
      }
    }
    
    // Single state update
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      activeDragItem: { 
        id: activeId, 
        type: blockData.type,
        sourceDay: blockData.dayId
      },
      draggedContent
    }));
    
    document.body.classList.add('drag-in-progress');
  }, [memoizedParseBlockId, scheduleDays, cacheJobElements, cancelAnimation]);

  // Optimized drag over handler
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeBlock = memoizedParseBlockId(activeId);
    const overBlock = memoizedParseBlockId(overId);
    if (!activeBlock || !overBlock) return;
    
    if (activeBlock.type === 'job' && overBlock.type === 'job') {
      // Prevent job from targeting itself
      if (activeBlock.blockId === overBlock.blockId && activeBlock.dayId === overBlock.dayId) {
        return;
      }
      
      const overRect = over.rect;
      if (overRect) {
        const overMidpoint = overRect.top + (overRect.height / 2);
        const pointerY = dragState.pointerPosition.y;
        const position = pointerY < overMidpoint ? 'before' : 'after';

        setDragState(prev => ({
          ...prev,
          jobDragTarget: {
            jobId: overBlock.blockId,
            position: position,
            refJobId: overBlock.blockId
          }
        }));
      }
    }
  }, [memoizedParseBlockId, dragState.pointerPosition.y]);

    // Extracted drag handling functions
  const handleJobDrag = useCallback((activeData: ScheduleBlockId, overId: string, currentScheduleDays: ScheduleDay[], jobTarget: DragState['jobDragTarget']): ScheduleDay[] | null => {
    const targetData = memoizedParseBlockId(overId);
    
    if (!targetData) return null;
    
    const sourceDay = currentScheduleDays.find(day => day.id === activeData.dayId);
    const targetDay = currentScheduleDays.find(day => day.id === targetData.dayId);
    
    if (!sourceDay || !targetDay) return null;
    
    const updatedSourceDay = deepClone(sourceDay);
    const updatedTargetDay = sourceDay.id === targetDay.id 
      ? updatedSourceDay
      : deepClone(targetDay);
    
    const sourceJobIndex = updatedSourceDay.jobVisits?.findIndex(
      job => job.id.toString() === activeData.blockId
    );
    
    if (sourceJobIndex === undefined || sourceJobIndex < 0 || !updatedSourceDay.jobVisits) {
      return null;
    }
    
    const [movedJob] = updatedSourceDay.jobVisits.splice(sourceJobIndex, 1);
    
    // If moving to a different day, handle the assigned members
    if (sourceDay.id !== targetDay.id && movedJob.assignedMembers) {
      const membersToReassign = [...movedJob.assignedMembers]; // Copy the members before clearing
      
      // Clear the job's assigned members
      movedJob.assignedMembers = [];
      
      // For each member that was assigned to this job, check if they're assigned to other jobs on the source day
      membersToReassign.forEach(memberInstance => {
        const memberId = memberInstance.member.id.toString();
        
        // Check if this member is assigned to any other job on the source day
        const memberExistsInOtherJobs = updatedSourceDay.jobVisits?.some(otherJob => {
          return otherJob.assignedMembers?.some(
            m => m.member.id.toString() === memberId
          );
        });
        
        // Check if the member is already in the unassigned section
        const memberExistsInUnassigned = updatedSourceDay.unassignedTeamMembers?.some(
          m => m.member.id.toString() === memberId
        );
        
        // If the member doesn't exist elsewhere on this day, add them to unassigned
        if (!memberExistsInOtherJobs && !memberExistsInUnassigned) {
          if (!updatedSourceDay.unassignedTeamMembers) {
            updatedSourceDay.unassignedTeamMembers = [];
          }
          updatedSourceDay.unassignedTeamMembers.push(memberInstance);
        }
      });
    }    

    if (!updatedTargetDay.jobVisits) {
      updatedTargetDay.jobVisits = [];
    }
    
    if (targetData.type === 'job') {
      const targetJobIndex = updatedTargetDay.jobVisits.findIndex(
        job => job.id.toString() === targetData.blockId
      );
      
      if (targetJobIndex !== -1) {
        const adjustedIndex = jobTarget.position === 'after' ? targetJobIndex + 1 : targetJobIndex;
        updatedTargetDay.jobVisits.splice(adjustedIndex, 0, movedJob);
      } else {
        updatedTargetDay.jobVisits.push(movedJob);
      }
    } else {
      updatedTargetDay.jobVisits.push(movedJob);
    }
    
    return currentScheduleDays.map(day => {
      if (day.id === updatedSourceDay.id) return updatedSourceDay;
      if (day.id === updatedTargetDay.id) return updatedTargetDay;
      return day;
    });
  }, [memoizedParseBlockId]);

  const handleMemberDrag = useCallback((activeData: ScheduleBlockId, overId: string, currentScheduleDays: ScheduleDay[], memberTarget: DragState['memberDragTarget']) => {
    const dayId = activeData.dayId;
    const currentDay = currentScheduleDays.find(day => day.id === dayId);
    
    if (!currentDay) {
      return { updatedDays: null, shouldOpenUnassigned: false, dayDate: "" };
    }
    
    let updatedScheduleDay = deepClone(currentDay);
    let shouldUpdateData = false;

    if (overId.startsWith('unassigned-group-')) {
      shouldUpdateData = handleMemberToUnassignedDrop(activeData, updatedScheduleDay);
      const memberIdToFind = activeData.blockId;
      const memberToAnimate = updatedScheduleDay.unassignedTeamMembers?.find(m => m.member.id.toString() === memberIdToFind);
      if (memberToAnimate) {
        memberToAnimate.isAnimatingIn = true;
      }
      return {
        updatedDays: shouldUpdateData ? currentScheduleDays.map(day => 
          day.id === updatedScheduleDay.id ? updatedScheduleDay : day
        ) : null,
        shouldOpenUnassigned: shouldUpdateData,
        dayDate: updatedScheduleDay.date
      };
    } else if (memberTarget.jobId || overId.startsWith('empty-')) {
      const memberId = activeData.blockId;
      const sourceAssignment = activeData.assignment;
      let memberToMove: TeamMemberInstance | undefined;
      
      // Extract jobId from overId if it's an empty zone
      let targetJobId = memberTarget.jobId;
      if (overId.startsWith('empty-') && !targetJobId) {
        const emptyZoneMatch = overId.match(/empty-(\d+)-/);
        if (emptyZoneMatch) {
          targetJobId = emptyZoneMatch[1];
        }
      }
      
      if (sourceAssignment === 'unassigned') {
        const memberIndex = updatedScheduleDay.unassignedTeamMembers?.findIndex(
          (member) => member.member.id.toString() === memberId
        );
        
        if (memberIndex !== undefined && memberIndex >= 0 && updatedScheduleDay.unassignedTeamMembers) {
          const [member] = updatedScheduleDay.unassignedTeamMembers.splice(memberIndex, 1);
          memberToMove = member;
        }
      } else if (sourceAssignment) {
        memberToMove = findAndRemoveMemberFromJob(updatedScheduleDay, sourceAssignment, memberId);
      }
      
      if (!memberToMove || !targetJobId) {
        return { updatedDays: null, shouldOpenUnassigned: false, dayDate: "" };
      }
      
      const targetJob = updatedScheduleDay.jobVisits?.find(
        job => job.id.toString() === targetJobId
      );
      
      if (targetJob) {
        if (!targetJob.assignedMembers) {
          targetJob.assignedMembers = [];
        }
        
        const memberClone = deepClone(memberToMove);
        memberClone.isAnimatingIn = true;
        let insertIndex: number;
        
        switch (memberTarget.position) {
          case 'first':
            insertIndex = 0;
            break;
          case 'last':
            insertIndex = targetJob.assignedMembers.length;
            break;
          case 'before':
          case 'after':
            if (memberTarget.refMemberId) {
              const refIndex = targetJob.assignedMembers.findIndex(
                m => m.member.id.toString() === memberTarget.refMemberId
              );
              insertIndex = refIndex !== -1 
                ? (memberTarget.position === 'before' ? refIndex : refIndex + 1)
                : targetJob.assignedMembers.length;
            } else {
              insertIndex = targetJob.assignedMembers.length;
            }
            break;
          default:
            insertIndex = targetJob.assignedMembers.length;
        }
        
        targetJob.assignedMembers.splice(insertIndex, 0, memberClone);
        shouldUpdateData = true;
      }
    }
    
    return {
      updatedDays: shouldUpdateData ? currentScheduleDays.map(day => 
        day.id === updatedScheduleDay.id ? updatedScheduleDay : day
      ) : null,
      shouldOpenUnassigned: false,
      dayDate: updatedScheduleDay.date
    };
  }, [memoizedParseBlockId]);

  // Enhanced drag end handler with dual FLIP animations
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    // Clear drop indicators immediately before any animations
    setDragState(prev => ({
      ...prev,
      memberDragTarget: { blockId: null, jobId: null, position: null, refMemberId: null },
      jobDragTarget: { jobId: null, position: null, refJobId: null },
      isInvalidDropZone: false
    }));

    const dragOverlayNode = document.querySelector('.drag-overlay');
    
    const activeData = memoizedParseBlockId(active.id as string); // Parse activeData early
    if (!activeData) {
      setDragState(prev => ({ // Minimal cleanup if full function not available
        ...prev,
        isDragging: false,
        draggedContent: null,
        activeDragItem: { id: null, type: null, sourceDay: null },
      }));
      document.body.classList.remove('drag-in-progress');
      return;
    }

    // Determine the actual visual element within the drag overlay
    let draggedVisualInOverlay: HTMLElement | null = null;
    if (dragOverlayNode && activeData) { // activeData check is now redundant due to early return but good for safety
      if (activeData.type === 'job') {
        draggedVisualInOverlay = dragOverlayNode.querySelector('.job-block-clone .job-block');
      } else if (activeData.type === 'member') {
        draggedVisualInOverlay = dragOverlayNode.querySelector('.team-member-block-clone .team-member-block');
      }
    }

    const dragOverlayRect = dragOverlayNode?.getBoundingClientRect();
    const draggedVisualRect = draggedVisualInOverlay?.getBoundingClientRect();

    // Define source coordinates for the animation
    // Position from the overlay, dimensions from the visual content within it.
    const sourceAnimationRect = {
      left: dragOverlayRect?.left || 0,
      top: dragOverlayRect?.top || 0,
      width: draggedVisualRect?.width || dragOverlayRect?.width || 0,
      height: draggedVisualRect?.height || dragOverlayRect?.height || 0,
    };
    
    const cleanupDrag = () => {
      // Clean up source element styling
      const activeDragItemId = dragState.activeDragItem.id;
      if (activeDragItemId) {
        const activeData = memoizedParseBlockId(activeDragItemId);
        if (activeData) {
          let sourceElement: HTMLElement | null = null;
          if (activeData.type === 'job') {
            sourceElement = document.querySelector(`[data-job-id="${activeData.blockId}"]`) as HTMLElement;
          } else if (activeData.type === 'member') {
            sourceElement = document.querySelector(`[data-instance-id="${activeDragItemId}"]`) as HTMLElement;
          }
          
          if (sourceElement) {
            sourceElement.style.opacity = '';
            sourceElement.classList.remove('dragging-source');
          }
        }
      }
      
      setDragState({
        activeDragItem: { id: null, type: null, sourceDay: null },
        draggedContent: null,
        pointerPosition: { x: 0, y: 0 },
        isDragging: false,
        isInvalidDropZone: false,
        memberDragTarget: { blockId: null, jobId: null, position: null, refMemberId: null },
        jobDragTarget: { jobId: null, position: null, refJobId: null }
      });
      
      document.body.classList.remove('drag-in-progress');
      dropZoneCache.current.clear();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Nuclear option: disable hover completely for an extended period
      document.body.classList.add('disable-hover');
      
      // Only re-enable hover after a long delay AND significant mouse movement
      let hoverReenabled = false;
      const initialX = dragState.pointerPosition.x;
      const initialY = dragState.pointerPosition.y;
      
      // Set a minimum timeout before hover can be re-enabled (500ms)
      const minimumTimeout = setTimeout(() => {
        if (!hoverReenabled) {
          document.body.classList.remove('disable-hover');
          hoverReenabled = true;
        }
      }, 500);
      
      // Also allow re-enabling if user moves mouse very far (100px+)
      const enableOnLargeMovement = (e: MouseEvent) => {
        if (hoverReenabled) return;
        
        const deltaX = Math.abs(e.clientX - initialX);
        const deltaY = Math.abs(e.clientY - initialY);
        
        if (deltaX > 100 || deltaY > 100) {
          clearTimeout(minimumTimeout);
          document.body.classList.remove('disable-hover');
          hoverReenabled = true;
          document.removeEventListener('mousemove', enableOnLargeMovement);
        }
      };
      
      setTimeout(() => {
        document.addEventListener('mousemove', enableOnLargeMovement);
      }, 500);
    };
    
    if (!over) {
      cleanupDrag();
      return;
    }
    
    const activeId = active.id as string; // This is fine, used for logging or if needed elsewhere
    const overId = over.id as string;
    
    // const activeData = memoizedParseBlockId(activeId); // THIS IS THE REDUNDANT DECLARATION
    // The activeData variable is already parsed at the top of this function.
    // We can safely remove this and the subsequent check.
    // if (!activeData) { // This check is also redundant
    //   cleanupDrag();
    //   return;
    // }
    
    // Cancel any existing animations before starting new ones
    cancelAnimation();
    
    // Handle job dragging with dual animations
    if (activeData.type === 'job') {
      if (dragState.jobDragTarget.jobId && 
          !(dragState.jobDragTarget.jobId === activeData.blockId && 
            scheduleDays.find(day => day.jobVisits?.some(job => job.id.toString() === dragState.jobDragTarget.jobId))?.id === activeData.dayId)) {
        
        const targetData = memoizedParseBlockId(overId);
        const sourceDay = scheduleDays.find(day => day.id === activeData.dayId);
        const targetDay = scheduleDays.find(day => day.id === targetData?.dayId);
        
        try {
          const surroundingJobsSelector = `[data-type="job"]:not([data-job-id="${activeData.blockId}"])`;
          const flipState = captureState(surroundingJobsSelector);
          
          const result = handleJobDrag(activeData, overId, scheduleDays, dragState.jobDragTarget);
          if (result) {
            setScheduleDays(result);
            
            if (sourceDay && targetDay && sourceDay.id !== targetDay.id) {
              setFoldState(prev => ({
                ...prev,
                [sourceDay.date + "unassignedGroup"]: true,
              }));
            }
            
            await new Promise(resolve => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => resolve(void 0));
              });
            });
            
            const animationPromises: Promise<void>[] = [];
            
            if (sourceAnimationRect.width > 0 && sourceAnimationRect.height > 0) {
              const droppedJob = document.querySelector(`[data-job-id="${activeData.blockId}"]`);
              if (droppedJob) {
                const finalRect = droppedJob.getBoundingClientRect();
                const deltaX = sourceAnimationRect.left - finalRect.left;
                const deltaY = sourceAnimationRect.top - finalRect.top;
                
                gsap.set(droppedJob, {
                  x: deltaX,
                  y: deltaY,
                  width: sourceAnimationRect.width,
                  height: sourceAnimationRect.height,
                  opacity: 0.3
                });
                
                const droppedAnimation = new Promise<void>((resolve) => {
                  gsap.to(droppedJob, {
                    x: 0,
                    y: 0,
                    width: finalRect.width,
                    height: finalRect.height,
                    opacity: 1,
                    duration: 0.2,
                    ease: "power4.out",
                    onComplete: () => {
                      gsap.set(droppedJob, { clearProps: "all" });
                      resolve();
                    }
                  });
                });
                animationPromises.push(droppedAnimation);
              } else {
                console.warn(`Dropped job element [data-job-id="${activeData.blockId}"] not found for animation.`);
              }
            } else {
              console.warn('Source animation rect for job has zero width or height. Skipping drop animation.', sourceAnimationRect);
            }
            
            if (flipState) {
              const surroundingAnimation = animateFromState(flipState, {
                duration: 0.2,
                ease: "power4.out"
              });
              animationPromises.push(surroundingAnimation);
            }
            
            // Wait for both animations to complete
            await Promise.all(animationPromises);
            console.log('Job dual animations completed');
          }
        } catch (error) {
          console.warn('Job dual animation failed, applying changes without animation:', error);
          const result = handleJobDrag(activeData, overId, scheduleDays, dragState.jobDragTarget);
          if (result) {
            setScheduleDays(result);
            
            if (sourceDay && targetDay && sourceDay.id !== targetDay.id) {
              setFoldState(prev => ({
                ...prev,
                [sourceDay.date + "unassignedGroup"]: true,
              }));
            }
          }
        }
      }
    }
    
    // Handle member dragging with simple drop animation
    else if (activeData.type === 'member') {
      const draggedItemInstanceId = active.id;
      try {
        // Capture FLIP state for surrounding team members BEFORE any state changes
        let flipState: ReturnType<typeof captureState> = null;
        let elementsToCapture: NodeListOf<Element> | null = null;
        
        if (dragState.memberDragTarget.jobId) {
          const targetJobId = dragState.memberDragTarget.jobId;
          const draggedMemberId = activeData.blockId;
          
          const surroundingMembersSelector = `.team-member-draggable[data-type="member"][data-job-id="${targetJobId}"]:not([data-member-id="${draggedMemberId}"])`;
          
          elementsToCapture = document.querySelectorAll(surroundingMembersSelector);
          
          if (elementsToCapture.length > 0) {
            flipState = captureState(Array.from(elementsToCapture));
            
            if (flipState && flipState.state && flipState.state.elementStates) {
              flipState.state.elementStates.forEach((elementState: any, index: number) => {
                const element = elementsToCapture![index];
                const flipId = element.getAttribute('data-flip-id');
                if (flipId) {
                  elementState.flipId = flipId;
                }
              });
            }
          }
        }
        
        // Apply the data changes
        const result = handleMemberDrag(activeData, overId, scheduleDays, dragState.memberDragTarget);
        
        if (result.updatedDays) {
          setScheduleDays(result.updatedDays); 
          
          if (result.shouldOpenUnassigned) {
            setFoldState(prev => ({
              ...prev,
              [result.dayDate + "unassignedGroup"]: true,
            }));
          }
          
          // Wait for React to update the DOM
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                resolve(void 0);
              });
            });
          });
          
          const animationPromises: Promise<void>[] = [];
          
          // Animate surrounding team members to their new positions using FLIP
          if (flipState && flipState.state && dragState.memberDragTarget.jobId) {
            const targetJobId = dragState.memberDragTarget.jobId;
            const draggedMemberId = activeData.blockId;
            const surroundingMembersSelector = `.team-member-draggable[data-type="member"][data-job-id="${targetJobId}"]:not([data-member-id="${draggedMemberId}"])`;
            const elementsAfterUpdate = document.querySelectorAll(surroundingMembersSelector);
            
            const surroundingMembersAnimation = new Promise<void>((resolve) => {
              try {
                const { Flip } = require('gsap/Flip');
                
                if (!flipState || !flipState.state) {
                  resolve();
                  return;
                }
                
                // Create a mapping of flipId to new elements
                const newElementsByFlipId = new Map<string, Element>();
                elementsAfterUpdate.forEach(el => {
                  const flipId = el.getAttribute('data-flip-id');
                  if (flipId) {
                    newElementsByFlipId.set(flipId, el);
                  }
                });
                
                // Get the captured element states from the FLIP state
                const capturedStates = flipState.state.elementStates;
                const capturedElements = Array.from(elementsToCapture || []);
                
                // Match captured states to new elements by flipId and animate
                capturedStates.forEach((capturedState: any, index: number) => {
                  const oldElement = capturedElements[index];
                  if (!oldElement) return;
                  
                  const flipId = oldElement.getAttribute('data-flip-id');
                  if (!flipId || !newElementsByFlipId.has(flipId)) return;
                  
                  const newElement = newElementsByFlipId.get(flipId)!;
                  const newRect = newElement.getBoundingClientRect();
                  
                  // Use the captured state bounds (old position)
                  const oldBounds = capturedState.bounds;
                  
                  const deltaX = oldBounds.left - newRect.left;
                  const deltaY = oldBounds.top - newRect.top;
                  
                  if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
                    // Element actually moved, animate it
                    gsap.set(newElement, { x: deltaX, y: deltaY });
                    gsap.to(newElement, {
                      x: 0,
                      y: 0,
                      duration: 0.2,
                      ease: "power4.out",
                    });
                  }
                });
                
                setTimeout(() => {
                  resolve();
                }, 300);
                
              } catch (error) {
                console.error('FLIP animation error:', error);
                resolve();
              }
            });
            
            animationPromises.push(surroundingMembersAnimation);
          }
          
          // Animate the dropped member from overlay position to final position
          if (sourceAnimationRect.width > 0 && sourceAnimationRect.height > 0) {
            const memberId = activeData.blockId;

            // Check if this is an unassigned drop first
            let finalElement: HTMLElement | null = null;
            if (overId.startsWith('unassigned-group-')) {
              // Find the member in the unassigned group
              finalElement = document.querySelector(`[data-member-id="${memberId}"].team-member-draggable:not([data-job-id])`) as HTMLElement;
            } else {
              // For job assignments, look for hidden elements first, then fallback
              const hiddenTeamMemberBlock = document.querySelector(`.team-member-block.is-initially-hidden`) as HTMLElement;
              finalElement = hiddenTeamMemberBlock?.closest('.team-member-droppable') as HTMLElement;
              
              if (!finalElement) {
                finalElement = document.querySelector(`[data-member-id="${memberId}"]`) as HTMLElement;
              }
            }

            if (finalElement) {
              const finalElementInstanceId = finalElement.getAttribute('data-block-id');
              const finalRect = finalElement.getBoundingClientRect(); 
              
              const animationClone = finalElement.cloneNode(true) as HTMLElement;
              
              const teamMemberBlockVisualInClone = animationClone.querySelector('.team-member-block.is-initially-hidden') as HTMLElement | null;

              if (teamMemberBlockVisualInClone) {
                teamMemberBlockVisualInClone.classList.remove('is-initially-hidden');
              } else if (animationClone.classList.contains('team-member-block') && animationClone.classList.contains('is-initially-hidden')) {
                animationClone.classList.remove('is-initially-hidden');
              }
              
              animationClone.style.position = 'fixed';
              animationClone.style.left = `${sourceAnimationRect.left}px`;
              animationClone.style.top = `${sourceAnimationRect.top}px`;
              animationClone.style.width = `${sourceAnimationRect.width}px`;
              animationClone.style.height = `${sourceAnimationRect.height}px`;
              animationClone.style.zIndex = '9999';
              animationClone.style.pointerEvents = 'none';
              animationClone.style.transform = 'none'; 
              
              document.body.appendChild(animationClone);
              
              const droppedMemberAnimation = new Promise<void>((resolveAnimation) => {
                gsap.to(animationClone, { 
                  left: finalRect.left,
                  top: finalRect.top,
                  width: finalRect.width, 
                  height: finalRect.height,
                  duration: 0.2,
                  ease: "power4.out",
                  onComplete: () => {
                    // Make the actual final element in the DOM visible
                    const teamMemberBlockVisualInDOM = finalElement?.querySelector('.team-member-block.is-initially-hidden') as HTMLElement | null;
                    if (teamMemberBlockVisualInDOM) {
                      teamMemberBlockVisualInDOM.classList.remove('is-initially-hidden');
                      teamMemberBlockVisualInDOM.style.opacity = '1';
                      teamMemberBlockVisualInDOM.style.visibility = 'visible';
                    } else if (finalElement?.classList.contains('team-member-block') && finalElement.classList.contains('is-initially-hidden')) {
                      finalElement.classList.remove('is-initially-hidden');
                      finalElement.style.opacity = '1';
                      finalElement.style.visibility = 'visible';
                    }
                    
                    if (document.body.contains(animationClone)) {
                      document.body.removeChild(animationClone);
                    }
                    
                    setScheduleDays(currentDays => {
                      return currentDays.map(day => {
                        if (day.id === activeData.dayId) {
                          const updatedDay = deepClone(day);
                          const searchAndUpdate = (memberList: TeamMemberInstance[] | undefined) => {
                            memberList?.forEach(memInstance => {
                              if ((finalElementInstanceId && memInstance.instanceId === finalElementInstanceId) || 
                                  (memInstance.member.id.toString() === memberId && memInstance.isAnimatingIn)) {
                                if (memInstance.isAnimatingIn) {
                                  delete memInstance.isAnimatingIn;
                                }
                              }
                            });
                          };
                          
                          updatedDay.jobVisits?.forEach(job => {
                            if (job.assignedMembers) searchAndUpdate(job.assignedMembers);
                          });
                          if (updatedDay.unassignedTeamMembers) searchAndUpdate(updatedDay.unassignedTeamMembers);
                          
                          return updatedDay;
                        }
                        return day;
                      });
                    });
                    resolveAnimation();
                  }
                });
              });
              
              animationPromises.push(droppedMemberAnimation);
            }
          }
          
          // Wait for both animations to complete
          if (animationPromises.length > 0) {
            await Promise.all(animationPromises);
          }
          
          // Fallback cleanup if no animations ran
          if (animationPromises.length === 0) {
            const memberId = activeData.blockId;
            const finalElement = document.querySelector(`[data-member-id="${memberId}"]`) as HTMLElement;
            if (finalElement) {
              finalElement.classList.remove('is-initially-hidden');
              finalElement.style.opacity = '1';
              finalElement.style.visibility = 'visible';
            }
            setScheduleDays(currentDays => currentDays.map(day => {
              if (day.id === activeData.dayId) {
                const updatedDay = deepClone(day);
                const cleanupFlag = (memberList: TeamMemberInstance[] | undefined) => {
                  memberList?.forEach(m => {
                    if (m.member.id.toString() === memberId && m.isAnimatingIn) delete m.isAnimatingIn;
                  });
                };
                updatedDay.jobVisits?.forEach(job => cleanupFlag(job.assignedMembers));
                cleanupFlag(updatedDay.unassignedTeamMembers);
                return updatedDay;
              }
              return day;
            }));
          }
        }
      } catch (error) {
        console.error('Animation failed:', error);
        // Ensure isAnimatingIn is cleaned up on error too and element is visible
        setScheduleDays(currentDays => currentDays.map(day => {
          if (day.id === activeData.dayId) {
            const updatedDay = deepClone(day);
            const memberId = activeData.blockId;
            const finalElement = document.querySelector(`[data-member-id="${memberId}"]`) as HTMLElement;
            if (finalElement) {
                finalElement.classList.remove('is-initially-hidden');
                finalElement.style.opacity = '1';
                finalElement.style.visibility = 'visible';
            }
            const cleanupFlag = (memberList: TeamMemberInstance[] | undefined) => {
              memberList?.forEach(m => {
                if (m.member.id.toString() === memberId && m.isAnimatingIn) delete m.isAnimatingIn;
              });
            };
            updatedDay.jobVisits?.forEach(job => cleanupFlag(job.assignedMembers));
            cleanupFlag(updatedDay.unassignedTeamMembers);
            return updatedDay;
          }
          return day;
        }));
      }
    }
    
    cleanupDrag();
  }, [scheduleDays, dragState.jobDragTarget, dragState.memberDragTarget, dragState.pointerPosition.x, dragState.pointerPosition.y, memoizedParseBlockId, handleJobDrag, handleMemberDrag, captureState, animateFromState, cancelAnimation, handleMemberToUnassignedDrop]);

  // Add a drag cancel handler for ESC key presses
  const handleDragCancel = useCallback((event: DragEndEvent) => {
    // Use event.active.id to find the source element
    const activeDragItemId = event?.active?.id as string;
    if (activeDragItemId) {
      const activeData = memoizedParseBlockId(activeDragItemId);
      if (activeData) {
        let sourceElement: HTMLElement | null = null;
        if (activeData.type === 'job') {
          sourceElement = document.querySelector(`[data-job-id="${activeData.blockId}"]`) as HTMLElement;
        } else if (activeData.type === 'member') {
          sourceElement = document.querySelector(`[data-instance-id="${activeDragItemId}"]`) as HTMLElement;
        }
        if (sourceElement) {
          sourceElement.style.opacity = '';
          sourceElement.classList.remove('dragging-source');
        }
      }
    }

    // Capture pointer position before resetting dragState for disable-hover logic
    const currentPointerX = dragState.pointerPosition.x;
    const currentPointerY = dragState.pointerPosition.y;

    // Reset all drag state
    setDragState({
      activeDragItem: { id: null, type: null, sourceDay: null },
      draggedContent: null,
      pointerPosition: { x: 0, y: 0 },
      isDragging: false,
      isInvalidDropZone: false,
      memberDragTarget: { blockId: null, jobId: null, position: null, refMemberId: null },
      jobDragTarget: { jobId: null, position: null, refJobId: null }
    });

    // Clean up global state
    document.body.classList.remove('drag-in-progress');
    document.body.classList.remove('no-drop');
    dropZoneCache.current.clear();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    if (pointerTrackingRef.current) {
      document.removeEventListener('pointermove', pointerTrackingRef.current);
      pointerTrackingRef.current = null;
    }

    // Disable hover for a short period or until pointer moves far
    document.body.classList.add('disable-hover');
    let hoverReenabled = false;
    const initialX = currentPointerX;
    const initialY = currentPointerY;
    const minimumTimeout = setTimeout(() => {
      if (!hoverReenabled) {
        document.body.classList.remove('disable-hover');
        hoverReenabled = true;
      }
    }, 500);
    const enableOnLargeMovement = (e: MouseEvent) => {
      if (hoverReenabled) {
        document.removeEventListener('mousemove', enableOnLargeMovement);
        clearTimeout(minimumTimeout);
        return;
      }
      const deltaX = Math.abs(e.clientX - initialX);
      const deltaY = Math.abs(e.clientY - initialY);
      if (deltaX > 100 || deltaY > 100) {
        clearTimeout(minimumTimeout);
        document.body.classList.remove('disable-hover');
        hoverReenabled = true;
        document.removeEventListener('mousemove', enableOnLargeMovement);
      }
    };
    setTimeout(() => {
      document.addEventListener('mousemove', enableOnLargeMovement);
    }, 100);
  }, [memoizedParseBlockId, dragState.pointerPosition.x, dragState.pointerPosition.y]);

  // Optimized effects
  useEffect(() => {
    if (!dragState.isDragging) {
      if (pointerTrackingRef.current) {
        document.removeEventListener('pointermove', pointerTrackingRef.current);
        pointerTrackingRef.current = null;
      }
      return;
    }

    pointerTrackingRef.current = trackPointer;
    document.addEventListener('pointermove', trackPointer, { passive: true });
    
    return () => {
      if (pointerTrackingRef.current) {
        document.removeEventListener('pointermove', pointerTrackingRef.current);
        pointerTrackingRef.current = null;
      }
    };
  }, [dragState.isDragging, trackPointer]);

  // Update drag targets when pointer moves during dragging
  useEffect(() => {
    if (dragState.isDragging && dragState.activeDragItem.id) {
      updateDragTargets();
    }
  }, [dragState.pointerPosition, dragState.isDragging, dragState.activeDragItem.id, updateDragTargets]);

  // Manage body class for invalid drop zone cursor
  useEffect(() => {
    if (dragState.isInvalidDropZone) {
      document.body.classList.add('no-drop');
    } else {
      document.body.classList.remove('no-drop');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('no-drop');
    };
  }, [dragState.isInvalidDropZone]);

  // DnD Kit sensors setup - keep array size constant
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 160,
        tolerance: 8,
      },
    })
  );


  // Event handlers
  const handleScheduleDayDataChange = useCallback((updatedDay: ScheduleDay) => {
    setScheduleDays(prev => prev.map(day => 
      day.id === updatedDay.id ? updatedDay : day
    ));
    console.log('💾Schedule DAY updated:', updatedDay);
  }, []);
  
  const handleModalStateChange = useCallback((isOpen: boolean) => {
    setIsModalOpen(isOpen);
  }, []);

  const toggleGroupFold = useCallback((section: string) => {
    setFoldState(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const toggleAllGroups = useCallback((collapse: boolean) => {
    setFoldState(prev => {
      const newFoldState = { ...prev };
      scheduleDays.forEach(day => {
        newFoldState[day.date] = collapse;
      });
      return newFoldState;
    });
  }, [scheduleDays]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (pointerTrackingRef.current) {
        document.removeEventListener('pointermove', pointerTrackingRef.current);
      }
    };
  }, []);

  // Show loading or empty state
  if (isLoading) {
    return (
      <div className={"loading-view"}>
        <LoadingSpinner isLoading={isLoading} />
      </div>
    );
  }

  // Only show "no data" message if we have a scheduleData that's explicitly empty
  // (not just null on initial load)
  if (!scheduleData || !scheduleDays || scheduleDays.length === 0) {
    // If scheduleData is null and we're not loading, this is likely initial state
    // Show a neutral message
    return (
      <div className="schedule-document">
        <div className={"loading-message"}>
          {/* <h3>Select a date range to load schedule data</h3> */}
        </div>
      </div>
    );
  }

  // At this point, scheduleData is guaranteed to exist
  const title = `Scheduling ${scheduleData.scheduleDays[0].shortDate} - ${scheduleData.scheduleDays[scheduleData.scheduleDays.length - 1].shortDate}`;

  return (
    <ScheduleProvider>
      <DndContext
        sensors={sensors}
        onDragStart={isModalOpen ? undefined : handleDragStart}
        onDragOver={isModalOpen ? undefined : handleDragOver}
        onDragEnd={isModalOpen ? undefined : handleDragEnd}
        onDragCancel={isModalOpen ? undefined : handleDragCancel}
      >
        <div className={`schedule-document ${haveJobQueue ? 'has-job-queue' : 'no-job-queue'}`}>
          <section className="document-head">
            <h1 className="document-title">{title}</h1>
            {/* <button className="settings-button" onClick={() => { alert("edit schedule settings") }}>
              <Gear/>
            </button> */}
          </section>

          {/* JOB QUEUE */}
          {haveJobQueue && (
          <section className="job-queue">
            <header onClick={() => toggleGroupFold("jobQueue")}>
              <div className="toggle">
                <RotatingIcon rotate={foldState.jobQueue} icon={<FoldCaret />} />
              </div>
              <h2>Job Queue ({APP_SETTINGS.jobQueueDay})</h2>
            </header>
            <div className={`section-inner ${foldState["jobQueue"] ? 'open' : 'closed'}`}>
              {scheduleData.jobQueue?.map((job) => {
                const jobBlockId = createJobBlockId("queue", job.id.toString());
                return (
                  <Draggable
                    id={jobBlockId}
                    key={`drag-${job.id}`}
                    className="job-draggable"
                    data-type="job"
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
          </section>
          )}  

          <section className="schedule-days">
            {/* DAYS */}
            {scheduleDays
              .filter((day: ScheduleDay) => day.name !== APP_SETTINGS.jobQueueDay)
              .map((day: ScheduleDay) => {
                return (
                  <ScheduleDocumentDay
                    key={day.date}
                    scheduleDay={day}
                    availableTeamMembers={day.teamMembers}
                    foldState={foldState[day.date]}
                    unassignedGroupState={foldState[day.date + "unassignedGroup"]}
                    onFoldStateChange={(currentState: boolean, event: React.MouseEvent) => {
                      if (event.metaKey) {
                        toggleAllGroups(currentState);
                      } else {
                        toggleGroupFold(day.date);
                      }
                    }}
                    onDayUpdate={handleScheduleDayDataChange}
                    onUnassignedGroupFoldStateChange={(state: boolean) => {
                      console.log(`Unassigned group fold state changed to: ${state}`);
                    }}
                    onModalStateChange={handleModalStateChange}
                    memberDragTarget={dragState.memberDragTarget}
                    jobDragTarget={dragState.jobDragTarget}
                    activeDragItem={dragState.activeDragItem}
                    isInvalidDropZone={dragState.isInvalidDropZone}
                  />
                );
              }
            )}
          </section>
      </div>
        
        {typeof window !== 'undefined' && createPortal(
          <DragOverlay className={`drag-overlay ${dragState.draggedContent ? 'active' : ''}`}>
            {dragState.draggedContent}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </ScheduleProvider>
  );
};

export default ScheduleDocument;