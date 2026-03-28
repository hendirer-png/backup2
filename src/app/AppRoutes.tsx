import React, { useState, useEffect, lazy, Suspense } from "react";
import { useApp } from "@/app/AppContext";
import { useNotifications } from "@/hooks/useNotifications";
import { ViewType, TransactionType, PaymentStatus, NavigationAction } from "@/types";
import { DataLoadingWrapper } from "@/shared/ui/LoadingState";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import { MainLayout } from "@/layouts/MainLayout";
import { updateProject as updateProjectInDb } from "@/services/projects";
import { createTransaction, updateCardBalance, updateTransaction as updateTransactionInDb } from "@/services/transactions";
import { markSubStatusConfirmed } from "@/services/projectSubStatusConfirmations";
import { updateContract as updateContractInDb } from "@/services/contracts";

// Lazy-load route components
const Homepage = lazy(() => import("@/pages/home/Homepage"));
const Login = lazy(() => import("@/pages/auth/LoginPage"));
const Dashboard = lazy(() => import("@/pages/dashboard/DashboardPage"));
const Leads = lazy(() => import("@/pages/leads/LeadsPage").then((m) => ({ default: m.Leads })));
const Booking = lazy(() => import("@/pages/booking/BookingPage"));
const Clients = lazy(() => import("@/pages/clients/ClientsPage"));
const Projects = lazy(() => import("@/pages/projects/ProjectsPage").then((m) => ({ default: m.Projects })));
const Freelancers = lazy(() => import("@/pages/team/TeamPage").then((m) => ({ default: m.Freelancers })));
const Finance = lazy(() => import("@/pages/finance/FinancePage"));
const Packages = lazy(() => import("@/features/packages/Packages"));
const Contracts = lazy(() => import("@/pages/contracts/ContractsPage"));
const Settings = lazy(() => import("@/pages/settings/SettingsPage"));
const CalendarView = lazy(() => import("@/features/projects/components/CalendarView").then((m) => ({ default: m.CalendarView })));
const ClientReports = lazy(() => import("@/features/clients/components/ClientKPI"));
const ClientPortal = lazy(() => import("@/features/clients/components/ClientPortal"));
const FreelancerPortal = lazy(() => import("@/features/team/components/FreelancerPortal"));
const PromoCodes = lazy(() => import("@/features/promo/PromoCodes"));
const GalleryUpload = lazy(() => import("@/features/public/components/GalleryUpload"));
const PublicGallery = lazy(() => import("@/features/public/components/PublicGallery"));
const PublicBookingForm = lazy(() => import("@/features/public/components/PublicBookingForm"));
const PublicPackages = lazy(() => import("@/features/public/components/PublicPackages"));
const PublicFeedbackForm = lazy(() => import("@/features/public/components/PublicFeedbackForm"));
const PublicLeadForm = lazy(() => import("@/features/public/components/PublicLeadForm"));
const SuggestionForm = lazy(() => import("@/features/public/components/SuggestionForm"));
const TestSignature = lazy(() => import("@/features/test/TestSignature"));
const PublicInvoice = lazy(() => import("@/features/public/components/PublicInvoice"));
const PublicReceipt = lazy(() => import("@/features/public/components/PublicReceipt"));

const LAST_ROUTE_STORAGE_KEY = "vena-lastRoute";

const AccessDenied: React.FC<{ onBackToDashboard: () => void }> = ({ onBackToDashboard }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 md:p-8 animate-fade-in">
    <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-4 sm:mb-6">
      <img src="/assets/images/backgrounds/errorimg.svg" alt="Akses Ditolak" className="w-full h-full object-contain" />
    </div>
    <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2 sm:mb-3">Akses Ditolak</h2>
    <p className="text-brand-text-secondary mb-6 sm:mb-8 max-w-md leading-relaxed">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
    <button onClick={onBackToDashboard} className="button-primary">Kembali ke Dashboard</button>
  </div>
);

const ROUTE_TO_VIEW: Record<string, ViewType> = {
    home: ViewType.HOMEPAGE,
    dashboard: ViewType.DASHBOARD,
    prospek: ViewType["Calon Pengantin"],
    booking: ViewType.BOOKING,
    clients: ViewType.CLIENTS,
    projects: ViewType.PROJECTS,
    team: ViewType.TEAM,
    finance: ViewType.FINANCE,
    calendar: ViewType.CALENDAR,
    packages: ViewType.PACKAGES,
    "promo-codes": ViewType.PROMO_CODES,
    gallery: ViewType.GALLERY,
    "pricelist-upload": ViewType.GALLERY,
    "client-reports": ViewType.CLIENT_REPORTS,
    settings: ViewType.SETTINGS,
    kontrak: ViewType.CONTRACTS,
};

