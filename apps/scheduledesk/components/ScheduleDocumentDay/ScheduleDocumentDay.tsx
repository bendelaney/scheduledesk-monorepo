'use client'

import React, { useState, FC, useEffect, useRef } from "react";
import { Draggable, Droppable } from "@/components/DragDrop";
import {
  JobVisit,
  ScheduleDay,
  TeamMember,
  TeamMemberInstance,
  TeamMembersWithAvailability
} from "@/types";
import APP_SETTINGS from "@/data/appSettings";
import JobBlock from "@/components/JobBlock";
import TeamMemberSelectMenu from "@/components/SelectMenu/TeamMemberSelectMenu";
import { SelectMenuStylePresets } from '@/components/SelectMenu/SelectMenu';
import { FoldCaret } from "@/components/Icons";
import RotatingIcon from "@/components/RotatingIcon";
// import WeatherIcon from "@/components/WeatherIcon";
import TeamMemberBlock from "@/components/TeamMemberBlock";
import {
  MemberDragTarget,
  JobDragTarget,
  createMemberBlockId,
  createJobBlockId,
  deepClone,
  createDropTargetId,
  ActiveDragItem,
} from "../ScheduleDocument/utils";
import "./ScheduleDocumentDay.scss";

///////////////////////////////////////////////////
// TEAM MEMBER DATA (temporary static data)
import TeamMembersData from '@/data/teamMembersData';

////////////////////
// Helper functions
export function getTeamMemberObjectById(memberId: string): TeamMember | undefined {
  return TeamMembersData.find((member) => member.id.toString() === memberId);
}
export function getMemberFirstName(memberId: string): string | null {
  const member = TeamMembersData.find((member) => member.id.toString() === memberId);
  return member ? member.firstName : null;
}

//////////////////////////////////
// ScheduleDocumentDay Component
export interface ScheduleDocumentDayProps {
  scheduleDay: ScheduleDay;
  availableTeamMembers: TeamMembersWithAvailability[] | undefined;
  foldState: boolean;
  unassignedGroupState?: boolean;
  onDayUpdate?: (updatedDay: ScheduleDay) => void;
  onFoldStateChange?: (state: boolean, event: React.MouseEvent) => void;
  onUnassignedGroupFoldStateChange?: (state: boolean) => void;
  onModalStateChange?: (isOpen: boolean) => void;
  memberDragTarget?: MemberDragTarget;
  jobDragTarget?: JobDragTarget;
  activeDragItem?: ActiveDragItem;
  isInvalidDropZone?: boolean;
}

