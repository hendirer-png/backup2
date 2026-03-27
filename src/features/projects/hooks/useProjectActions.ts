import { useState, useCallback, useMemo } from 'react';

import { 
    Project, 
    TeamMember, 
    Client, 
    Package, 
    TeamProjectPayment, 
    Transaction, 
    TransactionType, 
    Profile, 
    Card, 
    FinancialPocket, 
    AssignedTeamMember,
    PrintingItem
} from '@/features/projects/types/project.types';
import { 
    createProjectWithRelations, 
    updateProject as updateProjectInDb, 
    deleteProject as deleteProjectInDb, 
    sanitizeProjectData 
} from '@/services/projects';
import { upsertAssignmentsForProject } from '@/services/projectTeamAssignments';
import { upsertTeamPaymentsForProject } from '@/services/teamProjectPayments';
import { 
    createTransaction, 
    updateCardBalance, 
    updateTransaction as updateTransactionRow, 
    deleteTransaction as deleteTransactionRow 
} from '@/services/transactions';
import { syncClientStatusFromProjects } from '@/services/clients';
import { getProgressForStatus, generateBriefingData } from '@/features/projects/utils/project.utils';


interface UseProjectActionsProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    clients: Client[];
    teamMembers: TeamMember[];
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    profile: Profile;
    showNotification: (message: string) => void;
}

