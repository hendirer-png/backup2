import React from 'react';
// Types
import {
    Client, Project, Transaction, Package, Card, PromoCode, FinancialPocket,
    ViewType, NavigationAction, Profile, ClientFeedback, Contract
} from '@/types';
import { ExtendedClient } from '@/features/clients/types';

// React Query Hooks
import { useQueryClient } from '@tanstack/react-query';
import { useClients } from '@/features/clients/api/useClients';
import { useProjects } from '@/features/projects/api/useProjects';
import { useTransactions, useCards, usePockets } from '@/features/finance/api/useFinanceQueries';
import { usePackages, useAddOns } from '@/features/packages/api/usePackagesQueries';
import { usePromoCodes } from '@/features/promo/api/usePromoQueries';
import { useProfile } from '@/features/settings/api/useProfileQueries';

// Hooks
import { useClientsPage } from '@/features/clients/hooks/useClientsPage';

// Components (Named & Default Imports)
import { ClientStatsCards } from '@/features/clients/components/ClientStatsCards';
import { ClientFilterBar } from '@/features/clients/components/ClientFilterBar';
import { ClientHeader } from '@/features/clients/components/ClientHeader';
import { ClientActiveList } from '@/features/clients/components/ClientActiveList';
import { ClientInactiveList } from '@/features/clients/components/ClientInactiveList';
import { ClientUnpaidList } from '@/features/clients/components/ClientUnpaidList';
import { ClientForm } from '@/features/clients/components/ClientForm';
import ClientDetailModal from '@/features/clients/components/ClientDetailModal';
import BillingChatModal from '@/features/clients/components/BillingChatModal';
import { NewClientsChart } from '@/features/clients/components/NewClientsChart';
import { ClientPortalQrModal, BookingFormShareModal } from '@/features/clients/components/ClientLinkModals';
import { InvoicePreviewModal } from '@/features/clients/components/InvoicePreviewModal';
import { ReceiptPreviewModal } from '@/features/clients/components/ReceiptPreviewModal';
import ProjectsPageFeature from '@/features/projects/ProjectsPage';
import ProjectListView from '@/features/projects/components/ProjectListView';
import { useProjectActions } from '@/features/projects/hooks/useProjectActions';
import ProjectForm from '@/features/projects/components/ProjectForm';
import ProjectDetailModal from '@/features/projects/components/ProjectDetailModal';
import QuickStatusModal from '@/features/projects/components/QuickStatusModal';
import BriefingModal from '@/features/projects/components/BriefingModal';
import ChatModal from '@/features/communication/components/ChatModal';
import ShareMessageModal from '@/features/communication/components/ShareMessageModal';
import Contracts from '@/pages/contracts/ContractsPage';

export interface ClientsProps {
    showNotification: (message: string) => void;
    handleNavigation: (view: ViewType, action?: NavigationAction) => void;
}



// Service & Mutation Imports for local handlers
import { useQuery, useMutation } from '@tanstack/react-query';
import { listContracts, updateContract as updateContractInDb } from '@/services/contracts';
import { updateProject as updateProjectInDb } from '@/services/projects';
import { createTransaction, updateCardBalance, updateTransaction as updateTransactionInDb } from '@/services/transactions';
import { useTeamMembers, useTeamProjectPayments } from '@/features/team/api/useTeamQueries';
import { TransactionType, PaymentStatus } from '@/types';

