'use client'

import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef, useContext, createContext, ReactNode } from 'react';
import Portal from "../Portal";
import { useClickOutside } from 'hooks/useClickOutside';
import './Popover.scss';

interface MaskOptions {
  color: string;
  opacity: number;
}

interface PositionObject {
  x: 'left' | 'right' | 'center';
  y: 'top' | 'bottom' | 'center';
}

interface PositionOffset {
  x: number;
  y: number;
}

type PositionType = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'centerLeft' | 'centerRight' | 'centerTop' | 'centerBottom' | 'topCenter' | 'bottomCenter' | 'upperLeft' | 'upperRight' | 'centerCenter';

interface PopoverType {
  hide: () => void;
}

interface PopoverContextType {
  register: (id: string, popover: PopoverType) => void;
  unregister: (id: string) => void;
  hideAll: () => void;
  getPopover: (id: string) => PopoverType | undefined;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

interface PopoverProviderProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

export const PopoverContext = createContext<PopoverContextType>({
  register: () => { },
  unregister: () => { },
  hideAll: () => { },
  getPopover: () => undefined,
  scrollContainerRef: { current: null },
});

export const PopoverProvider: React.FC<PopoverProviderProps> = ({ children, scrollContainerRef }) => {
  const [popovers, setPopovers] = useState<Record<string, PopoverType>>({});

  const register = (id: string, popover: PopoverType) => {
    setPopovers((prev) => ({ ...prev, [id]: popover }));
  };

  const unregister = (id: string) => {
    setPopovers((prev) => {
      const newPopovers = { ...prev };
      delete newPopovers[id];
      return newPopovers;
    });
  };

  const hideAll = () => {
    Object.values(popovers).forEach(popover => popover.hide());
  };

  const getPopover = (id: string) => {
    return popovers[id];
  };

  return (
    <PopoverContext.Provider value={{ register, unregister, hideAll, getPopover, scrollContainerRef }}>
      {children}
    </PopoverContext.Provider>
  );
};

interface PopoverHandle {
  show: () => void;
  hide: () => void;
}

interface PopoverProps {
  className?: string;
  targetRef: React.RefObject<HTMLElement> | null;
  children: ReactNode;
  height?: number | string;
  width?: number | string;
  position?: PositionType | PositionObject;
  edge?: PositionType | PositionObject;
  offset?: PositionOffset;
  closeButton?: boolean;
  clickToClose?: boolean;
  maskOptions?: MaskOptions;
  zIndex?: number;
  exclusive?: boolean;
  clickOutsideToClose?: boolean;
  noStyles?: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  onShow?: () => void;
  onHide?: () => void;
}

const Popover = forwardRef<PopoverHandle, PopoverProps>(({
  className = '',
  targetRef,
  children,
  height,
  width,
  position = 'center',
  edge = 'center',
  offset = { x: 0, y: 0 },
  closeButton = false,
  clickToClose = false,
  maskOptions = { color: '#000', opacity: 0.7 },
  zIndex = 10000,
  exclusive = true,
  clickOutsideToClose = true,
  noStyles = false,
  onShow = () => {},
  onHide = () => {},
}, ref) => {
  const { register, unregister, hideAll } = useContext(PopoverContext);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  // Remove unused positionStyle state
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollContainerRef } = useContext(PopoverContext);

  useClickOutside(popoverRef as React.RefObject<HTMLElement>, onHide, targetRef||undefined);

  // Generate a unique ID for this popover
  const id = useRef(Math.random().toString(36).substring(2, 9)).current;

  useEffect(() => {
    register(id, { hide });

    show();

    return () => {
      unregister(id);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      if (scrollContainerRef && scrollContainerRef.current) {
        scrollContainerRef.current.addEventListener('scroll', positionPopover);
        scrollContainerRef.current.addEventListener('resize', positionPopover);
      } else {
        window.addEventListener('scroll', positionPopover);
        window.addEventListener('resize', positionPopover);
      }

      onShow();

      return () => {
        window.removeEventListener('scroll', positionPopover);
        window.removeEventListener('resize', positionPopover);
      };
    }
  }, [isVisible, onShow]);

  const show = () => {
    if (exclusive) {
      hideAll();
    }
    setIsVisible(true);
    
    // Safari fix: Wait for DOM to be ready, then position and animate
    setTimeout(() => {
      positionPopover();
      // Start animation after positioning
      setTimeout(() => setIsAnimating(true), 10);
      
      // Retry positioning if element wasn't ready
      if (!popoverRef.current) {
        setTimeout(() => {
          positionPopover();
          setIsAnimating(true);
        }, 100);
      }
    }, 10);
  };

  const hide = () => {
    setIsAnimating(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
      onHide();
    }, 200); // Match CSS transition duration
  };
   
