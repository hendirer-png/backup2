import React from 'react';
import Modal from '@/shared/ui/Modal';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';
import { Contract, Client, Project } from '@/types';
import { FileTextIcon, CalendarIcon, UserCheckIcon, UsersIcon, BriefcaseIcon, DollarSignIcon } from '@/constants';

interface ContractFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    clients: Client[];
    availableProjects: Project[];
    selectedClientId: string;
    setSelectedClientId: (id: string) => void;
    selectedProjectId: string;
    setSelectedProjectId: (id: string) => void;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

export const ContractFormModal: React.FC<ContractFormModalProps> = ({
    isOpen,
    onClose,
    mode,
    formData,
    setFormData,
    clients,
    availableProjects,
    selectedClientId,
    setSelectedClientId,
    selectedProjectId,
    setSelectedProjectId,
    handleFormChange,
    handleSubmit
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Buat Kontrak Baru' : 'Edit Kontrak'} size="5xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-600/5 border border-blue-600/10 rounded-3xl p-6 shadow-sm mb-2">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <FileTextIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-brand-text-light tracking-tight">Pilih Klien & Proyek</h4>
                            <p className="text-[10px] font-black text-brand-text-secondary uppercase tracking-widest">Langkah pertama untuk membuat kontrak resmi</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Klien Utama</label>
                            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" required>
                                <option value="">Pilih Klien...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Project Terkait</label>
                            <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold disabled:opacity-50" required disabled={!selectedClientId}>
                                <option value="">{selectedClientId ? 'Pilih Proyek...' : 'Pilih Klien Dahulu'}</option>
                                {availableProjects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar px-1">
                    <CollapsibleSection title="Detail Penandatanganan" defaultExpanded={true} variant="filled" icon={<CalendarIcon className="w-5 h-5" />}>
                        <div className="space-y-6 p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Tanggal Penandatanganan</label>
                                    <input type="date" name="signingDate" value={formData.signingDate} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Lokasi Penandatanganan</label>
                                    <input type="text" name="signingLocation" value={formData.signingLocation} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Cth: Studio / Alamat Klien" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Judul Layanan Utama</label>
                                <input type="text" name="serviceTitle" value={formData.serviceTitle} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" placeholder="Contoh: JASA CORPORATE / EVENT / WEDDING" />
                            </div>
                        </div>
                    </CollapsibleSection>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CollapsibleSection title="Pihak Klien 1" defaultExpanded={true} variant="filled" icon={<UserCheckIcon className="w-5 h-5" />}>
                            <div className="space-y-4 p-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nama Lengkap Pihak I</label>
                                    <input type="text" name="clientName1" value={formData.clientName1} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" placeholder="Nama Klien 1" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">No. Telepon / WhatsApp</label>
                                    <input type="text" name="clientPhone1" value={formData.clientPhone1} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="08xxxxxxxx" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Alamat Korespondensi</label>
                                    <textarea name="clientAddress1" value={formData.clientAddress1} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px] resize-none" placeholder="Alamat lengkap..."></textarea>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Pihak Klien 2 (Opsional)" defaultExpanded={false} variant="filled" icon={<UsersIcon className="w-5 h-5" />}>
                            <div className="space-y-4 p-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nama Lengkap Pihak II</label>
                                    <input type="text" name="clientName2" value={formData.clientName2} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" placeholder="Nama Pasangan (Jika ada)" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">No. Telepon / WhatsApp</label>
                                    <input type="text" name="clientPhone2" value={formData.clientPhone2} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="08xxxxxxxx" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Alamat Korespondensi</label>
                                    <textarea name="clientAddress2" value={formData.clientAddress2} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px] resize-none" placeholder="Alamat lengkap..."></textarea>
                                </div>
                            </div>
                        </CollapsibleSection>
                    </div>

                    <CollapsibleSection title="Ruang Lingkup & Teknis" defaultExpanded={true} variant="filled" icon={<BriefcaseIcon className="w-5 h-5" />}>
                        <div className="space-y-6 p-2">
                            <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-200/50">
                                <div className="flex items-center gap-2 cursor-pointer group">
                                    <input id="includeMeterai" type="checkbox" checked={!!formData.includeMeterai} onChange={(e) => setFormData((prev: any) => ({ ...prev, includeMeterai: e.target.checked }))} className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 cursor-pointer" />
                                    <label htmlFor="includeMeterai" className="text-sm font-black text-brand-text-light group-hover:text-blue-600 transition-colors cursor-pointer">Gunakan Meterai (Rp 10.000)</label>
                                </div>
                                {!!formData.includeMeterai && (
                                    <div className="ml-auto flex gap-4 animate-in fade-in slide-in-from-left-4">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                                            <input type="radio" name="meteraiPlacement" value="client" checked={(formData.meteraiPlacement || 'client') === 'client'} onChange={() => setFormData((prev: any) => ({ ...prev, meteraiPlacement: 'client' }))} className="w-4 h-4 text-blue-600" />
                                            1 Sisi
                                        </label>
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                                            <input type="radio" name="meteraiPlacement" value="both" checked={formData.meteraiPlacement === 'both'} onChange={() => setFormData((prev: any) => ({ ...prev, meteraiPlacement: 'both' }))} className="w-4 h-4 text-blue-600" />
                                            2 Sisi
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2"><label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Durasi Liputan</label><input type="text" name="shootingDuration" value={formData.shootingDuration} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white" placeholder="Cth: 8 Jam" /></div>
                                <div className="space-y-2"><label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Output Foto</label><input type="text" name="guaranteedPhotos" value={formData.guaranteedPhotos} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white" placeholder="Cth: All Files" /></div>
                                <div className="space-y-2"><label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Album Fisik</label><input type="text" name="albumDetails" value={formData.albumDetails} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white" placeholder="Cth: 1 Album 20x30" /></div>
                                <div className="space-y-2"><label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Item Lain</label><input type="text" name="otherItems" value={formData.otherItems} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white" placeholder="..." /></div>
                                <div className="space-y-2"><label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Jumlah Personel</label><input type="text" name="personnelCount" value={formData.personnelCount} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white" placeholder="Cth: 2 Fotografer" /></div>
                                <div className="space-y-2"><label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Proses Editing</label><input type="text" name="deliveryTimeframe" value={formData.deliveryTimeframe} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white" placeholder="Cth: 30 Hari Kerja" /></div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Isi & Pasal Kontrak" defaultExpanded={false} variant="filled" icon={<FileTextIcon className="w-5 h-5" />}>
                        <div className="space-y-6 p-2">
                            <p className="text-[10px] text-brand-text-secondary font-medium italic">Sesuaikan narasi pasal kontrak di bawah ini jika diperlukan.</p>
                            <div className="space-y-6">
                                {['pasal1Content', 'pasal2Content', 'pasal3Content', 'pasal4Content', 'pasal5Content', 'closingText'].map((field, idx) => (
                                    <div key={field} className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-blue-600">{field === 'closingText' ? 'KALIMAT PENUTUP' : `PASAL ${idx + 1}`}</label>
                                        <textarea name={field} value={formData[field]} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-brand-bg/30 text-[11px] font-mono leading-relaxed min-h-[120px] focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Pembayaran & Hukum" defaultExpanded={true} variant="filled" icon={<DollarSignIcon className="w-5 h-5" />}>
                        <div className="space-y-6 p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Batas DP</label><input type="date" name="dpDate" value={formData.dpDate} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white font-mono" /></div>
                                <div className="space-y-2"><label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Batas Pelunasan</label><input type="date" name="finalPaymentDate" value={formData.finalPaymentDate} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white font-mono" /></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Kebijakan Pembatalan (Detail)</label>
                                <textarea name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white min-h-[100px]"></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Wilayah Hukum Penyelesaian Sengketa</label>
                                <input type="text" name="jurisdiction" value={formData.jurisdiction} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white font-bold" placeholder="Cth: Pengadilan Negeri Bandung" />
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-brand-border/10">
                    <button type="button" onClick={onClose} className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-brand-text-secondary hover:bg-brand-bg transition-all border border-brand-border/30">Batal</button>
                    <button type="submit" className="px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95">
                        {mode === 'add' ? 'Buat Kontrak' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </Modal>

    );
};