export const ClientsPage: React.FC<ClientsProps> = (props) => {

    const {
        showNotification,
        handleNavigation,
    } = props;


    // Fetch decoupled data locally
    const { data: packages = [] } = usePackages();
    const { data: addOns = [] } = useAddOns();
    const { data: promoCodes = [] } = usePromoCodes();
    const { data: userProfileData } = useProfile();

    const userProfile = userProfileData || ({
        projectTypes: [],
        projectStatusConfig: [],
        eventTypes: [],
    } as any);


    // Fetch decoupled data locally
    const { data: clientsData } = useClients({ limit: 500 });
    const { data: projectsData } = useProjects({ limit: 500 });
    const { data: transactionsData } = useTransactions({ limit: 500 });
    const { data: cardsData } = useCards();
    const { data: pocketsData } = usePockets();

    // Mission Decoupling: Localized data for previously drilled props
    const { data: teamMembers = [] } = useTeamMembers();
    const { data: teamProjectPayments = [] } = useTeamProjectPayments();
    const { data: contractsData } = useQuery({ 
        queryKey: ['contracts'], 
        queryFn: listContracts,
        staleTime: 5 * 60 * 1000
    });
    const contracts = contractsData || [];

    const setContracts = (updater: React.SetStateAction<Contract[]>) => {
        const current = queryClient.getQueryData<Contract[]>(['contracts']) || [];
        const next = typeof updater === 'function' ? (updater as any)(current) : updater;
        queryClient.setQueryData(['contracts'], next);
    };

    const setTeamProjectPayments = (updater: React.SetStateAction<any[]>) => {
        const current = queryClient.getQueryData<any[]>(['teamProjectPayments']) || [];
        const next = typeof updater === 'function' ? (updater as any)(current) : updater;
        queryClient.setQueryData(['teamProjectPayments'], next);
    };

    const queryClient = useQueryClient();

    // Local Handlers (previously in AppRoutes)
    const onSignInvoice = async (pId: string, sig: string) => {
        try {
            await updateProjectInDb(pId, { invoiceSignature: sig } as any);
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            showNotification("Tanda tangan invoice berhasil disimpan.");
        } catch (e) { showNotification("Gagal menyimpan tanda tangan invoice."); }
    };

    const onSignTransaction = async (tId: string, sig: string) => {
        try {
            await updateTransactionInDb(tId, { vendorSignature: sig } as any);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            showNotification("Tanda tangan kuitansi berhasil disimpan.");
        } catch (e) { showNotification("Gagal menyimpan tanda tangan kuitansi."); }
    };

    const onRecordPayment = async (projectId: string, amount: number, destinationCardId: string) => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const proj = (projectsData || []).find(p => p.id === projectId);
            if (!proj) return;
            await createTransaction({
                date: today, description: `Pembayaran Acara Pernikahan ${proj.projectName}`,
                amount, type: TransactionType.INCOME, projectId, category: "Pelunasan Acara Pernikahan",
                method: "Transfer Bank", cardId: destinationCardId,
            } as any);
            if (destinationCardId) await updateCardBalance(destinationCardId, amount);
            const newAmountPaid = (proj.amountPaid || 0) + amount;
            const newStatus = newAmountPaid >= proj.totalCost ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR;
            await updateProjectInDb(projectId, { amountPaid: newAmountPaid, paymentStatus: newStatus } as any);
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            showNotification("Pembayaran berhasil dicatat.");
        } catch (e) { showNotification("Gagal mencatat pembayaran."); }
    };

    const onSignContract = async (contractId: string, sig: string, signer: 'vendor' | 'client') => {
        try {
            const field = signer === 'vendor' ? 'vendorSignature' : 'clientSignature';
            await updateContractInDb(contractId, { [field]: sig } as any);
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            showNotification("Tanda tangan kontrak berhasil disimpan.");
        } catch (e) { showNotification("Gagal menyimpan tanda tangan kontrak."); }
    };

    const clients = clientsData || [];
    const projects = projectsData || [];
    const transactions = transactionsData || [];
    const cards = cardsData || [];
    const pockets = pocketsData || [];

    const [mainTab, setMainTab] = React.useState<'database' | 'progress' | 'contracts'>(() => {
        const hash = window.location.hash;
        if (hash.includes('progress') || hash.includes('projects')) return 'progress';
        if (hash.includes('contracts') || hash.includes('kontrak')) return 'contracts';
        return 'database';
    });

    const {
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
        bookingFormUrl, handleCopyBookingLink
    } = useClientsPage({
        showNotification,
    });


    const projectActions = useProjectActions({
        projects, clients, teamMembers,
        teamProjectPayments, setTeamProjectPayments,
        transactions, cards, 
        pockets, profile: userProfile, showNotification

    });

    const handleManageProjects = (client: ExtendedClient) => {
        setMainTab('progress');
        window.location.hash = '#/progress';
        if (client.mostRecentProject) {
            projectActions.handleOpenDetailModal(client.mostRecentProject);
        }
    };

    const clientStats = {
        totalClients: stats.totalClients,
        activeClients: stats.activeClients,
        totalReceivables: stats.totalReceivables.toLocaleString(),
        mostFrequentLocation: stats.mostFrequentLocation
    };

    const [selectedInvoiceProject, setSelectedInvoiceProject] = React.useState<Project | null>(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
    const [selectedReceiptTransaction, setSelectedReceiptTransaction] = React.useState<Transaction | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);

    const handleViewInvoiceModal = (project: Project) => {
        setSelectedInvoiceProject(project);
        setIsInvoiceModalOpen(true);
    };

    const handleViewReceiptModal = (transaction: Transaction) => {
        setSelectedReceiptTransaction(transaction);
        setIsReceiptModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-20 sm:pb-8">
            <div className="flex p-1 bg-brand-surface/60 backdrop-blur-md rounded-2xl border border-brand-border/40 w-fit">
                <button
                    onClick={() => { setMainTab('database'); window.location.hash = '#/clients'; }}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${mainTab === 'database' ? 'bg-brand-accent text-white shadow-lg' : 'text-brand-text-secondary hover:text-brand-accent hover:bg-brand-accent/5'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Database Pengantin
                </button>
                <button
                    onClick={() => { setMainTab('progress'); window.location.hash = '#/progress'; }}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${mainTab === 'progress' ? 'bg-brand-accent text-white shadow-lg' : 'text-brand-text-secondary hover:text-brand-accent hover:bg-brand-accent/5'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Progress & Timeline Acara
                </button>
                <button
                    onClick={() => { setMainTab('contracts'); window.location.hash = '#/contracts'; }}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${mainTab === 'contracts' ? 'bg-brand-accent text-white shadow-lg' : 'text-brand-text-secondary hover:text-brand-accent hover:bg-brand-accent/5'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Kontrak Digital
                </button>
            </div>

            {mainTab === 'database' ? (
                <>
                    <ClientHeader
                        onAddClient={() => handleOpenModal('add')}
                        onDownloadClients={handleDownloadClients}
                        onShareBookingForm={handleOpenBookingModal}
                    />

                    <ClientStatsCards stats={clientStats} />

                    <NewClientsChart clients={clients} />

                    <ClientUnpaidList
                        clients={filteredClientData.filter(c => c.balanceDue > 0)}
                        onViewDetail={handleViewDetail}
                    />

                    <ClientFilterBar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        typeFilter={typeFilter}
                        onTypeFilterChange={setTypeFilter}
                        startDate={startDate}
                        onStartDateChange={setStartDate}
                        endDate={endDate}
                        onEndDateChange={setEndDate}
                        sortConfig={sortConfig}
                        onSortChange={setSortConfig}
                    />

                    <div className="space-y-6">
                        {(activeTab === 'all' || activeTab === 'unpaid') && (
                            <>
                                <ClientActiveList
                                    clients={filteredClientData}
                                    onEditClient={(c: ExtendedClient) => handleOpenModal('edit', c, c.projects[0])}
                                    onViewDetail={handleViewDetail}
                                    onDeleteClient={handleDeleteClient}
                                    onAddProject={(c: ExtendedClient) => handleOpenModal('add', c)}
                                    onManageProjects={handleManageProjects}
                                />
                                <ClientInactiveList
                                    clients={filteredClientData}
                                    onEditClient={(c: ExtendedClient) => handleOpenModal('edit', c, c.projects[0])}
                                    onViewDetail={handleViewDetail}
                                    onDeleteClient={handleDeleteClient}
                                />
                            </>
                        )}
                        {activeTab === 'inactive' && (
                            <ClientInactiveList
                                clients={filteredClientData}
                                onEditClient={(c: ExtendedClient) => handleOpenModal('edit', c, c.projects[0])}
                                onViewDetail={handleViewDetail}
                                onDeleteClient={handleDeleteClient}
                            />
                        )}
                    </div>
                </>
            ) : mainTab === 'progress' ? (
                <ProjectsPageFeature
                    profile={userProfile}
                    showNotification={showNotification}
                    packages={packages}
                    teamMembers={teamMembers}
                    teamProjectPayments={teamProjectPayments}
                    setTeamProjectPayments={() => {}}
                />

            ) : (
                <Contracts
                    contracts={contracts}
                    setContracts={setContracts}
                    clients={clients}
                    projects={projects}
                    profile={userProfile}
                    showNotification={showNotification}
                    packages={packages}
                    onSignContract={onSignContract}
                />

            )}

            <ClientForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                mode={modalMode}
                formData={formData}
                setFormData={setFormData}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                packages={packages}
                addOns={addOns}
                promoCodes={promoCodes}
                cards={cards}
                userProfile={userProfile}
            />

            {selectedClientForDetail && (
                <ClientDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetail}
                    client={selectedClientForDetail}
                    projects={projects}
                    transactions={transactions}
                    packages={packages}
                    cards={cards}
                    onEditClient={(c: Client) => handleOpenModal('edit', c, projects.find(p => p.clientId === c.id))}
                    onDeleteClient={handleDeleteClient}
                    onViewReceipt={handleViewReceiptModal}
                    onViewInvoice={handleViewInvoiceModal}
                    handleNavigation={handleNavigation}
                    onRecordPayment={onRecordPayment}
                    onSharePortal={handleSharePortal}
                    onDeleteProject={handleDeleteProject}
                    showNotification={showNotification}
                    userProfile={userProfile}
                    // Mocks for decoupled setters in ClientDetailModal (if it still needs them before we refactor it)
                    setProjects={() => {}}
                    setTransactions={() => {}}
                    setCards={() => {}}
                />
            )}

            <BillingChatModal
                isOpen={isBillingModalOpen}
                onClose={handleCloseBilling}
                client={selectedClientForDetail}
                projects={projects}
                userProfile={userProfile}
                showNotification={showNotification}
            />

            <ClientPortalQrModal
                qrModalContent={qrModalContent}
                onCloseQrModal={handleCloseQrModal}
                onDownloadQr={handleDownloadQr}
                onShareWhatsApp={handleShareWhatsApp}
            />

            <BookingFormShareModal
                isBookingFormShareModalOpen={isBookingFormShareModalOpen}
                onCloseBookingModal={handleCloseBookingModal}
                bookingFormUrl={bookingFormUrl}
                onCopyLink={handleCopyBookingLink}
                onDownloadQr={handleDownloadQr}
            />

            {selectedInvoiceProject && (
                <InvoicePreviewModal
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                    project={selectedInvoiceProject}
                    profile={userProfile}
                    packages={packages}
                    client={clients.find(c => c.id === selectedInvoiceProject.clientId)}
                    onSign={(sig) => onSignInvoice(selectedInvoiceProject.id, sig)}
                    onEdit={() => {
                        const client = clients.find(c => c.id === selectedInvoiceProject.clientId);
                        if (client) handleOpenModal('edit', client, selectedInvoiceProject);
                    }}
                />
            )}

            {selectedReceiptTransaction && (
                <ReceiptPreviewModal
                    isOpen={isReceiptModalOpen}
                    onClose={() => setIsReceiptModalOpen(false)}
                    transaction={selectedReceiptTransaction}
                    project={projects.find(p => p.id === selectedReceiptTransaction.projectId)}
                    client={selectedClientForDetail}
                    profile={userProfile}
                    onSign={(sig) => onSignTransaction(selectedReceiptTransaction.id, sig)}
                    onEdit={() => {
                        const project = projects.find(p => p.id === selectedReceiptTransaction.projectId);
                        if (selectedClientForDetail && project) {
                            handleOpenModal('edit', selectedClientForDetail, project);
                        }
                    }}
                />
            )}

            {/* Project Related Modals */}
            {projectActions.isFormModalOpen && projectActions.formData && (
                <ProjectForm
                    isOpen={projectActions.isFormModalOpen}
                    onClose={projectActions.handleCloseForm}
                    mode={projectActions.formMode}
                    formData={projectActions.formData}
                    onFormChange={projectActions.handleFormChange}
                    onSubStatusChange={projectActions.handleSubStatusChange}
                    onClientChange={projectActions.handleClientChange}
                    onTeamChange={projectActions.handleTeamChange}
                    onTeamFeeChange={projectActions.handleTeamFeeChange}
                    onTeamSubJobChange={projectActions.handleTeamSubJobChange}
                    onTeamClientPortalLinkChange={projectActions.handleTeamClientPortalLinkChange}
                    onCustomSubStatusChange={projectActions.handleCustomSubStatusChange}
                    onAddCustomSubStatus={projectActions.addCustomSubStatus}
                    onRemoveCustomSubStatus={projectActions.removeCustomSubStatus}
                    onSubmit={projectActions.handleFormSubmit}
                    clients={clients}
                    teamMembers={teamMembers}
                    teamProjectPayments={teamProjectPayments}
                    profile={userProfile}
                    teamByCategory={projectActions.teamByCategory}
                    showNotification={showNotification}
                    setFormData={projectActions.setFormData}
                />
            )}

            {projectActions.isDetailModalOpen && projectActions.selectedProject && (
                <ProjectDetailModal
                    isOpen={projectActions.isDetailModalOpen}
                    selectedProject={projectActions.selectedProject}
                    onClose={() => projectActions.setIsDetailModalOpen(false)}
                    profile={userProfile}
                    packages={packages}
                    teamProjectPayments={teamProjectPayments}
                    onProjectUpdate={(up: Project) => {
                        // ProjectDetailModal handles its own updates, but we might want to refresh query
                        // Handled internally by React Query or a forced reload if needed.
                        window.location.reload(); // Simple fallback since we don't have queryClient exposed easily here, or we'll refactor ProjectDetailModal next.
                    }}
                    clients={clients}
                    handleOpenForm={projectActions.handleOpenForm}
                    handleOpenBriefingModal={() => projectActions.handleOpenBriefingModal(projectActions.selectedProject!)}
                    showNotification={showNotification}
                />
            )}

            {projectActions.isBriefingModalOpen && (
                <BriefingModal
                    isOpen={projectActions.isBriefingModalOpen}
                    onClose={() => projectActions.setIsBriefingModalOpen(false)}
                    briefingText={projectActions.briefingText}
                />
            )}

            {projectActions.quickStatusModalOpen && projectActions.selectedProjectForStatus && (
                <QuickStatusModal
                    isOpen={projectActions.quickStatusModalOpen}
                    onClose={() => projectActions.setQuickStatusModalOpen(false)}
                    project={projectActions.selectedProjectForStatus}
                    statusConfig={userProfile.projectStatusConfig}
                    onStatusChange={projectActions.handleQuickStatusChange}
                    showNotification={showNotification}
                />
            )}

            {projectActions.sharePreview && (
                <ShareMessageModal
                    isOpen={!!projectActions.sharePreview}
                    onClose={() => projectActions.setSharePreview(null)}
                    title={projectActions.sharePreview.title}
                    initialMessage={projectActions.sharePreview.message}
                    phone={projectActions.sharePreview.phone}
                    showNotification={showNotification}
                />
            )}

            {projectActions.chatModalData && (
                <ChatModal
                    isOpen={!!projectActions.chatModalData}
                    onClose={() => projectActions.setChatModalData(null)}
                    project={projectActions.chatModalData.project}
                    client={projectActions.chatModalData.client}
                    onSendMessage={() => { }}
                    userProfile={userProfile}
                />
            )}
        </div>
    );
};
