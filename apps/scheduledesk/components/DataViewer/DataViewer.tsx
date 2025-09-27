'use client'

import React from 'react';

type DataViewerProps = {
  data: any;
  log?: boolean;
  theme?: 'dark' | 'light';
};

const DataViewer: React.FC<DataViewerProps> = ({ 
  data, 
  log = true, 
  theme = 'dark' 
}) => {
  if (log) console.log(data);

  // Function to handle various types of data for display
  const formatData = (data: any) => {
    // Handle null, undefined, and other non-object types that JSON.stringify handles well
    if (data === null || typeof data !== 'object') {
      return String(data);
    }
    // Use JSON.stringify for objects and arrays
    return JSON.stringify(data, null, 2);
  };

  let themeStyles: React.CSSProperties = {
    background: '#444',
    color: 'lime',
    padding: '10px',
    margin: '0',
    borderRadius: '8px',
    fontFamily: 'monospace',
    lineHeight: '1.4',
    fontSize: '14px',
    boxShadow: '0px 0px 4px inset rgba(0, 0, 0, 1)',
    overflow: 'auto',
  };

  if (theme === 'light') {
    themeStyles = {
      ...themeStyles,
      background: '#efefef',
      color: '#333',
      boxShadow: '0px 0px 5px inset rgba(0, 0, 0, 0.4)',
    };
  }
  
  return (
    <pre style={themeStyles}>
      {formatData(data)}
    </pre>
  );
};

export default DataViewer;