import React from 'react';
import Modal from '@/shared/ui/Modal';
import PageHeader from '@/layouts/PageHeader';
import { LightbulbIcon, PlusIcon } from '@/constants';
import { LeadsPageProps } from '@/features/leads/types';
import { useLeadsPage } from '@/features/leads/hooks/useLeadsPage';
import { LeadForm } from '@/features/leads/components/LeadForm';
import { ConvertLeadForm } from '@/features/leads/components/ConvertLeadForm';
import { LeadsAnalytics } from '@/features/leads/components/LeadsAnalytics';
import { LeadFilterBar } from '@/features/leads/components/LeadFilterBar';
import { LeadKanban } from '@/features/leads/components/LeadKanban';
import { ShareMessageModal } from '@/features/leads/components/ShareMessageModal';

import { useQueryClient } from '@tanstack/react-query';
import { useLeads } from '@/features/leads/api/useLeadsQueries';
import { useClients } from '@/features/clients/api/useClients';
import { useProjects } from '@/features/projects/api/useProjects';
import { useTransactions, useCards, usePockets } from '@/features/finance/api/useFinanceQueries';
import { Lead, Client, Project, Transaction, Card, FinancialPocket, LeadStatus, TransactionType, ViewType, NavigationAction } from '@/types';
import { usePackages, useAddOns } from '@/features/packages/api/usePackagesQueries';
import { usePromoCodes } from '@/features/promo/api/usePromoQueries';
import { useProfile } from '@/features/settings/api/useProfileQueries';
import { useUIStore } from '@/store/uiStore';
import { useApp } from "@/app/AppContext";


