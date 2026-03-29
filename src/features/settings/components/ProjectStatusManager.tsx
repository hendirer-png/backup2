import React, { useState } from 'react';
import Modal from '@/shared/ui/Modal';
import { PencilIcon, PlusIcon, Trash2Icon } from '@/constants';
import { ProjectStatusConfig, SubStatusConfig, Project, Profile } from '@/types';
import { upsertProfile } from '@/services/profile';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';

interface ProjectStatusManagerProps {
    config: ProjectStatusConfig[];
    onConfigChange: (newConfig: ProjectStatusConfig[]) => void;
    projects: Project[];
    profile: Profile;
    onAddDefaultStatuses?: () => void;
}

export const ProjectStatusManager: React.FC<ProjectStatusManagerProps> = ({ config, onConfigChange, projects, profile, onAddDefaultStatuses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedStatus, setSelectedStatus] = useState<ProjectStatusConfig | null>(null);

    const initialFormState = {
        name: '', color: '#64748b', note: '',
        defaultProgress: undefined as number | undefined,
        subStatuses: [] as SubStatusConfig[],
    };
    const [form, setForm] = useState(initialFormState);

    const handleOpenModal = (mode: 'add' | 'edit', status?: ProjectStatusConfig) => {
        setModalMode(mode);
        if (mode === 'edit' && status) {
            setSelectedStatus(status);
            setForm({
                name: status.name, color: status.color, note: status.note,
                defaultProgress: (status as any).defaultProgress,
                subStatuses: [...status.subStatuses],
            });
        } else {
            setSelectedStatus(null);
            setForm(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'defaultProgress') {
            const num = value === '' ? undefined : Math.max(0, Math.min(100, Math.round(Number(value))));
            setForm(prev => ({ ...prev, [name]: num }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubStatusChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newSubStatuses = [...form.subStatuses];
        newSubStatuses[index] = { ...newSubStatuses[index], [name]: value };
        setForm(prev => ({ ...prev, subStatuses: newSubStatuses }));
    };

    const addSubStatus = () => setForm(prev => ({ ...prev, subStatuses: [...prev.subStatuses, { name: '', note: '' }] }));
    const removeSubStatus = (index: number) => {
        const newSubStatuses = [...form.subStatuses];
        newSubStatuses.splice(index, 1);
        setForm(prev => ({ ...prev, subStatuses: newSubStatuses }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let updatedConfig: ProjectStatusConfig[];
        if (modalMode === 'add') {
            const newStatus: ProjectStatusConfig = { id: crypto.randomUUID(), ...form, subStatuses: form.subStatuses.filter(s => s.name.trim() !== '') };
            updatedConfig = [...config, newStatus];
        } else {
            updatedConfig = config.map(s => s.id === selectedStatus?.id ? { ...s, ...form, subStatuses: form.subStatuses.filter(sub => sub.name.trim() !== '') } : s);
        }
        onConfigChange(updatedConfig);
        try {
            await upsertProfile({ id: profile.id, projectStatusConfig: updatedConfig } as any);
        } catch (err: any) {
            alert('Gagal menyimpan Progres: ' + (err?.message || 'Coba lagi.'));
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (statusId: string) => {
        const status = config.find(s => s.id === statusId);
        if (!status) return;
        if (projects.some(p => p.status === status.name)) { alert(`Status "${status.name}" sedang digunakan.`); return; }
        if (window.confirm(`Hapus status "${status.name}"?`)) {
            const newConfig = config.filter(s => s.id !== statusId);
            onConfigChange(newConfig);
            try { await upsertProfile({ id: profile.id, projectStatusConfig: newConfig } as any); }
            catch (err: any) { alert('Gagal menghapus: ' + (err?.message || 'Coba lagi.')); }
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                <h3 className="text-sm md:text-lg font-semibold text-brand-text-light">Manajemen Progres Acara Pernikahan Pengantin</h3>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {onAddDefaultStatuses && <button onClick={onAddDefaultStatuses} className="button-secondary inline-flex items-center gap-2 text-sm md:text-base">+ Tambah dari saran default</button>}
                    <button onClick={() => handleOpenModal('add')} className="button-primary inline-flex items-center gap-2 w-full sm:w-auto text-sm md:text-base"><PlusIcon className="w-4 h-4 md:w-5 md:h-5" /> Tambah Status</button>
                </div>
            </div>
            <div className="space-y-3 md:space-y-4">
                {config.map(status => (
                    <div key={status.id} className="p-4 bg-white border border-brand-border/60 rounded-xl shadow-sm transition-all hover:border-brand-accent/30">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 md:gap-3">
                                <span className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }}></span>
                                <span className="font-semibold text-sm md:text-base text-brand-text-light">{status.name}</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <button onClick={() => handleOpenModal('edit', status)} className="p-1.5 md:p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"><PencilIcon className="w-4 h-4 md:w-5 md:h-5" /></button>
                                <button onClick={() => handleDelete(status.id)} className="p-1.5 md:p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"><Trash2Icon className="w-4 h-4 md:w-5 md:h-5" /></button>
                            </div>
                        </div>
                        {status.subStatuses.length > 0 && (
                            <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-brand-border/50 pl-5 md:pl-7 space-y-1.5 md:space-y-2">
                                {status.subStatuses.map((sub, index) => (
                                    <div key={index}><p className="text-xs md:text-sm font-medium text-brand-text-primary">{sub.name}</p><p className="text-[10px] md:text-xs text-brand-text-secondary">{sub.note}</p></div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Status Baru' : `Edit Status: ${selectedStatus?.name}`} size="2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CollapsibleSection title="Identitas Status" defaultExpanded={true} variant="filled">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nama Status</label>
                                    <input type="text" id="name" name="name" value={form.name} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" required placeholder="Cth: Editing" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Warna</label>
                                    <input type="color" id="color" name="color" value={form.color} onChange={handleFormChange} className="w-full h-12 p-1 rounded-2xl border border-brand-border bg-white cursor-pointer" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Default Progres (%)</label>
                                    <input type="number" min={0} max={100} id="defaultProgress" name="defaultProgress" value={form.defaultProgress ?? ''} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="0-100" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Catatan / Deskripsi</label>
                                <textarea id="note" name="note" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px] resize-none" placeholder="Deskripsi progres status ini..."></textarea>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Hierarki Sub-Status" defaultExpanded={true} variant="filled">
                        <div className="space-y-4">
                            <p className="text-[10px] text-brand-text-secondary font-medium uppercase tracking-wider">Tambahkan langkah-langkah detail untuk status ini.</p>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {form.subStatuses.map((sub, index) => (
                                    <div key={index} className="p-4 bg-white border border-brand-border rounded-2xl shadow-sm space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">{index + 1}</div>
                                            <input type="text" name="name" value={sub.name} onChange={e => handleSubStatusChange(index, e)} placeholder="Nama Sub-Status (Cth: Sortir Foto)" className="flex-grow px-3 py-2 rounded-xl border border-brand-border text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
                                            <button type="button" onClick={() => removeSubStatus(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                                <Trash2Icon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="pl-11">
                                            <input type="text" name="note" value={sub.note} onChange={e => handleSubStatusChange(index, e)} placeholder="Catatan tambahan (Cth: Max 2x revisi)" className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-bg/30 text-xs focus:ring-2 focus:ring-blue-500 transition-all" />
                                        </div>
                                    </div>
                                ))}
                                {form.subStatuses.length === 0 && (
                                    <div className="text-center py-6 border-2 border-dashed border-brand-border rounded-2xl">
                                        <p className="text-xs text-brand-text-secondary font-medium">Belum ada sub-status.</p>
                                    </div>
                                )}
                            </div>
                            <button type="button" onClick={addSubStatus} className="w-full py-3 border-2 border-dashed border-brand-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text-secondary hover:border-blue-500 hover:text-blue-600 transition-all">+ Tambah Sub-Status Baru</button>
                        </div>
                    </CollapsibleSection>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-brand-border/10">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-brand-text-secondary hover:bg-brand-bg transition-all border border-brand-border/30">Batal</button>
                        <button type="submit" className="px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95">
                            {modalMode === 'add' ? 'Simpan' : 'Update'}
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};
