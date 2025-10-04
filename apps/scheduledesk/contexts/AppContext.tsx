import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types';

// Define the shape of your app context
interface AppContextType {
  // User-related props
  user: User | null;
  setUser: (user: User | null) => void;

  // Drag lock props
  isDragLocked: boolean;
  lockDrag: () => void;
  unlockDrag: () => void;

  // Add other global state/functions as needed
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  // User defaults
  user: null,
  setUser: () => {},

  // Drag lock defaults
  isDragLocked: false,
  lockDrag: () => {},
  unlockDrag: () => {},
});

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User state
  const [user, setUser] = useState<User | null>(null);

  // Drag lock state
  const [isDragLocked, setIsDragLocked] = useState(false);
  const lockDrag = () => setIsDragLocked(true);
  const unlockDrag = () => setIsDragLocked(false);

  const value = {
    // User values
    user,
    setUser,

    // Drag lock values
    isDragLocked,
    lockDrag,
    unlockDrag,
  };

  useEffect(() => {
    console.log('isDragLocked changed:', isDragLocked);
  }
  , [isDragLocked]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hooks for accessing specific parts of the context
export const useUser = () => {
  const { user, setUser } = useContext(AppContext);
  return { user, setUser };
};

export const useDragLock = () => {
  const { isDragLocked, lockDrag, unlockDrag } = useContext(AppContext);
  return { isDragLocked, lockDrag, unlockDrag };
};

// For backward compatibility (optional)
export const useUserContext = useUser;
