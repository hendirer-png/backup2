import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  User,
  ViewType,
} from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { useUIStore } from "@/store/uiStore";
import { useNotifications } from "@/hooks/useNotifications";
import { AppContext, AppContextType } from "./AppContext";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const storedValue = window.localStorage.getItem("vena-isAuthenticated");
      return storedValue ? JSON.parse(storedValue) : false;
    } catch { return false; }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedValue = window.localStorage.getItem("vena-currentUser");
      return storedValue ? JSON.parse(storedValue) : null;
    } catch { return null; }
  });

  useEffect(() => {
    window.localStorage.setItem("vena-isAuthenticated", JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    window.localStorage.setItem("vena-currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  const uiStore = useUIStore();
  const activeView = uiStore.activeView;
  const setActiveView = uiStore.setActiveView;
  const notification = uiStore.notification;
  const showNotification = uiStore.showNotification;
  const isSidebarOpen = uiStore.isSidebarOpen;
  const setIsSidebarOpen = uiStore.setIsSidebarOpen;
  const isSearchOpen = uiStore.isSearchOpen;
  const setIsSearchOpen = uiStore.setIsSearchOpen;
  const initialAction = uiStore.initialAction;
  const setInitialAction = uiStore.setInitialAction;

  // Notifications
  const { handleMarkAsRead, handleMarkAllAsRead } = useNotifications();

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      window.localStorage.removeItem("vena-isAuthenticated");
      window.localStorage.removeItem("vena-currentUser");
      window.location.hash = "#/login";
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
    }
  }, []);

  // Theme
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      window.localStorage.setItem("theme", "light");
    } catch (error) {
      console.warn("[Theme] Failed to set theme in localStorage:", error);
    }
  }, []);

  const value: AppContextType = useMemo(() => ({
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    setCurrentUser,
    activeView,
    setActiveView,
    isSidebarOpen,
    setIsSidebarOpen,
    isSearchOpen,
    setIsSearchOpen,
    notification,
    showNotification,
    handleLogout,
    initialAction,
    setInitialAction,
    handleMarkAsRead,
    handleMarkAllAsRead
  }), [
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    setCurrentUser,
    activeView,
    setActiveView,
    isSidebarOpen,
    setIsSidebarOpen,
    isSearchOpen,
    setIsSearchOpen,
    notification,
    showNotification,
    handleLogout,
    initialAction,
    setInitialAction,
    handleMarkAsRead,
    handleMarkAllAsRead
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