export const AppRoutes: React.FC = () => {
    const { 
        isAuthenticated, setIsAuthenticated,
        currentUser, setCurrentUser,
        activeView, setActiveView, 
        showNotification,
        setIsSidebarOpen, setIsSearchOpen,
        handleLogout 
    } = useApp();


    const [route, setRoute] = useState(window.location.hash || "#/home");

    // Route Parsing and Navigation Logic
    useEffect(() => {
        const handleHashChange = () => {
            const newRoute = window.location.hash || "#/home";
            setRoute(newRoute);

            const isPublicRoute = newRoute.startsWith("#/public") || 
                newRoute.startsWith("#/gallery") || newRoute.startsWith("#/feedback") || 
                newRoute.startsWith("#/suggestion-form") || newRoute.startsWith("#/portal") || 
                newRoute.startsWith("#/freelancer-portal") || newRoute.startsWith("#/login") || 
                newRoute === "#/home" || newRoute === "#";

            if (!isAuthenticated && !isPublicRoute) {
                window.localStorage.setItem(LAST_ROUTE_STORAGE_KEY, newRoute);
                window.location.hash = "#/login";
            } else if (isAuthenticated && (newRoute.startsWith("#/login") || newRoute === "#")) {
                window.location.hash = "#/dashboard";
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        handleHashChange();
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [isAuthenticated]);

    // Active View Sync
    useEffect(() => {
        const path = (route.split("?")[0].split("/")[1] || "home").toLowerCase();
        const mappedView = ROUTE_TO_VIEW[path];
        if (mappedView) {
            setActiveView(mappedView);
        }
    }, [route, setActiveView]);

    const handleNavigation = (view: ViewType, action?: NavigationAction) => {
        // action handling moved to individual components using useUIStore if needed


        const pathMap: any = {
            [ViewType.HOMEPAGE]: "home",
            [ViewType.DASHBOARD]: "dashboard",
            [ViewType.CLIENTS]: "clients",
            [ViewType.PROJECTS]: "clients",
        };
        const newPath = pathMap[view] || view.toLowerCase().replace(/ /g, "-");
        window.location.hash = `#/${newPath}`;
    };

    const hasPermission = (view: ViewType) => {
        if (!currentUser) return false;
        if (currentUser.role === "Admin") return true;
        return currentUser.permissions?.includes(view) || false;
    };

    const renderView = () => {
        if (!hasPermission(activeView)) {
            return <AccessDenied onBackToDashboard={() => setActiveView(ViewType.DASHBOARD)} />;
        }
        
        switch (activeView) {
            case ViewType.DASHBOARD:
                return (
                    <Dashboard />

                );

            case ViewType["Calon Pengantin"]:
                return <Leads />;


            case ViewType.BOOKING:
                return <Booking />;


            case ViewType.CLIENTS:
            case ViewType.PROJECTS:
                return (
                    <Clients />

                );


            case ViewType.TEAM:
                return (
                    <Freelancers />

                );


            case ViewType.FINANCE:
                return <Finance />;

            case ViewType.PACKAGES:
                return <Packages />;

            case ViewType.SETTINGS:
                return <Settings />;


            case ViewType.CALENDAR:
                return <CalendarView />;


            case ViewType.CLIENT_REPORTS:
                return <ClientReports />;

            case ViewType.PROMO_CODES:
                return <Packages />;
            case ViewType.GALLERY:
                return <Packages />;

            case ViewType.CONTRACTS:
                return (
                    <Clients />

                );


            default:
                return <div />;
        }
    };

    // Public Route logic from App.tsx
    if (route.startsWith("#/home") || route === "#/" || route === "#") {
        return <Homepage />;
    }
    if (route.startsWith("#/login")) {
        return <Login onLoginSuccess={(u: any) => {
            setIsAuthenticated(true);
            setCurrentUser(u);
            window.location.hash = "#/dashboard";
        }} />;
    }

    if (route.startsWith("#/public-packages")) {
        return <PublicPackages />;

    }
    if (route.startsWith("#/public-booking")) {
        return <PublicBookingForm />;

    }
    if (route.startsWith("#/public-lead-form")) {
        return <PublicLeadForm />;

    }

    if (route.startsWith("#/feedback")) return <PublicFeedbackForm />;
    if (route.startsWith("#/suggestion-form")) return <SuggestionForm />;

    if (route.startsWith("#/test-signature")) return <TestSignature />;
    if (route.startsWith("#/gallery/")) {
        const id = route.split("/")[2];
        return <PublicGallery galleryId={id} />;
    }
    if (route.startsWith("#/portal/invoice/")) {
        return <Suspense fallback={<div>Loading...</div>}><PublicInvoice projectId={route.split("/portal/invoice/")[1] || ""} /></Suspense>;
    }
    if (route.startsWith("#/portal/receipt/")) {
        return <Suspense fallback={<div>Loading...</div>}><PublicReceipt transactionId={route.split("/portal/receipt/")[1] || ""} /></Suspense>;
    }
    if (route.startsWith("#/portal/")) {
        const raw = route.split("/portal/")[1] || "";
        const accessId = decodeURIComponent((raw.split(/[?#]/)[0] || "").split("/")[0] || "").trim();
        return <ClientPortal accessId={accessId} />;

    }
    if (route.startsWith("#/freelancer-portal/")) {
        const raw = route.split("/freelancer-portal/")[1] || "";
        const accessId = decodeURIComponent((raw.split(/[?#]/)[0] || "").split("/")[0] || "").trim();
        return <FreelancerPortal accessId={accessId} />;

    }

    if (!isAuthenticated) return <Login onLoginSuccess={(u: any) => {
        setIsAuthenticated(true);
        setCurrentUser(u);
        window.location.hash = "#/dashboard";
    }} />;


    return (
        <MainLayout>
            <ErrorBoundary fallback={<div>Gagal memuat komponen.</div>}>
                <Suspense fallback={<div>Loading...</div>}>
                    {renderView()}
                </Suspense>
            </ErrorBoundary>
        </MainLayout>
    );
};
