import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Package, AddOn, PhysicalItem, Region, REGIONS, DurationOption } from '@/types';
import { createPackage as createPackageRow, updatePackage as updatePackageRow, deletePackage as deletePackageRow } from '@/services/packages';
import { createAddOn as createAddOnRow, updateAddOn as updateAddOnRow, deleteAddOn as deleteAddOnRow } from '@/services/addOns';
import { toBase64, titleCase } from '@/features/packages/utils/packages.utils';
import { usePackages as usePackagesQuery, useAddOns as useAddOnsQuery } from '@/features/packages/api/usePackagesQueries';
import { useProjects } from '@/features/projects/api/useProjects';
import { useProfile } from '@/features/settings/api/useProfileQueries';


export interface PackageForm {
    name: string;
    price: string;
    category: string;
    region: '' | Region;
    processingTime: string;
    photographers: string;
    videographers: string;
    physicalItems: { name: string; price: string | number }[];
    digitalItems: string[];
    coverImage: string;
    durationOptions: {
        label: string;
        price: string | number;
        default: boolean;
        photographers?: string;
        videographers?: string;
        processingTime?: string;
        digitalItems?: string[];
        physicalItems?: { name: string; price: string | number }[];
    }[];
}

export const emptyPackageForm: PackageForm = {
    name: '',
    price: '',
    category: '',
    region: '',
    processingTime: '',
    photographers: '',
    videographers: '',
    physicalItems: [{ name: '', price: '' }],
    digitalItems: [''],
    coverImage: '',
    durationOptions: [{ label: '', price: '', default: true }],
};

export interface AddOnForm {
    name: string;
    price: string;
    region: string;
}

export const emptyAddOnForm: AddOnForm = { name: '', price: '', region: '' };