const ScheduleDocumentDay: FC<ScheduleDocumentDayProps> = ({
  scheduleDay,
  availableTeamMembers,
  foldState,
  unassignedGroupState,
  onDayUpdate,
  onFoldStateChange,
  onUnassignedGroupFoldStateChange,
  onModalStateChange,
  memberDragTarget,
  jobDragTarget,
  activeDragItem,
  isInvalidDropZone
}) => {
  const [thisFoldState, setThisFoldState] = useState<boolean>(foldState ?? true);
  const [unassignedGroupFoldState, setUnassignedGroupFoldState] = useState<boolean>(unassignedGroupState ?? true);

  useEffect(() => {
    setThisFoldState(foldState);
  }, [foldState]);
  useEffect(() => {
    unassignedGroupState && setUnassignedGroupFoldState(unassignedGroupState);
  }, [unassignedGroupState]);

  // Handlers
  const toggleFoldState = (event: React.MouseEvent) => {
    const currentState = thisFoldState;
    // setThisFoldState(!currentState);
    onFoldStateChange && onFoldStateChange(!currentState, event);
  };
  const toggleUnassignedGroupFold = () => {
    const currentState = unassignedGroupFoldState;
    setUnassignedGroupFoldState(!currentState);
  };

  function handleAddTeamMemberToJob(member: TeamMember, job: JobVisit) {
    const updatedScheduleDay = deepClone(scheduleDay);
    const targetJob = updatedScheduleDay.jobVisits?.find(jobVisit => jobVisit.id.toString() === job.id.toString());

    if (targetJob) {
      // Initialize assignedMembers array if it doesn't exist
      if (!targetJob.assignedMembers) {
        targetJob.assignedMembers = [];
      }

      // Create a TeamMemberInstance from the selected TeamMember
      const memberInstance: TeamMemberInstance = {
        member: member,
      };

      // Add the member to the job
      targetJob.assignedMembers.push(memberInstance);

      // Remove the member from unassigned list if they exist there
      if (updatedScheduleDay.unassignedTeamMembers) {
        updatedScheduleDay.unassignedTeamMembers = updatedScheduleDay.unassignedTeamMembers.filter(
          unassignedMember => unassignedMember.member.id.toString() !== member.id.toString()
        );
      }

      // Update the parent component with the modified data
      onDayUpdate && onDayUpdate(updatedScheduleDay);
    }
  }
  function handleRemoveTeamMemberFromJob(member: TeamMemberInstance, job: JobVisit) {
    const updatedScheduleDay = deepClone(scheduleDay);
    const memberIdToRemove = member.member.id.toString();

    // First find the job we're removing from
    const targetJob = updatedScheduleDay.jobVisits?.find(
      jobVisit => jobVisit.id.toString() === job.id.toString()
    );

    if (!targetJob) return;

    // Remove the member from this job
    if (targetJob.assignedMembers) {
      targetJob.assignedMembers = targetJob.assignedMembers.filter(
        m => m.member.id.toString() !== memberIdToRemove
      );
    }

    // Check if this member exists in ANY other job in this day
    const memberExistsElsewhere = updatedScheduleDay.jobVisits?.some(otherJob => {
      // Skip the job we just removed from
      if (otherJob.id === job.id) return false;

      // Check if member exists in this job
      return otherJob.assignedMembers?.some(
        m => m.member.id.toString() === memberIdToRemove
      );
    });

    // Also check if the member is already in the unassigned section
    const memberExistsInUnassigned = updatedScheduleDay.unassignedTeamMembers?.some(
      m => m.member.id.toString() === memberIdToRemove
    );

    // If this is the last instance of this member in this day, add to unassigned
    if (!memberExistsElsewhere && !memberExistsInUnassigned) {
      // Create a TeamMemberInstance from the removed member
      const memberInstance: TeamMemberInstance = {
        member: member.member,
      };

      // Initialize unassignedTeamMembers if it doesn't exist
      if (!updatedScheduleDay.unassignedTeamMembers) {
        updatedScheduleDay.unassignedTeamMembers = [];
      }

      // Add to unassigned team members
      updatedScheduleDay.unassignedTeamMembers.push(memberInstance);

      // Ensure the unassigned group is visible
      setUnassignedGroupFoldState(true);

      console.log(`Moved member ${member.member.firstName} to unassigned group (last instance on day)`);
    } else {
      console.log(`Removed member ${member.member.firstName} from job (still exists elsewhere on day)`);
    }

    // Update the parent component with the modified data
    onDayUpdate && onDayUpdate(updatedScheduleDay);
  }

  const unassignedGroupDropTargetId = createDropTargetId(scheduleDay.id);

  return (
    <section className="schedule-day" data-day-id={scheduleDay.id}>
      <header onClick={(e) => toggleFoldState(e)}>
        <div className="toggle">
          <RotatingIcon rotate={thisFoldState} icon={<FoldCaret />} />
        </div>
        <h2>
          {/* <a href={`https://secure.getjobber.com/calendar#day/${scheduleDay.date.replace(/-/g, "/")}`} target="_blank"> */}
            {scheduleDay.name}, {scheduleDay.shortDate}
          {/* </a> */}
          {/* This is the weather icon. currently broken. */}
          {/* {scheduleDay.date > currentDate.toISOString().split('T')[0] ? <WeatherIcon date={scheduleDay.date} linkOut={true} postalCode={APP_SETTINGS.weatherPostalCode} /> : null} */}
        </h2>
      </header>

      <div className={`section-inner ${thisFoldState ? 'open' : 'closed'}`}>

        {/* Unassigned Group: */}
        <Droppable
          id={`unassigned-group-${unassignedGroupDropTargetId}`}
          className={`droppable block-group unassigned-members
            ${activeDragItem && activeDragItem.type === 'member' ? 'droppable-active' : ''}
            ${unassignedGroupFoldState ? 'open' : 'closed'}
            ${(scheduleDay.unassignedTeamMembers?.length || 0) === 0 ? 'empty' : ''}
          `}
          disabled={activeDragItem && activeDragItem.type !== 'member'}
          key={scheduleDay.date + "unassignedGroup"}
          data-type="unasssigned"
        >
          <div className="block-group-header" onClick={toggleUnassignedGroupFold}>
            <div className="toggle">
              <RotatingIcon rotate={unassignedGroupFoldState} icon={<FoldCaret />} />
            </div>
            <div className="block-group-name">Unassigned {(scheduleDay.unassignedTeamMembers?.length || 0) === 0 ? '(none)' : ''}</div >
          </div>

          <div className="block-group-inner">
            {(scheduleDay.unassignedTeamMembers?.length || 0) === 0 ? (
              <span className="empty-msg">Move members here to unassign them</span>
            ) : (
              scheduleDay.unassignedTeamMembers?.map((teamMemberInstance) => {
                const uniqueId = createMemberBlockId(
                  scheduleDay.id,
                  teamMemberInstance.member.id,
                  'unassigned'
                );
                return (
                  <Draggable
                    id={uniqueId}
                    data-id={uniqueId}
                    key={uniqueId}
                    className="team-member-draggable"
                    data-type="member"
                  >
                    <TeamMemberBlock
                      id={teamMemberInstance.member.id}
                      teamMember={teamMemberInstance}
                      data-member-id={teamMemberInstance.member.id}
                    />
                  </Draggable>
                );
              })
            )}
          </div>
        </Droppable>

        {/* Job Visits: */}
        {scheduleDay.jobVisits?.map((job: JobVisit) => {
          const jobBlockId = createJobBlockId(
            scheduleDay.id,
            job.id.toString(),
          );

          const dropTargetId = createDropTargetId(jobBlockId);

          // Insertion class based on job drag target
          let jobInsertClass = '';
          if (jobDragTarget?.refJobId === job.id.toString()) {
            jobInsertClass = jobDragTarget.position === 'before' ? 'insert-before' : 'insert-after';
          }

          return (
            <Droppable
              id={dropTargetId}
              key={`drop-${jobBlockId}`}
              className={`job-droppable ${jobInsertClass}`}
              data-type="job"
              data-job-id={job.id}
            >
              <Draggable
                id={jobBlockId}
                key={`drag-${jobBlockId}`}
                className="job-draggable"
                data-id={jobBlockId}
              >
                <JobBlock
                  id={job.id}
                  job={job}
                  onModalStateChange={onModalStateChange}
                >
                  {job.assignedMembers?.map((memberInstance: TeamMemberInstance, index: number) => {
                    const member = memberInstance.member;

                    // Generate instanceId based on position if it doesn't exist
                    const memberBlockId = createMemberBlockId(
                      scheduleDay.id,
                      member.id,
                      job.id.toString(),
                      index
                    );

                    // Set instanceId for tracking if it doesn't exist
                    if (!memberInstance.instanceId) {
                      memberInstance.instanceId = memberBlockId;
                    }

                    const memberDropTargetId = createDropTargetId(memberBlockId);

                    // Show insertion indicator based on the new dragTarget model
                    let insertClass = '';

                    // Only show blue indicators if not in invalid drop zone
                    if (!isInvalidDropZone && memberDragTarget?.jobId === job.id.toString()) {
                      if (memberDragTarget.position === 'first' && index === 0) {
                        // First position indicator
                        insertClass = 'insert-before';
                      }
                      else if (memberDragTarget.position === 'last' &&
                              index === job.assignedMembers!.length - 1) {
                        // Last position indicator
                        insertClass = 'insert-after';
                      }
                      else if (memberDragTarget.blockId === memberBlockId) {
                        // Specific member indicator
                        insertClass = memberDragTarget.position === 'before' ? 'insert-before' : 'insert-after';
                      }
                    }

                    return (
                      // Droppable area for each team member
                    <Droppable
                      id={memberDropTargetId}
                      key={memberDropTargetId}
                      className={`team-member-droppable ${insertClass}`}
                      disabled={(activeDragItem && activeDragItem.type === 'job')}
                      data-job-id={job.id}
                      data-member-id={member.id}
                      data-block-id={memberBlockId}
                      data-type="member"
                    >
                      <Draggable
                        id={memberBlockId}
                        key={memberBlockId}
                        className={`team-member-draggable`}
                        data-id={memberBlockId}
                        data-type="member"
                        data-member-id={member.id}
                        data-job-id={job.id}
                        data-block-id={memberBlockId}
                        data-flip-id={`${job.id}-${member.id}`} // Add stable FLIP ID
                      >
                        <TeamMemberBlock
                          key={memberBlockId}
                          id={memberBlockId}
                          teamMember={memberInstance}
                          onRemove={(id, teamMember) => {
                            handleRemoveTeamMemberFromJob(teamMember, job);
                          }}
                        />
                      </Draggable>
                    </Droppable>
                    );
                  })}

                  {/* Empty droppable zone when no members are assigned */}
                  {(!job.assignedMembers || job.assignedMembers.length === 0) && (
                    <Droppable
                      id={`empty-${job.id}-${scheduleDay.id}`}
                      key={`empty-${job.id}`}
                      className={`empty-member-drop-zone ${
                        !isInvalidDropZone && memberDragTarget?.jobId === job.id.toString() ? 'insert-before' : ''
                      }`}
                      disabled={activeDragItem && activeDragItem.type === 'job'}
                      data-job-id={job.id}
                      data-type="member"
                      data-empty-zone="true"
                    >
                      {/* No visible content - just an invisible drop target */}
                    </Droppable>
                  )}

                  <TeamMemberSelectMenu
                    teamMembers={TeamMembersData}
                    selectMenuProps={{
                      placeholder: "+ Add Member",
                      resetOnSelect: true,
                      styles: {
                        ...SelectMenuStylePresets.Medium,
                        control: () => ({
                          backgroundColor: 'none',
                          border: '0',
                          fontWeight: '500',
                          color: '#BDBDBD',
                          fontSize: '12px',
                          marginLeft: '38px',
                          minHeight: 'none',
                          '&:hover': {
                            color: 'red',
                          },
                        }),
                        placeholder: (baseStyles:any) => ({
                          ...baseStyles,
                          fontWeight: '500',
                          color: '#BDBDBD',
                          fontSize: '12px',
                        }),
                      },
                      selectProps: {
                        escapeClearsValue: true,
                        blurInputOnSelect: true,
                        className: "add-team-member-select-menu",
                        components:{
                          DropdownIndicator: null
                        }
                      },
                      onChange: (selectedOption) => {
                        if (selectedOption) {
                          const member = getTeamMemberObjectById(selectedOption.id.toString());
                          if (member) {
                            handleAddTeamMemberToJob(member, job);
                          }
                        }
                      },
                    }}
                  />
                </JobBlock>
              </Draggable>
            </Droppable>
          );
        })}
      </div>
    </section>
  );
};

export default ScheduleDocumentDay;
