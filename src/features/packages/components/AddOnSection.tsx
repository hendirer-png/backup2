import React from 'react';
import { AddOn } from '@/types';
import { PlusIcon, PencilIcon, Trash2Icon } from '@/constants';
import { formatCurrency } from '@/features/booking/utils/booking.utils';
import RupiahInput from '@/shared/form/RupiahInput';

interface AddOnSectionProps {
    addOns: AddOn[];
    regionFilter: string;
    editMode: string | null;
    formData: { name: string; price: string; region: string };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPriceChange: (raw: string) => void;
    onRegionSelect: (region: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onEdit: (addon: AddOn) => void;
    onDelete: (id: string) => void;
    onCancelEdit: () => void;
    unionRegions: { value: string; label: string }[];
}

const AddOnSection: React.FC<AddOnSectionProps> = ({
    addOns,
    regionFilter,
    editMode,
    formData,
    onInputChange,
    onPriceChange,
    onRegionSelect,
    onSubmit,
    onEdit,
    onDelete,
    onCancelEdit,
    unionRegions
}) => {
    const filteredAddOns = regionFilter ? addOns.filter(a => a.region === regionFilter) : addOns;

    return (
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <div className="glass-card rounded-3xl border border-brand-border/50 flex flex-col shadow-sm">
                <div className="p-4 md:p-5 border-b border-brand-border/50 bg-brand-surface/60 rounded-t-3xl backdrop-blur-md">
                    <h3 className="font-bold text-lg text-gradient flex items-center gap-2">
                        <PlusIcon className="w-5 h-5 text-brand-accent" /> Layanan Tambahan
                    </h3>
                    <p className="text-xs text-brand-text-secondary mt-1">Kelola ekstra Add-Ons.</p>
                </div>

                <div className="p-2 md:p-3 space-y-1.5 max-h-[40vh] overflow-y-auto custom-scrollbar bg-brand-surface/20">
                    {filteredAddOns.map(addon => (
                        <div key={addon.id} className="group flex justify-between items-center bg-white/60 hover:bg-white border border-brand-border/30 p-3 rounded-xl transition-all shadow-sm">
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-sm font-semibold text-brand-text-light truncate">{addon.name}</span>
                                <span className="text-xs font-bold text-brand-accent mt-0.5">{formatCurrency(addon.price)}</span>
                            </div>
                            <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button onClick={() => onEdit(addon)} className="p-2 rounded-lg text-brand-text-secondary hover:bg-amber-50 hover:text-amber-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(addon.id)} className="p-2 rounded-lg text-brand-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2Icon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                    {filteredAddOns.length === 0 && (
                        <div className="text-center py-8 text-brand-text-secondary/50 text-sm">
                            Belum ada add-on untuk wilayah ini.
                        </div>
                    )}
                </div>

                <form onSubmit={onSubmit} className="p-4 md:p-5 border-t border-brand-border/50 bg-brand-surface/40 rounded-b-3xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary/70 mb-2">{editMode ? 'Edit Add-On' : 'Tambah Add-On Baru'}</h4>
                    <div className="input-group">
                        <label htmlFor="addOnName" className="input-label">Nama Add-On</label>
                        <input type="text" id="addOnName" name="name" value={formData.name} onChange={onInputChange} className="input-field bg-white/80" placeholder=" " required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="addOnPrice" className="input-label">Harga (IDR)</label>
                        <RupiahInput id="addOnPrice" value={formData.price.toString()} onChange={onPriceChange} className="input-field bg-white/80" placeholder=" " required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="addOnRegion" className="input-label">Wilayah (opsional)</label>
                        <input
                            type="text"
                            id="addOnRegion"
                            name="region"
                            list="region-suggestions-addon"
                            value={formData.region}
                            onChange={onInputChange}
                            className="input-field bg-white/80"
                            placeholder=" "
                        />
                        <datalist id="region-suggestions-addon">
                            {unionRegions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </datalist>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {unionRegions.map(r => (
                            <button type="button" key={r.value} onClick={() => onRegionSelect(r.value)} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors border ${formData.region === r.value ? 'bg-brand-accent text-white border-brand-accent shadow-sm' : 'bg-white border-brand-border border-dashed text-brand-text-secondary hover:border-brand-accent/50'}`}>{r.label}</button>
                        ))}
                        {formData.region && (
                            <button type="button" onClick={() => onRegionSelect('')} className="px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-red-50 border-red-200 text-brand-danger">Kosongkan</button>
                        )}
                    </div>
                    <div className="flex gap-2 pt-2">
                        {editMode && <button type="button" onClick={onCancelEdit} className="button-secondary flex-1 py-2 text-xs">Batal</button>}
                        <button type="submit" className="button-primary flex-[2] py-2 text-xs shadow-md">{editMode ? 'Simpan' : 'Tambah'}</button>
                    </div>
                </form>
            </div>
        </aside>
    );
};

export default AddOnSection;
