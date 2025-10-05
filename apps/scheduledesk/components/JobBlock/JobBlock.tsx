'use client'

import React, { useState, useRef, FC, useEffect, useCallback, useContext } from "react";
import { useDragLock } from '@/components/DragDrop/DragDrop';
import { DateTime } from 'luxon';
import BDPopover, { PopoverContext } from "@/components/Popover";
import { AnimatePresence } from 'framer-motion';
import Modal from "@/components/Modal";
import APP_SETTINGS from "@/data/appSettings";
import { JobVisit, JobVisitConfirmationStatus } from "@/types";
import JobVisitConfirmationStatusSelector from "@/components/JobVisitConfirmationStatusSelector";
import JobHighlightMenu from "./JobHighlightMenu";
import TimeRangeSelectMenu from "@/components/SelectMenu/TimeRangeSelectMenu";
import JobDetailsView from "@/components/JobDetailsView";
import MapView from "@/components/MapView";
import RotatingIcon from "@/components/RotatingIcon";
import { AngleDown, CloseX } from "@/components/Icons";
import "./JobBlock.scss";
import {SelectMenuStylePresets} from "@/components/SelectMenu/SelectMenu";

interface JobBlockProps {
  id: string;
  job: JobVisit;
  isActive?: boolean;
  isSelected?: boolean;
  children?: React.ReactNode;
  isClone?: boolean;
  className?: string;
  highlightId?: string;
  showTimeInputs?: boolean;
  onSelected?: (id: string) => void;
  onActive?: (id: string) => void;
  onHighlightChange?: (id: string, highlightId: string) => void;
  onTimeChange?: (id: string, startTime: string | undefined, endTime: string | undefined) => void;
  onStatusChange?: (id: string, status: JobVisitConfirmationStatus) => void;
  onDateChange?: (id: string, date: Date | null | undefined) => void;
  onModalStateChange?: (isOpen: boolean) => void;


  // TODO: We need to make these work:
  // onActiveChange?: (id: string) => void;
  // onSetStatus?: (id: string, status: JobVisitConfirmationStatus) => void;
  // onSetTimeRange?: (id: string, startTime: string, endTime: string) => void;
}

