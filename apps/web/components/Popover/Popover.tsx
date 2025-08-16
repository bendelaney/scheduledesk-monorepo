'use client'

import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef, useContext, createContext, ReactNode } from 'react';
import Portal from "../Portal";
import { useClickOutside } from 'hooks/useClickOutside';

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
  const [positionStyle, setPositionStyle] = useState({ x: 0, y: 0 });
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
    positionPopover();
  };

  const hide = () => {
    setIsVisible(false);
    onHide();
  };
   
  const positionPopover = () => {
    if (!targetRef || !popoverRef.current) return;
  
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
        switch (pos) {
          case 'left':
            return axis === 'x' ? 0 : 0;
          case 'right':
            return axis === 'x' ? popoverRect.width : 0;
          case 'center':
            return axis === 'x'
              ? popoverRect.width / 2
              : popoverRect.height / 2;
          case 'top':
            return axis === 'y' ? 0 : 0;
          case 'bottom':
            return axis === 'y' ? popoverRect.height : 0;
          default:
            return 0;
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
  
      top = resolvePosition(pos.y, 'y') - resolveEdge(edgePos.y, 'y') + posOffset.y;
      left = resolvePosition(pos.x, 'x') - resolveEdge(edgePos.x, 'x') + posOffset.x;
  
      popoverElement.style.top = '0px';
      popoverElement.style.left = '0px';
      setPositionStyle({ x: left, y: top });
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
        className={`BDPopover ${className} ${isVisible ? 'visible' : ''} ${noStyles ? 'no-styles' : ''}`}
        style={{
          zIndex: zIndex, 
          opacity: isVisible ? 1 : 0,
          transform: `translate(${positionStyle.x}px, ${positionStyle.y}px)`
        }}>
        {closeButton && (
          <button className="BDPopover-CloseButton" onClick={hide}>
            Close
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