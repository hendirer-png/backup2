import React, { useState, useEffect } from 'react';
import Modal from '@/shared/ui/Modal';
import { WhatsappIcon } from '@/constants';
import { UniversalShareModal } from '@/shared/components/UniversalShareModal';
import { Client, Project, Profile } from '@/types';
import { DEFAULT_BILLING_TEMPLATES } from '@/constants';
import { formatCurrency } from '@/features/clients/utils/clients.utils';

import { BillingChatModalProps } from '@/features/clients/types';

const BillingChatModal: React.FC<BillingChatModalProps> = ({ isOpen, onClose, client, projects, userProfile, showNotification }) => {
    const [message, setMessage] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Use profile billing templates if available, otherwise use defaults
    const BILLING_CHAT_TEMPLATES = (userProfile.billingTemplates && userProfile.billingTemplates.length > 0)
        ? userProfile.billingTemplates
        : DEFAULT_BILLING_TEMPLATES;

    useEffect(() => {
        if (!client) return;

        const projectsWithBalance = projects.filter(p => p.clientId === client.id && (p.totalCost - (p.amountPaid || 0)) > 0);
        if (projectsWithBalance.length === 0) return;

        const totalDue = projectsWithBalance.reduce((sum, p) => sum + (p.totalCost - (p.amountPaid || 0)), 0);

        const projectDetails = projectsWithBalance.map(p =>
            `- Acara Pernikahan: *${p.projectName}*\n  Sisa Tagihan: ${formatCurrency(p.totalCost - (p.amountPaid || 0))}`
        ).join('\n');

        const path = window.location.pathname.replace(/index\.html$/, '');
        const portalLink = `${window.location.origin}${path}#/portal/${client.portalAccessId}`;

        const template = BILLING_CHAT_TEMPLATES.find(t => t.id === selectedTemplateId)?.template || BILLING_CHAT_TEMPLATES[0].template;

        const processedMessage = template
            .replace('{clientName}', client.name)
            .replace('{projectDetails}', projectDetails)
            .replace('{totalDue}', formatCurrency(totalDue))
            .replace('{portalLink}', portalLink)
            .replace('{bankAccount}', userProfile.bankAccount || 'N/A')
            .replace(/{companyName}/g, userProfile.companyName || 'Tim Kami');

        setMessage(processedMessage);

    }, [client, projects, userProfile, selectedTemplateId, BILLING_CHAT_TEMPLATES]);

    const handleShareToWhatsApp = () => {
        if (!client || (!client.phone && !client.whatsapp)) {
            showNotification('Nomor telepon pengantin tidak tersedia.');
            return;
        }
        if (!message.trim()) {
            showNotification('Pesan tidak boleh kosong.');
            return;
        }

        setIsShareModalOpen(true);
    };

    if (!isOpen || !client) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Kirim Tagihan ke ${client.name}`} size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-brand-text-secondary">Gunakan Template Pesan:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {BILLING_CHAT_TEMPLATES.map(template => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => setSelectedTemplateId(template.id)}
                                className={`button-secondary !text-xs !px-3 !py-1.5 ${selectedTemplateId === template.id ? '!bg-brand-accent !text-white !border-brand-accent' : ''}`}
                            >
                                {template.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="input-group">
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={12} className="input-field"></textarea>
                    <label className="input-label">Isi Pesan</label>
                </div>
                <div className="flex justify-end items-center pt-4 border-t border-brand-border">
                    <button onClick={handleShareToWhatsApp} className="button-primary inline-flex items-center gap-2">
                        <WhatsappIcon className="w-5 h-5" /> Kirim via WhatsApp
                    </button>
                </div>
            </div>
            
            {isShareModalOpen && (
                <UniversalShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => {
                        setIsShareModalOpen(false);
                        onClose();
                    }}
                    title={`Kirim Tagihan ke ${client.name}`}
                    initialMessage={message}
                    phone={client.whatsapp || client.phone}
                    profile={userProfile}
                    showNotification={showNotification}
                />
            )}
        </Modal>
    );
};

export default BillingChatModal;
