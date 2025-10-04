'use client';

import { createContext, useContext, FC, useCallback, useState } from "react";
import { User } from "@/types";

interface UserContextType {
  user: User;
  setUser: (newUser: User) => void;
}

interface UserProviderProps {
  initialValue?: User;
  children?: React.ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

const UserProvider: FC<UserProviderProps> = ({ children, initialValue }) => {
  const [user, setUser] = useState<User>(() => {
    if (initialValue) return initialValue;

    if (typeof window !== 'undefined') {
      const persistedUser = localStorage.getItem("user");
      if (!persistedUser) return { accountName: "" };
      return { ...JSON.parse(persistedUser) };
    }

    return { accountName: "" };
  });

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