  const positionPopover = () => {
    if (!targetRef || !targetRef.current || !popoverRef.current) {
      return;
    }
  
    const targetElement = targetRef.current;
    const popoverElement = popoverRef.current;
  
    if (targetElement && popoverElement) {
      const triggerRect = targetElement.getBoundingClientRect();
      const popoverRect = popoverElement.getBoundingClientRect();
  
      let top = 0;
      let left = 0;
  
      const resolvePosition = (pos: 'left' | 'right' | 'center' | 'top' | 'bottom', axis: 'x' | 'y') => {
        switch (pos) {
          case 'left':
            return axis === 'x' ? triggerRect.left : triggerRect.top;
          case 'right':
            return axis === 'x' ? triggerRect.right : triggerRect.bottom;
          case 'center':
            return axis === 'x'
              ? triggerRect.left + (triggerRect.width / 2)
              : triggerRect.top + (triggerRect.height / 2);
          case 'top':
            return axis === 'y' ? triggerRect.top : triggerRect.top;
          case 'bottom':
            return axis === 'y' ? triggerRect.bottom : triggerRect.bottom;
          default:
            return axis === 'x' ? triggerRect.left : triggerRect.top;
        }
      };
  
      const resolveEdge = (pos: 'left' | 'right' | 'center' | 'top' | 'bottom', axis: 'x' | 'y') => {
        // Returns offset from popover's top-left corner to the desired edge anchor point
        if (axis === 'x') {
          switch (pos) {
            case 'left': return 0;
            case 'right': return popoverRect.width;
            case 'center': return popoverRect.width / 2;
            default: return 0; // top/bottom don't affect x-axis
          }
        } else { // axis === 'y'
          switch (pos) {
            case 'top': return 0;
            case 'bottom': return popoverRect.height;
            case 'center': return popoverRect.height / 2;
            default: return 0; // left/right don't affect y-axis
          }
        }
      };
  
      const parsePosition = (position: string) => {
        const normalizedPosition = position.toLowerCase().replace(/upper/, 'top');
        let yPos: 'top' | 'bottom' | 'center' = 'center';
        let xPos: 'left' | 'right' | 'center' = 'center';
  
        if (normalizedPosition.includes('top')) {
          yPos = 'top';
        } else if (normalizedPosition.includes('bottom')) {
          yPos = 'bottom';
        }
  
        if (normalizedPosition.includes('left')) {
          xPos = 'left';
        } else if (normalizedPosition.includes('right')) {
          xPos = 'right';
        }
  
        return { x: xPos, y: yPos };
      };
  
      const getPosition = (position: PositionType | PositionObject): PositionObject => {
        if (typeof position === 'string') {
          return parsePosition(position);
        }
        return position;
      };
  
      const pos = getPosition(position as PositionType);
      const edgePos = getPosition(edge as PositionType);
      const posOffset = offset || { x: 0, y: 0 };

      const targetY = resolvePosition(pos.y, 'y');
      const edgeY = resolveEdge(edgePos.y, 'y');
      const targetX = resolvePosition(pos.x, 'x');
      const edgeX = resolveEdge(edgePos.x, 'x');
      
      top = targetY - edgeY + posOffset.y;
      left = targetX - edgeX + posOffset.x;
  
      // Viewport boundary detection and adjustment
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 10; // Minimum distance from viewport edges

      // Adjust if going off right edge
      if (left + popoverRect.width > viewportWidth) {
        left = viewportWidth - popoverRect.width - padding;
      }

      // Adjust if going off left edge  
      if (left < 0) {
        left = padding;
      }

      // Adjust if going off bottom
      if (top + popoverRect.height > viewportHeight) {
        top = viewportHeight - popoverRect.height - padding;
      }

      // Adjust if going off top
      if (top < 0) {
        top = padding;
      }

      // Safari fix: Use direct positioning instead of transform
      popoverElement.style.top = `${top}px`;
      popoverElement.style.left = `${left}px`;
    }
  };

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  return (
    <Portal>
      <div 
        ref={popoverRef} 
        className={`BDPopover ${className} ${isAnimating ? 'visible' : ''} ${noStyles ? 'no-styles' : ''}`}
        style={{
          zIndex: zIndex,
        }}>
        {closeButton && (
          <button className="BDPopover-CloseButton" onClick={hide}>
            <svg width="1em" height="1em" viewBox="0 0 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g fill="currentColor" fillRule="nonzero">
                <path d="M11,22 C17.0445545,22 22,17.0336634 22,11 C22,4.95544554 17.0445545,0 11,0 C4.95544554,0 0,4.95544554 0,11 C0,17.0336634 4.95544554,22 11,22 Z M7.83069307,15.4435644 C7.1009901,15.4435644 6.54554455,14.8772277 6.54554455,14.1475248 C6.54554455,13.8316832 6.68712871,13.5049505 6.93762376,13.2653465 L9.18118812,11.0108911 L6.93762376,8.75643564 C6.68712871,8.51683168 6.54554455,8.19009901 6.54554455,7.87425743 C6.54554455,7.13366337 7.1009901,6.57821782 7.83069307,6.57821782 C8.22277228,6.57821782 8.51683168,6.70891089 8.76732673,6.95940594 L11,9.18118812 L13.2544554,6.94851485 C13.5158416,6.6980198 13.809901,6.57821782 14.1910891,6.57821782 C14.9207921,6.57821782 15.4762376,7.13366337 15.4762376,7.86336634 C15.4762376,8.19009901 15.3455446,8.50594059 15.0841584,8.74554455 L12.8405941,11.0108911 L15.0841584,13.2653465 C15.3346535,13.5049505 15.4653465,13.8207921 15.4653465,14.1475248 C15.4653465,14.8772277 14.909901,15.4435644 14.1910891,15.4435644 C13.7990099,15.4435644 13.4831683,15.3237624 13.2326733,15.0623762 L11,12.8514851 L8.78910891,15.0623762 C8.52772277,15.3237624 8.22277228,15.4435644 7.83069307,15.4435644 Z" id="Shape"></path>
              </g>
            </svg>
            {/* Close */}
          </button>
        )}
        <div className="BDPopover-Content" ref={containerRef} style={{ height, width }}>
          {children}
        </div>
        {maskOptions && isVisible && (
          <div
            className="BDPopover-Mask"
            style={{
              backgroundColor: maskOptions.color,
              opacity: maskOptions.opacity,
              zIndex: zIndex - 1,
            }}
          />
        )}
      </div>
    </Portal>
  );
});
Popover.displayName = 'Popover';

export default Popover;