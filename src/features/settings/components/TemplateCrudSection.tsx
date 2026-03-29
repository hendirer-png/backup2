import React from 'react';
import { ChatTemplate } from '@/types';
import { TemplateVariable } from '@/features/settings/types';
import { PencilIcon, Trash2Icon, RefreshCwIcon, PlusIcon } from '@/constants';
import { escapeRegExp } from '@/features/settings/utils/settings.utils';

interface TemplateCrudSectionProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accentClass: string;
    chipClass: string;
    templates: ChatTemplate[];
    variableChips: TemplateVariable[];
    editingId: string | null;
    isAddingNew: boolean;
    formData: { title: string; template: string };
    formError: string;
    isSaving: boolean;
    previewId: string | null;
    onAddNew: () => void;
    onEdit: (t: ChatTemplate) => void;
    onDelete: (id: string) => void;
    onSave: () => void;
    onCancel: () => void;
    onReset: () => void;
    onPreviewToggle: (id: string) => void;
    onFormChange: (field: 'title' | 'template', val: string) => void;
    onInsertVar: (variable: string) => void;
    textareaId: string;
}

export const TemplateCrudSection: React.FC<TemplateCrudSectionProps> = ({
    title, subtitle, icon, accentClass, chipClass, templates, variableChips,
    editingId, isAddingNew, formData, formError, isSaving, previewId,
    onAddNew, onEdit, onDelete, onSave, onCancel, onReset, onPreviewToggle,
    onFormChange, onInsertVar, textareaId
}) => {
    const processPreview = (text: string) => {
        let p = text;
        const PREVIEW_VARS: Record<string, string> = {
            clientName: 'Budi & Ani',
            projectName: 'Wedding Budi & Ani',
            packageName: 'Gold Package',
            amountPaid: 'Rp 5.000.000',
            totalCost: 'Rp 10.000.000',
            sisaTagihan: 'Rp 5.000.000',
            portalLink: 'https://example.com/portal/abc123',
            projectDetails: '- Acara Pernikahan: *Wedding Budi & Ani*\n  Sisa Tagihan: Rp 5.000.000',
            totalDue: 'Rp 5.000.000',
            bankAccount: 'BCA 1234567890 a.n. Wedding Studio',
            companyName: 'Wedding Studio',
        };
        Object.entries(PREVIEW_VARS).forEach(([k, v]) => {
            p = p.replace(new RegExp(escapeRegExp(`{${k}}`), 'g'), v);
        });
        return p;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${accentClass} flex items-center justify-center shadow-lg shadow-black/10`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-brand-text-light">{title}</h3>
                        <p className="text-xs text-brand-text-secondary mt-1 max-w-md">{subtitle}</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={onReset} className="button-secondary py-2.5 px-4 rounded-xl text-sm font-bold flex items-center gap-2 flex-1 sm:flex-none">
                        <RefreshCwIcon className="w-4 h-4" /> Reset Default
                    </button>
                    <button onClick={onAddNew} className="button-primary py-2.5 px-4 rounded-xl text-sm font-bold flex items-center gap-2 flex-1 sm:flex-none">
                        <PlusIcon className="w-4 h-4" /> Tambah Baru
                    </button>
                </div>
            </div>

            {(isAddingNew || editingId) && (
                <div className="bg-brand-surface border-2 border-brand-accent/30 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <h4 className="text-lg font-bold text-brand-text-light mb-4 flex items-center gap-2">
                        {isAddingNew ? <PlusIcon className="w-5 h-5 text-brand-accent" /> : <PencilIcon className="w-5 h-5 text-brand-accent" />}
                        {isAddingNew ? 'Tambah Template Baru' : 'Edit Template'}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="input-group !mt-0">
                            <input type="text" value={formData.title} onChange={e => onFormChange('title', e.target.value)} className="input-field" placeholder=" " required />
                            <label className="input-label">Judul Template (misal: "Follow Up Penawaran")</label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-text-secondary ml-1">Pesan Template</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {variableChips.map(chip => (
                                    <button key={chip.label} onClick={() => onInsertVar(chip.label)} className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${chipClass} hover:scale-105 active:scale-95`} title={chip.desc}>
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                            <textarea id={textareaId} value={formData.template} onChange={e => onFormChange('template', e.target.value)} className="input-field min-h-[200px] font-mono text-sm leading-relaxed" placeholder="Tulis rincian pesan WhatsApp di sini..." />
                        </div>
                        {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed">{formError}</div>}
                        <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                            <button onClick={onCancel} className="button-secondary py-2.5 px-6 rounded-xl font-bold">Batal</button>
                            <button onClick={onSave} disabled={isSaving} className="button-primary py-2.5 px-8 rounded-xl font-bold shadow-lg shadow-brand-accent/20">
                                {isSaving ? 'Menyimpan...' : 'Simpan Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((t) => (
                    <div key={t.id} className="group bg-white border border-brand-border rounded-2xl p-5 hover:border-brand-accent/50 transition-all shadow-sm flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                            <h5 className="font-bold text-brand-text-light group-hover:text-brand-accent transition-colors">{t.title}</h5>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(t)} className="p-2 text-brand-text-secondary hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(t.id)} className="p-2 text-brand-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2Icon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="bg-brand-bg/40 border border-brand-border/40 rounded-xl p-4 flex-grow mb-4">
                            <p className="text-xs text-brand-text-secondary line-clamp-3 whitespace-pre-wrap leading-relaxed">{t.template}</p>
                        </div>
                        <button onClick={() => onPreviewToggle(t.id)} className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all border ${previewId === t.id ? 'bg-brand-accent text-white border-brand-accent' : 'bg-transparent text-brand-text-secondary border-brand-border hover:border-brand-text-secondary'}`}>
                            {previewId === t.id ? 'Tutup Preview' : 'Preview Hasil Pesan'}
                        </button>
                        {previewId === t.id && (
                            <div className="mt-3 p-4 bg-brand-surface rounded-xl border border-brand-accent/30 animate-in zoom-in-95 duration-200">
                                <p className="text-xs text-brand-text-light whitespace-pre-wrap leading-relaxed">{processPreview(t.template)}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {templates.length === 0 && <div className="text-center py-12 border-2 border-dashed border-brand-border rounded-3xl"><p className="text-brand-text-secondary font-medium">Belum ada template. Klik 'Tambah Baru' untuk memulai.</p></div>}
        </div>
    );
};
