import React from 'react';
import { Profile } from '@/types';
import { CategoryManager } from '@/features/settings/components/CategoryManager';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';
import { CreditCardIcon, DollarSignIcon } from '@/constants';

interface FinanceSettingsTabProps {
    profile: Profile;
    incomeCategoryInput: string;
    setIncomeCategoryInput: (v: string) => void;
    editingIncomeCategory: string | null;
    setEditingIncomeCategory: (v: string | null) => void;
    expenseCategoryInput: string;
    setExpenseCategoryInput: (v: string) => void;
    editingExpenseCategory: string | null;
    setEditingExpenseCategory: (v: string | null) => void;
    handleCategoryUpdate: (field: keyof Profile, categories: string[]) => void;
}

export const FinanceSettingsTab: React.FC<FinanceSettingsTabProps> = ({
    profile, incomeCategoryInput, setIncomeCategoryInput, editingIncomeCategory, setEditingIncomeCategory,
    expenseCategoryInput, setExpenseCategoryInput, editingExpenseCategory, setEditingExpenseCategory,
    handleCategoryUpdate
}) => {
    const handleUpdate = (field: 'incomeCategories' | 'expenseCategories', input: string, setInput: any, categories: string[], editing: string | null, setEditing: any) => {
        const val = input.trim(); if (!val) return;
        let updated: string[];
        if (editing) updated = categories.map(c => c === editing ? val : c);
        else updated = categories.includes(val) ? categories : [...categories, val];
        handleCategoryUpdate(field, updated); setInput(''); setEditing(null);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CollapsibleSection 
                    title="Kategori Pemasukan" 
                    defaultExpanded={true} 
                    variant="filled"
                    icon={<DollarSignIcon className="w-4 h-4" />}
                >
                    <CategoryManager
                        title="Daftar Kategori Pemasukan" 
                        placeholder="Tambah Kategori (e.g. Booking Fee)" 
                        categories={profile.incomeCategories || []}
                        inputValue={incomeCategoryInput} 
                        onInputChange={setIncomeCategoryInput}
                        onAddOrUpdate={() => handleUpdate('incomeCategories', incomeCategoryInput, setIncomeCategoryInput, profile.incomeCategories || [], editingIncomeCategory, setEditingIncomeCategory)}
                        onEdit={(cat) => { setEditingIncomeCategory(cat); setIncomeCategoryInput(cat); }}
                        onDelete={(cat) => confirm(`Hapus "${cat}"?`) && handleCategoryUpdate('incomeCategories', (profile.incomeCategories || []).filter(c => c !== cat))}
                        editingValue={editingIncomeCategory} 
                        onCancelEdit={() => { setEditingIncomeCategory(null); setIncomeCategoryInput(''); }}
                    />
                </CollapsibleSection>

                <CollapsibleSection 
                    title="Kategori Pengeluaran" 
                    defaultExpanded={true} 
                    variant="filled"
                    icon={<CreditCardIcon className="w-4 h-4" />}
                >
                    <CategoryManager
                        title="Daftar Kategori Pengeluaran" 
                        placeholder="Tambah Kategori (e.g. Gaji Team)" 
                        categories={profile.expenseCategories || []}
                        inputValue={expenseCategoryInput} 
                        onInputChange={setExpenseCategoryInput}
                        onAddOrUpdate={() => handleUpdate('expenseCategories', expenseCategoryInput, setExpenseCategoryInput, profile.expenseCategories || [], editingExpenseCategory, setEditingExpenseCategory)}
                        onEdit={(cat) => { setEditingExpenseCategory(cat); setExpenseCategoryInput(cat); }}
                        onDelete={(cat) => confirm(`Hapus "${cat}"?`) && handleCategoryUpdate('expenseCategories', (profile.expenseCategories || []).filter(c => c !== cat))}
                        editingValue={editingExpenseCategory} 
                        onCancelEdit={() => { setEditingExpenseCategory(null); setExpenseCategoryInput(''); }}
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
};