export const usePackages = () => {
    const queryClient = useQueryClient();

    // --- Data Hooks ---
    const { data: qPackages } = usePackagesQuery();
    const { data: qAddOns } = useAddOnsQuery();
    const { data: qProjects } = useProjects({ limit: 1000 });
    const { data: qProfile } = useProfile();

    const packages = qPackages || [];
    const addOns = qAddOns || [];
    const projects = qProjects || [];
    const profile = qProfile || ({
        projectTypes: [],
        projectStatusConfig: [],
    } as any);

    // Helper for invalidation
    const invalidate = (key: any[]) => queryClient.invalidateQueries({ queryKey: key });


    // --- UI States ---
    const [packageFormData, setPackageFormData] = useState<PackageForm>(emptyPackageForm);
    const [packageEditMode, setPackageEditMode] = useState<string | null>(null);
    const [regionFilter, setRegionFilter] = useState<'' | Region>(REGIONS[0].value as any);
    const [addOnFormData, setAddOnFormData] = useState(emptyAddOnForm);
    const [addOnEditMode, setAddOnEditMode] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [expandedDurationIndex, setExpandedDurationIndex] = useState<number | null>(null);

    // --- Computed Data ---
    const publicPackagesUrl = useMemo(() => {
        const vendorId = 'VEN001'; // Placeholder
        const base = `${window.location.origin}${window.location.pathname}#/public-packages/${vendorId}`;
        return regionFilter ? `${base}?region=${regionFilter.toLowerCase()}` : base;
    }, [regionFilter]);

    const publicBookingUrl = useMemo(() => {
        const base = `${window.location.origin}${window.location.pathname}#/public-booking`;
        return regionFilter ? `${base}?region=${regionFilter.toLowerCase()}` : base;
    }, [regionFilter]);

    const existingRegions = useMemo(() => {
        const set = new Set<string>();
        for (const p of packages) {
            if (p.region && String(p.region).trim() !== '') set.add(String(p.region));
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [packages]);

    const unionRegions = useMemo(() => {
        const baseValues = REGIONS.map(r => r.value.toLowerCase());
        const extra = existingRegions.filter(er => !baseValues.includes(er.toLowerCase()));
        return [
            ...REGIONS.map(r => ({ value: r.value, label: r.label })),
            ...extra.map(er => ({ value: er, label: titleCase(er) })),
        ];
    }, [existingRegions]);

    const packagesByCategory = useMemo(() => {
        const grouped: Record<string, Package[]> = {};
        const filtered = regionFilter ? packages.filter(p => (p.region ? p.region.toLowerCase() === regionFilter.toLowerCase() : false)) : packages;
        for (const pkg of filtered) {
            const category = pkg.category || 'Tanpa Kategori';
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(pkg);
        }
        return grouped;
    }, [packages, regionFilter]);

    // --- Duration Option Handlers ---
    const handleDurationOptionChange = (index: number, field: string, value: any) => {
        const list = [...packageFormData.durationOptions];
        if (field === 'default') {
            list.forEach((opt: any, i: number) => { opt.default = i === index ? Boolean(value) : false; });
        } else {
            (list[index] as any)[field] = value;
        }
        setPackageFormData((prev: any) => ({ ...prev, durationOptions: list }));
    };

    const addDurationOption = () => {
        setPackageFormData((prev) => ({ ...prev, durationOptions: [...(prev.durationOptions || []), { label: '', price: '', default: false }] }));
    };

    const removeDurationOption = (index: number) => {
        const list = [...packageFormData.durationOptions];
        list.splice(index, 1);
        const final = list.length > 0 ? list : [{ label: '', price: '', default: true }];
        if (!final.some((o: any) => o.default)) (final[0] as any).default = true;
        setPackageFormData((prev) => ({ ...prev, durationOptions: final }));
        if (expandedDurationIndex === index) setExpandedDurationIndex(null);
        else if (expandedDurationIndex !== null && expandedDurationIndex > index) setExpandedDurationIndex(expandedDurationIndex - 1);
    };

    const handleDurationDetailChange = (optIndex: number, type: 'digital' | 'physical', itemIndex: number, field: string, value: any) => {
        const list = [...packageFormData.durationOptions];
        const opt = list[optIndex] as any;
        const key = type === 'digital' ? 'digitalItems' : 'physicalItems';
        if (!opt[key]) opt[key] = type === 'digital' ? [''] : [{ name: '', price: 0 }];
        opt[key] = [...opt[key]];
        if (type === 'digital') {
            opt[key][itemIndex] = value;
        } else {
            opt[key][itemIndex] = { ...opt[key][itemIndex], [field]: field === 'price' ? Number(value) : value };
        }
        setPackageFormData((prev: any) => ({ ...prev, durationOptions: list }));
    };

    const addDurationDetail = (optIndex: number, type: 'digital' | 'physical') => {
        const list = [...packageFormData.durationOptions];
        const opt = list[optIndex] as any;
        const key = type === 'digital' ? 'digitalItems' : 'physicalItems';
        if (!opt[key]) opt[key] = [];
        opt[key] = [...opt[key], type === 'digital' ? '' : { name: '', price: 0 }];
        setPackageFormData((prev: PackageForm) => ({ ...prev, durationOptions: list }));
    };

    const removeDurationDetail = (optIndex: number, type: 'digital' | 'physical', itemIndex: number) => {
        const list = [...packageFormData.durationOptions];
        const opt = list[optIndex] as any;
        const key = type === 'digital' ? 'digitalItems' : 'physicalItems';
        if (opt[key] && opt[key].length > 1) {
            opt[key] = opt[key].filter((_: any, i: number) => i !== itemIndex);
            setPackageFormData((prev: PackageForm) => ({ ...prev, durationOptions: list }));
        }
    };

    // --- Package Handlers ---
    const handlePackageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPackageFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) return alert('Ukuran file tidak boleh melebihi 2MB');
            if (!file.type.match('image.*')) return alert('Hanya file gambar yang diperbolehkan');
            try {
                const base64 = await toBase64(file);
                setPackageFormData((prev: any) => ({ ...prev, coverImage: base64 }));
            } catch (err) {
                console.error('Error uploading image:', err);
                alert('Gagal mengunggah gambar.');
            }
        }
    };

    const handleListChange = (type: 'digital' | 'physical', index: number, field: string, value: any) => {
        const key = type === 'digital' ? 'digitalItems' : 'physicalItems';
        const list = [...packageFormData[key]];
        if (type === 'digital') {
            (list as string[])[index] = value;
        } else {
            (list as any[])[index] = { ...(list as any[])[index], [field]: value };
        }
        setPackageFormData((prev) => ({ ...prev, [key]: list }));
    };

    const addListItem = (type: 'digital' | 'physical') => {
        const key = type === 'digital' ? 'digitalItems' : 'physicalItems';
        setPackageFormData((prev) => ({ ...prev, [key]: [...(prev as any)[key], type === 'digital' ? '' : { name: '', price: '' }] }));
    };

    const removeListItem = (type: 'digital' | 'physical', index: number) => {
        const key = type === 'digital' ? 'digitalItems' : 'physicalItems';
        const list = [...packageFormData[key]];
        list.splice(index, 1);
        setPackageFormData((prev: any) => ({ ...prev, [key]: list }));
    };

    const handlePackageEdit = (pkg: Package) => {
        setPackageEditMode(pkg.id);
        setPackageFormData({
            name: pkg.name,
            price: pkg.price.toString(),
            category: pkg.category,
            region: (pkg.region || '') as any,
            processingTime: '',
            photographers: pkg.photographers && pkg.videographers
                ? `${pkg.photographers} & ${pkg.videographers}`
                : (pkg.photographers || pkg.videographers || ''),
            videographers: '',
            physicalItems: pkg.physicalItems.length > 0 ? pkg.physicalItems.map(item => ({ ...item, price: item.price.toString() })) : [{ name: '', price: '' }],
            digitalItems: pkg.digitalItems.length > 0 ? pkg.digitalItems : [''],
            coverImage: pkg.coverImage || '',
            durationOptions: (pkg.durationOptions && pkg.durationOptions.length > 0)
                ? pkg.durationOptions.map(o => ({
                    label: o.label,
                    price: o.price.toString(),
                    default: o.default,
                    photographers: o.photographers && o.videographers
                        ? `${o.photographers} & ${o.videographers}`
                        : (o.photographers || o.videographers || ''),
                    videographers: '',
                    processingTime: '',
                    digitalItems: o.digitalItems && o.digitalItems.length > 0 ? o.digitalItems : [''],
                    physicalItems: o.physicalItems && o.physicalItems.length > 0 ? o.physicalItems.map((p: PhysicalItem) => ({ ...p, price: p.price })) : [{ name: '', price: 0 }],
                }))
                : [{ label: '', price: '' as string | number, default: true }],
        });
    };

    const handlePackageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasValidOptions = Array.isArray(packageFormData.durationOptions) && packageFormData.durationOptions.some((o: any) => String(o.label || '').trim() !== '' && String(o.price || '') !== '');
        if (!packageFormData.name || (!hasValidOptions && !packageFormData.price)) {
            alert('Nama Package wajib diisi. Jika tidak mengisi Opsi Durasi, maka Harga (IDR) wajib diisi.');
            return;
        }

        const defaultOption = hasValidOptions ? (packageFormData.durationOptions.find((o: any) => o.default) || packageFormData.durationOptions.find((o: any) => String(o.label || '').trim() !== '' && String(o.price || '') !== '')) : null;
        const computedBasePrice = defaultOption ? Number(defaultOption.price || 0) : Number(packageFormData.price || 0);

        const packageData: Omit<Package, 'id'> = {
            name: packageFormData.name,
            price: computedBasePrice,
            category: packageFormData.category,
            region: packageFormData.region ? String(packageFormData.region).trim().toLowerCase() : undefined,
            processingTime: '',
            photographers: packageFormData.photographers,
            videographers: '',
            physicalItems: packageFormData.physicalItems
                .filter((item: PhysicalItem) => typeof item.name === 'string' && item.name.trim() !== '')
                .map((item: any) => ({ ...item, price: Number(item.price || 0) })),
            digitalItems: packageFormData.digitalItems.filter((item: string) => item.trim() !== ''),
            coverImage: packageFormData.coverImage,
            durationOptions: hasValidOptions
                ? packageFormData.durationOptions
                    .filter((opt: any) => String(opt.label || '').trim() !== '' && Number(opt.price) >= 0)
                    .map((opt: any): DurationOption => ({
                        label: String(opt.label).trim(),
                        price: Number(opt.price),
                        default: !!opt.default,
                        photographers: opt.photographers?.trim() || undefined,
                        digitalItems: opt.digitalItems?.filter((d: string) => d?.trim?.()) || undefined,
                        physicalItems: opt.physicalItems?.filter((p: any) => p?.name?.trim?.()).map((p: any) => ({ name: p.name, price: Number(p.price || 0) })) || undefined,
                    }))
                : undefined,
        };

        try {
            if (packageEditMode && packageEditMode !== 'new') {
                const updated = await updatePackageRow(packageEditMode, packageData);
                invalidate(['packages']);
            } else {
                const created = await createPackageRow(packageData as any);
                invalidate(['packages']);
            }

            setPackageEditMode(null);
            setPackageFormData(emptyPackageForm);
        } catch (err: any) {
            console.error('Error saving package:', err);
            alert(`Gagal menyimpan Package. ${err?.message || ''}`);
        }
    };

    const handlePackageDelete = async (pkgId: string) => {
        if (projects.some(p => p.packageId === pkgId)) return alert("Package ini sedang digunakan dan tidak dapat dihapus.");
        if (!window.confirm("Hapus Package ini?")) return;
        try {
            await deletePackageRow(pkgId);
            invalidate(['packages']);
        } catch (err) {

            alert('Gagal menghapus Package.');
        }
    };

    // --- AddOn Handlers ---
    const handleAddOnSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addOnFormData.name || !addOnFormData.price) return alert('Nama dan Harga wajib diisi.');
        const data: Omit<AddOn, 'id'> = {
            name: addOnFormData.name,
            price: Number(addOnFormData.price),
            region: addOnFormData.region ? String(addOnFormData.region).trim().toLowerCase() : undefined,
        };
        try {
            if (addOnEditMode) {
                const updated = await updateAddOnRow(addOnEditMode, data);
                invalidate(['addOns']);
            } else {
                const created = await createAddOnRow(data as any);
                invalidate(['addOns']);
            }

            setAddOnEditMode(null);
            setAddOnFormData(emptyAddOnForm);
        } catch (err) {
            alert('Gagal menyimpan Add-On.');
        }
    };

    const handleAddOnDelete = async (id: string) => {
        if (projects.some(p => p.addOns.some(a => a.id === id))) return alert("Add-on ini sedang digunakan.");
        if (!window.confirm("Hapus Add-On ini?")) return;
        try {
            await deleteAddOnRow(id);
            invalidate(['addOns']);
        } catch (err) {

            alert('Gagal menghapus Add-On.');
        }
    };

    return {
        // UI & State
        packageFormData, setPackageFormData,
        packageEditMode, setPackageEditMode,
        regionFilter, setRegionFilter,
        addOnFormData, setAddOnFormData,
        addOnEditMode, setAddOnEditMode,
        isShareModalOpen, setIsShareModalOpen,
        isInfoModalOpen, setIsInfoModalOpen,
        expandedDurationIndex, setExpandedDurationIndex,
        
        // Computed
        publicPackagesUrl,
        publicBookingUrl,
        unionRegions,
        packagesByCategory,
        existingRegions,
        addOns,
        projects,
        profile,

        
        // Handlers
        handleDurationOptionChange,
        addDurationOption,
        removeDurationOption,
        handleDurationDetailChange,
        addDurationDetail,
        removeDurationDetail,
        handlePackageInputChange,
        handleCoverImageChange,
        handleListChange,
        addListItem,
        removeListItem,
        handlePackageEdit,
        handlePackageSubmit,
        handlePackageDelete,
        handleAddOnSubmit,
        handleAddOnDelete
    };
};
