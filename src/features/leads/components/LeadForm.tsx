import React from 'react';
import { ContactChannel } from '@/types';
import { LightbulbIcon, UserIcon, MapPinIcon, MessageSquareIcon } from '@/constants';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';

interface LeadFormProps {
    formData: any;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleCloseModal: () => void;
    modalMode: 'add' | 'edit';
}

export const LeadForm: React.FC<LeadFormProps> = ({ formData, handleFormChange, handleSubmit, handleCloseModal, modalMode }) => {
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-600/5 border border-blue-600/10 rounded-2xl p-5 mb-2">
                <h4 className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <LightbulbIcon className="w-4 h-4" />
                    Catatan Calon Pengantin
                </h4>
                <p className="text-xs text-brand-text-secondary leading-relaxed font-medium">
                    Gunakan formulir ini untuk mencatat data awal calon pengantin yang baru menghubungi. Data ini nantinya bisa dikonversi menjadi data pengantin tetap.
                </p>
            </div>

            <CollapsibleSection
                title="Data Calon Pengantin"
                defaultExpanded={true}
                variant="filled"
                icon={<UserIcon className="w-4 h-4" />}
                status={formData.name ? 'valid' : undefined}
            >
                <div className="space-y-4">
                    <div className="input-group">
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" placeholder="Nama Calon Pengantin" required />
                        <p className="text-[10px] text-brand-text-secondary mt-1 font-medium uppercase tracking-tighter">Masukkan nama lengkap sesuai identitas</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Sumber Kontak</label>
                            <select id="contactChannel" name="contactChannel" value={formData.contactChannel} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold">
                                {Object.values(ContactChannel).map(channel => <option key={channel} value={channel}>{channel}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">No. WhatsApp</label>
                            <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="08xxxxxxxx" />
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection
                title="Lokasi & Alamat"
                defaultExpanded={true}
                variant="filled"
                icon={<MapPinIcon className="w-4 h-4" />}
                status={formData.location || formData.address ? 'valid' : undefined}
            >
                <div className="space-y-4">
                    <div className="input-group">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Kota / Wilayah</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Cth: Bandung, Jakarta, dll" />
                    </div>

                    <div className="input-group">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Alamat Lengkap / Gedung</label>
                        <textarea id="address" name="address" value={formData.address} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px] resize-none" placeholder="Masukkan alamat lengkap atau nama venue rencana acara"></textarea>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection
                title="Catatan Tambahan"
                defaultExpanded={true}
                variant="filled"
                icon={<MessageSquareIcon className="w-4 h-4" />}
            >
                <div className="input-group">
                    <textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] resize-none" placeholder="Catat kebutuhan khusus, preferensi, atau informasi penting lainnya..."></textarea>
                </div>
            </CollapsibleSection>

            <div className="flex flex-col sm:row justify-end gap-3 pt-6 border-t border-brand-border">
                <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-xl font-bold text-brand-text-secondary hover:bg-brand-bg transition-colors order-2 sm:order-1">Batal</button>
                <button type="submit" className="px-10 py-3 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 order-1 sm:order-2">
                    {modalMode === 'add' ? 'Simpan Calon Pengantin' : 'Update Calon Pengantin'}
                </button>
            </div>
        </form>
    );
};
