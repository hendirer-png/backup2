import React from 'react';
// Types
import { 
    Client, Project, Transaction, Package, Card, PromoCode, FinancialPocket, 
    ViewType, NavigationAction, Profile, ClientFeedback 
} from '@/types';
import { ExtendedClient } from '@/features/clients/types';

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

export interface ClientsFeatureProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    packages: Package[];
    addOns: any[];
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    userProfile: Profile;
    showNotification: (message: string) => void;
    addNotification: (notif: any) => void;
    initialAction: any;
    setInitialAction: (val: any) => void;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    handleNavigation: (view: ViewType, action?: NavigationAction) => void;
    promoCodes: PromoCode[];
    setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
    totals: any;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    clientFeedback: ClientFeedback[];
    onSignInvoice: (pId: string, sig: string) => void;
    onSignTransaction: (tId: string, sig: string) => void;
    onRecordPayment: (projectId: string, amount: number, destinationCardId: string) => void;
}

export const ClientsPage: React.FC<ClientsFeatureProps> = (props) => {
    const {
        clients, setClients,
        projects, setProjects,
        packages, addOns,
        transactions, setTransactions,
        userProfile,
        showNotification,
        addNotification,
        initialAction, setInitialAction,
        cards, setCards,
        handleNavigation,
        promoCodes, setPromoCodes,
        onSignInvoice,
        onSignTransaction,
        onRecordPayment
    } = props;

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
        clients, setClients,
        projects, setProjects,
        transactions, setTransactions,
        cards, setCards,
        promoCodes, setPromoCodes,
        packages, addOns,
        userProfile,
        showNotification,
        addNotification,
        initialAction,
        setInitialAction
    });

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
                    setProjects={setProjects}
                    setTransactions={setTransactions}
                    setCards={setCards}
                    userProfile={userProfile}
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
        </div>
    );
};
