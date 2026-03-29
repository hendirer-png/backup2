import { useState, useEffect, useCallback } from 'react';
import { ChatTemplate } from '@/types';
import { CHAT_TEMPLATES, DEFAULT_BILLING_TEMPLATES } from '@/constants';
import { useProfile, useUpdateProfile } from '@/features/settings/api/useProfileQueries';
import { useApp } from "@/app/AppContext";

interface UseSettingsPageProps {
    currentUser: any;
}


export const useSettingsPage = ({ currentUser }: UseSettingsPageProps) => {
    const { data: profile } = useProfile();
    const updateProfileMutation = useUpdateProfile();


    const [activeTab, setActiveTab] = useState('profile');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('Perubahan berhasil disimpan!');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');


    const showNotification = useCallback((msg: string) => {
        setSuccessMessage(msg);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    }, []);

    useEffect(() => {
        try {
            const tab = window.localStorage.getItem('vena-settings-tab');
            if (tab) {
                setActiveTab(tab);
                window.localStorage.removeItem('vena-settings-tab');
            }
        } catch (e) {}
    }, []);

    const handleProfileSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        setSaveError('');
        try {
            await updateProfileMutation.mutateAsync(profile);
            showNotification('Profil berhasil diperbarui!');
        } catch (err: any) {
            setSaveError(err?.message || 'Gagal menyimpan profil.');
        } finally {
            setIsSaving(false);
        }
    };


    const handleCategoryUpdate = async (field: keyof any, categories: string[]) => {
        try {
            await updateProfileMutation.mutateAsync({ id: profile.id, [field]: categories } as any);
            showNotification('Kategori berhasil diperbarui!');
        } catch (err: any) {
            alert('Gagal menyimpan: ' + (err?.message || 'Coba lagi.'));
        }
    };


    // Chat Template Logic
    const [chatTemplates, setChatTemplates] = useState<ChatTemplate[]>(profile?.chatTemplates || CHAT_TEMPLATES);
    const [billingTemplates, setBillingTemplates] = useState<ChatTemplate[]>(profile?.billingTemplates || DEFAULT_BILLING_TEMPLATES);

    const persistChatTemplates = async (updated: ChatTemplate[]) => {
        setIsSaving(true);
        try {
            await updateProfileMutation.mutateAsync({ ...profile, chatTemplates: updated } as any);
            setChatTemplates(updated);
            showNotification('Template berhasil disimpan!');
        } catch (err: any) {
            alert('Gagal menyimpan: ' + (err?.message || 'Coba lagi.'));
        } finally {
            setIsSaving(false);
        }
    };


    const persistBillingTemplates = async (updated: ChatTemplate[]) => {
        setIsSaving(true);
        try {
            await updateProfileMutation.mutateAsync({ ...profile, billingTemplates: updated } as any);
            setBillingTemplates(updated);
            showNotification('Template tagihan berhasil disimpan!');
        } catch (err: any) {
            alert('Gagal menyimpan: ' + (err?.message || 'Coba lagi.'));
        } finally {
            setIsSaving(false);
        }
    };


    return {
        activeTab,
        setActiveTab,
        showSuccess,
        successMessage,
        isSaving,
        saveError,
        showNotification,
        handleProfileSubmit,
        handleCategoryUpdate,
        chatTemplates,
        setChatTemplates,
        persistChatTemplates,
        billingTemplates,
        setBillingTemplates,
        persistBillingTemplates,
    };
};
