import { create } from 'zustand';
import { ViewType, NavigationAction, User, Notification } from '@/types';

interface UIState {
  // Navigation & Layout
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  initialAction: NavigationAction | null;
  setInitialAction: (action: NavigationAction | null) => void;

  // Global Notification Toast
  notification: string;
  showNotification: (message: string, duration?: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeView: ViewType.HOMEPAGE,
  setActiveView: (view) => set({ activeView: view }),
  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  isSearchOpen: false,
  setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  initialAction: null,
  setInitialAction: (action) => set({ initialAction: action }),

  notification: '',
  showNotification: (message, duration = 3000) => {
    set({ notification: message });
    setTimeout(() => set({ notification: '' }), duration);
  },
}));