const JobBlock: FC<JobBlockProps> = ({
  id,
  job,
  isActive,
  isSelected,
  children,
  isClone=false,
  className,
  highlightId,
  showTimeInputs,
  onSelected,
  onActive,
  onHighlightChange,
  onTimeChange,
  onStatusChange,
  onDateChange,
  onModalStateChange,
  ...props
}) => {
  // State
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState((job.confirmationStatus || "Open") as JobVisitConfirmationStatus);
  const [highlight, setHighlight] = useState(job.highlightId);
  const [blockActive, setBlockActive] = useState(isActive || false);
  const [startTime, setStartTime] = useState<string | undefined>(job.startTime);
  const [endTime, setEndTime] = useState<string | undefined>(job.endTime);
  const [date, setDate] = useState<Date | null>(DateTime.fromISO(job.date as string).toJSDate() || null);

  const { isDragLocked, setIsDragLocked } = useDragLock();


  // Refs
  const modalTrigger = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const jobVisitConfirmationStatusSelectorRef = useRef<HTMLDivElement>(null);
  const { scrollContainerRef } = useContext(PopoverContext);


  // Handlers
  const handleTimeRangeChange = useCallback((startTime: string | undefined, endTime: string | undefined) => {
    setStartTime(startTime);
    setEndTime(endTime);
    onTimeChange && onTimeChange(id, startTime, endTime);
    console.log(`💾SELECTED TIME RANGE: jobId:${job.id} startTime:${startTime} endTime:${endTime}`);
  }, [id, job.id, onTimeChange]);

  const handleDateChange = useCallback((date: Date | null) => {
    setDate(date);
    onDateChange && onDateChange(id, date);
    console.log(`💾SELECTED DATE: jobId:${job.id} date:${date}`);
  }, [id, job.id, onDateChange]);

  const handleBlockActive = (id: string) => {
    const newActiveState = !blockActive;
    setBlockActive(newActiveState);

    if (newActiveState) {  // Check the NEW state we're setting
      console.log('>>> JobBlock active. id:', id);
      onActive ? onActive(id) : console.log('No onActive provided');
    }
  };

  const handleSetConfirmationStatus = (confirmationStatus: JobVisitConfirmationStatus) => {
    setConfirmationStatus(confirmationStatus);
    onStatusChange && onStatusChange(id, confirmationStatus);
    console.log(`💾SELECTED STATUS: jobId:${job.id} confirmationStatus:${confirmationStatus}`);
  };

  const handleSetHighlight = (highlightId: string) => {
    setHighlight(highlightId);
    job.highlightId = highlightId;
    onHighlightChange && onHighlightChange(id, highlightId);
    setShowHighlightMenu(false);
  };

  const handleJobDetailModalOpen = (e: React.MouseEvent) => {
    if (e.altKey) {
      window.open(job.webUri, '_blank');
      return;
    }
    setIsDragLocked(true);
    setShowJobDetailModal(true);
    onModalStateChange?.(true);
  };

  const handleJobDetailModalClose = () => {
    setIsDragLocked(false);
    setShowJobDetailModal(false);
    onModalStateChange?.(false);
  };

  const handleMapModalOpen = (e: React.MouseEvent) => {
    setShowMapModal(true);
    onModalStateChange?.(true);
  };

  const handleMapModalClose = () => {
    setShowMapModal(false);
    onModalStateChange?.(false);
  };

  const toggleHighlightMenu = () => {
    const newMenuState = !showHighlightMenu;
    setShowHighlightMenu(newMenuState);

    // Lock/unlock drag based on menu state
    if (newMenuState) {
      setIsDragLocked(true);
    } else {
      setIsDragLocked(false);
    }
  };

  // Effects
  useEffect(() => {
    if (isActive !== undefined) {
      setBlockActive(isActive);
    }
  }, [isActive]);

  useEffect(() => {
    // Cleanup function to ensure drag is unlocked when component unmounts
    return () => {
      if (showHighlightMenu) {
        setIsDragLocked(false);
      }
    };
  }, [showHighlightMenu, setIsDragLocked]);

  // Render
  return (
    <div
      className={
        `job-block highlight-${highlight}
        ${blockActive ? "active" : ""}
        ${isSelected ? "selected" : ""}
        ${isClone ? "is-clone" : ""}
        ${className || ""}`
      }
      /////////////////////////////////
      // Activation
      //////////////
      // onClick={(e) => {
      //   // Check if click is on a popover or menu
      //   if (e.target && (
      //     (e.target as HTMLElement).closest('.bd-popover') ||
      //     (e.target as HTMLElement).closest('.team-member-highlight-menu')
      //   )) {
      //     e.stopPropagation();
      //     return;
      //   }
      //   handleBlockActive(job.id);
      // }}
    >
      <div className="job-block-line">
        <JobVisitConfirmationStatusSelector
          ref={jobVisitConfirmationStatusSelectorRef}
          status={confirmationStatus}
          hideText={true}
          onSelect={handleSetConfirmationStatus}
        />

        <div className="job-title-wrap">
          <div className="job-title">
            <span
              className="client-last-name"
              ref={modalTrigger}
              onClick={(e) => { handleJobDetailModalOpen(e); }}
            >
              {job.client?.lastName}
            </span>
            <span>-</span>
            <span className="map-link"
              ref={modalTrigger}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMapModalOpen(e);
              }}
            >
              {job.location?.street}
            </span>
            {job.customFields && (
              <span className="custom-fields">
                {job.customFields
                  .filter(
                    (field) => field.__typename === "CustomFieldText"
                      && APP_SETTINGS.jobTitleIncludedCustomFields.some(
                        (item) => item.label === field.label
                      )
                      && field.valueText !== ""
                  )
                  .map((field, i) => (
                    <React.Fragment key={i}>
                      <span>-</span>
                      <span className="field">{field.valueText}</span>
                    </React.Fragment>
                  ))}
              </span>
            )
            }
          </div>
        </div>

        {showTimeInputs && (
        <div className="time-inputs">
          <TimeRangeSelectMenu
            startTime={startTime}
            endTime={endTime}
            minStartTime='06:30:00'
            maxEndTime='18:00:00'
            onChange={handleTimeRangeChange}
            interval={30}
            selectMenuProps={{styles: SelectMenuStylePresets.Medium}}
          />
        </div>
        )}

        <button
          ref={menuToggleRef}
          className={`job-highlight-toggle ${showHighlightMenu ? "menu-active" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleHighlightMenu();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <RotatingIcon rotate={showHighlightMenu} degrees={180} icon={<AngleDown/>} />
        </button>
      </div>

      <div className="job-block-team-members">
        {children}
      </div>

      {showHighlightMenu && (
        <BDPopover
          targetRef={menuToggleRef}
          scrollContainerRef={scrollContainerRef}
          position={'bottomRight'}
          edge={'topRight'}
          offset={{ x: 8, y: -20 }}
          onHide={() => setShowHighlightMenu(false)}
          noStyles={true}
        >
          <JobHighlightMenu
            onSelect={handleSetHighlight}
            onClose={() => setShowHighlightMenu(false)}
            trigger={menuToggleRef as React.RefObject<HTMLElement>}
            currentHighlight={highlight}
          />
        </BDPopover>
      )}

      <AnimatePresence>
        {/* Confirm Confirmation Dialog - ON HOLD */}
        {/* {showConfirmDialog && (
          <Popover
            pointTo={jobVisitConfirmationStatusSelectorRef}
            height="auto"
            position="right"
            closeButton={false}
            clickOutsideToClose={false}
          >
            <div className="dialog add-note-confirmation">
              <h2>Add Confirmation Note?</h2>
              <p>If you choose 'Yes', a note will be added to <a href={job.webUri} target="_blank">this job</a> in Jobber containing:
                <span>👍🏼CONFIRMED for [DATE], [TIME]</span>
              </p>
              <div className="button-group">
                <button onClick={handleConfirmNo}>No</button>
                <button onClick={handleConfirmYes} className="primary">Yes</button>
              </div>
            </div>
          </Popover>
        )} */}

        {/* Job Details Modal */}
        {showJobDetailModal && (
          <Modal
            key="job-details-modal"
            closeButton={true}
            clickOutsideToClose={true}
            onClose={handleJobDetailModalClose}
            escToClose={true}
          >
            <JobDetailsView
              id={job.id}
              job={job}
              onTimeChange={(startTime, endTime) => handleTimeRangeChange(startTime, endTime)}
              onStatusChange={(status) => handleSetConfirmationStatus(status)}
              onDateChange={(date) => handleDateChange(date)}
            />
          </Modal>
        )}

        {/* Map Modal */}
        {showMapModal && (
          <Modal
            key="map-modal"
            closeButton={false}
            clickOutsideToClose={true}
            styles={{ padding: '0px' }}
            onClose={handleMapModalClose}
            escToClose={true}
          >
            <div className="map-view-modal-container">
              <MapView position={{
                lat: parseFloat(job.location?.coordinates?.latitudeString || "0"),
                lng: parseFloat(job.location?.coordinates?.longitudeString || "0"),
              }} />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobBlock;
