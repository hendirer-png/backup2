import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  User,
  Client,
  Project,
  TeamMember,
  Transaction,
  FinancialPocket,
  Profile,
  Lead,
  Card,
  ClientFeedback,
  Notification,
  PromoCode,
  Package,
  AddOn,
  TeamProjectPayment,
  TeamPaymentRecord,
  NavigationAction,
  CardType,
  Contract,
  ViewType,
} from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { useAppData } from "@/hooks/useAppData";
import { createNotification as createNotificationRow } from "@/services/notifications";
import { listTeamPaymentRecords as listTeamPaymentRecordsFromDb, createTeamPaymentRecord } from "@/services/teamPaymentRecords";
import { listPockets as listPocketsFromDb } from "@/services/pockets";
import { listPackages } from "@/services/packages";
import { listAddOns } from "@/services/addOns";
import { listLeads as listLeadsFromDb } from "@/services/leads";
import { getProfile as getProfileFromDb } from "@/services/profile";
import { listAllTeamPayments } from "@/services/teamProjectPayments";
import { listProjectsWithRelations } from "@/services/projects";

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  setIsAuthenticated: (val: boolean) => void;
  setCurrentUser: (user: User | null) => void;

  // Data
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  teamProjectPayments: TeamProjectPayment[];
  setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
  teamPaymentRecords: TeamPaymentRecord[];
  setTeamPaymentRecords: React.Dispatch<React.SetStateAction<TeamPaymentRecord[]>>;
  pockets: FinancialPocket[];
  setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  profile: Profile;
  setProfile: (value: React.SetStateAction<Profile>) => void;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  clientFeedback: ClientFeedback[];
  setClientFeedback: React.Dispatch<React.SetStateAction<ClientFeedback[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  promoCodes: PromoCode[];
  setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  addOns: AddOn[];
  setAddOns: React.Dispatch<React.SetStateAction<AddOn[]>>;
  appData: any; // From useAppData hook

  // UI State
  activeView: ViewType;
  setActiveView: React.Dispatch<React.SetStateAction<ViewType>>;
  notification: string;
  showNotification: (message: string, duration?: number) => void;
  addNotification: (newNotificationData: Omit<Notification, "id" | "timestamp" | "isRead">) => Promise<void>;
  initialAction: NavigationAction | null;
  setInitialAction: React.Dispatch<React.SetStateAction<NavigationAction | null>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Handlers
  handleMarkAsRead: (notificationId: string) => void;
  handleMarkAllAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProviders");
  return context;
};

