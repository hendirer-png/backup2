import React, { useState } from 'react';
import { 
    XIcon, 
    LayoutIcon, 
    InfoIcon, 
    FolderIcon 
} from 'lucide-react';
import { 
    Project, 
    Profile, 
    Package, 
    AssignedTeamMember, 
    TeamProjectPayment,
    Client
} from '@/features/projects/types/project.types';
import ProjectDetailsTab from '@/features/projects/components/ProjectDetailModal/ProjectDetailsTab';
import ProjectFilesTab from '@/features/projects/components/ProjectDetailModal/ProjectFilesTab';
import { updateProject } from '@/services/projects';
import { getProgressForStatus } from '@/features/projects/utils/project.utils';


interface ProjectDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProject: Project;
    profile: Profile;
    packages: Package[];
    // teamByCategory: Record<string, Record<string, AssignedTeamMember[]>>; // Removed as we compute it internally now
    teamProjectPayments: TeamProjectPayment[];
    onProjectUpdate: (updatedProject: Project) => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleOpenBriefingModal: () => void;
    clients: Client[];
    showNotification: (msg: string) => void;

}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
    isOpen,
    onClose,
    selectedProject,
    profile,
    packages,
    teamProjectPayments,
    onProjectUpdate,
    clients,
    handleOpenForm,
    handleOpenBriefingModal,
    showNotification
}) => {
    const teamByCategory = React.useMemo(() => {
        const categories: Record<string, Record<string, AssignedTeamMember[]>> = { 'Tim': {}, 'Vendor': {} };
        (selectedProject.team || []).forEach(m => {
            const cat = ('category' in m ? (m as any).category : 'Tim') || 'Tim';
            if (!categories[cat]) categories[cat] = {};
            if (!categories[cat][m.role]) categories[cat][m.role] = [];
            categories[cat][m.role].push(m);
        });
        return categories;
    }, [selectedProject.team]);

    const [detailTab, setDetailTab] = useState<'details' | 'files'>('details');

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const nextProgress = getProgressForStatus(newStatus, profile.projectStatusConfig);
            const updated = await updateProject(selectedProject.id, { 
                status: newStatus,
                progress: nextProgress,
                activeSubStatuses: [] 
            });
            onProjectUpdate(updated);
        } catch (err) {
            console.error('Failed to update status:', err);
            showNotification('Gagal memperbarui status.');
        }
    };

    const handleSubStatusToggle = async (name: string, checked: boolean) => {
        try {
            const nextActive = checked 
                ? [...(selectedProject.activeSubStatuses || []), name]
                : (selectedProject.activeSubStatuses || []).filter(s => s !== name);
            
            const updated = await updateProject(selectedProject.id, { activeSubStatuses: nextActive });
            onProjectUpdate(updated);
        } catch (err) {
            console.error('Failed to update sub-status:', err);
            showNotification('Gagal memperbarui sub-status.');
        }
    };

    const handleSaveFinalLink = async (link: string) => {
        try {
            const updated = await updateProject(selectedProject.id, { finalDriveLink: link });
            onProjectUpdate(updated);
            showNotification('Link file jadi berhasil disimpan.');
        } catch (err) {
            console.error('Failed to save link:', err);
            showNotification('Gagal menyimpan link.');
        }
    };

    const handleSendFinalLink = () => {
        const client = clients.find(c => c.id === selectedProject.clientId);
        if (!selectedProject.finalDriveLink || !client?.phone) {
            showNotification('Nomor telepon pengantin atau link belum tersedia.');
            return;
        }
        const message = `Halo Kak, file dokumentasi pernikahan sudah siap ya. Silakan akses di link berikut: ${selectedProject.finalDriveLink}. Terima kasih!`;
        window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-brand-bg/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full h-full md:h-auto md:max-h-[95vh] md:max-w-4xl bg-brand-surface border-0 md:border md:border-brand-border md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex-shrink-0 p-6 md:p-8 flex items-center justify-between border-b border-brand-border bg-brand-bg/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-accent to-blue-600 flex items-center justify-center shadow-lg shadow-brand-accent/20">
                            <LayoutIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-brand-text-light tracking-tight truncate max-w-[200px] md:max-w-md">Detail Acara Pernikahan</h2>
                            <p className="text-xs text-brand-text-secondary font-bold uppercase tracking-widest">{selectedProject.projectName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 rounded-2xl border border-brand-border bg-brand-surface text-brand-text-secondary hover:text-brand-text-light hover:border-brand-accent/50 transition-all active:scale-95"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex-shrink-0 px-6 md:px-8 py-4 border-b border-brand-border bg-brand-bg/30">
                    <div className="flex gap-2 p-1.5 bg-brand-surface rounded-[1.25rem] border border-brand-border max-w-fit">
                        {[
                            { id: 'details', label: 'Informasi Detail', icon: InfoIcon },
                            { id: 'files', label: 'File & Tautan', icon: FolderIcon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setDetailTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                                    detailTab === tab.id 
                                        ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20 translate-y-[-1px]' 
                                        : 'text-brand-text-secondary hover:text-brand-text-light hover:bg-brand-input'
                                }`}
                            >
                                <tab.icon className={`w-3.5 h-3.5 ${detailTab === tab.id ? 'animate-pulse' : ''}`} />
                                <span>
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {detailTab === 'details' && (
                        <ProjectDetailsTab
                            selectedProject={selectedProject}
                            profile={profile}
                            packages={packages}
                            teamByCategory={teamByCategory}
                            teamProjectPayments={teamProjectPayments}
                            handleStatusUpdate={handleStatusUpdate}
                            handleSubStatusToggle={handleSubStatusToggle}
                            handleOpenForm={handleOpenForm}
                            handleOpenBriefingModal={handleOpenBriefingModal}
                            onClose={onClose}
                        />
                    )}
                    {detailTab === 'files' && (
                        <ProjectFilesTab
                            selectedProject={selectedProject}
                            handleSaveFinalLink={handleSaveFinalLink}
                            handleSendFinalLink={handleSendFinalLink}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailModal;
