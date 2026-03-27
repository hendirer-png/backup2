import React from 'react';
import { Profile } from '@/types';
import { toBase64 } from '@/features/settings/utils/settings.utils';
import { HomeIcon, PhoneIcon, MapPinIcon, LinkIcon, MailIcon, ImageIcon, CheckCircleIcon, PencilIcon } from '@/constants';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';

interface ProfileSettingsTabProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    handleProfileSubmit: (e: React.FormEvent) => void;
    isSaving: boolean;
    showSuccess: boolean;
    saveError: string;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({ profile, setProfile, handleProfileSubmit, isSaving, showSuccess, saveError }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoBase64' | 'signatureBase64') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { alert("Maksimal 2MB"); return; }
            const b64 = await toBase64(file);
            setProfile(prev => ({ ...prev, [field]: b64 }));
        }
    };

    return (
        <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-4xl mx-auto">
            <CollapsibleSection title="Informasi Vendor" defaultExpanded={true} variant="filled" icon={<HomeIcon className="w-5 h-5" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nama Perusahaan / Vendor</label>
                        <div className="relative group">
                            <HomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary group-focus-within:text-blue-500 transition-colors" />
                            <input name="companyName" value={profile.companyName} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" placeholder="Nama Vendor" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">No. WhatsApp Bisnis</label>
                        <div className="relative group">
                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary group-focus-within:text-blue-500 transition-colors" />
                            <input name="phone" value={profile.phone} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="08xxxxxxxx" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Email Bisnis</label>
                        <div className="relative group">
                            <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary group-focus-within:text-blue-500 transition-colors" />
                            <input name="email" value={profile.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="email@vendor.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Website / Portofolio</label>
                        <div className="relative group">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary group-focus-within:text-blue-500 transition-colors" />
                            <input name="website" value={profile.website} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="www.vendor.com" />
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Alamat Kantor</label>
                        <div className="relative group">
                            <MapPinIcon className="absolute left-4 top-4 w-5 h-5 text-brand-text-secondary group-focus-within:text-blue-500 transition-colors" />
                            <textarea name="address" value={profile.address} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none" placeholder="Alamat lengkap kantor..."></textarea>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CollapsibleSection title="Logo Studio" defaultExpanded={true} variant="filled" icon={<ImageIcon className="w-5 h-5" />}>
                    <div className="flex flex-col items-center gap-6 p-2">
                        <div className="w-40 h-40 rounded-3xl bg-white border-2 border-dashed border-brand-border flex items-center justify-center overflow-hidden shadow-inner group hover:border-blue-500 transition-colors">
                            {profile.logoBase64 ? (
                                <img src={profile.logoBase64} alt="Logo" className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-brand-text-secondary opacity-30" />
                            )}
                        </div>
                        <input type="file" onChange={e => handleFileChange(e, 'logoBase64')} className="hidden" id="logo-upload" accept="image/*" />
                        <label htmlFor="logo-upload" className="button-secondary px-8 py-3 rounded-xl cursor-pointer text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Ganti Logo
                        </label>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Tanda Tangan Digital" defaultExpanded={true} variant="filled" icon={<PencilIcon className="w-5 h-5" />}>
                    <div className="flex flex-col items-center gap-6 p-2">
                        <div className="w-40 h-40 rounded-3xl bg-white border-2 border-dashed border-brand-border flex items-center justify-center overflow-hidden shadow-inner group hover:border-blue-500 transition-colors">
                            {profile.signatureBase64 ? (
                                <img src={profile.signatureBase64} alt="TTD" className="w-full h-full object-contain filter invert opacity-80 group-hover:scale-110 transition-transform" />
                            ) : (
                                <PencilIcon className="w-12 h-12 text-brand-text-secondary opacity-30" />
                            )}
                        </div>
                        <input type="file" onChange={e => handleFileChange(e, 'signatureBase64')} className="hidden" id="sig-upload" accept="image/*" />
                        <label htmlFor="sig-upload" className="button-secondary px-8 py-3 rounded-xl cursor-pointer text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <PencilIcon className="w-4 h-4" />
                            Ganti TTD
                        </label>
                    </div>
                </CollapsibleSection>
            </div>

            {saveError && <div className="p-4 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-bold text-center animate-in fade-in duration-300">{saveError}</div>}
            {showSuccess && <div className="p-4 rounded-2xl bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-4 duration-300"><CheckCircleIcon className="w-5 h-5" /> Perubahan berhasil disimpan!</div>}

            <div className="flex justify-center pt-8 sticky bottom-4 z-10">
                <button type="submit" disabled={isSaving} className="button-primary py-5 px-16 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>

    );
};
