import React, { useState } from 'react';
import { useSettingsPage } from '@/features/settings/hooks/useSettingsPage';
import { SettingsPageProps } from '@/features/settings/types';
import { ProfileSettingsTab } from '@/features/settings/components/ProfileSettingsTab';
import { FinanceSettingsTab } from '@/features/settings/components/FinanceSettingsTab';
import { TeamSettingsTab } from '@/features/settings/components/TeamSettingsTab';
import { PackageSettingsTab } from '@/features/settings/components/PackageSettingsTab';
import { ProjectSettingsTab } from '@/features/settings/components/ProjectSettingsTab';
import { MessageSettingsTab } from '@/features/settings/components/MessageSettingsTab';
import { PublicPageSettingsTab } from '@/features/settings/components/PublicPageSettingsTab';
import { UsersIcon, CashIcon, PackageIcon, LayoutGridIcon, MessageSquareIcon, GlobeIcon } from '@/constants';

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

    const setProfile = (updater: any) => {
        const current = queryClient.getQueryData(['profile']);
        const next = typeof updater === 'function' ? updater(current) : updater;
        queryClient.setQueryData(['profile'], next);
    };

    const {
        showSuccess, successMessage, isSaving, saveError,
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

    if (isProfileLoading || !profile) {
        return <div className="p-8 text-center text-brand-text-secondary animate-pulse font-black uppercase tracking-widest">Memuat Pengaturan...</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h1 className="text-2xl md:text-3xl font-black text-brand-text-light tracking-tight">Pengaturan & Konfigurasi</h1><p className="text-brand-text-secondary text-sm mt-1">Sesuaikan identitas vendor, manajemen tim, dan template pesan WhatsApp.</p></div>
            </header>

            <main className="space-y-12 pb-20">
                <section id="profile" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-accent/10 rounded-xl">
                            <UsersIcon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-brand-text-light">Profil Vendor</h2>
                    </div>
                    <ProfileSettingsTab profile={profile} setProfile={setProfile} handleProfileSubmit={handleProfileSubmit} isSaving={isSaving} showSuccess={showSuccess} saveError={saveError} />
                </section>

                <section id="public-page" className="scroll-mt-24 border-t border-brand-border/40 pt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-accent/10 rounded-xl">
                            <GlobeIcon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-brand-text-light">Konfigurasi Halaman Publik</h2>
                    </div>
                    <PublicPageSettingsTab profile={profile} setProfile={setProfile} handleProfileSubmit={handleProfileSubmit} isSaving={isSaving} showSuccess={showSuccess} saveError={saveError} />
                </section>

                <section id="finance" className="scroll-mt-24 border-t border-brand-border/40 pt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-accent/10 rounded-xl">
                            <CashIcon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-brand-text-light">Finance & Bank</h2>
                    </div>
                    <FinanceSettingsTab profile={profile} incomeCategoryInput={incomeInput} setIncomeCategoryInput={setIncomeInput} editingIncomeCategory={editIncome} setEditingIncomeCategory={setEditIncome} expenseCategoryInput={expenseInput} setExpenseCategoryInput={setExpenseInput} editingExpenseCategory={editExpense} setEditingExpenseCategory={setEditExpense} handleCategoryUpdate={handleCategoryUpdate} />
                </section>

                <section id="team" className="scroll-mt-24 border-t border-brand-border/40 pt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-accent/10 rounded-xl">
                            <UsersIcon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-brand-text-light">Team & Akses</h2>
                    </div>
                    <TeamSettingsTab users={users} setUsers={setUsers} currentUser={currentUser} />
                </section>

                <section id="packages" className="scroll-mt-24 border-t border-brand-border/40 pt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-accent/10 rounded-xl">
                            <PackageIcon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-brand-text-light">Package Category</h2>
                    </div>
                    <PackageSettingsTab profile={profile} packageCategoryInput={pkgCatInput} setPackageCategoryInput={setPkgCatInput} editingPackageCategory={editPkgCat} setEditingPackageCategory={setEditPkgCat} handleCategoryUpdate={handleCategoryUpdate} />
                </section>

                <section id="projects" className="scroll-mt-24 border-t border-brand-border/40 pt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-accent/10 rounded-xl">
                            <LayoutGridIcon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-brand-text-light">Project & Status</h2>
                    </div>
                    <ProjectSettingsTab profile={profile} setProfile={setProfile} projects={projects} projectTypeInput={prjTypeInput} setProjectTypeInput={setPrjTypeInput} editingProjectType={editPrjType} setEditingProjectType={setEditPrjType} eventTypeInput={evtTypeInput} setEventTypeInput={setEvtTypeInput} editingEventType={editEvtType} setEditingEventType={setEditEvtType} handleCategoryUpdate={handleCategoryUpdate} showNotification={showNotification} />
                </section>

                <section id="messages" className="scroll-mt-24 border-t border-brand-border/40 pt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-accent/10 rounded-xl">
                            <MessageSquareIcon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <h2 className="text-xl font-bold text-brand-text-light">Chat Templates</h2>
                    </div>
                    <MessageSettingsTab profile={profile} setProfile={setProfile} showSuccess={showNotification} />
                </section>
            </main>
        </div>
    );
};

