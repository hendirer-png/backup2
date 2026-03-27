import React, { useState } from 'react';
import { EyeIcon } from '@/constants';
import { PencilIcon, Trash2Icon, ChevronDownIcon, ChevronUpIcon, ArrowDownIcon } from 'lucide-react';
import ProjectCard from '@/features/projects/components/ProjectCard';
import { 
    Project, 
    ProjectStatusConfig, 
    Client, 
    ProjectListViewProps 
} from '@/features/projects/types/project.types';
import { 
    getStatusColor, 
    getStatusClass, 
    getSubStatusText, 
    getDisplayProgress 
} from '@/features/projects/utils/project.utils';

const ProjectListView: React.FC<ProjectListViewProps> = ({ 
    projects, 
    handleOpenDetailModal, 
    handleOpenForm, 
    handleProjectDelete, 
    config, 
    clients, 
    handleQuickStatusChange, 
    handleSendMessage, 
    hasMore, 
    isLoadingMore, 
    onLoadMore 
}) => {
    const [isInactiveOpen, setIsInactiveOpen] = useState(true);

    const activeProjects = projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan');
    const inactiveProjects = projects.filter(p => p.status === 'Selesai' || p.status === 'Dibatalkan');

    const ProgressBar: React.FC<{ progress: number, status: string, config: ProjectStatusConfig[] }> = ({ progress, status, config }) => (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getStatusColor(status, config) }}></div>
        </div>
    );

    const renderTable = (projectList: Project[], isInactive: boolean = false) => (
        <div className={`overflow-x-auto ${isInactive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-brand-text-secondary uppercase">
                    <tr>
                        <th className="px-6 py-4 font-medium tracking-wider">Nama Acara Pernikahan</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Pengantin</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Tanggal</th>
                        <th className="px-6 py-4 font-medium tracking-wider min-w-[200px]">Progress</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Tim</th>
                        <th className="px-6 py-4 font-medium tracking-wider text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                    {projectList.map(p => (
                        <tr key={p.id} className="hover:bg-brand-bg transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-brand-text-light">{p.projectName}</p>
                                </div>
                                <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusClass(p.status, config)}`}>
                                    {getSubStatusText(p)}
                                </p>
                            </td>
                            <td className="px-6 py-4 text-brand-text-primary">{p.clientName}</td>
                            <td className="px-6 py-4 text-brand-text-primary">{new Date(p.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <ProgressBar progress={getDisplayProgress(p, config)} status={p.status} config={config} />
                                    <span className="text-xs font-semibold text-brand-text-secondary">{getDisplayProgress(p, config)}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-brand-text-primary">{p.team.map(t => t.name.split(' ')[0]).join(', ') || '-'}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center space-x-1">
                                    <button onClick={() => handleOpenDetailModal(p)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors" title="Detail Acara Pernikahan"><EyeIcon className="w-5 h-5 text-white" /></button>
                                    <button onClick={() => handleOpenForm('edit', p)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors" title="Edit Acara Pernikahan"><PencilIcon className="w-5 h-5 text-white" /></button>
                                    <button onClick={() => handleProjectDelete(p.id)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 transition-colors" title="Hapus Acara Pernikahan"><Trash2Icon className="w-5 h-5 text-white" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCards = (projectList: Project[], isInactive: boolean = false) => (
        <div className={`space-y-3 ${isInactive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            {projectList.map(p => {
                const client = clients.find(c => c.id === p.clientId);
                return (
                    <ProjectCard
                        key={p.id}
                        project={p}
                        client={client}
                        projectStatusConfig={config}
                        onStatusChange={(projectId, newStatus) => handleQuickStatusChange(projectId, newStatus, false)}
                        onViewDetails={handleOpenDetailModal}
                        onEdit={(project) => handleOpenForm('edit', project)}
                        onSendMessage={handleSendMessage}
                    />
                );
            })}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* --- Active Projects Section --- */}
            <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border overflow-hidden">
                <div className="p-4 border-b border-brand-border bg-brand-bg/10">
                    <h3 className="text-base md:text-lg font-bold text-gradient">
                        Acara Pernikahan Aktif ({activeProjects.length})
                    </h3>
                </div>
                
                <div className="md:hidden p-3">
                    {renderCards(activeProjects)}
                </div>
                <div className="hidden md:block">
                    {renderTable(activeProjects)}
                </div>
                
                {activeProjects.length === 0 && (
                    <p className="text-center py-8 text-sm text-brand-text-secondary">Tidak ada Acara Pernikahan aktif.</p>
                )}
            </div>

            {/* --- Inactive Projects Section (Selesai & Dibatalkan) --- */}
            <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border overflow-hidden">
                <button 
                    onClick={() => setIsInactiveOpen(!isInactiveOpen)}
                    className="w-full h-14 px-6 flex items-center justify-between hover:bg-brand-bg/50 transition-colors outline-none"
                >
                    <h3 className="text-base md:text-lg font-bold text-blue-900/40">
                        Acara Pernikahan Selesai & Dibatalkan ({inactiveProjects.length})
                    </h3>
                    {isInactiveOpen ? (
                        <ChevronUpIcon className="w-5 h-5 text-brand-text-secondary" />
                    ) : (
                        <ChevronDownIcon className="w-5 h-5 text-brand-text-secondary" />
                    )}
                </button>

                {isInactiveOpen && (
                    <>
                        <div className="md:hidden p-3 pt-0">
                            {renderCards(inactiveProjects, true)}
                        </div>
                        <div className="hidden md:block">
                            {renderTable(inactiveProjects, true)}
                        </div>
                        {inactiveProjects.length === 0 && (
                            <p className="text-center py-8 text-sm text-brand-text-secondary">Tidak ada Acara Pernikahan selesai atau dibatalkan.</p>
                        )}
                    </>
                )}
            </div>

            {hasMore && (
                <div className="mt-8 flex justify-center pb-8 border-t border-brand-border/10 pt-8">
                    <button
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-accent text-white font-bold hover:shadow-xl hover:shadow-brand-accent/30 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {isLoadingMore ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                                <ArrowDownIcon className="w-5 h-5" />
                                Muat Lebih Banyak
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectListView;
