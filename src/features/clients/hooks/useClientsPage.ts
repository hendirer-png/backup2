import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Client, Project, Transaction, Package, Card, PromoCode, PaymentStatus, TransactionType, ClientStatus, Profile } from '@/types';
import { createClient as createClientRow, updateClient as updateClientRow, deleteClient as deleteClientRow } from '@/services/clients';
import { createProject as createProjectRow, updateProject as updateProjectRow, deleteProject as deleteProjectRow } from '@/services/projects';
import { createTransaction as createTransactionRow, updateTransaction as updateTransactionRow, updateCardBalance } from '@/services/transactions';
import { findCardIdByMeta } from '@/services/cards';
import { ensureOnlineOrNotify } from '@/utils/network';
import { downloadCSV } from '@/features/clients/utils/clients.utils';
import { ExtendedClient } from '@/features/clients/types';
import { useClients } from '@/features/clients/api/useClients';
import { useProjects } from '@/features/projects/api/useProjects';
import { useTransactions, useCards, usePockets } from '@/features/finance/api/useFinanceQueries';
import { usePackages, useAddOns } from '@/features/packages/api/usePackagesQueries';
import { usePromoCodes } from '@/features/promo/api/usePromoQueries';
import { useProfile } from '@/features/settings/api/useProfileQueries';


export const initialFormState = {
    clientId: '',
    clientName: '',
    email: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    clientType: 'Perseorangan' as any,
    projectId: '',
    projectName: '',
    projectType: 'Wedding',
    location: '',
    date: new Date().toISOString().split('T')[0],
    packageId: '',
    selectedAddOnIds: [] as string[],
    durationSelection: '',
    unitPrice: undefined as number | undefined,
    address: '',
    dp: '',
    dpDestinationCardId: '',
    notes: '',
    accommodation: '',
    driveLink: '',
    promoCodeId: '',
};

export interface UseClientsPageProps {
    showNotification: (msg: string) => void;
}



