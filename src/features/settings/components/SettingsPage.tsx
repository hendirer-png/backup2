import React, { useState } from 'react';
import { useSettingsPage } from '@/features/settings/hooks/useSettingsPage';
import { SettingsPageProps } from '@/features/settings/types';
import { ProfileSettingsTab } from '@/features/settings/components/ProfileSettingsTab';
import { FinanceSettingsTab } from '@/features/settings/components/FinanceSettingsTab';
import { TeamSettingsTab } from '@/features/settings/components/TeamSettingsTab';
import { PackageSettingsTab } from '@/features/settings/components/PackageSettingsTab';
import { ProjectSettingsTab } from '@/features/settings/components/ProjectSettingsTab';
import { MessageSettingsTab } from '@/features/settings/components/MessageSettingsTab';
import { UsersIcon, CashIcon, PackageIcon, LayoutGridIcon, MessageSquareIcon } from '@/constants';

import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useProjects } from '@/features/projects/api/useProjects';
import { listUsers } from '@/services/users';
import { useProfile } from '@/features/settings/api/useProfileQueries';


export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
    const { data: profile, isLoading: isProfileLoading } = useProfile();
    const queryClient = useQueryClient();

    const { data: qProjects } = useProjects();
    const projects = qProjects || [];
    
    const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: listUsers });
    
    const setUsers = (updater: any) => {
        const current = queryClient.getQueryData(['users']) || [];
        const next = typeof updater === 'function' ? updater(current) : updater;
        queryClient.setQueryData(['users'], next);
        queryClient.invalidateQueries({ queryKey: ['users'] });
    };

    if (isProfileLoading || !profile) {
        return <div className="p-8 text-center text-brand-text-secondary animate-pulse font-black uppercase tracking-widest">Memuat Pengaturan...</div>;
    }

    const {
        activeTab, setActiveTab, showSuccess, successMessage, isSaving, saveError,
        showNotification, handleProfileSubmit, handleCategoryUpdate
    } = useSettingsPage({ currentUser });


    // Category Inputs (Internal to page state)
    const [incomeInput, setIncomeInput] = useState('');
    const [editIncome, setEditIncome] = useState<string | null>(null);
    const [expenseInput, setExpenseInput] = useState('');
    const [editExpense, setEditExpense] = useState<string | null>(null);
    const [prjTypeInput, setPrjTypeInput] = useState('');
    const [editPrjType, setEditPrjType] = useState<string | null>(null);
    const [evtTypeInput, setEvtTypeInput] = useState('');
    const [editEvtType, setEditEvtType] = useState<string | null>(null);
    const [pkgCatInput, setPkgCatInput] = useState('');
    const [editPkgCat, setEditPkgCat] = useState<string | null>(null);

    const tabs = [
        { id: 'profile', label: 'Profil Vendor', icon: <UsersIcon className="w-4 h-4" /> },
        { id: 'finance', label: 'Finance & Bank', icon: <CashIcon className="w-4 h-4" /> },
        { id: 'team', label: 'Team & Akses', icon: <UsersIcon className="w-4 h-4" /> },
        { id: 'packages', label: 'Package Category', icon: <PackageIcon className="w-4 h-4" /> },
        { id: 'projects', label: 'Project & Status', icon: <LayoutGridIcon className="w-4 h-4" /> },
        { id: 'messages', label: 'Chat Templates', icon: <MessageSquareIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h1 className="text-2xl md:text-3xl font-black text-brand-text-light tracking-tight">Pengaturan & Konfigurasi</h1><p className="text-brand-text-secondary text-sm mt-1">Sesuaikan identitas vendor, manajemen tim, dan template pesan WhatsApp.</p></div>
            </header>

            <nav className="flex gap-2 border-b border-brand-border pb-4 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 md:px-6 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/20 scale-105' : 'text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text-primary'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </nav>

            <main className="min-h-[60vh] pb-20">
                {activeTab === 'profile' && <ProfileSettingsTab profile={profile} setProfile={() => {}} handleProfileSubmit={handleProfileSubmit} isSaving={isSaving} showSuccess={showSuccess} saveError={saveError} />}
                {activeTab === 'finance' && <FinanceSettingsTab profile={profile} incomeCategoryInput={incomeInput} setIncomeCategoryInput={setIncomeInput} editingIncomeCategory={editIncome} setEditingIncomeCategory={setEditIncome} expenseCategoryInput={expenseInput} setExpenseCategoryInput={setExpenseInput} editingExpenseCategory={editExpense} setEditingExpenseCategory={setEditExpense} handleCategoryUpdate={handleCategoryUpdate} />}
                {activeTab === 'team' && <TeamSettingsTab users={users} setUsers={setUsers} currentUser={currentUser} />}
                {activeTab === 'packages' && <PackageSettingsTab profile={profile} packageCategoryInput={pkgCatInput} setPackageCategoryInput={setPkgCatInput} editingPackageCategory={editPkgCat} setEditingPackageCategory={setEditPkgCat} handleCategoryUpdate={handleCategoryUpdate} />}
                {activeTab === 'projects' && <ProjectSettingsTab profile={profile} setProfile={() => {}} projects={projects} projectTypeInput={prjTypeInput} setProjectTypeInput={setPrjTypeInput} editingProjectType={editPrjType} setEditingProjectType={setEditPrjType} eventTypeInput={evtTypeInput} setEventTypeInput={setEvtTypeInput} editingEventType={editEvtType} setEditingEventType={setEditEvtType} handleCategoryUpdate={handleCategoryUpdate} showNotification={showNotification} />}
                {activeTab === 'messages' && <MessageSettingsTab profile={profile} setProfile={() => {}} showSuccess={showNotification} />}
            </main>
        </div>
    );
};

