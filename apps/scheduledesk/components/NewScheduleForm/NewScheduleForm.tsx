'use client'

import React, { FC, useRef } from "react";

const NewScheduleForm: FC = () => {
  const formRef = useRef(null);

  return (
    <form ref={formRef} className="new-schedule-form">
      {/* Form content goes here */}
    </form>
  );
}

export default NewScheduleForm;