export const useClientsPage = ({
    showNotification,
}: UseClientsPageProps) => {

    const queryClient = useQueryClient();

    // --- Data Fetching ---
    const { data: clients = [] } = useClients();
    const { data: projects = [] } = useProjects();
    const { data: transactions = [] } = useTransactions({});
    const { data: cards = [] } = useCards();
    const { data: pockets = [] } = usePockets();
    const { data: packages = [] } = usePackages();
    const { data: addOns = [] } = useAddOns();
    const { data: promoCodes = [] } = usePromoCodes();
    const { data: userProfileData } = useProfile();

    const userProfile = userProfileData || ({
        projectTypes: [],
        projectStatusConfig: [],
        eventTypes: [],
    } as any);

    // Mock setter for compatibility (zero-rewrite pattern)
    const setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>> = (u) => {
        queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
    };


    // --- UI & Modal States ---
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState(initialFormState);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedClientForDetail, setSelectedClientForDetail] = useState<ExtendedClient | null>(null);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [qrModalContent, setQrModalContent] = useState<{ title: string; url: string; clientName: string; clientPhone?: string } | null>(null);
    const [isBookingFormShareModalOpen, setIsBookingFormShareModalOpen] = useState(false);
    const [sharePortalContent, setSharePortalContent] = useState<{ client: Client; url: string } | null>(null);

    // --- Filters & Sort ---
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Semua Status');
    const [typeFilter, setTypeFilter] = useState<string>('Semua Tipe');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);



    // --- Computed Data ---
    const allClientData = useMemo(() => {
        return clients.map((client: Client) => {
            const clientProjects = projects.filter((p: Project) => p.clientId === client.id);
            const totalValue = clientProjects.reduce((sum: number, p: Project) => sum + (p.totalCost || 0), 0);
            const totalPaid = clientProjects.reduce((sum: number, p: Project) => sum + (p.amountPaid || 0), 0);
            const mostRecentProject = clientProjects.length > 0
                ? [...clientProjects].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                : null;

            return {
                ...client,
                projects: clientProjects,
                totalProjectValue: totalValue,
                balanceDue: totalValue - totalPaid,
                PackageTerbaru: mostRecentProject ? mostRecentProject.packageName : 'Belum ada Acara Pernikahan',
                overallPaymentStatus: mostRecentProject ? mostRecentProject.paymentStatus : null,
                mostRecentProject: mostRecentProject,
            };
        }) as ExtendedClient[];
    }, [clients, projects]);

    const filteredClientData = useMemo(() => {
        let result = allClientData.filter(client => {
            const searchMatch = !searchQuery || 
                [client.name, client.email, client.phone].some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()));
            const statusMatch = statusFilter === 'Semua Status' || client.overallPaymentStatus === statusFilter;
            const typeMatch = typeFilter === 'Semua Tipe' || client.clientType === typeFilter;
            
            // Date Filter (using client.since as the primary reference)
            const clientDate = new Date(client.since);
            const startMatch = !startDate || clientDate >= new Date(startDate);
            const endMatch = !endDate || clientDate <= new Date(endDate);
            
            if (activeTab === 'inactive') return searchMatch && statusMatch && typeMatch && startMatch && endMatch && client.status === ClientStatus.INACTIVE;
            if (activeTab === 'unpaid') return searchMatch && statusMatch && typeMatch && startMatch && endMatch && client.balanceDue > 0;
            
            return searchMatch && statusMatch && typeMatch && startMatch && endMatch;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = (a as any)[sortConfig.key];
                const bValue = (b as any)[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [allClientData, searchQuery, statusFilter, typeFilter, startDate, endDate, sortConfig, activeTab]);

    const stats = useMemo(() => {
        const locations = allClientData.flatMap(c => c.projects.map(p => p.location)).filter(Boolean);
        const locFreq: { [key: string]: number } = {};
        locations.forEach(l => locFreq[l] = (locFreq[l] || 0) + 1);
        const mostFreqLoc = Object.keys(locFreq).sort((a, b) => locFreq[b] - locFreq[a])[0] || '-';

        return {
            totalClients: allClientData.length,
            activeClients: allClientData.filter(c => c.status === ClientStatus.ACTIVE).length,
            totalReceivables: allClientData.reduce((sum: number, c: ExtendedClient) => sum + c.balanceDue, 0),
            mostFrequentLocation: mostFreqLoc
        };
    }, [allClientData]);

    // --- Handlers ---
    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ensureOnlineOrNotify(showNotification)) return;
        
        const selectedPackage = packages.find(p => p.id === formData.packageId);
        if (!selectedPackage) {
            alert('Harap pilih Package layanan.');
            return;
        }

        const selectedAddOns = addOns.filter(addon => formData.selectedAddOnIds.includes(addon.id));
        const packagePriceChosen = formData.unitPrice !== undefined && !isNaN(Number(formData.unitPrice)) ? Number(formData.unitPrice) : (selectedPackage.price || 0);
        const totalBeforeDiscount = packagePriceChosen + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
        
        let finalDiscountAmount = 0;
        const promoCode = promoCodes.find(p => p.id === formData.promoCodeId);
        if (promoCode) {
            finalDiscountAmount = promoCode.discountType === 'percentage' 
                ? (totalBeforeDiscount * promoCode.discountValue) / 100 
                : promoCode.discountValue;
        }
        const totalProject = totalBeforeDiscount - finalDiscountAmount;

        if (modalMode === 'add') {
            let clientId = selectedClient?.id;
            if (!selectedClient) {
                try {
                    const created = await createClientRow({
                        name: formData.clientName,
                        email: formData.email,
                        phone: formData.phone,
                        whatsapp: formData.whatsapp || formData.phone,
                        instagram: formData.instagram || undefined,
                        clientType: formData.clientType,
                        since: new Date().toISOString().split('T')[0],
                        status: ClientStatus.ACTIVE,
                        lastContact: new Date().toISOString(),
                        portalAccessId: crypto.randomUUID(),
                        address: formData.address || undefined,
                    } as Omit<Client, 'id'>);
                    clientId = created.id;
                    queryClient.invalidateQueries();
                } catch (err) {
                    showNotification('Gagal menyimpan pengantin ke database.');
                    return;
                }
            }

            const dpAmount = Number(formData.dp) || 0;
            const remainingPayment = totalProject - dpAmount;

            try {
                const createdProject = await createProjectRow({
                    projectName: formData.projectName,
                    clientName: formData.clientName,
                    clientId: clientId!,
                    projectType: formData.projectType,
                    packageName: selectedPackage.name,
                    date: formData.date,
                    location: formData.location,
                    status: 'Dikonfirmasi',
                    totalCost: totalProject,
                    amountPaid: dpAmount,
                    paymentStatus: dpAmount > 0 ? (remainingPayment <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR) : PaymentStatus.BELUM_BAYAR,
                    durationSelection: formData.durationSelection || undefined,
                    unitPrice: formData.unitPrice !== undefined ? Number(formData.unitPrice) : undefined,
                    notes: formData.notes || undefined,
                    accommodation: formData.accommodation || undefined,
                    driveLink: formData.driveLink || undefined,
                    promoCodeId: formData.promoCodeId || undefined,
                    discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : undefined,
                    address: formData.address || undefined,
                    addOns: selectedAddOns.map(a => ({ id: a.id, name: a.name, price: a.price })),
                } as any);
                queryClient.invalidateQueries();

                if (dpAmount > 0 && formData.dpDestinationCardId) {
                    const selectedCard = cards.find(c => c.id === formData.dpDestinationCardId);
                    const supaCardId = selectedCard ? await findCardIdByMeta(selectedCard.bankName, selectedCard.lastFourDigits) : null;
                    try {
                        const createdTx = await createTransactionRow({
                            date: new Date().toISOString().split('T')[0],
                            description: `DP Acara Pernikahan ${createdProject.projectName}`,
                            amount: dpAmount,
                            type: TransactionType.INCOME,
                            projectId: createdProject.id,
                            category: 'DP Acara Pernikahan',
                            method: 'Transfer Bank',
                            cardId: supaCardId || undefined,
                        } as any);
                        queryClient.invalidateQueries();
                    } catch (err) {
                        console.warn('DP Tx sync failed');
                    }
                }
            } catch (err) {
                showNotification('Gagal membuat Acara Pernikahan.');
                return;
            }

            if (promoCode) {
                setPromoCodes(prev => prev.map(p => p.id === promoCode.id ? { ...p, usageCount: p.usageCount + 1 } : p));
            }
            showNotification(`Pengantin ${formData.clientName} berhasil ditambahkan.`);
            handleCloseModal();
        } else {
            if (!selectedClient || !selectedProject) return;
            try {
                const updatedClient = await updateClientRow(selectedClient.id, {
                    name: formData.clientName, email: formData.email, phone: formData.phone,
                    whatsapp: formData.whatsapp || undefined, instagram: formData.instagram || undefined,
                    clientType: formData.clientType, address: formData.address || undefined,
                });
                queryClient.invalidateQueries();

                const updatedProject = await updateProjectRow(selectedProject.id, {
                    projectName: formData.projectName,
                    clientName: formData.clientName,
                    clientId: selectedClient.id,
                    projectType: formData.projectType,
                    packageName: selectedPackage.name,
                    date: formData.date,
                    location: formData.location,
                    totalCost: totalProject,
                    amountPaid: Number(formData.dp) || 0,
                    durationSelection: formData.durationSelection || undefined,
                    unitPrice: formData.unitPrice !== undefined ? Number(formData.unitPrice) : undefined,
                    notes: formData.notes || undefined,
                    accommodation: formData.accommodation || undefined,
                    driveLink: formData.driveLink || undefined,
                    promoCodeId: formData.promoCodeId || undefined,
                    discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : undefined,
                    address: formData.address || undefined,
                    addOns: selectedAddOns.map(a => ({ id: a.id, name: a.name, price: a.price })),
                } as any);
                queryClient.invalidateQueries();
                
                showNotification(`Data berhasil diperbarui.`);
                handleCloseModal();
            } catch (err) {
                showNotification('Gagal memperbarui data.');
            }
        }
    };

    const handleOpenModal = (mode: 'add' | 'edit', client?: Client, project?: Project) => {
        setModalMode(mode);
        if (mode === 'edit' && client && project) {
            setSelectedClient(client);
            setSelectedProject(project);
            setFormData({
                ...initialFormState,
                clientId: client.id,
                clientName: client.name,
                email: client.email,
                phone: client.phone,
                whatsapp: client.whatsapp || '',
                instagram: client.instagram || '',
                clientType: client.clientType,
                projectId: project.id,
                projectName: project.projectName,
                projectType: project.projectType,
                location: project.location,
                date: project.date,
                packageId: packages.find(p => p.name === project.packageName)?.id || '',
                selectedAddOnIds: project.addOns ? project.addOns.map(a => a.id) : [],
                durationSelection: (project as any).durationSelection || '',
                unitPrice: (project as any).unitPrice,
                address: project.address || client.address || '',
                dp: String(project.amountPaid || ''),
                notes: project.notes || '',
                accommodation: project.accommodation || '',
                driveLink: project.driveLink || '',
                promoCodeId: project.promoCodeId || '',
            });
        } else if (mode === 'add' && client) {
            setSelectedClient(client);
            setFormData({ ...initialFormState, clientName: client.name, email: client.email, phone: client.phone, whatsapp: client.whatsapp || '', instagram: client.instagram || '', clientType: client.clientType, address: client.address || '' });
        } else {
            setSelectedClient(null);
            setSelectedProject(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
    };

    const handleViewDetail = (client: ExtendedClient) => {
        setSelectedClientForDetail(client);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailModalOpen(false);
        setSelectedClientForDetail(null);
    };

    const handleOpenBilling = () => setIsBillingModalOpen(true);
    const handleCloseBilling = () => setIsBillingModalOpen(false);

    const handleCloseQrModal = () => setQrModalContent(null);
    const handleDownloadQr = (id: string) => {
        const svg = document.getElementById(id);
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `${id}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
    };
    const handleShareWhatsApp = (phone: string, url: string) => {
        const msg = encodeURIComponent(`Halo, berikut adalah link portal pengantin Anda: ${url}`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    };

    const handleOpenBookingModal = () => setIsBookingFormShareModalOpen(true);
    const handleCloseBookingModal = () => setIsBookingFormShareModalOpen(false);
    const bookingFormUrl = `${window.location.origin}/#/public-booking/${userProfile.id}`;
    const handleCopyBookingLink = () => {
        navigator.clipboard.writeText(bookingFormUrl);
        showNotification('Link booking berhasil disalin.');
    };

    const handleDeleteClient = async (clientId: string) => {
        if (!window.confirm('Hapus pengantin?')) return;
        try {
            await deleteClientRow(clientId);
            queryClient.invalidateQueries();
            showNotification('Pengantin berhasil dihapus.');
        } catch (err) {
            showNotification('Gagal menghapus pengantin.');
        }
    };

    const handleSharePortal = (client: Client) => {
        const url = `${window.location.origin}/#/portal/${client.portalAccessId}`;
        setSharePortalContent({ client, url });
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!window.confirm('Hapus proyek ini?')) return;
        try {
            const success = await deleteProjectRow(projectId);
            if (success) {
                queryClient.invalidateQueries();
                showNotification('Proyek berhasil dihapus.');
            } else {
                showNotification('Gagal menghapus proyek.');
            }
        } catch (err) {
            showNotification('Gagal menghapus proyek.');
        }
    };

    const handleDownloadClients = () => {
        const headers = ['Nama', 'Email', 'Telepon', 'Tipe', 'Status Pembayaran', 'Total Nilai Proyek', 'Sisa Tagihan'];
        const data = allClientData.map(c => [
            c.name,
            c.email,
            c.phone,
            c.clientType,
            c.overallPaymentStatus || '-',
            c.totalProjectValue,
            c.balanceDue
        ]);
        downloadCSV(headers, data, 'daftar_klien.csv');
    };

    return {
        activeTab, setActiveTab,
        searchQuery, setSearchQuery,
        statusFilter, setStatusFilter,
        typeFilter, setTypeFilter,
        startDate, setStartDate,
        endDate, setEndDate,
        sortConfig, setSortConfig,
        filteredClientData,
        stats,
        isModalOpen, modalMode, formData, setFormData,
        handleOpenModal, handleCloseModal, handleFormChange, handleFormSubmit,
        handleDeleteClient,
        handleSharePortal,
        handleDeleteProject,
        handleDownloadClients,
        isDetailModalOpen, selectedClientForDetail, handleViewDetail, handleCloseDetail,
        isBillingModalOpen, handleOpenBilling, handleCloseBilling,
        qrModalContent, handleCloseQrModal, handleDownloadQr, handleShareWhatsApp,
        isBookingFormShareModalOpen, handleOpenBookingModal, handleCloseBookingModal,
        bookingFormUrl, handleCopyBookingLink,
        sharePortalContent, setSharePortalContent
    };
};
