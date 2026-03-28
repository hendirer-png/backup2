import { 
    Project, 
    Client, 
    Package, 
    TeamMember, 
    TeamProjectPayment, 
    Transaction, 
    Profile, 
    Card, 
    FinancialPocket, 
    NavigationAction, 
    SubStatusConfig, 
    PrintingItem,
    ProjectStatusConfig,
    AssignedTeamMember,
    CustomCost,
    TransactionType,
    PaymentStatus,
    WeddingDayChecklist
} from '@/types';

export type { 
    Project, 
    Client, 
    Package, 
    TeamMember, 
    TeamProjectPayment, 
    Transaction, 
    Profile, 
    Card, 
    FinancialPocket, 
    NavigationAction, 
    SubStatusConfig, 
    PrintingItem,
    ProjectStatusConfig,
    AssignedTeamMember,
    CustomCost,
    WeddingDayChecklist
};

export { TransactionType, PaymentStatus };




export interface ProjectsProps {
    packages: Package[];
    teamMembers: TeamMember[];
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    profile: Profile;
    showNotification: (message: string) => void;
}


export type SharePreviewData = {
    title: string;
    message: string;
    phone?: string | null;
} | null;

export type StatModalItem = {
    id: string;
    primary: string;
    secondary: string;
    value: string;
};

export type StatModalData = {
    title: string;
    items: StatModalItem[];
    total: number | null;
};

export interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    formData: any; 
    onFormChange: (e: React.ChangeEvent<any>) => void;
    onSubStatusChange: (option: string, isChecked: boolean) => void;
    onClientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onTeamChange: (member: TeamMember) => void;
    onTeamFeeChange: (memberId: string, fee: number) => void;
    onTeamSubJobChange: (memberId: string, subJob: string) => void;
    onTeamClientPortalLinkChange: (memberId: string, link: string) => void;
    onCustomSubStatusChange: (index: number, field: 'name' | 'note', value: string) => void;
    onAddCustomSubStatus: () => void;
    onRemoveCustomSubStatus: (index: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    clients: Client[];
    teamMembers: TeamMember[];
    teamProjectPayments: TeamProjectPayment[];
    profile: Profile;
    teamByCategory: Record<string, Record<string, TeamMember[]>>;
    showNotification: (message: string) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export interface ProjectListViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
    config: ProjectStatusConfig[];
    clients: Client[];
    handleQuickStatusChange: (projectId: string, newStatus: string, notifyClient: boolean) => Promise<void>;
    handleSendMessage: (project: Project) => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
}

export interface ProjectKanbanViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    draggedProjectId: string | null;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, projectId: string) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, newStatus: string) => void;
    config: ProjectStatusConfig[];
}

export interface ProjectDetailModalProps {
    selectedProject: Project | null;
    setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
    teamMembers: TeamMember[];
    clients: Client[];
    profile: Profile;
    showNotification: (message: string) => void;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onClose: () => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
    handleOpenBriefingModal: () => void;
    packages: Package[];
    transactions: Transaction[];
    teamProjectPayments: TeamProjectPayment[];
    cards: Card[];
    onOpenSharePreview: (data: { title: string; message: string; phone?: string | null }) => void;
}

export interface ProjectHeaderProps {
    onOpenInfoModal: () => void;
    onAddProject: () => void;
}

export interface ProjectFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    dateFrom: string;
    setDateFrom: (value: string) => void;
    dateTo: string;
    setDateTo: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    viewMode: 'list' | 'kanban';
    setViewMode: (mode: 'list' | 'kanban') => void;
    projectStatusConfig: ProjectStatusConfig[];
}

export interface ProjectAnalyticsProps {
    totals: {
        projects: number;
        activeProjects: number;
        clients: number;
        activeClients: number;
        leads: number;
        discussionLeads: number;
        followUpLeads: number;
        teamMembers: number;
        transactions: number;
        revenue: number;
        expense: number;
    };
    onStatCardClick: (type: 'count' | 'deadline' | 'top_type' | 'status_dist') => void;
}


export interface QuickStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    statusConfig: ProjectStatusConfig[];
    onStatusChange: (projectId: string, newStatus: string, notifyClient: boolean) => Promise<void>;
    showNotification: (message: string) => void;
}

