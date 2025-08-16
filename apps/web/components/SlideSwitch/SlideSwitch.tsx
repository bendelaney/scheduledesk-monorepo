'use client'

import React, { useState, useEffect, CSSProperties } from 'react';

interface SlideSwitchProps {
  labelText?: string;
  isOn?: boolean;
  height?: string;
  bgColorActive?: string;
  bgColor?: string;
  knobColor?: string; 
  onToggle?: (isOn: boolean) => void;
  onOn?: () => void;
  onOff?: () => void;
}

const SlideSwitch: React.FC<SlideSwitchProps> = ({
  labelText = '',
  isOn = false,
  height = '1em',
  bgColorActive = '#0087FF',
  bgColor = '#bdbdbd',
  knobColor = '#ffffff',
  onToggle = () => {},
  onOn = () => {},
  onOff = () => {},
}) => {
  const [isAffirmative, setIsAffirmative] = useState(isOn);

  useEffect(() => {
    isAffirmative ? onOn() : onOff();
  }, [isAffirmative, onOn, onOff]);

  useEffect(() => {
    isOn ? turnOn() : turnOff();
  }, [isOn]);

  const turnOn = () => {
    setIsAffirmative(true);
    onOn();
    onToggle(true);
  };

  const turnOff = () => {
    setIsAffirmative(false);
    onOff();
    onToggle(false);
  };

  const toggle = () => {
    isAffirmative ? turnOff() : turnOn();
  };

  let switchHeight; 
  let switchWidth;
  switch (true) {
  case height.includes('px'):
    switchHeight = height;
    switchWidth = parseInt(height, 10) * 2;
    break;
  case height.includes('%'):
    switchHeight = height;
    switchWidth = (parseInt(height, 10) / 2)+'%';
    break;
  case height.includes('auto'):
  default:
    switchHeight = "1em";
    switchWidth = "2em";
    break;
  }

  const wrapperStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: '6px',
    color: isAffirmative ? '#333333' : '#bdbdbd',
    cursor: 'pointer',
    flex: '0 0 auto',
  };
  const switchStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    height: switchHeight,
    width: switchWidth,
    backgroundColor: isAffirmative ? bgColorActive : bgColor,
    borderRadius: switchHeight,
    border: '1px solid '+(isAffirmative ? bgColorActive : bgColor),
    transition: 'background-color 0.2s',
    verticalAlign: 'bottom',
  };

  const knobStyle: CSSProperties = {
    position: 'absolute',
    top: '-1px',
    left: isAffirmative ? `50%` : '-1px',
    height: switchHeight,
    width: switchHeight,
    backgroundColor: knobColor,
    border: '2px solid '+(isAffirmative ? bgColorActive : bgColor),
    borderRadius: '50%',
    transition: 'left 0.16s',
  };

  const handleClick = () => {
    toggle();
  };

  return (
    <div className='slide-switch' style={wrapperStyles} onClick={handleClick}>
      <div className={`switch ${isAffirmative? "on" : "off"}`} style={switchStyle}>
        <span className="Knob" style={knobStyle}></span>
      </div>
      {labelText !== '' && <span className="label">{labelText}</span>}
    </div>
  );
};

export { SlideSwitch };