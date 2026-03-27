import React from 'react';
import { Profile, Project } from '@/types';
import { CategoryManager } from '@/features/settings/components/CategoryManager';
import { ProjectStatusManager } from '@/features/settings/components/ProjectStatusManager';
import { ChecklistTemplateSettings } from '@/features/settings/components/ChecklistTemplateSettings';
import { DEFAULT_STATUS_CONFIG } from '@/features/settings/utils/settings.utils';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';
import { PackageIcon, CalendarIcon, ListIcon, CheckSquareIcon } from '@/constants';

interface ProjectSettingsTabProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    projects: Project[];
    projectTypeInput: string;
    setProjectTypeInput: (v: string) => void;
    editingProjectType: string | null;
    setEditingProjectType: (v: string | null) => void;
    eventTypeInput: string;
    setEventTypeInput: (v: string) => void;
    editingEventType: string | null;
    setEditingEventType: (v: string | null) => void;
    handleCategoryUpdate: (field: keyof Profile, categories: string[]) => void;
    showNotification: (msg: string) => void;
}

export const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({
    profile, setProfile, projects, projectTypeInput, setProjectTypeInput,
    editingProjectType, setEditingProjectType, eventTypeInput, setEventTypeInput,
    editingEventType, setEditingEventType, handleCategoryUpdate, showNotification
}) => {
    const handleUpdate = (field: 'projectTypes' | 'eventTypes', input: string, setInput: any, categories: string[], editing: string | null, setEditing: any) => {
        const val = input.trim(); if (!val) return;
        let updated: string[];
        if (editing) updated = categories.map(c => c === editing ? val : c);
        else updated = categories.includes(val) ? categories : [...categories, val];
        handleCategoryUpdate(field, updated); setInput(''); setEditing(null);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CollapsibleSection 
                    title="Tipe Project / Layanan" 
                    defaultExpanded={true} 
                    variant="filled"
                    icon={<PackageIcon className="w-4 h-4" />}
                >
                    <CategoryManager
                        title="Daftar Tipe Project" 
                        placeholder="Tambah Tipe (e.g. Wedding Photography)" 
                        categories={profile.projectTypes || []}
                        inputValue={projectTypeInput} 
                        onInputChange={setProjectTypeInput}
                        onAddOrUpdate={() => handleUpdate('projectTypes', projectTypeInput, setProjectTypeInput, profile.projectTypes || [], editingProjectType, setEditingProjectType)}
                        onEdit={(cat) => { setEditingProjectType(cat); setProjectTypeInput(cat); }}
                        onDelete={(cat) => confirm(`Hapus "${cat}"?`) && handleCategoryUpdate('projectTypes', (profile.projectTypes || []).filter(c => c !== cat))}
                        editingValue={editingProjectType} 
                        onCancelEdit={() => { setEditingProjectType(null); setProjectTypeInput(''); }}
                    />
                </CollapsibleSection>

                <CollapsibleSection 
                    title="Jenis Acara Pernikahan" 
                    defaultExpanded={true} 
                    variant="filled"
                    icon={<CalendarIcon className="w-4 h-4" />}
                >
                    <CategoryManager
                        title="Daftar Jenis Acara" 
                        placeholder="Tambah Jenis (e.g. Akad Nikah)" 
                        categories={profile.eventTypes || []}
                        inputValue={eventTypeInput} 
                        onInputChange={setEventTypeInput}
                        onAddOrUpdate={() => handleUpdate('eventTypes', eventTypeInput, setEventTypeInput, profile.eventTypes || [], editingEventType, setEditingEventType)}
                        onEdit={(cat) => { setEditingEventType(cat); setEventTypeInput(cat); }}
                        onDelete={(cat) => confirm(`Hapus "${cat}"?`) && handleCategoryUpdate('eventTypes', (profile.eventTypes || []).filter(c => c !== cat))}
                        editingValue={editingEventType} 
                        onCancelEdit={() => { setEditingEventType(null); setEventTypeInput(''); }}
                    />
                </CollapsibleSection>
            </div>

            <CollapsibleSection 
                title="Manajemen Status Project" 
                defaultExpanded={true} 
                variant="filled"
                icon={<ListIcon className="w-4 h-4" />}
            >
                <ProjectStatusManager
                    config={profile.projectStatusConfig || []}
                    onConfigChange={(newConfig) => setProfile(p => ({ ...p, projectStatusConfig: newConfig }))}
                    projects={projects} profile={profile}
                    onAddDefaultStatuses={() => confirm('Gunakan status default?') && handleCategoryUpdate('projectStatusConfig', DEFAULT_STATUS_CONFIG as any)}
                />
            </CollapsibleSection>

            <CollapsibleSection 
                title="Template Checklist Pelanggan" 
                defaultExpanded={true} 
                variant="filled"
                icon={<CheckSquareIcon className="w-4 h-4" />}
            >
                <ChecklistTemplateSettings profile={profile} setProfile={setProfile} showNotification={showNotification} />
            </CollapsibleSection>
        </div>
    );
};
