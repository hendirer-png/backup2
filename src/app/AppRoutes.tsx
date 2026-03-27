import React, { useState, useEffect, lazy, Suspense } from "react";
import { useApp } from "@/app/AppProviders";
import { ViewType, TransactionType, PaymentStatus, NavigationAction } from "@/types";
import { DataLoadingWrapper } from "@/shared/ui/LoadingState";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import { MainLayout } from "@/layouts/MainLayout";
import { updateProject as updateProjectInDb } from "@/services/projects";
import { createTransaction, updateCardBalance, updateTransaction as updateTransactionInDb } from "@/services/transactions";
import { markSubStatusConfirmed } from "@/services/projectSubStatusConfirmations";

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

export const AppRoutes: React.FC = () => {
    const { 
        isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser,
        activeView, setActiveView, 
        notification, showNotification, addNotification,
        projects, setProjects, clients, setClients, 
        transactions, setTransactions, teamMembers, setTeamMembers,
        cards, setCards, pockets, setPockets,
        profile, setProfile, leads, setLeads,
        teamProjectPayments, setTeamProjectPayments,
        teamPaymentRecords, setTeamPaymentRecords,
        promoCodes, setPromoCodes, packages, setPackages,
        addOns, setAddOns, clientFeedback, setClientFeedback,
        notifications, appData, initialAction, setInitialAction,
        users, setUsers, contracts, setContracts
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
        const routeToView: Record<string, ViewType> = {
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
            "client-reports": ViewType.CLIENT_REPORTS,
            settings: ViewType.SETTINGS,
            kontrak: ViewType.CONTRACTS,
        };

        if (routeToView[path]) {
            setActiveView(routeToView[path]);
        } else if (path === "team") {
            setActiveView(ViewType.TEAM);
        }
    }, [route, setActiveView]);

    const handleNavigation = (view: ViewType, action?: NavigationAction) => {
        if (action) {
            setInitialAction(action);
        }

        const pathMap: any = {
            [ViewType.HOMEPAGE]: "home",
            [ViewType.DASHBOARD]: "dashboard",
            [ViewType.CLIENTS]: "clients",
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
                    <Dashboard 
                        projects={projects} clients={clients} transactions={transactions}
                        teamMembers={teamMembers} cards={cards} pockets={pockets}
                        handleNavigation={handleNavigation} leads={leads}
                        teamProjectPayments={teamProjectPayments} packages={packages}
                        clientFeedback={clientFeedback} currentUser={currentUser}
                        projectStatusConfig={profile.projectStatusConfig} profile={profile}
                        totals={appData.totals}
                    />
                );
            case ViewType["Calon Pengantin"]:
                return <Leads leads={leads} setLeads={setLeads} clients={clients} setClients={setClients} projects={projects} setProjects={setProjects} packages={packages} addOns={addOns} transactions={transactions} setTransactions={setTransactions} userProfile={profile} setProfile={setProfile} showNotification={showNotification} cards={cards} setCards={setCards} pockets={pockets} setPockets={setPockets} promoCodes={promoCodes} setPromoCodes={setPromoCodes} handleNavigation={handleNavigation} totals={appData.totals} />;
            case ViewType.BOOKING:
                return <Booking leads={leads} clients={clients} projects={projects} setProjects={setProjects} packages={packages} userProfile={profile} setProfile={setProfile} handleNavigation={handleNavigation} showNotification={showNotification} />;
            case ViewType.CLIENTS:
                return (
                    <DataLoadingWrapper loading={appData.loading.clients} loaded={appData.loaded.clients} loadingMessage="Memuat data klien..." onRetry={appData.loadClients}>
                        <Clients 
                            clients={clients} setClients={setClients} projects={projects} setProjects={setProjects}
                            packages={packages} addOns={addOns} transactions={transactions} setTransactions={setTransactions}
                            userProfile={profile} showNotification={showNotification} initialAction={initialAction}
                            setInitialAction={setInitialAction} cards={cards} setCards={setCards} pockets={pockets}
                            setPockets={setPockets} handleNavigation={handleNavigation} clientFeedback={clientFeedback}
                            promoCodes={promoCodes} setPromoCodes={setPromoCodes} totals={appData.totals}
                            onSignInvoice={async (pId, sig) => {
                                setProjects(prev => prev.map(p => p.id === pId ? { ...p, invoiceSignature: sig } : p));
                                await updateProjectInDb(pId, { invoiceSignature: sig } as any);
                            }}
                            onSignTransaction={async (tId, sig) => {
                                setTransactions(prev => prev.map(t => t.id === tId ? { ...t, vendorSignature: sig } : t));
                                await updateTransactionInDb(tId, { vendorSignature: sig } as any);
                            }}
                            onRecordPayment={async (projectId, amount, destinationCardId) => {
                                try {
                                    const today = new Date().toISOString().split("T")[0];
                                    const proj = projects.find(p => p.id === projectId);
                                    if (!proj) return;
                                    const tx = await createTransaction({
                                        date: today, description: `Pembayaran Acara Pernikahan ${proj.projectName}`,
                                        amount, type: TransactionType.INCOME, projectId, category: "Pelunasan Acara Pernikahan",
                                        method: "Transfer Bank", cardId: destinationCardId,
                                    } as any);
                                    if (destinationCardId) await updateCardBalance(destinationCardId, amount);
                                    const newAmountPaid = (proj.amountPaid || 0) + amount;
                                    const newStatus = newAmountPaid >= proj.totalCost ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR;
                                    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, amountPaid: newAmountPaid, paymentStatus: newStatus } : p));
                                    await updateProjectInDb(projectId, { amountPaid: newAmountPaid, paymentStatus: newStatus } as any);
                                    setTransactions(prev => [tx, ...prev]);
                                    showNotification("Pembayaran berhasil dicatat.");
                                } catch (e) { showNotification("Gagal mencatat pembayaran."); }
                            }}
                            addNotification={addNotification}
                        />
                    </DataLoadingWrapper>
                );
            case ViewType.PROJECTS:
                return (
                    <DataLoadingWrapper loading={appData.loading.projects} loaded={appData.loaded.projects} loadingMessage="Memuat data proyek..." onRetry={appData.loadProjects}>
                        <Projects projects={projects} setProjects={setProjects} clients={clients} packages={packages} teamMembers={teamMembers} teamProjectPayments={teamProjectPayments} setTeamProjectPayments={setTeamProjectPayments} transactions={transactions} setTransactions={setTransactions} initialAction={initialAction} setInitialAction={setInitialAction} profile={profile} showNotification={showNotification} cards={cards} setCards={setCards} pockets={pockets} setPockets={setPockets} totals={appData.totals} />
                    </DataLoadingWrapper>
                );
            case ViewType.TEAM:
                return (
                    <DataLoadingWrapper loading={appData.loading.teamMembers} loaded={appData.loaded.teamMembers} loadingMessage="Memuat data tim..." onRetry={appData.loadTeamMembers}>
                        <Freelancers 
                            teamMembers={teamMembers} 
                            setTeamMembers={setTeamMembers} 
                            teamProjectPayments={teamProjectPayments} 
                            setTeamProjectPayments={setTeamProjectPayments} 
                            teamPaymentRecords={teamPaymentRecords} 
                            setTeamPaymentRecords={setTeamPaymentRecords} 
                            transactions={transactions} 
                            setTransactions={setTransactions} 
                            userProfile={profile} 
                            showNotification={showNotification} 
                            initialAction={initialAction} 
                            setInitialAction={setInitialAction} 
                            projects={projects} 
                            setProjects={setProjects} 
                            pockets={pockets} 
                            setPockets={setPockets} 
                            cards={cards} 
                            setCards={setCards} 
                            totals={appData.totals} 
                            onSignPaymentRecord={async () => {}}
                        />
                    </DataLoadingWrapper>
                );
            case ViewType.FINANCE:
                return (
                    <DataLoadingWrapper loading={appData.loading.transactions} loaded={appData.loaded.transactions} loadingMessage="Memuat data transaksi..." onRetry={appData.loadTransactions}>
                        <Finance transactions={transactions} setTransactions={setTransactions} pockets={pockets} setPockets={setPockets} projects={projects} setProjects={setProjects} profile={profile} cards={cards} setCards={setCards} teamMembers={teamMembers} />
                    </DataLoadingWrapper>
                );
            case ViewType.PACKAGES:
                return <Packages packages={packages} setPackages={setPackages} addOns={addOns} setAddOns={setAddOns} projects={projects} profile={profile} />;
            case ViewType.SETTINGS:
                return <Settings profile={profile} setProfile={setProfile} transactions={transactions} projects={projects} packages={packages} users={users} setUsers={setUsers} currentUser={currentUser} />;
            case ViewType.CALENDAR:
                return <CalendarView projects={projects} setProjects={setProjects} teamMembers={teamMembers} profile={profile} clients={clients} handleNavigation={handleNavigation} />;
            case ViewType.CLIENT_REPORTS:
                return <ClientReports clients={clients} leads={leads} projects={projects} feedback={clientFeedback} setFeedback={setClientFeedback} showNotification={showNotification} />;
            case ViewType.PROMO_CODES:
                return <PromoCodes promoCodes={promoCodes} setPromoCodes={setPromoCodes} projects={projects} showNotification={showNotification} />;
            case ViewType.GALLERY:
                return <GalleryUpload userProfile={profile} showNotification={showNotification} />;
            case ViewType.CONTRACTS:
                return (
                    <DataLoadingWrapper loading={appData.loading.contracts} loaded={appData.loaded.contracts} loadingMessage="Memuat data kontrak..." onRetry={appData.loadContracts}>
                        <Contracts 
                            contracts={contracts} 
                            setContracts={setContracts}
                            clients={clients} 
                            projects={projects} 
                            profile={profile}
                            showNotification={showNotification}
                            initialAction={initialAction}
                            setInitialAction={setInitialAction}
                            packages={packages}
                            onSignContract={() => {}}
                        />
                    </DataLoadingWrapper>
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
            const last = window.localStorage.getItem(LAST_ROUTE_STORAGE_KEY);
            window.location.hash = last && last.startsWith("#/") && !last.startsWith("#/home") ? last : "#/dashboard";
        }} users={appData.users} />;
    }
    if (route.startsWith("#/public-packages")) {
        return <PublicPackages userProfile={profile} showNotification={showNotification} setClients={setClients} setProjects={setProjects} setTransactions={setTransactions} setCards={setCards} setLeads={setLeads} addNotification={addNotification} cards={cards} projects={projects} promoCodes={promoCodes} setPromoCodes={setPromoCodes} />;
    }
    if (route.startsWith("#/public-booking")) {
        return (
            <PublicBookingForm 
                setClients={setClients}
                setProjects={setProjects}
                setTransactions={setTransactions}
                setCards={setCards}
                setPockets={setPockets}
                setPromoCodes={setPromoCodes}
                setLeads={setLeads}
                showNotification={showNotification}
                userProfile={profile}
                packages={packages}
                addOns={addOns}
                cards={cards}
                pockets={pockets}
                promoCodes={promoCodes}
                leads={leads}
                addNotification={addNotification}
            />
        );
    }
    if (route.startsWith("#/public-lead-form")) {
        return <PublicLeadForm setLeads={setLeads} userProfile={profile} showNotification={showNotification} addNotification={addNotification} />;
    }
    if (route.startsWith("#/feedback")) return <PublicFeedbackForm setClientFeedback={setClientFeedback} />;
    if (route.startsWith("#/suggestion-form")) return <SuggestionForm setLeads={setLeads} />;
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
        return <ClientPortal accessId={accessId} clients={clients} projects={projects} setClientFeedback={setClientFeedback} showNotification={showNotification} transactions={transactions} userProfile={profile} packages={packages} teamMembers={teamMembers} onClientSubStatusConfirmation={async (pid, sub, note) => {
            setProjects(prev => prev.map(p => p.id === pid ? { ...p, confirmedSubStatuses: [...(p.confirmedSubStatuses || []), sub], clientSubStatusNotes: { ...(p.clientSubStatusNotes || {}), [sub]: note } } : p));
            await markSubStatusConfirmed(pid, sub, note);
        }} />;
    }
    if (route.startsWith("#/freelancer-portal/")) {
        const raw = route.split("/freelancer-portal/")[1] || "";
        const accessId = decodeURIComponent((raw.split(/[?#]/)[0] || "").split("/")[0] || "").trim();
        return <FreelancerPortal accessId={accessId} teamMembers={teamMembers} projects={projects} teamProjectPayments={teamProjectPayments} teamPaymentRecords={teamPaymentRecords} showNotification={showNotification} userProfile={profile} addNotification={addNotification} />;
    }

    if (!isAuthenticated) return <Login onLoginSuccess={(u: any) => { setIsAuthenticated(true); setCurrentUser(u); }} users={appData.users} />;

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
