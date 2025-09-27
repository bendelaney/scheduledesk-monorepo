'use client'

import React, { ReactNode } from "react";
import { useSpring, animated } from 'react-spring';

interface RotatingIconProps extends React.HTMLAttributes<HTMLElement> {
  rotate: boolean;
  icon: ReactNode;
  degrees?: number; // 90, 180, 270, etc
  clockwise?: boolean;
  duration?: number;
  styles?: object;
}

const RotatingIcon: React.FC<RotatingIconProps> = ({
  rotate, 
  icon, 
  degrees = 90, 
  clockwise = true, 
  duration = 100,
  styles,
  ...props
}) => {
  let rotateStyles = useSpring({
    transform: `rotate(${rotate ? (clockwise ? degrees : -degrees) : 0}deg)`,
    config: { duration: duration }
  });
  if (styles) rotateStyles = Object.assign(rotateStyles, styles);

  return (
    <animated.div 
      className="rotating-icon" 
      style={{
        ...rotateStyles,
        ...styles
      }} 
      {...props}
    >
      {icon}
    </animated.div>
  );
};

export default RotatingIcon;