export const useProjectActions = ({
    projects, setProjects, clients, teamMembers,
    teamProjectPayments, setTeamProjectPayments,
    transactions, setTransactions, cards, setCards,
    pockets, setPockets, profile, showNotification
}: UseProjectActionsProps) => {
    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState<any>(null);

    const initialFormState = useMemo(() => ({
        projectName: '',
        projectType: profile.projectTypes[0] || '',
        date: new Date().toISOString().split('T')[0],
        status: profile.projectStatusConfig?.[0]?.name || '',
        team: [] as AssignedTeamMember[],
        totalCost: 0,
        amountPaid: 0,
        paymentStatus: 'BELUM_BAYAR' as const,
        progress: 0,
        activeSubStatuses: [] as string[],
        customSubStatuses: profile.projectStatusConfig?.[0]?.subStatuses || [],
        printingDetails: [] as PrintingItem[],
        customCosts: [] as any[],
        shippingDetails: '',
        location: '',
        address: '',
        notes: '',
        driveLink: '',
        clientDriveLink: '',
        finalDriveLink: '',
        createdAt: new Date().toISOString(),
    }), [profile]);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
    const [briefingText, setBriefingText] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [googleCalendarLink, setGoogleCalendarLink] = useState('');
    const [icsDataUri, setIcsDataUri] = useState('');
    const [activeStatModal, setActiveStatModal] = useState<'count' | 'deadline' | 'top_type' | 'status_dist' | null>(null);
    const [quickStatusModalOpen, setQuickStatusModalOpen] = useState(false);
    const [selectedProjectForStatus, setSelectedProjectForStatus] = useState<Project | null>(null);
    const [chatModalData, setChatModalData] = useState<{ project: Project; client: Client } | null>(null);
    const [sharePreview, setSharePreview] = useState<{ title: string; message: string; phone?: string | null } | null>(null);
    
    // Drag and Drop State
    const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);

    // Form Handlers
    const handleOpenForm = useCallback((mode: 'add' | 'edit', project?: Project) => {
        setFormMode(mode);
        if (mode === 'edit' && project) {
            setFormData({ 
                ...project,
                date: (project.date || initialFormState.date).split('T')[0],
                deadlineDate: project.deadlineDate ? project.deadlineDate.split('T')[0] : '',
                startTime: project.startTime ? project.startTime.split(':').slice(0, 2).join(':') : '',
                endTime: project.endTime ? project.endTime.split(':').slice(0, 2).join(':') : '',
            });
        } else {
            setFormData({ ...initialFormState });
        }
        setIsFormModalOpen(true);
    }, [initialFormState]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
            return;
        }
        setFormData((prev: any) => {
            const newState = { ...prev, [name]: value };
            if (name === 'status') {
                newState.activeSubStatuses = [];
                const statusConfig = profile.projectStatusConfig.find(s => s.name === value);
                newState.customSubStatuses = statusConfig?.subStatuses || [];
                if (value !== 'Dikirim') newState.shippingDetails = '';
            }
            return newState;
        });
    };

    const handleSubStatusChange = (option: string, isChecked: boolean) => {
        setFormData((prev: any) => {
            const current = prev.activeSubStatuses || [];
            if (isChecked) return { ...prev, activeSubStatuses: [...current, option] };
            return { ...prev, activeSubStatuses: current.filter((s: string) => s !== option) };
        });
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setFormData((prev: any) => ({
                ...prev,
                clientId: client.id,
                clientName: client.name,
                projectName: prev.projectName || `Acara Pernikahan ${client.name}`
            }));
        }
    };

    const handleTeamChange = (member: TeamMember) => {
        setFormData((prev: any) => {
            const isSelected = prev.team.some((t: any) => t.memberId === member.id);
            if (isSelected) {
                return { ...prev, team: prev.team.filter((t: any) => t.memberId !== member.id) };
            } else {
                const newMember: AssignedTeamMember = {
                    memberId: member.id,
                    name: member.name,
                    role: member.role,
                    fee: member.standardFee,
                };
                return { ...prev, team: [...prev.team, newMember] };
            }
        });
    };

    const handleTeamFeeChange = (memberId: string, newFee: number) => {
        setFormData((prev: any) => ({
            ...prev,
            team: prev.team.map((t: any) => t.memberId === memberId ? { ...t, fee: newFee } : t)
        }));
    };

    const handleTeamSubJobChange = (memberId: string, subJob: string) => {
        setFormData((prev: any) => ({
            ...prev,
            team: prev.team.map((t: any) => t.memberId === memberId ? { ...t, subJob } : t)
        }));
    };

    const handleTeamClientPortalLinkChange = (memberId: string, link: string) => {
        setFormData((prev: any) => ({
            ...prev,
            team: prev.team.map((t: any) => t.memberId === memberId ? { ...t, clientPortalLink: link } : t)
        }));
    };

    const handleCustomSubStatusChange = (index: number, field: 'name' | 'note', value: string) => {
        setFormData((prev: any) => {
            const newCustom = [...(prev.customSubStatuses || [])];
            const oldName = newCustom[index]?.name;
            newCustom[index] = { ...newCustom[index], [field]: value };
            if (field === 'name' && oldName && (prev.activeSubStatuses || []).includes(oldName)) {
                const newActive = (prev.activeSubStatuses || []).map((name: string) => name === oldName ? value : name);
                return { ...prev, customSubStatuses: newCustom, activeSubStatuses: newActive };
            }
            return { ...prev, customSubStatuses: newCustom };
        });
    };

    const addCustomSubStatus = () => {
        setFormData((prev: any) => ({
            ...prev,
            customSubStatuses: [...(prev.customSubStatuses || []), { name: '', note: '' }]
        }));
    };

    const removeCustomSubStatus = (index: number) => {
        setFormData((prev: any) => {
            const custom = prev.customSubStatuses || [];
            const subToRemove = custom[index];
            const newCustom = custom.filter((_: any, i: number) => i !== index);
            let newActive = prev.activeSubStatuses || [];
            if (subToRemove) newActive = newActive.filter((name: string) => name !== subToRemove.name);
            return { ...prev, customSubStatuses: newCustom, activeSubStatuses: newActive };
        });
    };

    const teamByCategory = useMemo(() => {
        const categories: Record<string, Record<string, TeamMember[]>> = { 'Tim': {}, 'Vendor': {} };
        teamMembers.forEach(m => {
            const cat = m.category || 'Tim';
            if (!categories[cat]) categories[cat] = {};
            if (!categories[cat][m.role]) categories[cat][m.role] = [];
            categories[cat][m.role].push(m);
        });
        return categories;
    }, [teamMembers]);


    const handleCloseForm = useCallback(() => {
        setIsFormModalOpen(false);
        setFormData(null);
    }, []);

    const handleOpenDetailModal = useCallback((project: Project) => {
        setSelectedProject(project);
        setIsDetailModalOpen(true);
    }, []);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const projectData = sanitizeProjectData(formData);
        const originalProject = formMode === 'edit' ? projects.find(p => p.id === projectData.id) : null;
        const clientIdsToSync = new Set<string>();
        if (projectData.clientId) clientIdsToSync.add(projectData.clientId);
        if (originalProject?.clientId) clientIdsToSync.add(originalProject.clientId);

        try {
            if (formMode === 'add') {
                const created = await createProjectWithRelations(projectData);
                setProjects(prev => [created, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                showNotification('Berhasil menambah Acara Pernikahan');
            } else {
                await updateProjectInDb(projectData.id, projectData);
                // Also update assignments and payments (simplified for the hook)
                await upsertAssignmentsForProject(projectData.id, (projectData.team || []).map((t: any) => ({
                    memberId: t.memberId,
                    name: t.name,
                    role: t.role,
                    fee: t.fee,
                    subJob: t.subJob,
                })));
                
                setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
                showNotification('Berhasil memperbarui Acara Pernikahan');
            }

            // Sync client status
            if (clientIdsToSync.size > 0) {
                await Promise.all(Array.from(clientIdsToSync).map(id => syncClientStatusFromProjects(id)));
            }
            
            handleCloseForm();
        } catch (err) {
            console.error('Project action failed:', err);
            showNotification('Gagal menyimpan perubahan. Coba lagi.');
        }
    };

    const handleProjectDelete = async (projectId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus Acara Pernikahan ini? Semua data terkait akan dihapus.")) {
            try {
                await deleteProjectInDb(projectId);
                setProjects(prev => prev.filter(p => p.id !== projectId));
                setTeamProjectPayments(prev => prev.filter(fp => fp.projectId !== projectId));
                setTransactions(prev => prev.filter(t => t.projectId !== projectId));
                showNotification('Acara Pernikahan berhasil dihapus');
            } catch (err) {
                console.error('Delete failed:', err);
                showNotification('Gagal menghapus Acara Pernikahan');
            }
        }
    };

    const handleQuickStatusChange = async (projectId: string, newStatus: string, notifyClient: boolean) => {
        try {
            const project = projects.find(p => p.id === projectId);
            if (!project) return;
            const nextProgress = getProgressForStatus(newStatus, profile.projectStatusConfig);
            
            await updateProjectInDb(projectId, {
                status: newStatus as any,
                progress: nextProgress as any,
                activeSubStatuses: [] as any,
            } as any);

            const updated = { ...project, status: newStatus, progress: nextProgress, activeSubStatuses: [] } as Project;
            setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
            syncClientStatusFromProjects(project.clientId).catch(console.error);
            showNotification(`Status berhasil diubah ke "${newStatus}"`);
        } catch (error) {
            console.error('Status change failed:', error);
            showNotification('Gagal mengubah status');
        }
    };

    const handleOpenBriefingModal = useCallback((project: Project) => {
        const data = generateBriefingData(project, profile);
        setBriefingText(data.text);
        setWhatsappLink(data.whatsappLink);
        setGoogleCalendarLink(data.googleCalendarLink);
        setIcsDataUri(data.icsDataUri);
        setSelectedProject(project);
        setIsBriefingModalOpen(true);
    }, [profile]);

    const handlePayForPrintingItem = async (projectId: string, printingItemId: string, sourceCardId: string, sourcePocketId?: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const currentItems = (project.printingDetails || []) as PrintingItem[];
        const printingItem = currentItems.find(item => item.id === printingItemId);

        const isFromPocket = !!sourcePocketId;
        const sourcePocket = isFromPocket ? pockets.find(p => p.id === sourcePocketId) : null;
        const sourceCard = !isFromPocket ? cards.find(c => c.id === sourceCardId) : null;

        if (!printingItem || (!sourcePocket && !sourceCard)) {
            showNotification("Error: Data tidak lengkap.");
            return;
        }

        try {
            const created = await createTransaction({
                date: new Date().toISOString().split('T')[0],
                description: `Biaya Produksi Fisik: ${printingItem.customName || printingItem.type} - ${project.projectName}`,
                amount: printingItem.cost,
                type: TransactionType.EXPENSE,
                projectId: projectId,
                category: 'Produksi Fisik',
                method: 'Sistem',
                cardId: isFromPocket ? undefined : sourceCardId,
                pocketId: isFromPocket ? sourcePocketId : undefined,
                printingItemId: printingItemId,
            } as any);

            if (isFromPocket && sourcePocketId) {
                const { updatePocket } = await import('@/services/pockets');
                await updatePocket(sourcePocketId, { amount: sourcePocket!.amount - printingItem.cost });
                setPockets(prev => prev.map(p => p.id === sourcePocketId ? { ...p, amount: p.amount - printingItem.cost } : p));
            } else if (sourceCardId) {
                await updateCardBalance(sourceCardId, -printingItem.cost);
                setCards(prev => prev.map(c => c.id === sourceCardId ? { ...c, balance: c.balance - printingItem.cost } : c));
            }

            setTransactions(prev => [created, ...prev]);
            
            const updatedItems = currentItems.map(item => 
                item.id === printingItemId ? { ...item, paymentStatus: 'Paid' as const } : item
            );
            const updatedProject = await updateProjectInDb(projectId, { printingDetails: updatedItems });
            setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
            
            showNotification('Pembayaran berhasil diproses');
        } catch (err) {
            console.error('Payment failed:', err);
            showNotification('Gagal memproses pembayaran');
        }
    };

    
    const handleSendMessage = (project: Project) => {
        const client = clients.find(c => c.id === project.clientId);
        if (!client) return;
        setChatModalData({ project, client });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
        e.dataTransfer.setData("projectId", projectId);
        setDraggedProjectId(projectId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData("projectId");
        if (projectId) {
            handleQuickStatusChange(projectId, newStatus, false);
        }
        setDraggedProjectId(null);
    };

    return {

        isFormModalOpen, setIsFormModalOpen,
        formMode, setFormMode,
        formData, setFormData,
        isDetailModalOpen, setIsDetailModalOpen,
        selectedProject, setSelectedProject,
        isBriefingModalOpen, setIsBriefingModalOpen,
        briefingText, setBriefingText,
        whatsappLink, setWhatsappLink,
        googleCalendarLink, setGoogleCalendarLink,
        icsDataUri, setIcsDataUri,
        activeStatModal, setActiveStatModal,
        quickStatusModalOpen, setQuickStatusModalOpen,
        selectedProjectForStatus, setSelectedProjectForStatus,
        chatModalData, setChatModalData,
        sharePreview, setSharePreview,
        draggedProjectId, setDraggedProjectId,
        handleOpenForm, handleCloseForm, handleOpenDetailModal,
        handleOpenBriefingModal, handlePayForPrintingItem, handleQuickStatusChange,
        handleSendMessage, handleProjectDelete, handleFormSubmit,
        handleDragStart, handleDragOver, handleDrop,
        handleFormChange, handleSubStatusChange, handleClientChange,
        handleTeamChange, handleTeamFeeChange, handleTeamSubJobChange,
        handleTeamClientPortalLinkChange, handleCustomSubStatusChange,
        addCustomSubStatus, removeCustomSubStatus, teamByCategory
    };
};
