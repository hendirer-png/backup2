import { useState, useMemo, useEffect } from 'react';
import { Contract, Client, Project, Profile, Package, NavigationAction } from '@/types';
import { initialFormState } from '@/features/contracts/constants/contracts.constants';
import { createContract as createContractRow, updateContract as updateContractRow, deleteContract as deleteContractRow } from '@/services/contracts';

interface UseContractsPageProps {
    contracts: Contract[];
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    clients: Client[];
    projects: Project[];
    profile: Profile;
    packages: Package[];
    showNotification: (message: string) => void;
    onSignContract: (contractId: string, signatureDataUrl: string, signer: 'vendor' | 'client') => void;
}


export const useContractsPage = ({
    contracts,
    setContracts,
    clients,
    projects,
    profile,
    packages,
    showNotification,
    onSignContract
}: UseContractsPageProps) => {

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    // Form specific state
    const [formData, setFormData] = useState(initialFormState);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');

    const availableProjects = useMemo(() => {
        return projects.filter(p => p.clientId === selectedClientId);
    }, [selectedClientId, projects]);

    // Auto-populate form when project is selected
    useEffect(() => {
        if (selectedProjectId) {
            const project = projects.find(p => p.id === selectedProjectId);
            const client = clients.find(c => c.id === project?.clientId);
            if (project && client) {
                const pkg = packages.find(p => p.id === project.packageId);
                const clientNames = client.name.split(/&|,/);
                setFormData(prev => ({
                    ...prev,
                    clientName1: prev.clientName1 || clientNames[0]?.trim() || client.name,
                    clientPhone1: prev.clientPhone1 || client.phone,
                    clientAddress1: prev.clientAddress1 || project.location,
                    clientName2: prev.clientName2 || clientNames[1]?.trim() || '',
                    clientPhone2: prev.clientPhone2 || client.phone,
                    clientAddress2: prev.clientAddress2 || project.location,
                    jurisdiction: prev.jurisdiction || project.location.split(',')[1]?.trim() || project.location.split(',')[0]?.trim() || 'Indonesia',
                    signingLocation: prev.signingLocation || profile.address,
                    dpDate: prev.dpDate || (project.amountPaid > 0 ? new Date().toISOString().split('T')[0] : ''),
                    finalPaymentDate: prev.finalPaymentDate || (project.date ? new Date(new Date(project.date).setDate(new Date(project.date).getDate() - 7)).toISOString().split('T')[0] : ''),
                    shootingDuration: prev.shootingDuration || pkg?.photographers || 'Sesuai detail paket',
                    guaranteedPhotos: prev.guaranteedPhotos || pkg?.digitalItems.find(item => item.toLowerCase().includes('foto')) || 'Sesuai detail paket',
                    albumDetails: prev.albumDetails || pkg?.physicalItems.find(item => item.name.toLowerCase().includes('album'))?.name || 'Sesuai detail paket',
                    otherItems: prev.otherItems || project.addOns.map(a => a.name).join(', ') || 'Sesuai detail paket',
                    personnelCount: prev.personnelCount || `${pkg?.photographers ? '1+' : '0'} Fotografer, ${pkg?.videographers ? '1+' : '0'} Videografer`,
                    deliveryTimeframe: prev.deliveryTimeframe || pkg?.processingTime || '30 hari kerja',
                    serviceTitle: prev.serviceTitle || `JASA ${project.projectType.toUpperCase()}`,
                    pasal1Content: prev.pasal1Content || `1.1 PIHAK PERTAMA sepakat untuk memberikan jasa ${project.projectType.toLowerCase()} kepada PIHAK KEDUA.\n\n1.2 Pelaksanaan pekerjaan dilakukan pada:\n• Tanggal Acara : ${new Date(project.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n• Lokasi Acara : ${project.location}\n\n1.3 Rincian layanan yang diberikan oleh PIHAK PERTAMA meliputi:\n• ${pkg?.photographers || 'Sesuai paket'}\n• ${pkg?.digitalItems.find(item => item.toLowerCase().includes('foto')) || 'Sesuai paket'}\n• ${pkg?.physicalItems.find(item => item.name.toLowerCase().includes('album'))?.name || 'Sesuai paket'}\n\n1.4 Layanan tambahan yang disepakati:\n• ${project.addOns.map(a => a.name).join(', ') || '-'}\n\n1.5 Segala perubahan layanan di luar yang tercantum dalam perjanjian ini harus disepakati oleh kedua belah pihak.`,
                    pasal2Content: prev.pasal2Content || `2.1 Total biaya jasa yang disepakati oleh kedua belah pihak adalah sebesar:\nRp ${project.totalCost.toLocaleString('id-ID')}\n\n2.2 Sistem pembayaran dilakukan dengan ketentuan sebagai berikut:\n\na. Uang Muka (DP)\nSebesar Rp ${project.amountPaid.toLocaleString('id-ID')} dibayarkan pada tanggal ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.\n\nb. Pelunasan\nSisa pembayaran wajib dilunasi paling lambat pada tanggal ${project.date ? new Date(new Date(project.date).setDate(new Date(project.date).getDate() - 7)).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'} atau sebelum hari pelaksanaan acara.\n\n2.3 Pembayaran dianggap sah setelah dana diterima oleh PIHAK PERTAMA.`,
                    pasal3Content: prev.pasal3Content || `3.1 DP yang sudah dibayarkan tidak dapat dikembalikan.\n\n3.2 Jika pembatalan dilakukan H-7 sebelum hari pelaksanaan, PIHAK KEDUA wajib membayar 50% dari total biaya.\n\n3.3 Apabila pembatalan dilakukan oleh PIHAK PERTAMA karena alasan yang tidak dapat dihindari, maka PIHAK PERTAMA wajib mengembalikan seluruh pembayaran yang telah diterima.`,
                    pasal4Content: prev.pasal4Content || `4.1 Waktu pengerjaan dan pengiriman hasil dokumentasi adalah maksimal ${pkg?.processingTime || '30 hari kerja'} setelah acara berlangsung.\n\n4.2 Tim yang akan bertugas pada acara PIHAK KEDUA: ${pkg?.photographers ? '1+' : '0'} Fotografer, ${pkg?.videographers ? '1+' : '0'} Videografer.\n\n4.3 PIHAK PERTAMA berhak menggunakan sebagian hasil dokumentasi sebagai portofolio atau media promosi, kecuali apabila PIHAK KEDUA menyatakan keberatan secara tertulis.`,
                    pasal5Content: prev.pasal5Content || `5.1 Perjanjian ini berlaku sejak tanggal ditandatangani oleh kedua belah pihak.\n\n5.2 Segala hal yang belum diatur dalam perjanjian ini akan diselesaikan secara musyawarah dan mufakat.\n\n5.3 Apabila terjadi perselisihan yang tidak dapat diselesaikan secara musyawarah, maka kedua belah pihak sepakat untuk menyelesaikannya melalui jalur hukum di wilayah ${project.location.split(',')[1]?.trim() || project.location.split(',')[0]?.trim() || 'Indonesia'}.`,
                    closingText: prev.closingText || `Demikian Surat Perjanjian Kerja Sama ini dibuat dengan sebenar-benarnya dalam keadaan sadar dan tanpa paksaan. Perjanjian ini dibuat dalam dua rangkap yang masing-masing mempunyai kekuatan hukum yang sama.`
                }));
            }
        }
    }, [selectedProjectId, projects, clients, packages, profile.address]);

    const handleOpenModal = (mode: 'add' | 'edit' | 'view', contract?: Contract) => {
        if (mode === 'view' && contract) {
            setSelectedContract(contract);
            setIsViewModalOpen(true);
        } else {
            setModalMode(mode);
            if (mode === 'edit' && contract) {
                setSelectedContract(contract);
                setSelectedClientId(contract.clientId);
                setSelectedProjectId(contract.projectId);

                const editFormData = { ...initialFormState };
                Object.keys(initialFormState).forEach(key => {
                    const val = (contract as any)[key];
                    (editFormData as any)[key] = (val === null || val === undefined) ? '' : val;
                });
                setFormData(editFormData as any);
            } else {
                setSelectedContract(null);
                setSelectedClientId('');

            }
            setIsFormModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setIsViewModalOpen(false);
        setSelectedContract(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProjectId) {
            showNotification('Harap pilih proyek terlebih dahulu.');
            return;
        }

        try {
            if (modalMode === 'add') {
                const contractCount = contracts.length + 1;
                const contractNumber = `VP/CTR/${new Date().getFullYear()}/${String(contractCount).padStart(3, '0')}`;
                const payload = {
                    contractNumber,
                    clientId: selectedClientId,
                    projectId: selectedProjectId,
                    ...formData,
                } as Omit<Contract, 'id' | 'createdAt'>;
                const created = await createContractRow(payload);
                setContracts(prev => {
                    const exists = prev.some(c => c.id === created.id);
                    if (exists) {
                        return prev.map(c => (c.id === created.id ? created : c));
                    }
                    return [created, ...prev];
                });
                showNotification('Kontrak baru berhasil dibuat.');
            } else if (selectedContract) {
                const patch = {
                    ...formData,
                    clientId: selectedClientId,
                    projectId: selectedProjectId,
                } as Partial<Contract>;
                try {
                    const updated = await updateContractRow(selectedContract.id, patch);
                    setContracts(prev => prev.map(c => c.id === selectedContract.id ? updated : c));
                    showNotification('Kontrak berhasil diperbarui.');
                } catch (err: any) {
                    console.warn('[Supabase][contracts.update] gagal, fallback create. Detail:', err);
                    const payload = {
                        contractNumber: selectedContract.contractNumber,
                        clientId: selectedClientId,
                        projectId: selectedProjectId,
                        ...formData,
                    } as Omit<Contract, 'id' | 'createdAt'>;
                    const created = await createContractRow(payload);
                    setContracts(prev => prev.map(c => c.id === selectedContract.id ? created : c));
                    showNotification('Kontrak baru berhasil dibuat (fallback).');
                }
            }
            handleCloseModal();
        } catch (err: any) {
            console.error('[Supabase][contracts.save] error:', err);
            alert(`Gagal menyimpan kontrak ke database. ${err?.message || 'Coba lagi.'}`);
        }
    };

    const handleDelete = async (contractId: string) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus kontrak ini?")) return;
        try {
            await deleteContractRow(contractId);
            setContracts(prev => prev.filter(c => c.id !== contractId));
            showNotification('Kontrak berhasil dihapus.');
        } catch (err: any) {
            console.error('[Supabase][contracts.delete] error:', err);
            alert(`Gagal menghapus kontrak di database. ${err?.message || 'Coba lagi.'}`);
        }
    };

    const handleSaveSignature = async (signatureDataUrl: string) => {
        if (selectedContract) {
            try {
                const updated = await updateContractRow(selectedContract.id, { vendorSignature: signatureDataUrl });
                onSignContract(selectedContract.id, signatureDataUrl, 'vendor');
                setSelectedContract(updated);
                setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
                showNotification('Tanda tangan berhasil disimpan.');
            } catch (err: any) {
                console.error('[Supabase][contracts.signature] error:', err);
                alert(`Gagal menyimpan tanda tangan ke database. ${err?.message || 'Coba lagi.'}`);
            }
        }
        setIsSignatureModalOpen(false);
    };



    const stats = useMemo(() => {
        const waitingForClient = contracts.filter(c => c.vendorSignature && !c.clientSignature).length;
        const waitingForVendor = contracts.filter(c => !c.vendorSignature).length;
        const totalValue = contracts.reduce((sum, c) => {
            const project = projects.find(p => p.id === c.projectId);
            return sum + (project?.totalCost || 0);
        }, 0);
        return { waitingForClient, waitingForVendor, totalValue };
    }, [contracts, projects]);

    return {
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
    };
};
