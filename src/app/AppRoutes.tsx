import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/app/AppContext";
import { ViewType } from "@/types";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import { MainLayout } from "@/layouts/MainLayout";
import { PublicLayout } from "@/layouts/PublicLayout";

// Lazy-load route components
const Homepage = lazy(() => import("@/pages/home/Homepage"));
const Login = lazy(() => import("@/pages/auth/LoginPage"));
const Dashboard = lazy(() => import("@/pages/dashboard/DashboardPage"));
const Leads = lazy(() => import("@/pages/leads/LeadsPage").then((m) => ({ default: m.Leads })));
const Booking = lazy(() => import("@/pages/booking/BookingPage"));
const Clients = lazy(() => import("@/pages/clients/ClientsPage"));
const Freelancers = lazy(() => import("@/pages/team/TeamPage").then((m) => ({ default: m.Freelancers })));
const Finance = lazy(() => import("@/pages/finance/FinancePage"));
const Packages = lazy(() => import("@/features/packages/Packages"));
const Contracts = lazy(() => import("@/pages/contracts/ContractsPage"));
const Settings = lazy(() => import("@/pages/settings/SettingsPage"));
const CalendarView = lazy(() => import("@/features/projects/components/CalendarView").then((m) => ({ default: m.CalendarView })));
const ClientReports = lazy(() => import("@/features/clients/components/ClientKPI"));
const ClientPortal = lazy(() => import("@/features/clients/components/ClientPortal"));
const FreelancerPortal = lazy(() => import("@/features/team/components/FreelancerPortal"));
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

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A] mx-auto mb-4"></div>
            <p className="text-[#4A4A4A] font-medium tracking-widest uppercase text-[10px]">Memuat...</p>
        </div>
    </div>
);

const AccessDenied: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 md:p-8 animate-fade-in">
        <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-4 sm:mb-6">
            <img src="/assets/images/backgrounds/errorimg.svg" alt="Akses Ditolak" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2 sm:mb-3">Akses Ditolak</h2>
        <p className="text-brand-text-secondary mb-6 sm:mb-8 max-w-md leading-relaxed">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <Navigate to="/dashboard" replace />
    </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredPermission?: ViewType }> = ({ children, requiredPermission }) => {
    const { isAuthenticated, currentUser } = useApp();
    const location = useLocation();

    if (!isAuthenticated) {
        window.localStorage.setItem(LAST_ROUTE_STORAGE_KEY, location.pathname + location.search);
        return <Navigate to="/login" replace />;
    }

    if (requiredPermission && currentUser?.role !== "Admin") {
        const hasPermission = currentUser?.permissions?.includes(requiredPermission);
        if (!hasPermission) return <AccessDenied />;
    }

    return <MainLayout>{children}</MainLayout>;
};

export const AppRoutes: React.FC = () => {
    const { isAuthenticated, setIsAuthenticated, setCurrentUser } = useApp();

    return (
        <ErrorBoundary fallback={<div>Gagal memuat komponen.</div>}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Routes with Shared Layout */}
                    <Route element={<PublicLayout />}>
                        <Route path="/public-packages/:vendorId?" element={<PublicPackages />} />
                        <Route path="/public-booking/:vendorId?" element={<PublicBookingForm />} />
                        <Route path="/public-lead-form" element={<PublicLeadForm />} />
                        <Route path="/feedback" element={<PublicFeedbackForm />} />
                        <Route path="/suggestion-form" element={<SuggestionForm />} />
                    </Route>

                    {/* Specialized Public Routes (No shared layout) */}
                    <Route path="/" element={<Homepage />} />
                    <Route path="/home" element={<Homepage />} />
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : 
                        <Login onLoginSuccess={(u: any) => {
                            setIsAuthenticated(true);
                            setCurrentUser(u);
                        }} />
                    } />
                    
                    <Route path="/gallery/:id" element={<PublicGallery />} />
                    <Route path="/portal/invoice/:projectId" element={<PublicInvoice />} />
                    <Route path="/portal/receipt/:transactionId" element={<PublicReceipt />} />
                    <Route path="/portal/:accessId" element={<ClientPortal />} />
                    <Route path="/freelancer-portal/:accessId" element={<FreelancerPortal />} />
                    <Route path="/test-signature" element={<TestSignature />} />

                    {/* Dashboard Routes (Protected) */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/prospek" element={<ProtectedRoute requiredPermission={ViewType["Calon Pengantin"]}><Leads /></ProtectedRoute>} />
                    <Route path="/booking" element={<ProtectedRoute requiredPermission={ViewType.BOOKING}><Booking /></ProtectedRoute>} />
                    <Route path="/clients" element={<ProtectedRoute requiredPermission={ViewType.CLIENTS}><Clients /></ProtectedRoute>} />
                    <Route path="/projects" element={<ProtectedRoute requiredPermission={ViewType.PROJECTS}><Clients /></ProtectedRoute>} />
                    <Route path="/team" element={<ProtectedRoute requiredPermission={ViewType.TEAM}><Freelancers /></ProtectedRoute>} />
                    <Route path="/finance" element={<ProtectedRoute requiredPermission={ViewType.FINANCE}><Finance /></ProtectedRoute>} />
                    <Route path="/packages" element={<ProtectedRoute requiredPermission={ViewType.PACKAGES}><Packages /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute requiredPermission={ViewType.SETTINGS}><Settings /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute requiredPermission={ViewType.CALENDAR}><CalendarView /></ProtectedRoute>} />
                    <Route path="/client-reports" element={<ProtectedRoute requiredPermission={ViewType.CLIENT_REPORTS}><ClientReports /></ProtectedRoute>} />
                    <Route path="/promo-codes" element={<ProtectedRoute requiredPermission={ViewType.PROMO_CODES}><Packages /></ProtectedRoute>} />
                    <Route path="/gallery" element={<ProtectedRoute requiredPermission={ViewType.GALLERY}><Packages /></ProtectedRoute>} />
                    <Route path="/kontrak" element={<ProtectedRoute requiredPermission={ViewType.CONTRACTS}><Clients /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
};
