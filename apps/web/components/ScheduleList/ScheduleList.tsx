'use client'

import React from "react";
import scheduleListData from "../../data/scheduleListData";
import ScheduleListItem from "./ScheduleListItem";
import "./ScheduleList.scss";

function ScheduleList() {
  return (
    <div className="schedule-list">
      {scheduleListData.map((schedule) => (
        <ScheduleListItem schedule={schedule} key={schedule.id} />
      ))}
    </div>
  );
}

export default ScheduleList;