'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// Drag Lock Context
interface DragLockContextType {
  isDragLocked: boolean;
  setIsDragLocked: (locked: boolean) => void;
}

const DragLockContext = createContext<DragLockContextType>({
  isDragLocked: false,
  setIsDragLocked: () => {},
});

export const DragLockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDragLocked, setIsDragLocked] = useState(false);

  return (
    <DragLockContext.Provider value={{ isDragLocked, setIsDragLocked }}>
      {children}
    </DragLockContext.Provider>
  );
};

export const useDragLock = () => {
  return useContext(DragLockContext);
};

// Draggable Component
interface DraggableProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  disabled?: boolean;
}

export function Draggable({ id, className, children, disabled, ...props }: DraggableProps) {
  const { isDragLocked } = useDragLock();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    disabled: isDragLocked || disabled
  });

  const modifiedListeners = (isDragLocked || disabled) ? {} : listeners;

  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      {...modifiedListeners}
      className={`${className || ''} ${isDragging ? 'dragging' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Droppable Component
interface DroppableProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  disabled?: boolean;
}

export function Droppable({ id, className, children, disabled, ...props }: DroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    disabled: disabled
  });
  
  return (
    <div
      {...props}
      ref={setNodeRef} 
      className={`${className || ''} ${isOver ? 'droppable-over' : ''} ${disabled ? 'disabled' : ''}`}
    >
      {children}
    </div>
  );
}