import React, { useMemo } from 'react';
import RupiahInput from '@/shared/form/RupiahInput';
import { Package, AddOn, Profile, Card, PromoCode, ClientType } from '@/types';
import { formatCurrency } from '@/features/leads/utils/leads.utils';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';

interface ConvertLeadFormProps {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleCloseModal: () => void;
    packages: Package[];
    addOns: AddOn[];
    userProfile: Profile;
    cards: Card[];
    promoCodes: PromoCode[];
}

export const ConvertLeadForm: React.FC<ConvertLeadFormProps> = ({
    formData, setFormData, handleFormChange, handleSubmit, handleCloseModal,
    packages, addOns, userProfile, cards, promoCodes
}) => {
    const priceCalculations = useMemo(() => {
        const selectedPackage = packages.find(p => p.id === formData.packageId);
        const packagePrice = selectedPackage?.price || 0;
        const addOnsPrice = addOns.filter(a => formData.selectedAddOnIds.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
        let totalProjectBeforeDiscount = packagePrice + addOnsPrice;
        let discountAmount = 0;
        let discountApplied = 'N/A';
        const promoCode = promoCodes.find(p => p.id === formData.promoCodeId);
        if (promoCode) {
            if (promoCode.discountType === 'percentage') { discountAmount = (totalProjectBeforeDiscount * promoCode.discountValue) / 100; discountApplied = `${promoCode.discountValue}%`; }
            else { discountAmount = promoCode.discountValue; discountApplied = formatCurrency(promoCode.discountValue); }
        }
        const totalProject = totalProjectBeforeDiscount - discountAmount;
        const remainingPayment = totalProject - Number(formData.dp);
        return { packagePrice, addOnsPrice, totalProject, remainingPayment, discountAmount, discountApplied };
    }, [formData.packageId, formData.selectedAddOnIds, formData.dp, formData.promoCodeId, packages, addOns, promoCodes]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Client Info */}
            <CollapsibleSection
                title="Informasi Pengantin"
                defaultExpanded={true}
                variant="filled"
                status={formData.clientName && formData.phone ? 'valid' : undefined}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Nama Pengantin</label>
                            <input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" placeholder="Nama Lengkap" required />
                        </div>
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Jenis Pengantin</label>
                            <select id="clientType" name="clientType" value={formData.clientType} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" required>
                                {Object.values(ClientType).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Nomor Telepon</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="08xxxxxxxx" required />
                        </div>
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">No. WhatsApp</label>
                            <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp || ''} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="Nama Kontak WA" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="email@contoh.com" required />
                        </div>
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Instagram</label>
                            <input type="text" id="instagram" name="instagram" value={formData.instagram} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="@username" />
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Section 2: Project Info */}
            <CollapsibleSection
                title="Informasi Acara Pernikahan"
                defaultExpanded={true}
                variant="filled"
                status={formData.projectName && formData.date ? 'valid' : undefined}
            >
                <div className="space-y-4">
                    <div className="input-group">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Nama Acara Pernikahan</label>
                        <input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" placeholder="Wedding Budi & Siti" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Jenis Acara</label>
                            <select id="projectType" name="projectType" value={formData.projectType} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" required>
                                <option value="" disabled>Pilih Jenis...</option>
                                {userProfile.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Tanggal Acara</label>
                            <input type="date" id="date" name="date" value={formData.date} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Lokasi / Venue</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Nama Gedung / Kota" />
                    </div>

                    <div className="input-group">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Alamat Lengkap</label>
                        <textarea id="address" name="address" value={formData.address} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px] resize-none" placeholder="Masukkan alamat lengkap lokasi acara"></textarea>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Section 3: Financial & Package */}
            <CollapsibleSection
                title="Detail Package & Pembayaran"
                defaultExpanded={true}
                variant="filled"
                status={formData.packageId ? 'valid' : undefined}
                statusText={priceCalculations.totalProject > 0 ? formatCurrency(priceCalculations.totalProject) : undefined}
            >
                <div className="space-y-6">
                    <div className="input-group">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Pilih Package</label>
                        <select id="packageId" name="packageId" value={formData.packageId} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" required>
                            <option value="">Pilih Package...</option>
                            {packages.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary flex items-center justify-between">
                            Tambah Add-On
                            <span className="text-[10px] font-normal text-brand-text-secondary normal-case italic">Pilih sesuai kebutuhan pengantin</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {addOns.map(addon => (
                                <label key={addon.id} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedAddOnIds.includes(addon.id) ? 'border-blue-500 bg-blue-50/10' : 'border-brand-border hover:bg-white'}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id={addon.id} name="addOns" checked={formData.selectedAddOnIds.includes(addon.id)} onChange={handleFormChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                                        <span className="text-xs font-bold text-brand-text-light">{addon.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-brand-text-secondary">{formatCurrency(addon.price)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-4">
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Kode Promo</label>
                                <select id="promoCodeId" name="promoCodeId" value={formData.promoCodeId} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-emerald-50/5 text-brand-text-primary focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold">
                                    <option value="">Tanpa Kode Promo</option>
                                    {promoCodes.filter(p => p.isActive).map(p => (
                                        <option key={p.id} value={p.id}>{p.code} ({p.discountType === 'percentage' ? `${p.discountValue}%` : formatCurrency(p.discountValue)})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <div className="input-group">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Uang DP</label>
                                    <RupiahInput id="dp" name="dp" value={String(formData.dp ?? '')} onChange={(raw) => setFormData((prev: any) => ({ ...prev, dp: raw }))} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white/5 font-black text-blue-600 text-right text-lg" placeholder="0" />
                                </div>
                                {Number(formData.dp) > 0 && (
                                    <div className="input-group">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Kartu Tujuan DP</label>
                                        <select name="dpDestinationCardId" value={formData.dpDestinationCardId} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white" required>
                                            <option value="">Setor DP ke...</option>
                                            {cards.map(c => <option key={c.id} value={c.id}>{c.bankName} {c.lastFourDigits !== 'CASH' ? `**** ${c.lastFourDigits}` : '(Tunai)'}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-brand-surface rounded-[2rem] border border-brand-border space-y-4 shadow-sm h-full flex flex-col justify-center">
                            <div className="flex justify-between items-center text-xs text-brand-text-secondary font-bold uppercase tracking-wider">
                                <span>Subtotal</span>
                                <span>{formatCurrency(priceCalculations.packagePrice + priceCalculations.addOnsPrice)}</span>
                            </div>
                            {priceCalculations.discountAmount > 0 && (
                                <div className="flex justify-between items-center text-xs text-emerald-500 font-black uppercase tracking-wider">
                                    <span>Potongan Promo</span>
                                    <span>-{formatCurrency(priceCalculations.discountAmount)}</span>
                                </div>
                            )}
                            <div className="h-px bg-brand-border/30 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-brand-text-secondary text-gradient">Total Akhir</span>
                                <span className="text-xl font-black text-brand-text-light">{formatCurrency(priceCalculations.totalProject)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-brand-border/10">
                                <span className="text-xs font-bold text-brand-text-secondary">Sisa Tagihan</span>
                                <span className="text-base font-black text-red-500">{formatCurrency(priceCalculations.remainingPayment)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Catatan Tambahan</label>
                        <textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px] resize-none" placeholder="Catatan khusus..."></textarea>
                    </div>
                </div>
            </CollapsibleSection>

            <div className="flex justify-end items-center gap-3 pt-8 border-t border-brand-border">
                <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-xl font-bold text-brand-text-secondary hover:bg-brand-bg transition-colors">Batal</button>
                <button type="submit" className="px-10 py-3 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                    Konversi Calon Pengantin
                </button>
            </div>
        </form>
    );
};
