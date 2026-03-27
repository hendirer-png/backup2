import React, { useState, useMemo } from 'react';
import RupiahInput from '@/shared/form/RupiahInput';
import { ClientType, Package, AddOn, Profile, Card, PromoCode } from '@/types';
import { formatCurrency } from '@/features/clients/utils/clients.utils';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';

import { ClientFormProps } from '@/features/clients/types';

const ClientForm: React.FC<ClientFormProps> = ({ 
    isOpen,
    formData, 
    setFormData, 
    onChange, 
    onSubmit, 
    onClose, 
    packages, 
    addOns, 
    mode, 
    cards, 
    promoCodes,
    userProfile
}) => {
    if (!isOpen) return null;
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    // Get unique regions from packages
    const availableRegions = useMemo(() => {
        const regions = packages
            .map(p => p.region)
            .filter((r): r is string => !!r);
        return Array.from(new Set(regions));
    }, [packages]);

    // Filter packages by selected region
    const visiblePackages = useMemo(() => {
        if (!selectedRegion) return packages;
        return packages.filter(p => p.region === selectedRegion);
    }, [packages, selectedRegion]);

    // Filter add-ons by selected region
    const visibleAddOns = useMemo(() => {
        if (!selectedRegion) return addOns;
        return addOns.filter(a => !a.region || a.region === selectedRegion);
    }, [addOns, selectedRegion]);

    const priceCalculations = useMemo(() => {
        const selectedPackage = packages.find(p => p.id === formData.packageId);
        // Prefer explicit unitPrice stored in form (selected duration), fallback to package.price
        const packagePrice = (formData.unitPrice && Number(formData.unitPrice) > 0) ? Number(formData.unitPrice) : (selectedPackage?.price || 0);

        const addOnsPrice = addOns
            .filter(addon => formData.selectedAddOnIds.includes(addon.id))
            .reduce((sum, addon) => sum + addon.price, 0);

        let totalProjectBeforeDiscount = packagePrice + addOnsPrice;
        let discountAmount = 0;
        let discountApplied = 'N/A';
        const promoCode = promoCodes.find(p => p.id === formData.promoCodeId);

        if (promoCode) {
            if (promoCode.discountType === 'percentage') {
                discountAmount = (totalProjectBeforeDiscount * promoCode.discountValue) / 100;
                discountApplied = `${promoCode.discountValue}%`;
            } else { // fixed
                discountAmount = promoCode.discountValue;
                discountApplied = formatCurrency(promoCode.discountValue);
            }
        }

        const totalProject = totalProjectBeforeDiscount - discountAmount;
        const remainingPayment = totalProject - Number(formData.dp);

        return { packagePrice, addOnsPrice, totalProject, remainingPayment, discountAmount, discountApplied };
    }, [formData.packageId, formData.selectedAddOnIds, formData.dp, formData.promoCodeId, packages, addOns, promoCodes, formData.unitPrice]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-brand-bg rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-brand-border/20 animate-in zoom-in-95 duration-300">
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-brand-border/10">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tight text-gradient">
                            {mode === 'add' ? 'Tambah Pengantin Baru' : 'Edit Data Pengantin'}
                        </h3>
                        <p className="text-xs text-brand-text-secondary mt-1 font-medium italic">Silakan lengkapi data administratif pengantin di bawah ini</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-brand-surface hover:bg-brand-bg hover:text-red-500 rounded-full transition-all border border-brand-border/30 hover:border-red-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-none">
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Section 1: Client Info */}
                        <CollapsibleSection
                            title="Informasi Pengantin"
                            defaultExpanded={true}
                            variant="filled"
                            status={formData.clientName && formData.phone ? 'valid' : undefined}
                        >
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nama Pengantin</label>
                                        <input type="text" name="clientName" value={formData.clientName} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" placeholder="Nama Lengkap" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Jenis Pengantin</label>
                                        <select name="clientType" value={formData.clientType} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" required>
                                            {Object.values(ClientType).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nomor Telepon</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="08xxxxxxxx" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">No. WhatsApp</label>
                                        <input type="tel" name="whatsapp" value={formData.whatsapp || ''} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="Nama Kontak WA" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Instagram</label>
                                        <input type="text" name="instagram" value={formData.instagram || ''} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="@username" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="email@contoh.com" required />
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
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nama Acara Pernikahan</label>
                                    <input type="text" name="projectName" value={formData.projectName} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" placeholder="Contoh: Wedding Budi & Siti" required />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Jenis Acara</label>
                                        <select name="projectType" value={formData.projectType || ''} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" required>
                                            <option value="" disabled>Pilih Jenis...</option>
                                            {userProfile.projectTypes?.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Tanggal Acara</label>
                                        <input type="date" name="date" value={formData.date} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Lokasi / Venue</label>
                                    <input type="text" name="location" value={formData.location} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Nama Gedung / Kota" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Alamat Lengkap</label>
                                    <textarea name="address" value={formData.address || ''} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] resize-none" placeholder="Alamat lengkap lokasi acara"></textarea>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {availableRegions.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Wilayah Layanan</label>
                                            <select 
                                                value={selectedRegion || ''} 
                                                onChange={(e) => {
                                                    setSelectedRegion(e.target.value || null);
                                                    setFormData({ ...formData, packageId: '', selectedAddOnIds: [] });
                                                }} 
                                                className="w-full px-4 py-3 rounded-2xl border border-blue-100 bg-blue-50/10 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                                            >
                                                <option value="">Semua Wilayah</option>
                                                {availableRegions.map(region => (
                                                    <option key={region} value={region}>{region}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Pilih Package</label>
                                        <select name="packageId" value={formData.packageId} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold" required>
                                            <option value="">Pilih Package...</option>
                                            {visiblePackages.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}{p.region ? ` (${p.region})` : ''} - {formatCurrency(p.price)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Duration selector */}
                                {(() => {
                                    const pkg = packages.find(p => p.id === formData.packageId);
                                    if (pkg && pkg.durationOptions && pkg.durationOptions.length > 0) {
                                        return (
                                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Pilih Durasi</label>
                                                <select name="durationSelection" value={formData.durationSelection || ''} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold">
                                                    <option value="">Pilih Durasi...</option>
                                                    {pkg.durationOptions.map((opt, idx) => <option key={idx} value={opt.label}>{opt.label} — {formatCurrency(opt.price)}</option>)}
                                                </select>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary flex items-center justify-between">
                                        Tambah Add-On
                                        <span className="text-[10px] font-normal text-brand-text-secondary normal-case italic">Pilih sesuai kebutuhan pengantin</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                        {visibleAddOns.map(addon => (
                                            <label key={addon.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.selectedAddOnIds.includes(addon.id) ? 'border-blue-500 bg-blue-50/10' : 'border-brand-border/30 bg-brand-bg hover:border-brand-accent/30'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" checked={formData.selectedAddOnIds.includes(addon.id)} onChange={onChange} name="addOns" id={addon.id} className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-brand-border" />
                                                    <span className="text-sm font-bold text-brand-text-light">{addon.name}</span>
                                                </div>
                                                <span className="text-xs font-black text-brand-text-secondary">{formatCurrency(addon.price)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Kode Promo</label>
                                            <select name="promoCodeId" value={formData.promoCodeId || ''} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-emerald-50/5 text-brand-text-primary focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold">
                                                <option value="">Tidak ada promo</option>
                                                {promoCodes.filter(p => p.isActive).map(p => (
                                                    <option key={p.id} value={p.id}>{p.code} ({p.discountType === 'percentage' ? `${p.discountValue}%` : formatCurrency(p.discountValue)})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Uang DP</label>
                                            <RupiahInput
                                                id="dp"
                                                name="dp"
                                                value={String(formData.dp ?? '')}
                                                onChange={(raw) => setFormData((prev: any) => ({ ...prev, dp: raw }))}
                                                className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 font-black text-blue-600 text-right text-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Kartu Tujuan DP</label>
                                            <select name="dpDestinationCardId" value={formData.dpDestinationCardId || ''} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary font-semibold" required={Number(formData.dp) > 0}>
                                                <option value="">Pilih Kartu...</option>
                                                {cards.map(c => <option key={c.id} value={c.id}>{c.bankName} - {c.lastFourDigits}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-brand-surface rounded-[2rem] border border-brand-border space-y-4 shadow-sm h-full flex flex-col justify-center">
                                        <div className="flex justify-between items-center text-xs text-brand-text-secondary font-bold uppercase tracking-wider">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(priceCalculations.totalProject + priceCalculations.discountAmount)}</span>
                                        </div>
                                        {priceCalculations.discountAmount > 0 && (
                                            <div className="flex justify-between items-center text-xs text-emerald-500 font-black uppercase tracking-wider">
                                                <span>Potongan Promo ({priceCalculations.discountApplied})</span>
                                                <span>-{formatCurrency(priceCalculations.discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-brand-border/30 my-2"></div>
                                        <div className="flex justify-between items-center group">
                                            <span className="text-sm font-bold text-brand-text-secondary group-hover:text-brand-text-primary transition-colors">Total Akhir</span>
                                            <span className="text-xl font-black text-gradient">{formatCurrency(priceCalculations.totalProject)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-xs font-bold text-brand-text-secondary">Sisa Tagihan</span>
                                            <span className="text-base font-black text-red-500">{formatCurrency(priceCalculations.remainingPayment)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Catatan Khusus Paket/Pembayaran</label>
                                    <textarea name="notes" value={formData.notes || ''} onChange={onChange} className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-white/5 text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px] resize-none" placeholder="Catatan khusus..."></textarea>
                                </div>
                            </div>
                        </CollapsibleSection>
                    </form>
                </div>

                <div className="p-6 md:p-8 bg-brand-surface/50 border-t border-brand-border/10 flex flex-col md:flex-row justify-end items-stretch md:items-center gap-4">
                    <button type="button" onClick={onClose} className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-brand-text-secondary hover:bg-brand-bg transition-all active:scale-95 border border-brand-border/30">
                        Batal
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onSubmit(e as any); }} className="px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95">
                        {mode === 'add' ? 'Simpan Data Pengantin' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export { ClientForm };
