import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PromoCode } from '@/types';
import PageHeader from '@/layouts/PageHeader';
import Modal from '@/shared/ui/Modal';
import { PlusIcon, PencilIcon, Trash2Icon, PackageIcon, DollarSignIcon, CalendarIcon } from '@/constants';
import { createPromoCode, updatePromoCode, deletePromoCode } from '@/services/promoCodes';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';
import { usePromoCodes } from '@/features/promo/api/usePromoQueries';
import { useProjects } from '@/features/projects/api/useProjects';
import { useApp } from "@/app/AppContext";


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const emptyFormState = {
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    isActive: true,
    maxUsage: '',
    expiryDate: ''
};

interface PromoCodesProps {
    hideHeader?: boolean;
}


export interface PromoCodesHandle {
    openAddModal: () => void;
}

const PromoCodes = forwardRef<PromoCodesHandle, PromoCodesProps>(({ hideHeader }, ref) => {
    const queryClient = useQueryClient();
    const { showNotification } = useApp();

    // Data Hooks
    const { data: qPromoCodes } = usePromoCodes();
    const { data: qProjects } = useProjects({ limit: 1000 });

    const promoCodes = qPromoCodes || [];
    const projects = qProjects || [];

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['promoCodes'] });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null);
    const [formData, setFormData] = useState(emptyFormState);

    const handleOpenModal = (mode: 'add' | 'edit', code?: PromoCode) => {
        setModalMode(mode);
        if (mode === 'edit' && code) {
            setSelectedCode(code);
            setFormData({
                code: code.code,
                discountType: code.discountType,
                discountValue: code.discountValue.toString(),
                isActive: code.isActive,
                maxUsage: code.maxUsage?.toString() || '',
                expiryDate: code.expiryDate || '',
            });
        } else {
            setSelectedCode(null);
            setFormData(emptyFormState);
        }
        setFormData(prev => ({ ...prev, ...emptyFormState }));
        setIsModalOpen(true);
    };

    useImperativeHandle(ref, () => ({
        openAddModal: () => handleOpenModal('add')
    }));

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (modalMode === 'add') {
                const created = await createPromoCode({
                    code: formData.code.toUpperCase(),
                    discountType: formData.discountType,
                    discountValue: Number(formData.discountValue),
                    isActive: formData.isActive,
                    maxUsage: formData.maxUsage ? Number(formData.maxUsage) : undefined,
                    expiryDate: formData.expiryDate || undefined,
                } as any);
                invalidate();
                showNotification(`Kode promo "${created.code}" berhasil dibuat.`);

            } else if (selectedCode) {
                const updated = await updatePromoCode(selectedCode.id, {
                    code: formData.code.toUpperCase(),
                    discountType: formData.discountType,
                    discountValue: Number(formData.discountValue),
                    isActive: formData.isActive,
                    maxUsage: formData.maxUsage ? Number(formData.maxUsage) : undefined,
                    expiryDate: formData.expiryDate || undefined,
                } as any);
                invalidate();
                showNotification(`Kode promo "${updated.code}" berhasil diperbarui.`);

            }
        } catch (err) {
            alert('Gagal menyimpan kode promo ke database. Coba lagi.');
            return;
        }
        handleCloseModal();
    };

    const handleDelete = async (codeId: string) => {
        const isUsed = projects.some(p => p.promoCodeId === codeId);
        if (isUsed) {
            showNotification('Kode promo tidak dapat dihapus karena sedang digunakan pada Acara Pernikahan.');
            return;
        }
        if (!window.confirm("Apakah Anda yakin ingin menghapus kode promo ini?")) return;
        try {
            await deletePromoCode(codeId);
            invalidate();
            showNotification('Kode promo berhasil dihapus.');
        } catch (err) {

            alert('Gagal menghapus kode promo di database. Coba lagi.');
        }
    };

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <PageHeader 
                    title="Kode Promo & Diskon" 
                    subtitle="Buat penawaran terbatas dan kode voucher untuk menarik minat calon pengantin." 
                    icon={<PackageIcon className="w-6 h-6" />}
                >
                    <button 
                        onClick={() => handleOpenModal('add')} 
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 transition-all text-xs sm:text-sm font-black shadow-lg shadow-blue-900/40"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Buat Kode Promo</span>
                    </button>
                </PageHeader>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block bg-brand-surface p-4 rounded-xl shadow-lg border border-brand-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-brand-text-secondary uppercase">
                            <tr>
                                <th className="px-4 py-3">Kode</th>
                                <th className="px-4 py-3">Diskon</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Penggunaan</th>
                                <th className="px-4 py-3">Kadaluwarsa</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {promoCodes.map(code => (
                                <tr key={code.id} className="hover:bg-brand-bg">
                                    <td className="px-4 py-3 font-semibold text-brand-text-light">{code.code}</td>
                                    <td className="px-4 py-3">
                                        {code.discountType === 'percentage'
                                            ? `${code.discountValue}%`
                                            : formatCurrency(code.discountValue)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${code.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {code.isActive ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{code.usageCount} / {code.maxUsage ?? '∞'}</td>
                                    <td className="px-4 py-3">{code.expiryDate ? new Date(code.expiryDate).toLocaleDateString('id-ID') : 'Tidak ada'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center space-x-1.5">
                                            <button onClick={() => handleOpenModal('edit', code)} className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm group" title="Edit">
                                                <PencilIcon className="w-4 h-4" />
                                                <span className="text-xs font-bold">Edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(code.id)} className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm group" title="Hapus">
                                                <Trash2Icon className="w-4 h-4" />
                                                <span className="text-xs font-bold">Hapus</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {promoCodes.length === 0 ? (
                    <div className="bg-brand-surface p-8 rounded-xl text-center border border-brand-border">
                        <PackageIcon className="w-12 h-12 text-brand-text-secondary mx-auto mb-3 opacity-50" />
                        <p className="text-brand-text-secondary">Belum ada kode promo. Klik tombol "Buat Kode Baru" untuk memulai.</p>
                    </div>
                ) : (
                    promoCodes.map(code => (
                        <div key={code.id} className="bg-brand-surface rounded-xl shadow-lg border border-brand-border overflow-hidden">
                            {/* Header */}
                            <div className={`p-4 border-b border-brand-border ${code.isActive ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20' : 'bg-gradient-to-r from-gray-600/20 to-slate-600/20'}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-xs text-brand-text-secondary uppercase tracking-wide mb-1">Kode Promo</p>
                                        <p className="font-bold text-lg text-brand-text-light tracking-wider">{code.code}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${code.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {code.isActive ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                {/* Discount Value */}
                                <div className="flex items-center gap-3 p-3 bg-brand-bg rounded-lg">
                                    <DollarSignIcon className="w-6 h-6 text-brand-accent flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-brand-text-secondary">Nilai Diskon</p>
                                        <p className="text-xl font-bold text-brand-accent">
                                            {code.discountType === 'percentage'
                                                ? `${code.discountValue}%`
                                                : formatCurrency(code.discountValue)}
                                        </p>
                                    </div>
                                </div>

                                {/* Usage Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-brand-bg rounded-lg">
                                        <p className="text-xs text-brand-text-secondary mb-1">Penggunaan</p>
                                        <p className="text-sm font-semibold text-brand-text-light">
                                            {code.usageCount} / {code.maxUsage ?? '∞'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-brand-bg rounded-lg">
                                        <p className="text-xs text-brand-text-secondary mb-1">Kadaluwarsa</p>
                                        <p className="text-sm font-semibold text-brand-text-light">
                                            {code.expiryDate ? new Date(code.expiryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Tidak ada'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-3 bg-brand-bg border-t border-brand-border">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleOpenModal('edit', code)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-sm font-bold shadow-sm"
                                        title="Edit"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(code.id)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all text-sm font-bold shadow-sm"
                                        title="Hapus"
                                    >
                                        <Trash2Icon className="w-4 h-4" />
                                        <span>Hapus</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalMode === 'add' ? 'Buat Kode promo Baru' : 'Edit Kode promo'} size="2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CollapsibleSection title="Detail Identitas promo" defaultExpanded={true} variant="filled" icon={<PackageIcon className="w-4 h-4" />}>
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest leading-relaxed">
                                    💡 Tip: Kode promo yang unik dan mudah diingat akan lebih menarik bagi calon pengantin Anda.
                                </p>
                            </div>

                            <div className="input-group">
                                <label className="text-[10px] uppercase font-black tracking-widest text-brand-text-secondary mb-1 block">Kode promo (Kapital)</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-black text-blue-600 text-lg tracking-widest uppercase focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="CTH: PROMO2024"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-brand-surface border border-brand-border rounded-xl">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleFormChange}
                                    className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
                                />
                                <div>
                                    <label htmlFor="isActive" className="text-xs font-black text-brand-text-light cursor-pointer block uppercase tracking-wide">Status Aktif promo</label>
                                    <p className="text-[10px] text-brand-text-secondary">Hanya promo aktif yang dapat digunakan pada transaksi.</p>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Nilai & Tipe Diskon" defaultExpanded={true} variant="filled" icon={<DollarSignIcon className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-black tracking-widest text-brand-text-secondary mb-1 block">Jenis Diskon</label>
                                <select
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold text-brand-text-light appearance-none"
                                >
                                    <option value="percentage">Persentase (%)</option>
                                    <option value="fixed">Nominal Tetap (Rp)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-black tracking-widest text-brand-text-secondary mb-1 block">
                                    {formData.discountType === 'percentage' ? 'Besar Persentase' : 'Nominal Diskon'}
                                </label>
                                <div className="relative">
                                    {formData.discountType === 'fixed' && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-text-secondary text-sm">Rp</span>}
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleFormChange}
                                        className={`w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-black text-brand-text-light ${formData.discountType === 'fixed' ? 'pl-10' : ''}`}
                                        placeholder="0"
                                        min="0"
                                        max={formData.discountType === 'percentage' ? '100' : undefined}
                                        required
                                    />
                                    {formData.discountType === 'percentage' && <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-brand-text-secondary text-sm">%</span>}
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Batasan & Masa Berlaku" defaultExpanded={true} variant="filled" icon={<CalendarIcon className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-black tracking-widest text-brand-text-secondary mb-1 block">Maksimal Penggunaan</label>
                                <input
                                    type="number"
                                    name="maxUsage"
                                    value={formData.maxUsage}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold"
                                    placeholder="Kosongkan untuk ∞"
                                    min="0"
                                />
                            </div>
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-black tracking-widest text-brand-text-secondary mb-1 block">Tanggal Kadaluwarsa</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold"
                                />
                            </div>
                        </div>
                    </CollapsibleSection>

                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border">
                        <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-xl font-bold text-brand-text-secondary hover:bg-brand-bg transition-colors">Batal</button>
                        <button type="submit" className="px-10 py-3 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                            {modalMode === 'add' ? 'Simpan promo' : 'Update promo'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
});

export default PromoCodes;

