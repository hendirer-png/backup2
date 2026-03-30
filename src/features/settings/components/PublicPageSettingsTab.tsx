import React from 'react';
import { Profile, TimelineStep } from '@/types';
import { LayoutGridIcon, PlusIcon, TrashIcon, CheckCircleIcon } from '@/constants';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';

interface PublicPageSettingsTabProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    handleProfileSubmit: (e: React.FormEvent) => void;
    isSaving: boolean;
    showSuccess: boolean;
    saveError: string;
}

const DEFAULT_TIMELINE: TimelineStep[] = [
    { id: '1', t: "Konsep & Konsultasi", d: "H-90 • Mematangkan visi hari bahagia Anda bersama tim kami." },
    { id: '2', t: "Pemilihan Vendor & Detail", d: "H-60 • Kurasi terbaik untuk setiap aspek dokumentasi." },
    { id: '3', t: "Technical Meeting", d: "H-14 • Memastikan setiap detail berjalan sempurna." },
    { id: '4', t: "The Wedding Day", d: "Hari H • Kami mengabadikan setiap emosi dengan tulus." },
    { id: '5', t: "Final Handover", d: "H+30 • Hasil karya terbaik sampai di tangan Anda." }
];

export const PublicPageSettingsTab: React.FC<PublicPageSettingsTabProps> = ({ 
    profile, setProfile, handleProfileSubmit, isSaving, showSuccess, saveError 
}) => {
    
    const timeline = profile.publicPageConfig?.timeline || DEFAULT_TIMELINE;

    const handleTimelineChange = (index: number, field: 't' | 'd', value: string) => {
        const newTimeline = [...timeline];
        newTimeline[index] = { ...newTimeline[index], [field]: value };
        setProfile(prev => ({
            ...prev,
            publicPageConfig: {
                ...prev.publicPageConfig,
                timeline: newTimeline
            }
        }));
    };

    const addStep = () => {
        const newStep: TimelineStep = {
            id: Math.random().toString(36).substr(2, 9),
            t: "Langkah Baru",
            d: "Deskripsi langkah baru..."
        };
        setProfile(prev => ({
            ...prev,
            publicPageConfig: {
                ...prev.publicPageConfig,
                timeline: [...timeline, newStep]
            }
        }));
    };

    const removeStep = (index: number) => {
        const newTimeline = timeline.filter((_, i) => i !== index);
        setProfile(prev => ({
            ...prev,
            publicPageConfig: {
                ...prev.publicPageConfig,
                timeline: newTimeline
            }
        }));
    };

    const handleIntroChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setProfile(prev => ({
            ...prev,
            publicPageConfig: {
                ...prev.publicPageConfig,
                introduction: e.target.value
            }
        }));
    };

    return (
        <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-4xl mx-auto">
            <CollapsibleSection 
                title="Halaman Publik & Portfolio" 
                defaultExpanded={true} 
                variant="filled" 
                icon={<LayoutGridIcon className="w-5 h-5" />}
            >
                <div className="space-y-8 p-2">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Pesan Pengantar (Introduction)</label>
                        <textarea 
                            value={profile.publicPageConfig?.introduction || ''} 
                            onChange={handleIntroChange}
                            className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                            placeholder="Tulis pesan pengantar singkat untuk calon pengantin..."
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Timeline & Workflow</label>
                            <button 
                                type="button" 
                                onClick={addStep}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors"
                            >
                                <PlusIcon className="w-3 h-3" />
                                Tambah Langkah
                            </button>
                        </div>

                        <div className="space-y-4">
                            {timeline.map((step, index) => (
                                <div key={step.id || index} className="group relative bg-brand-bg-light/50 border border-brand-border rounded-2xl p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5">
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-accent text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                                        {index + 1}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 space-y-2">
                                            <input 
                                                value={step.t} 
                                                onChange={(e) => handleTimelineChange(index, 't', e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-accent outline-none font-bold text-sm"
                                                placeholder="Judul (Contoh: H-90 • Konsep)"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex gap-4 items-start">
                                            <textarea 
                                                value={step.d} 
                                                onChange={(e) => handleTimelineChange(index, 'd', e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-accent outline-none text-sm h-20 md:h-12 resize-none"
                                                placeholder="Deskripsi singkat proses..."
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeStep(index)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {saveError && <div className="p-4 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-bold text-center">{saveError}</div>}
            {showSuccess && <div className="p-4 rounded-2xl bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-bold text-center flex items-center justify-center gap-2"><CheckCircleIcon className="w-5 h-5" /> Perubahan berhasil disimpan!</div>}

            <div className="flex justify-center pt-8 sticky bottom-4 z-10">
                <button type="submit" disabled={isSaving} className="button-primary py-5 px-16 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    );
};
