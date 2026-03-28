import React from "react";
import Sidebar from "@/layouts/Sidebar";
import Header from "@/layouts/Header";
import GlobalSearch from "@/layouts/GlobalSearch";
import { useApp } from "@/app/AppContext";
import { ViewType, Profile } from "@/types";
import { HomeIcon, FolderKanbanIcon, UsersIcon, DollarSignIcon } from "@/constants";
import { useProfile } from "@/features/settings/api/useProfileQueries";
import { useNotifications } from "@/hooks/useNotifications";




const BottomNavBar: React.FC = () => {
    const { activeView, setActiveView } = useApp();

    
    // We need handleNavigation from AppRoutes probably, or just define it here/in context.
    // Let's use setActiveView for now if it's enough.
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
        };

        const newRoute = `#/${pathMap[view] || view.toLowerCase().replace(/ /g, "-")}`;
        window.location.hash = newRoute;
        setActiveView(view);
    };

    const navItems = [
        { view: ViewType.DASHBOARD, label: "Beranda", icon: HomeIcon },
        { view: ViewType.PROJECTS, label: "Proyek", icon: FolderKanbanIcon },
        { view: ViewType.CLIENTS, label: "Klien", icon: UsersIcon },
        { view: ViewType.FINANCE, label: "Keuangan", icon: DollarSignIcon },
    ];

    return (
        <nav className="bottom-nav xl:hidden bg-brand-surface/95 backdrop-blur-xl border-t border-brand-border/50">
            <div className="flex justify-around items-center h-16 px-2" style={{ paddingBottom: "var(--safe-area-inset-bottom, 0px)" }}>
                {navItems.map((item) => (
                    <button
                        key={item.view}
                        onClick={() => handleNavigation(item.view)}
                        className={`flex flex-col items-center justify-center w-full h-full px-2 py-2 rounded-xl transition-all duration-200 min-w-[56px] sm:min-w-[64px] min-h-[44px] relative group overflow-visible ${activeView === item.view ? "text-brand-accent bg-brand-accent/10" : "text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-input/50"}`}
                    >
                        <div className="relative mb-1">
                            <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${activeView === item.view ? "transform scale-110" : "group-active:scale-95"}`} />
                            {activeView === item.view && <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-accent animate-pulse-soft" />}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-semibold leading-tight transition-all duration-200 ${activeView === item.view ? "font-bold" : ""}`}>{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

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
          className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 xl:pb-8 overflow-y-auto"
          style={{ paddingBottom: "calc(5rem + var(--safe-area-inset-bottom, 0px))" }}
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


      <BottomNavBar />
    </div>
  );
};
