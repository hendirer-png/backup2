import React, { createContext, useContext } from "react";
import { User, ViewType, NavigationAction } from "@/types";

export interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  setIsAuthenticated: (val: boolean) => void;
  setCurrentUser: (user: User | null) => void;

  // UI State
  activeView: ViewType;
  setActiveView: React.Dispatch<React.SetStateAction<ViewType>>;
  initialAction: NavigationAction | null;
  setInitialAction: React.Dispatch<React.SetStateAction<NavigationAction | null>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  notification: string;
  
  // Handlers (extracted from AppProviders for global access)
  showNotification: (message: string) => void;
  handleLogout: () => Promise<void>;
  handleMarkAsRead: (id: string) => void;
  handleMarkAllAsRead: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProviders");
  }
  return context;
};
