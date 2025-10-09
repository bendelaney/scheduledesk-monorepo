'use client'

import React, { useEffect, useCallback, useRef, useState } from "react";
import { DateTime } from 'luxon';
import { JobVisit, JobVisitConfirmationStatus } from '@/types';
import DateSelector from '@/components/DateSelector';
import { TimeRangeSelectMenu } from '@/components/SelectMenu';
import { SelectMenuStylePresets } from '@/components/SelectMenu/SelectMenu';
import { LinkOut } from '@/components/Icons';
import './JobDetailsView.scss';
import { DatePicker } from "react-datepicker";

interface JobDetailsViewProps {
  id?: string;
  job: JobVisit;
  className?: string;
  onAnimationEnd?: React.AnimationEventHandler<HTMLDivElement>;
  onDateChange?: (date: Date | null) => void;
  onTimeChange?: (startTime: string | undefined, endTime: string | undefined) => void;
  onStatusChange?: (status: JobVisitConfirmationStatus) => void;
}

const JobDetailsView: React.FC<JobDetailsViewProps> = ({ 
  id,
  job, 
  className, 
  onAnimationEnd, 
  onDateChange,
  onTimeChange,
  onStatusChange
}) => {
  // State
  const [startTime, setStartTime] = useState(job.startTime);
  const [endTime, setEndTime] = useState(job.endTime);
  const [date, setDate] = useState<Date | null>(DateTime.fromISO(job.date as string).toJSDate() || null);
  const [dateSelectorValue, setDateSelectorValue] = useState<string | undefined>(job.dayName + ' ' + job.shortDate);
  const [confirmationStatus, setConfirmationStatus] = useState(job.confirmationStatus || "Unconfirmed");

  // Refs
  const instructionsTextRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleDateChange = useCallback((date: Date | null) => {
    if (!date) {
      setDate(null);
      setDateSelectorValue(undefined);
      onDateChange && onDateChange(null);
      return;
    }
    
    setDate(date);
    const newDateString = DateTime.fromJSDate(date).toFormat('EEEE, MMMM d\'th\'');
    setDateSelectorValue(newDateString);
    
    onDateChange && onDateChange(date);
  }, [id, job.id, onDateChange]);

  // Force scrollbar to be visible
  useEffect(() => {
    const instructionsEl = instructionsTextRef.current;
    if (instructionsEl) {
      instructionsEl.style.overflowY = 'hidden';
      requestAnimationFrame(() => {
        instructionsEl.style.overflowY = 'scroll';
        const originalHeight = instructionsEl.style.height;
        instructionsEl.style.height = 'calc(100% + 1px)';
        requestAnimationFrame(() => {
          instructionsEl.style.height = originalHeight;
        });
      });
    }
  }, []);

  return (
    <div
      className={`job-details-view ${className ?? ''}`}
      onAnimationEnd={onAnimationEnd}
    >
      <header>
        <div className={`job-title highlight-${job.highlightId}`}>{job.title}</div>
        <a className="job-number jobber-link" href={job.webUri} target="_blank" title={`Open job #${job.jobNumber} on getjobber.com`}>
          Job #{job.jobNumber}<LinkOut />
        </a>
      </header>

      <div className="container">
        <div className="column left">
          <div className="scheduling-details-container">
            <div className="date-time">
              <div className="date">
                {/* <DateSelector
                  date={date}
                  value={dateSelectorValue || "Start Date"}
                  onChange={handleDateChange}
                /> */}
                <DatePicker
                  calendarClassName="date-selector_calendar"
                  selected={date}        
                  onChange={handleDateChange}
                  selectsStart
                  startDate={date}
                  endDate={date}
                  // maxDate={theEndDate || undefined}
                  // customInput={<StartDateSelectorButton />}
                  popperPlacement='top-start'
                  // onCalendarClose={() => handleStartCalOpenState(false)}
                  // onCalendarOpen={() => handleStartCalOpenState(true)}
                  // {...sharedProps}
                />
              </div>
              <div className="time-inputs">
                <TimeRangeSelectMenu
                  startTime={startTime}
                  endTime={endTime}
                  onChange={(newStartTime, newEndTime) => {
                    setStartTime(newStartTime);
                    setEndTime(newEndTime);
                    onTimeChange && onTimeChange(newStartTime, newEndTime);
                  }}
                  interval={30}
                  selectMenuProps={{
                    isSearchable: true,
                    styles: SelectMenuStylePresets.Large,
                    instanceId: "job-details-time-range"
                  }}
                />
              </div>
            </div>

            <div className="status-selector-wrap">
              {/* Placeholder for JobVisitConfirmationStatusSelector */}
              <div className="status-placeholder">
                Status: {confirmationStatus}
              </div>
            </div>
          </div>

          <div className="fields-and-instructions">
            <ul className="fields">
              <li><span className="label">Workcode:</span> {job.workCode}</li>
              {job.jobInfo && <li><span className="label">Job Info:</span> {job.jobInfo}</li>}
              <li><span className="label">Salesperson: </span> {job.salesperson}</li>
              <li><span className="label">Total:</span> ${job.total}</li>
            </ul>

            <div className="instructions">
              <span className="label">Instructions:</span>
              <div className="instructions-text" ref={instructionsTextRef}>{job.instructions}</div>
            </div>
          </div>
        </div>

        <div className="column right">
          <div className="client-details">
            <div className="client-name">{job.client?.firstName} {job.client?.lastName}</div>
            <div className="client-location">
              <p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${job.location?.street},${job.location?.city},${job.location?.province},${job.location?.postalCode}`} target="_blank" rel="noopener noreferrer">
                  {job.location?.street}<br />
                  {job.location?.city}, {job.location?.province} {job.location?.postalCode}
                </a>
              </p>
            </div>
            <div className="client-contact-info">
              {job.client?.phones?.map((phone, index: number) => (
                <p key={index}><a href={`tel:${phone.number}`}>{phone.number}</a></p>
              ))}
              {job.client?.emails?.map((email, index: number) => (
                <p key={index}><a href={`mailto:${email.address}`}>{email.address}</a></p>
              ))}
            </div>
          </div>

          <div className="assigned-team-members">
            <span className="label">Assigned Team Members:</span>
            {job.assignedMembers?.length ? (
              <ul>
                {job.assignedMembers.map((member, index: number) => (
                  <li className="team-member" key={index}>
                    <div className="avatar">
                      {/* TODO: We'll need to replace these images with the actual image paths for the images that we are storing in Supabase.  */}
                      <img src={`/data/teamMemberAvatars/${member.member.firstName.toLowerCase()}.jpg`} alt={member.member.firstName} />
                    </div>
                    <span className="name">{member.member.firstName}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="secondary">No team members assigned</p>
            )}
          </div>

          <div className="notes">
            <span className="label">Job Notes:</span>
            {job.notes?.length ? (
              <ol>
                {job.notes?.map((note, index: number) => (
                  <li className="note" key={index}>
                    <span className="message">{note.message}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="secondary">No notes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsView;