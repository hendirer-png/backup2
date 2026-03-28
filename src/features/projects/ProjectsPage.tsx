import React, { useMemo } from 'react';
import { ProjectsProps, Project } from '@/features/projects/types/project.types';
import { useProjectsData } from '@/features/projects/hooks/useProjectsData';
import { useProjectsFilters } from '@/features/projects/hooks/useProjectsFilters';
import { useProjectActions } from '@/features/projects/hooks/useProjectActions';

// React Query Hooks
import { useProjects } from '@/features/projects/api/useProjects';
import { useClients } from '@/features/clients/api/useClients';
import { useTransactions, useCards, usePockets } from '@/features/finance/api/useFinanceQueries';
// import { useProjectChecklist } from '@/features/projects/hooks/useProjectChecklist'; // Keep if needed for later
import ProjectHeader from '@/features/projects/components/ProjectHeader';
import ProjectFilters from '@/features/projects/components/ProjectFilters';
import ProjectAnalytics from '@/features/projects/components/ProjectAnalytics';
import ProjectListView from '@/features/projects/components/ProjectListView';
import ProjectKanbanView from '@/features/projects/components/ProjectKanbanView';
import ProjectForm from '@/features/projects/components/ProjectForm';
import ProjectDetailModal from '@/features/projects/components/ProjectDetailModal';
import BriefingModal from '@/features/projects/components/BriefingModal';
import ShareMessageModal from '@/features/communication/components/ShareMessageModal';
import ChatModal from '@/features/communication/components/ChatModal';
import StatModal from '@/features/projects/components/StatModal';
import QuickStatusModal from '@/features/projects/components/QuickStatusModal';
import { getStatModalData } from '@/features/projects/utils/project.utils';

const ProjectsPage: React.FC<ProjectsProps> = ({
    profile, showNotification,
    packages, teamMembers, teamProjectPayments, setTeamProjectPayments
}) => {

    // 1. Decoupled Data Fetching
    const { data: qProjects } = useProjects({ limit: 50 });
    const { data: qClients } = useClients({ limit: 50 });
    const { data: qTransactions } = useTransactions({ limit: 50 });
    const { data: qCards } = useCards();
    const { data: qPockets } = usePockets();

    const initialProjects = qProjects || [];
    const clients = qClients || [];
    const transactions = qTransactions || [];
    const cards = qCards || [];
    const pockets = qPockets || [];
    // 1. Data & State Management
    const {
        projects, setProjects, isLoading, isLoadingMore, hasMore, loadMoreProjects, totals
    } = useProjectsData({
        teamMembers, showNotification
    });

    // 2. Filtering & View Logic
    const {
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        dateFrom, setDateFrom, dateTo, setDateTo,
        viewMode, setViewMode, filteredProjects
    } = useProjectsFilters({
        projects,
        projectStatusConfig: profile.projectStatusConfig
    });

    // 3. Mutation & Action Handlers
    const actions = useProjectActions({
        projects,
        clients,
        teamMembers,
        teamProjectPayments,
        setTeamProjectPayments,
        transactions,
        cards,
        pockets,
        profile,
        showNotification
    });

    // 4. Derived Data
    const statModalData = useMemo(() => 
        getStatModalData(actions.activeStatModal, projects, profile),
        [actions.activeStatModal, projects, profile]
    );

    const handleProjectUpdate = (updatedProject: Project) => {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        if (actions.selectedProject?.id === updatedProject.id) {
            actions.setSelectedProject(updatedProject);
        }
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <ProjectHeader 
                onAddProject={() => actions.handleOpenForm('add')}
                onOpenInfoModal={() => {}} // TODO: Implement if needed
            />

            {/* Analytics Section */}
            <ProjectAnalytics 
                projects={projects}
                projectStatusConfig={profile.projectStatusConfig}
                totals={totals} 
                onStatCardClick={actions.setActiveStatModal} 
            />

            {/* Filters Section */}
            <ProjectFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                dateFrom={dateFrom}
                setDateFrom={setDateFrom}
                dateTo={dateTo}
                setDateTo={setDateTo}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
                projectStatusConfig={profile.projectStatusConfig}
            />

            {/* Main Content: List or Kanban */}
            <div className="min-h-[400px]">
                {viewMode === 'list' ? (
                    <ProjectListView 
                        projects={filteredProjects}
                        handleOpenDetailModal={actions.handleOpenDetailModal}
                        handleOpenForm={actions.handleOpenForm}
                        handleProjectDelete={actions.handleProjectDelete}
                        config={profile.projectStatusConfig}
                        clients={clients}
                        handleQuickStatusChange={actions.handleQuickStatusChange}
                        handleSendMessage={actions.handleSendMessage}
                        hasMore={hasMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={loadMoreProjects}
                    />
                ) : (
                    <ProjectKanbanView 
                        projects={filteredProjects}
                        handleOpenDetailModal={actions.handleOpenDetailModal}
                        draggedProjectId={actions.draggedProjectId}
                        handleDragStart={actions.handleDragStart}
                        handleDragOver={actions.handleDragOver}
                        handleDrop={actions.handleDrop}
                        config={profile.projectStatusConfig}
                    />
                )}
            </div>

            {/* Modals */}
            {actions.isFormModalOpen && actions.formData && (
                <ProjectForm 
                    isOpen={actions.isFormModalOpen}
                    onClose={actions.handleCloseForm}
                    mode={actions.formMode}
                    formData={actions.formData}
                    onFormChange={actions.handleFormChange}
                    onSubStatusChange={actions.handleSubStatusChange}
                    onClientChange={actions.handleClientChange}
                    onTeamChange={actions.handleTeamChange}
                    onTeamFeeChange={actions.handleTeamFeeChange}
                    onTeamSubJobChange={actions.handleTeamSubJobChange}
                    onTeamClientPortalLinkChange={actions.handleTeamClientPortalLinkChange}
                    onCustomSubStatusChange={actions.handleCustomSubStatusChange}
                    onAddCustomSubStatus={actions.addCustomSubStatus}
                    onRemoveCustomSubStatus={actions.removeCustomSubStatus}
                    onSubmit={actions.handleFormSubmit}
                    clients={clients}
                    teamMembers={teamMembers}
                    teamProjectPayments={teamProjectPayments}
                    profile={profile}
                    teamByCategory={actions.teamByCategory}
                    showNotification={showNotification}
                    setFormData={actions.setFormData}
                />
            )}

            {actions.isDetailModalOpen && actions.selectedProject && (
                <ProjectDetailModal 
                    isOpen={actions.isDetailModalOpen}
                    selectedProject={actions.selectedProject}
                    onClose={() => actions.setIsDetailModalOpen(false)}
                    profile={profile}
                    packages={packages}
                    teamProjectPayments={teamProjectPayments}
                    onProjectUpdate={handleProjectUpdate}
                    clients={clients}
                    handleOpenForm={actions.handleOpenForm}
                    handleOpenBriefingModal={() => actions.handleOpenBriefingModal(actions.selectedProject!)}
                    showNotification={showNotification}
                />
            )}

            {actions.isBriefingModalOpen && (
                <BriefingModal 
                    isOpen={actions.isBriefingModalOpen}
                    onClose={() => actions.setIsBriefingModalOpen(false)}
                    briefingText={actions.briefingText}
                />
            )}

            {actions.quickStatusModalOpen && actions.selectedProjectForStatus && (
                <QuickStatusModal 
                    isOpen={actions.quickStatusModalOpen}
                    onClose={() => actions.setQuickStatusModalOpen(false)}
                    project={actions.selectedProjectForStatus}
                    statusConfig={profile.projectStatusConfig}
                    onStatusChange={actions.handleQuickStatusChange}
                    showNotification={showNotification}
                />
            )}

            {actions.sharePreview && (
                <ShareMessageModal 
                    isOpen={!!actions.sharePreview}
                    onClose={() => actions.setSharePreview(null)}
                    title={actions.sharePreview.title}
                    initialMessage={actions.sharePreview.message}
                    phone={actions.sharePreview.phone}
                    showNotification={showNotification}
                />
            )}

            {actions.chatModalData && (
                <ChatModal 
                    isOpen={!!actions.chatModalData}
                    onClose={() => actions.setChatModalData(null)}
                    project={actions.chatModalData.project}
                    client={actions.chatModalData.client}
                    onSendMessage={() => {}} // TODO: Implement if needed
                    userProfile={profile}
                />
            )}

            {actions.activeStatModal && statModalData && (
                <StatModal 
                    isOpen={!!actions.activeStatModal}
                    onClose={() => actions.setActiveStatModal(null)}
                    title={statModalData.title}
                    items={statModalData.items}
                />
            )}
        </div>
    );
};

export default ProjectsPage;
