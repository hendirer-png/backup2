import React from 'react';
import { Profile } from '@/types';
import { CategoryManager } from '@/features/settings/components/CategoryManager';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';
import { PackageIcon } from '@/constants';

interface PackageSettingsTabProps {
    profile: Profile;
    packageCategoryInput: string;
    setPackageCategoryInput: (v: string) => void;
    editingPackageCategory: string | null;
    setEditingPackageCategory: (v: string | null) => void;
    handleCategoryUpdate: (field: keyof Profile, categories: string[]) => void;
}

export const PackageSettingsTab: React.FC<PackageSettingsTabProps> = ({
    profile, packageCategoryInput, setPackageCategoryInput, editingPackageCategory, setEditingPackageCategory,
    handleCategoryUpdate
}) => {
    const handleUpdate = () => {
        const val = packageCategoryInput.trim(); if (!val) return;
        const categories = profile.packageCategories || [];
        let updated: string[];
        if (editingPackageCategory) updated = categories.map(c => c === editingPackageCategory ? val : c);
        else updated = categories.includes(val) ? categories : [...categories, val];
        handleCategoryUpdate('packageCategories', updated); setPackageCategoryInput(''); setEditingPackageCategory(null);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <CollapsibleSection 
                title="Kategori Package" 
                defaultExpanded={true} 
                variant="filled"
                icon={<PackageIcon className="w-4 h-4" />}
            >
                <CategoryManager
                    title="Daftar Kategori Package" placeholder="Tambah Kategori (e.g. Wedding)" categories={profile.packageCategories || []}
                    inputValue={packageCategoryInput} onInputChange={setPackageCategoryInput}
                    onAddOrUpdate={handleUpdate}
                    onEdit={(cat) => { setEditingPackageCategory(cat); setPackageCategoryInput(cat); }}
                    onDelete={(cat) => confirm(`Hapus "${cat}"?`) && handleCategoryUpdate('packageCategories', (profile.packageCategories || []).filter(c => c !== cat))}
                    editingValue={editingPackageCategory} onCancelEdit={() => { setEditingPackageCategory(null); setPackageCategoryInput(''); }}
                />
            </CollapsibleSection>
        </div>
    );
};
