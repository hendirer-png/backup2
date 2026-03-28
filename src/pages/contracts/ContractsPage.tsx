import React from 'react';
import { Contract, Client, Project, Profile, Package, NavigationAction } from '@/types';
import PageHeader from '@/layouts/PageHeader';
import { PlusIcon, FileTextIcon } from '@/constants';
import { useContractsPage } from '@/features/contracts/hooks/useContractsPage';
import { ContractStats } from '@/features/contracts/components/ContractStats';
import { ContractTable } from '@/features/contracts/components/ContractTable';
import { ContractMobileList } from '@/features/contracts/components/ContractMobileList';
import { ContractFormModal } from '@/features/contracts/components/ContractFormModal';
import { ContractViewModal } from '@/features/contracts/components/ContractViewModal';
import { ContractInfoModal } from '@/features/contracts/components/ContractInfoModal';
import { handleDownloadPDF, handleDownloadPDFWithoutTTD } from '@/features/contracts/utils/pdf.utils';

interface ContractsProps {
    contracts: Contract[];
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    clients: Client[];
    projects: Project[];
    profile: Profile;
    showNotification: (message: string) => void;
    packages: Package[];
    onSignContract: (contractId: string, signatureDataUrl: string, signer: 'vendor' | 'client') => void;
}


const Contracts: React.FC<ContractsProps> = ({ 
    contracts, 
    setContracts, 
    clients, 
    projects, 
    profile, 
    showNotification, 
    packages, 
    onSignContract 
}) => {

    const {
        isFormModalOpen,
        isViewModalOpen,
        modalMode,
        selectedContract,
        isInfoModalOpen,
        setIsInfoModalOpen,
        isSignatureModalOpen,
        setIsSignatureModalOpen,
        formData,
        setFormData,
        selectedClientId,
        setSelectedClientId,
        selectedProjectId,
        setSelectedProjectId,
        availableProjects,
        handleOpenModal,
        handleCloseModal,
        handleFormChange,
        handleSubmit,
        handleDelete,
        handleSaveSignature,
        stats
    } = useContractsPage({
        contracts,
        setContracts,
        clients,
        projects,
        profile,
        packages,
        showNotification,
        onSignContract
    });


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader 
                title="Kontrak Digital" 
                subtitle="Buat, kelola, dan arsipkan semua kontrak kerja vendor Anda dengan sistem tanda tangan digital yang aman." 
                icon={<FileTextIcon className="w-6 h-6" />}
            >
                <button 
                    onClick={() => setIsInfoModalOpen(true)} 
                    className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all text-xs font-bold"
                >
                    Pelajari
                </button>
                <button 
                    onClick={() => handleOpenModal('add')} 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 transition-all text-xs sm:text-sm font-black shadow-lg shadow-blue-900/40"
                >
                    <PlusIcon className="w-5 h-5"/>
                    <span>Buat Kontrak</span>
                </button>
            </PageHeader>

            <ContractStats 
                totalContracts={contracts.length}
                waitingForClient={stats.waitingForClient}
                totalValue={stats.totalValue}
            />
            
            <ContractTable 
                contracts={contracts}
                clients={clients}
                projects={projects}
                onView={(c) => handleOpenModal('view', c)}
                onEdit={(c) => handleOpenModal('edit', c)}
                onDelete={handleDelete}
            />

            <ContractMobileList 
                contracts={contracts}
                clients={clients}
                projects={projects}
                onView={(c) => handleOpenModal('view', c)}
                onEdit={(c) => handleOpenModal('edit', c)}
                onDelete={handleDelete}
            />

            <ContractInfoModal 
                isOpen={isInfoModalOpen} 
                onClose={() => setIsInfoModalOpen(false)} 
            />
            
            <ContractFormModal 
                isOpen={isFormModalOpen}
                onClose={handleCloseModal}
                mode={modalMode === 'view' ? 'edit' : modalMode} // Fallback for safety
                formData={formData}
                setFormData={setFormData}
                clients={clients}
                availableProjects={availableProjects}
                selectedClientId={selectedClientId}
                setSelectedClientId={setSelectedClientId}
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
                handleFormChange={handleFormChange}
                handleSubmit={handleSubmit}
            />
            
            <ContractViewModal 
                isOpen={isViewModalOpen}
                onClose={handleCloseModal}
                selectedContract={selectedContract}
                projects={projects}
                clients={clients}
                profile={profile}
                isSignatureModalOpen={isSignatureModalOpen}
                setIsSignatureModalOpen={setIsSignatureModalOpen}
                handleSaveSignature={handleSaveSignature}
                handleDownloadPDF={() => handleDownloadPDF(selectedContract)}
                handleDownloadPDFWithoutTTD={() => handleDownloadPDFWithoutTTD(selectedContract, projects, profile)}
                showNotification={showNotification}
            />
        </div>
    );
};

export default Contracts;