const LAST_ROUTE_STORAGE_KEY = "vena-lastRoute";

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

  // UI State
  const [activeView, setActiveView] = useState<ViewType>(ViewType.HOMEPAGE);
  const [notification, setNotification] = useState<string>("");
  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [teamProjectPayments, setTeamProjectPayments] = useState<TeamProjectPayment[]>([]);
  const [teamPaymentsLoaded, setTeamPaymentsLoaded] = useState(false);
  const [teamPaymentRecords, setTeamPaymentRecords] = useState<TeamPaymentRecord[]>([]);
  const [pockets, setPockets] = useState<FinancialPocket[]>([]);
  const [profile, setProfile] = useState<Profile>({
    projectTypes: [],
    projectStatusConfig: [],
    eventTypes: [],
  } as unknown as Profile);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [clientFeedback, setClientFeedback] = useState<ClientFeedback[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);

  const appData = useAppData();

  // Helper: map DB row to Card interface
  const mapCardRowToCard = useCallback((row: any): Card => ({
    id: row.id,
    cardHolderName: row.card_holder_name,
    bankName: row.bank_name,
    cardType: row.card_type as CardType,
    lastFourDigits: row.last_four_digits ?? "",
    expiryDate: row.expiry_date ?? undefined,
    balance: Number(row.balance || 0),
    colorGradient: row.color_gradient || "from-slate-200 to-slate-400",
  }), []);

  // Notifications
  const showNotification = useCallback((message: string, duration: number = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(""), duration);
  }, []);

  const addNotification = useCallback(async (newNotificationData: Omit<Notification, "id" | "timestamp" | "isRead">) => {
    const payload: Omit<Notification, "id"> = {
      ...newNotificationData,
      timestamp: new Date().toISOString(),
      isRead: false,
    } as any;
    try {
      const created = await createNotificationRow(payload);
      setNotifications((prev) => [created, ...prev]);
    } catch (e) {
      console.warn("[Notifications] Failed to create notification in Supabase:", e);
      const fallback: Notification = { id: crypto.randomUUID(), ...payload } as Notification;
      setNotifications((prev) => [fallback, ...prev]);
    }
  }, []);

  const handleMarkAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  // Theme & URL Redirects
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      window.localStorage.setItem("theme", "light");
    } catch (error) {
      console.warn("[Theme] Failed to set theme in localStorage:", error);
    }
  }, []);

  // Realtime Subscriptions & Initial Loads (copied from App.tsx)

  // Sync users
  useEffect(() => {
    if (appData.loaded.users) setUsers(appData.users);
  }, [appData.loaded.users, appData.users]);

  useEffect(() => {
    appData.loadUsers();
  }, [appData.loadUsers]);

  // Sync clients + Realtime
  useEffect(() => {
    if (appData.loaded.clients) setClients(appData.clients);
    const channel = supabase.channel("realtime-clients").on("postgres_changes", { event: "*", schema: "public", table: "clients" }, (payload) => {
      if (payload.eventType === "INSERT") setClients((prev) => [payload.new as Client, ...prev]);
      if (payload.eventType === "UPDATE") setClients((prev) => prev.map((c) => c.id === payload.new.id ? ({ ...c, ...payload.new } as Client) : c));
      if (payload.eventType === "DELETE") setClients((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [appData.clients, appData.loaded.clients]);

  // Sync contracts + Realtime (optional, can just sync)
  useEffect(() => {
    if (appData.loaded.contracts) setContracts(appData.contracts);
    const channel = supabase.channel("realtime-contracts").on("postgres_changes", { event: "*", schema: "public", table: "contracts" }, (payload) => {
      if (payload.eventType === "INSERT") setContracts((prev) => [payload.new as Contract, ...prev]);
      if (payload.eventType === "UPDATE") setContracts((prev) => prev.map((c) => c.id === payload.new.id ? ({ ...c, ...payload.new } as Contract) : c));
      if (payload.eventType === "DELETE") setContracts((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [appData.contracts, appData.loaded.contracts]);

  // Sync team members + Realtime
  useEffect(() => {
    if (appData.loaded.teamMembers) setTeamMembers(appData.teamMembers);
    const channel = supabase.channel("realtime-team-members").on("postgres_changes", { event: "*", schema: "public", table: "team_members" }, (payload) => {
      if (payload.eventType === "INSERT") setTeamMembers((prev) => [payload.new as TeamMember, ...prev]);
      if (payload.eventType === "UPDATE") setTeamMembers((prev) => prev.map((m) => m.id === payload.new.id ? ({ ...m, ...payload.new } as TeamMember) : m));
      if (payload.eventType === "DELETE") setTeamMembers((prev) => prev.filter((m) => m.id !== (payload.old as any).id));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [appData.teamMembers, appData.loaded.teamMembers]);

  // Leads
  useEffect(() => { if (appData.loaded.leads) setLeads(appData.leads); }, [appData.leads, appData.loaded.leads]);

  // Client Feedback
  useEffect(() => { if (appData.loaded.clientFeedback) setClientFeedback(appData.clientFeedback); }, [appData.clientFeedback, appData.loaded.clientFeedback]);

  // Transactions + Realtime
  useEffect(() => {
    if (appData.loaded.transactions) setTransactions(appData.transactions);
    const channel = supabase.channel("realtime-transactions").on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, (payload) => {
      if (payload.eventType === "INSERT") setTransactions((prev) => [payload.new as Transaction, ...prev]);
      if (payload.eventType === "UPDATE") setTransactions((prev) => prev.map((t) => t.id === payload.new.id ? ({ ...t, ...payload.new } as Transaction) : t));
      if (payload.eventType === "DELETE") setTransactions((prev) => prev.filter((t) => t.id !== (payload.old as any).id));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [appData.transactions, appData.loaded.transactions]);

  // Projects + Realtime
  useEffect(() => {
    if (appData.loaded.projects) setProjects(appData.projects as any);
    const channel = supabase.channel("realtime-projects-init").on("postgres_changes", { event: "*", schema: "public", table: "projects" }, (payload) => {
      if (payload.eventType === "INSERT") setProjects((prev) => [payload.new as Project, ...prev]);
      if (payload.eventType === "UPDATE") setProjects((prev) => prev.map((p) => p.id === payload.new.id ? ({ ...p, ...payload.new } as Project) : p));
      if (payload.eventType === "DELETE") setProjects((prev) => prev.filter((p) => p.id !== (payload.old as any).id));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [appData.projects, appData.loaded.projects]);

  // Initial Fetch for various entities
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      // Projects with relations
      try {
        const remoteProjects = await listProjectsWithRelations({ limit: 100 });
        if (isMounted) setProjects(Array.isArray(remoteProjects) ? (remoteProjects as any) : []);
      } catch (e) { console.warn("[Supabase] Failed to fetch initial projects.", e); }

      // Cards
      try {
        const { listCards: listCardsFromService } = await import("@/services/cards");
        const remoteCards = await listCardsFromService();
        if (isMounted) setCards(Array.isArray(remoteCards) ? (remoteCards as any[]).map(mapCardRowToCard) : []);
      } catch (e) { console.warn("[Supabase] Failed to fetch initial cards.", e); }

      // Team Payment Records
      try {
        const remote = await listTeamPaymentRecordsFromDb();
        if (isMounted) setTeamPaymentRecords(Array.isArray(remote) ? remote : []);
      } catch (e) { console.warn("[Supabase] Failed to fetch team payment records.", e); }

      // Pockets
      try {
        const remote = await listPocketsFromDb();
        if (isMounted) setPockets(Array.isArray(remote) ? (remote as any) : []);
      } catch (e) { console.warn("[Supabase] Failed to fetch pockets.", e); }

      // Packages
      try {
        const remote = await listPackages();
        if (isMounted && Array.isArray(remote) && remote.length) setPackages(remote as any);
      } catch (e) { console.warn("[Supabase] Failed to fetch packages.", e); }

      // Add-ons
      try {
        const remote = await listAddOns();
        if (isMounted && Array.isArray(remote) && remote.length) setAddOns(remote as any);
      } catch (e) { console.warn("[Supabase] Failed to fetch add-ons.", e); }

      // Profile
      try {
        const remote = await getProfileFromDb();
        if (isMounted && remote) setProfile(remote);
      } catch (e) { console.warn("[Supabase] Failed to fetch profile, using defaults.", e); }

      // Team Project Payments
      try {
        const remote = await listAllTeamPayments();
        if (isMounted) setTeamProjectPayments(Array.isArray(remote) ? remote : []);
      } catch (e) { console.warn("[Supabase] Failed to fetch team project payments.", e); }

      // Leads
      try {
        const remoteLeads = await listLeadsFromDb();
        if (isMounted) setLeads(Array.isArray(remoteLeads) ? remoteLeads : []);
      } catch (e) { console.warn("[Supabase] Failed to fetch leads.", e); }
    };

    fetchInitialData();
    return () => { isMounted = false; };
  }, [mapCardRowToCard]);

  // Realtime for Cards, Pockets, Leads
  useEffect(() => {
    const cardChannel = supabase.channel("realtime-cards").on("postgres_changes", { event: "*", schema: "public", table: "cards" }, (payload) => {
      const next = mapCardRowToCard(payload.new);
      if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
        setCards((current) => current.some(c => c.id === next.id) ? current.map(c => c.id === next.id ? next : c) : [next, ...current]);
      } else if (payload.eventType === "DELETE") {
        setCards((current) => current.filter(c => c.id !== (payload.old as any).id));
      }
    }).subscribe();

    const pocketChannel = supabase.channel("realtime-pockets").on("postgres_changes", { event: "*", schema: "public", table: "pockets" }, (payload) => {
      if (payload.eventType === "INSERT") setPockets(curr => [payload.new as any, ...curr]);
      if (payload.eventType === "UPDATE") setPockets(curr => curr.map(p => p.id === (payload.new as any).id ? ({ ...p, ...payload.new } as any) : p));
      if (payload.eventType === "DELETE") setPockets(curr => curr.filter(p => p.id !== (payload.old as any).id));
    }).subscribe();

    const leadChannel = supabase.channel("realtime-leads").on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
      if (payload.eventType === "INSERT") setLeads(curr => [payload.new as Lead, ...curr]);
      if (payload.eventType === "UPDATE") setLeads(curr => curr.map(l => l.id === payload.new.id ? ({ ...l, ...payload.new } as Lead) : l));
      if (payload.eventType === "DELETE") setLeads(curr => curr.filter(l => l.id !== (payload.old as any).id));
    }).subscribe();

    return () => {
      supabase.removeChannel(cardChannel);
      supabase.removeChannel(pocketChannel);
      supabase.removeChannel(leadChannel);
    };
  }, [mapCardRowToCard]);

  // Pre-load critical data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    appData.loadClients();
    appData.loadProjects();
    appData.loadContracts();
    appData.loadTransactions();
    appData.loadTeamMembers();
    appData.loadLeads();
    appData.loadClientFeedback();
    appData.loadTotals();
  }, [isAuthenticated, appData]);

  const value = useMemo(() => ({
    isAuthenticated, setIsAuthenticated,
    currentUser, setCurrentUser,
    activeView, setActiveView,
    notification, showNotification, addNotification,
    initialAction, setInitialAction,
    isSidebarOpen, setIsSidebarOpen,
    isSearchOpen, setIsSearchOpen,
    users, setUsers,
    clients, setClients,
    contracts, setContracts,
    projects, setProjects,
    teamMembers, setTeamMembers,
    transactions, setTransactions,
    teamProjectPayments, setTeamProjectPayments,
    teamPaymentRecords, setTeamPaymentRecords,
    pockets, setPockets,
    profile, setProfile,
    leads, setLeads,
    cards, setCards,
    clientFeedback, setClientFeedback,
    notifications, setNotifications,
    promoCodes, setPromoCodes,
    packages, setPackages,
    addOns, setAddOns,
    appData,
    handleMarkAsRead,
    handleMarkAllAsRead
  }), [
    isAuthenticated, currentUser, activeView, notification, showNotification, addNotification,
    initialAction, isSidebarOpen, isSearchOpen, users, clients, contracts, projects, teamMembers,
    transactions, teamProjectPayments, teamPaymentRecords, pockets, profile, leads, cards,
    clientFeedback, notifications, promoCodes, packages, addOns, appData, handleMarkAsRead, handleMarkAllAsRead
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
