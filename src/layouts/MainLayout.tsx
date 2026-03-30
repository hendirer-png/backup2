import React from "react";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import GlobalSearch from "@/layouts/GlobalSearch";
import { useApp } from "@/app/AppContext";
import { ViewType, Profile } from "@/types";
import { useProfile } from "@/features/settings/api/useProfileQueries";
import { useNotifications } from "@/hooks/useNotifications";






export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    activeView, setActiveView, 
    isSidebarOpen, setIsSidebarOpen, 
    currentUser, handleLogout,
    setIsSearchOpen, isSearchOpen,
    notification
  } = useApp();

  const { data: profileData } = useProfile();
  const profile = profileData || ({
    projectTypes: [],
    projectStatusConfig: [],
    eventTypes: [],
  } as Profile);

  const { notifications, handleMarkAllAsRead } = useNotifications();


  const handleNavigation = (view: any) => {
      const pathMap: any = {
          [ViewType.HOMEPAGE]: "home",
          [ViewType.DASHBOARD]: "dashboard",
          [ViewType["Calon Pengantin"]]: "prospek",
          [ViewType.BOOKING]: "booking",
          [ViewType.CLIENTS]: "clients",
          [ViewType.PROJECTS]: "projects",
          [ViewType.TEAM]: "team",
          [ViewType.FINANCE]: "finance",
          [ViewType.CALENDAR]: "calendar",
          [ViewType.PACKAGES]: "packages",
          [ViewType.PROMO_CODES]: "promo-codes",
          [ViewType.CLIENT_REPORTS]: "client-reports",
          [ViewType.SETTINGS]: "settings",
          [ViewType.CONTRACTS]: "kontrak",
      };
      const newRoute = `#/${pathMap[view] || view.toLowerCase().replace(/ /g, "-")}`;
      window.location.hash = newRoute;
      setActiveView(view);
      setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text-primary">
      <Sidebar
        activeView={activeView}
        setActiveView={handleNavigation}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
        profile={profile}
      />

      <div className="flex-1 flex flex-col xl:pl-64 overflow-hidden">
        <Header
          pageTitle={activeView}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          setIsSearchOpen={setIsSearchOpen}
          notifications={notifications}
          handleNavigation={handleNavigation}
          handleMarkAllAsRead={handleMarkAllAsRead}
          currentUser={currentUser}
          profile={profile}
          handleLogout={handleLogout}
        />

        <main
          className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:pb-8 overflow-y-auto"
        >
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {notification && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 bg-brand-accent text-white py-3 px-4 sm:py-4 sm:px-6 rounded-xl shadow-2xl z-50 animate-fade-in-out backdrop-blur-sm border border-brand-accent-hover/20 max-w-sm break-words"
             style={{ top: "calc(1rem + var(--safe-area-inset-top, 0px))", right: "calc(1rem + var(--safe-area-inset-right, 0px))" }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse-soft" />
            <span className="font-medium text-sm sm:text-base">{notification}</span>
          </div>
        </div>
      )}

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        handleNavigation={handleNavigation}
      />



    </div>
  );
};