export const LeadsPage: React.FC<LeadsPageProps> = (props) => {
    const { 
        showNotification: contextShowNotification,
    } = useApp();
    const { setActiveView } = useUIStore();

    const showNotification = props.showNotification || contextShowNotification;
    const handleNavigation = props.handleNavigation || ((view: ViewType) => {
        setActiveView(view);
        const pathMap: any = {
            [ViewType.HOMEPAGE]: "home",
            [ViewType.DASHBOARD]: "dashboard",
        };
        const newPath = pathMap[view] || view.toLowerCase().replace(/ /g, "-");
        window.location.hash = `#/${newPath}`;
    });


    const queryClient = useQueryClient();
    const { data: leads = [] } = useLeads();
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

    const totals = React.useMemo(() => ({
        projects: projects.length,
        activeProjects: projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').length,
        clients: clients.length,
        activeClients: clients.length, // Placeholder logic
        leads: leads.length,
        discussionLeads: leads.filter(l => l.status === LeadStatus.DISCUSSION).length,
        followUpLeads: leads.filter(l => l.status === LeadStatus.FOLLOW_UP).length,
        teamMembers: 0, // Placeholder
        transactions: transactions.length,
        revenue: transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0),
        expense: transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0),
    }), [projects, clients, leads, transactions]);

    // Mock setters to trigger React Query invalidation for deep logic
    const setQueryAndInvalidate = (key: any[], updater: any) => {
        queryClient.setQueryData(key, (old: any) => {
            return typeof updater === 'function' ? updater(old) : updater;
        });
        queryClient.invalidateQueries({ queryKey: key });
    };

    const setLeads: React.Dispatch<React.SetStateAction<Lead[]>> = (u) => setQueryAndInvalidate(['leads', {}], u);
    const setClients: React.Dispatch<React.SetStateAction<Client[]>> = (u) => setQueryAndInvalidate(['clients', {}], u);
    const setProjects: React.Dispatch<React.SetStateAction<Project[]>> = (u) => setQueryAndInvalidate(['projects', {}], u);
    const setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>> = (u) => setQueryAndInvalidate(['transactions', {}], u);
    const setCards: React.Dispatch<React.SetStateAction<Card[]>> = (u) => setQueryAndInvalidate(['cards', {}], u);
    const setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>> = (u) => setQueryAndInvalidate(['pockets', {}], u);
    const setPromoCodes: React.Dispatch<React.SetStateAction<any[]>> = (u) => setQueryAndInvalidate(['promoCodes'], u);
    const setProfile: React.Dispatch<React.SetStateAction<any>> = (u) => setQueryAndInvalidate(['profile'], u);

    const {
        isModalOpen, modalMode, formData, setFormData,
        handleOpenModal, handleCloseModal, handleFormChange, handleSubmit,
        isShareModalOpen, setIsShareModalOpen,
        activeStatModal, setActiveStatModal,
        hiddenColumns, toggleHiddenColumns,
        searchTerm, setSearchTerm,
        sourceFilter, setSourceFilter,
        dateFrom, setDateFrom,
        dateTo, setDateTo,
        shareModalState, setShareModalState,
        publicLeadFormUrl, publicBookingFormUrl, publicPackagesUrl,
        visibleLeadColumns,
        handleStatCardClick,
        handleDragStart, handleDragOver, handleDrop,
        handleNextStatus, handleDeleteLead,
    } = useLeadsPage({ 
        ...props,
        leads, setLeads, clients, setClients, projects, setProjects,
        transactions, setTransactions, cards, setCards, pockets, setPockets,
        packages, addOns, promoCodes, setPromoCodes, userProfile, setProfile, totals
    });

    const isEmpty = leads.length === 0;

    return (
        <div className="space-y-6">
            {isEmpty ? (
                <div className="text-center py-20">
                    <LightbulbIcon className="mx-auto h-16 w-16 text-brand-accent" />
                    <h2 className="mt-4 text-2xl font-bold text-brand-text-light">Selamat Datang di Halaman Calon Pengantin!</h2>
                    <p className="mt-2 text-brand-text-secondary max-w-lg mx-auto">Halaman ini adalah tempat Anda mengelola semua calon pengantin (Calon Pengantin) sebelum mereka resmi menjadi Acara Pernikahan.</p>
                    <button onClick={() => handleOpenModal('add')} className="mt-8 button-primary inline-flex items-center gap-2"><PlusIcon className="w-5 h-5" />Tambah Calon Pengantin Pertama Anda</button>
                </div>
            ) : (
                <>
                    <PageHeader
                        title="Database Calon Pengantin"
                        subtitle="Kelola prospek calon pengantin, track interaksi awal, dan konversi mereka menjadi Client utama Anda."
                        icon={<LightbulbIcon className="w-6 h-6" />}
                    >
                        <button 
                            onClick={() => handleOpenModal('add')} 
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 transition-all text-xs sm:text-sm font-black shadow-lg shadow-blue-900/40"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Tambah Calon Pengantin</span>
                        </button>
                    </PageHeader>

                    <LeadsAnalytics leads={leads} totals={totals} onStatCardClick={handleStatCardClick} />

                    <LeadFilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        dateFrom={dateFrom}
                        onDateFromChange={setDateFrom}
                        dateTo={dateTo}
                        onDateToChange={setDateTo}
                        sourceFilter={sourceFilter}
                        onSourceFilterChange={setSourceFilter}
                        hiddenColumns={hiddenColumns}
                        onToggleHiddenColumns={toggleHiddenColumns}
                        onOpenShareModal={() => setIsShareModalOpen(true)}
                        onAddLead={() => handleOpenModal('add')}
                    />

                    <LeadKanban
                        visibleLeadColumns={visibleLeadColumns}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onEdit={(lead) => handleOpenModal('edit', lead)}
                        onDelete={handleDeleteLead}
                        onNextStatus={handleNextStatus}
                        onShare={(type, lead) => setShareModalState({ type, lead })}
                        hiddenColumns={hiddenColumns}
                        toggleHiddenColumns={toggleHiddenColumns}
                        isShareModalOpen={isShareModalOpen}
                        onOpenShareModal={() => setIsShareModalOpen(true)}
                        onAddLead={() => handleOpenModal('add')}
                        showNotification={showNotification}
                        setLeads={setLeads}
                    />
                </>
            )}

            {/* Lead Add/Edit/Convert Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === 'add' ? 'Tambah Calon Pengantin Baru' : modalMode === 'edit' ? 'Edit Calon Pengantin' : 'Konversi Calon Pengantin Menjadi Pengantin'}
                size={modalMode === 'convert' ? '4xl' : 'lg'}
            >
                {modalMode === 'convert' ? (
                    <ConvertLeadForm
                        formData={formData}
                        setFormData={setFormData}
                        handleFormChange={handleFormChange}
                        handleSubmit={handleSubmit}
                        handleCloseModal={handleCloseModal}
                        packages={packages}
                        addOns={addOns}
                        userProfile={userProfile}
                        cards={cards}
                        promoCodes={promoCodes}
                    />
                ) : (
                    <LeadForm
                        formData={formData}
                        handleFormChange={handleFormChange}
                        handleSubmit={handleSubmit}
                        handleCloseModal={handleCloseModal}
                        modalMode={modalMode}
                    />
                )}
            </Modal>

            {/* QR Share Modal */}
            <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Bagikan Formulir Calon Pengantin Publik" size="sm">
                <div className="text-center p-4">
                    <div id="lead-form-qrcode" className="p-4 bg-white rounded-lg inline-block mx-auto"></div>
                    <p className="text-xs text-brand-text-secondary mt-4 break-all">{publicLeadFormUrl}</p>
                    <div className="flex items-center gap-2 mt-6">
                        <button onClick={() => { navigator.clipboard.writeText(publicLeadFormUrl); showNotification('Tautan berhasil disalin!'); }} className="button-secondary w-full">Salin Tautan</button>
                        <a href={`https://wa.me/?text=Silakan%20isi%20formulir%20berikut%20untuk%20memulai%3A%20${encodeURIComponent(publicLeadFormUrl)}`} target="_blank" rel="noopener noreferrer" className="button-primary w-full">Bagikan ke WA</a>
                    </div>
                </div>
            </Modal>

            {/* WhatsApp Share Template Modal */}
            {shareModalState && (
                <ShareMessageModal
                    type={shareModalState.type}
                    lead={shareModalState.lead}
                    userProfile={userProfile}
                    publicBookingFormUrl={publicBookingFormUrl}
                    publicPackagesUrl={publicPackagesUrl}
                    onClose={() => setShareModalState(null)}
                    showNotification={showNotification}
                    setProfile={setProfile}
                />
            )}

            {/* Stat Detail Modal */}
            <Modal isOpen={!!activeStatModal} onClose={() => setActiveStatModal(null)} title="" size="2xl">
                <p className="text-center text-brand-text-secondary py-8">Tidak ada data untuk ditampilkan.</p>
            </Modal>
        </div>
    );
};
