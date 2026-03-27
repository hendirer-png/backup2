import React from 'react';
import Modal from '@/shared/ui/Modal';
import RupiahInput from '@/shared/form/RupiahInput';
import { Trash2Icon, ChevronDownIcon, PackageIcon, ClockIcon, UsersIcon, ListIcon } from '@/constants';
import { Profile } from '@/types';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';

interface PackageFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editMode: string | null;
    formData: any;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onPriceChange: (raw: string) => void;
    onCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDurationOptionChange: (index: number, field: string, value: any) => void;
    addDurationOption: () => void;
    removeDurationOption: (index: number) => void;
    expandedDurationIndex: number | null;
    setExpandedDurationIndex: (index: number | null) => void;
    onDurationDetailChange: (optIndex: number, type: 'digital' | 'physical', itemIndex: number, field: string, value: any) => void;
    addDurationDetail: (optIndex: number, type: 'digital' | 'physical') => void;
    removeDurationDetail: (optIndex: number, type: 'digital' | 'physical', itemIndex: number) => void;
    onListChange: (type: 'digital' | 'physical', index: number, field: string, value: any) => void;
    addListItem: (type: 'digital' | 'physical') => void;
    removeListItem: (type: 'digital' | 'physical', index: number) => void;
    profile: Profile;
    existingRegions: string[];
    unionRegions: { value: string; label: string }[];
}

const PackageFormModal: React.FC<PackageFormModalProps> = ({
    isOpen, onClose, onSubmit, editMode, formData,
    onInputChange, onPriceChange, onCoverImageChange,
    onDurationOptionChange, addDurationOption, removeDurationOption,
    expandedDurationIndex, setExpandedDurationIndex,
    onDurationDetailChange, addDurationDetail, removeDurationDetail,
    onListChange, addListItem, removeListItem,
    profile, unionRegions
}) => {
    const hasValidOptions = Array.isArray(formData.durationOptions) && formData.durationOptions.some((o: any) => String(o.label || '').trim() !== '' && String(o.price || '') !== '');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editMode === 'new' ? 'Tambah Package Baru' : 'Edit Package'} size="4xl">
            <form onSubmit={onSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pb-4 custom-scrollbar">
                
                {/* Section 1: Informasi Utama */}
                <CollapsibleSection title="Informasi Utama Package" defaultExpanded={true} variant="filled" icon={<PackageIcon className="w-4 h-4" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Nama Package</label>
                                <input type="text" name="name" value={formData.name} onChange={onInputChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" placeholder="Cth: Wedding Gold" required />
                            </div>
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Harga Dasar (IDR)</label>
                                {hasValidOptions ? (
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text-secondary italic" value="Mengikut opsi durasi" disabled />
                                ) : (
                                    <RupiahInput value={formData.price.toString()} onChange={onPriceChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-black text-blue-600" placeholder="0" required />
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Kategori Package</label>
                                <select name="category" value={formData.category} onChange={onInputChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-semibold" required>
                                    <option value="">Pilih kategori...</option>
                                    {(profile?.packageCategories || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Wilayah (Opsional)</label>
                                <input type="text" name="region" list="region-suggestions-pkg" value={formData.region} onChange={onInputChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white" placeholder="Cth: Jakarta" />
                                <datalist id="region-suggestions-pkg">
                                    {unionRegions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </datalist>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Section 2: Opsi Durasi */}
                <CollapsibleSection title="Opsi Durasi & Harga" defaultExpanded={true} variant="filled" icon={<ClockIcon className="w-4 h-4" />}>
                    <div className="space-y-4">
                        <p className="text-[10px] text-brand-text-secondary font-medium uppercase tracking-wider mb-2">Tambahkan variasi durasi dengan harga berbeda untuk package ini.</p>
                        {formData.durationOptions?.map((opt: any, index: number) => (
                            <div key={index} className="border border-brand-border rounded-2xl overflow-hidden bg-white shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 bg-brand-bg/30">
                                    <div className="md:col-span-4">
                                        <input type="text" value={opt.label} onChange={e => onDurationOptionChange(index, 'label', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm font-bold" placeholder="Label (cth: 8 Jam)" />
                                    </div>
                                    <div className="md:col-span-4">
                                        <RupiahInput value={opt.price.toString()} onChange={(raw) => onDurationOptionChange(index, 'price', raw)} className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm font-black text-blue-600" placeholder="Harga" />
                                    </div>
                                    <div className="md:col-span-4 flex items-center justify-end gap-2 text-xs">
                                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-brand-text-secondary">
                                            <input type="radio" name="durationDefault" checked={!!opt.default} onChange={() => onDurationOptionChange(index, 'default', true)} className="text-blue-600" /> Default
                                        </label>
                                        <button type="button" onClick={() => setExpandedDurationIndex(expandedDurationIndex === index ? null : index)} className="p-2 rounded-lg hover:bg-white text-blue-500 transition-colors">
                                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedDurationIndex === index ? 'rotate-180' : ''}`} />
                                        </button>
                                        <button type="button" onClick={() => removeDurationOption(index)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                                            <Trash2Icon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {expandedDurationIndex === index && (
                                    <div className="p-4 border-t border-brand-border bg-white space-y-4 animate-in slide-in-from-top-2 duration-200">
                                        <div className="input-group">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Jumlah Tim (Khusus opsi ini)</label>
                                            <input type="text" value={opt.photographers || ''} onChange={e => onDurationOptionChange(index, 'photographers', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-brand-border bg-brand-bg/20" placeholder="Cth: 2 Fotografer, 1 Videografer" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-2 block">Deskripsi Detail</label>
                                                <div className="space-y-2">
                                                    {(opt.digitalItems || ['']).map((item: string, i: number) => (
                                                        <div key={i} className="flex gap-2">
                                                            <input type="text" value={item} onChange={e => onDurationDetailChange(index, 'digital', i, '', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs" placeholder="Deskripsi..." />
                                                            <button type="button" onClick={() => removeDurationDetail(index, 'digital', i)} className="text-red-400 p-1 hover:text-red-600"><Trash2Icon className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => addDurationDetail(index, 'digital')} className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">+ Tambah Detail</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-2 block">Vendor / Item Fisik</label>
                                                <div className="space-y-2">
                                                    {(opt.physicalItems || [{ name: '', price: 0 }]).map((item: any, i: number) => (
                                                        <div key={i} className="flex gap-2">
                                                            <input type="text" value={item.name || ''} onChange={e => onDurationDetailChange(index, 'physical', i, 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs" placeholder="Nama Vendor/Barang" />
                                                            <button type="button" onClick={() => removeDurationDetail(index, 'physical', i)} className="text-red-400 p-1 hover:text-red-600"><Trash2Icon className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => addDurationDetail(index, 'physical')} className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">+ Tambah Vendor</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addDurationOption} className="w-full py-3 border-2 border-dashed border-brand-border rounded-2xl text-xs font-bold text-brand-text-secondary hover:border-blue-400 hover:text-blue-500 transition-all">+ Tambah Opsi Durasi Baru</button>
                    </div>
                </CollapsibleSection>

                {/* Section 3: Visual & Tim */}
                <CollapsibleSection title="Visual & Detail Tim" defaultExpanded={false} variant="filled" icon={<UsersIcon className="w-4 h-4" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-1 block">Default Jumlah Tim</label>
                                <input type="text" name="photographers" value={formData.photographers} onChange={onInputChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white" placeholder="Cth: 2 Fotografer" />
                            </div>
                            <div className="input-group">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-blue-600 mb-1 block">Gambar Sampul</label>
                                <input type="file" onChange={onCoverImageChange} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*" />
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Section 4: Deskripsi & Vendor */}
                <CollapsibleSection title="Deskripsi & Vendor (Default)" defaultExpanded={false} variant="filled" icon={<ListIcon className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-3 block">Kelengkapan Package</label>
                            <div className="space-y-2">
                                {formData.digitalItems.map((item: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" value={item} onChange={e => onListChange('digital', index, '', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs" placeholder="Cth: Box Kayu Eksklusif" />
                                        <button type="button" onClick={() => removeListItem('digital', index)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2Icon className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addListItem('digital')} className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">+ Tambah Kelengkapan</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary mb-3 block">Rincian Vendor</label>
                            <div className="space-y-2">
                                {formData.physicalItems.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" value={item.name} onChange={e => onListChange('physical', index, 'name', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs" placeholder="Nama Vendor" />
                                        <button type="button" onClick={() => removeListItem('physical', index)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2Icon className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addListItem('physical')} className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">+ Tambah Vendor</button>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-brand-border sticky -bottom-4 bg-white/90 backdrop-blur-xl p-4 -mx-1">
                    <button type="button" onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-brand-text-secondary hover:bg-brand-bg transition-colors">Batal</button>
                    <button type="submit" className="px-10 py-3 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                        {editMode === 'new' ? 'Simpan Package' : 'Update Package'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PackageFormModal;
