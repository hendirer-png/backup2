import React, { useState, useEffect } from 'react';
import Modal from '@/shared/ui/Modal';
import { WhatsappIcon } from '@/constants';
import { Project, Client, Profile } from '@/types';
import { cleanPhoneNumber } from '@/constants';
import { useChatTemplates } from '@/hooks/useChatTemplates';
import { formatIdNumber } from '@/utils/currency';

interface WhatsappTemplateModalProps {
    project: Project;
    client: Client;
    onClose: () => void;
    showNotification: (message: string) => void;
}


const WhatsappTemplateModal: React.FC<WhatsappTemplateModalProps> = ({ 
    project, 
    client, 
    onClose, 
    showNotification, 
}) => {
    const { templates, processTemplate: processTemplateFunc, updateTemplate, isOnline } = useChatTemplates();

    const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || '');
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        const template = templates.find(t => t.id === selectedTemplate)?.template || '';
        
        const sisaTagihan = (project.totalCost || 0) - (project.amountPaid || 0);
        const portalBaseUrl = `${window.location.origin}${window.location.pathname}#/portal/`;
        const portalLink = client.portalAccessId ? `${portalBaseUrl}${client.portalAccessId}` : '{portalLink}';

        const processedMessage = processTemplateFunc(template, {
            clientName: client.name,
            projectName: project.projectName,
            packageName: project.packageName || '-',
            amountPaid: formatIdNumber(project.amountPaid || 0),
            totalCost: formatIdNumber(project.totalCost || 0),
            sisaTagihan: formatIdNumber(sisaTagihan),
            portalLink: portalLink
        });
        setCustomMessage(processedMessage);
    }, [selectedTemplate, client, project, templates, processTemplateFunc]);

    // Ensure selectedTemplate is always valid when templates list changes
    useEffect(() => {
        if (!templates.find(t => t.id === selectedTemplate)) {
            setSelectedTemplate(templates[0]?.id || '');
        }
    }, [templates, selectedTemplate]);

    const handleSelectTemplate = (templateId: string) => {
        setSelectedTemplate(templateId);
    };

    const handleShareToWhatsApp = () => {
        if (!client.phone) {
            showNotification('Nomor telepon pengantin tidak tersedia.');
            return;
        }
        const phoneNumber = cleanPhoneNumber(client.phone);
        const encodedMessage = encodeURIComponent(customMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    const handleSaveTemplate = async () => {
        const rawTemplate = customMessage
            .replace(new RegExp(client.name, 'g'), '{clientName}')
            .replace(new RegExp(project.projectName, 'g'), '{projectName}');

        try {
            await updateTemplate(selectedTemplate, { template: rawTemplate });
            showNotification(isOnline ? 'Template berhasil disimpan!' : 'Template disimpan offline, akan disinkronkan saat online');
        } catch (err) {
            console.error('[Chat Template] Gagal menyimpan template:', err);
            showNotification('Gagal menyimpan template.');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Kirim Pesan ke ${client.name}`} size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-brand-text-secondary">Gunakan Template Pesan:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {templates.map(template => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => handleSelectTemplate(template.id)}
                                className={`button-secondary !text-xs !px-3 !py-1.5 ${selectedTemplate === template.id ? '!bg-brand-accent !text-white !border-brand-accent' : ''}`}
                            >
                                {template.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="input-group">
                    <textarea 
                        value={customMessage} 
                        onChange={e => setCustomMessage(e.target.value)} 
                        rows={8} 
                        className="input-field"
                    ></textarea>
                    <label className="input-label">Isi Pesan</label>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-brand-border">
                    <button onClick={handleSaveTemplate} className="button-secondary">Simpan Template Ini</button>
                    <button onClick={handleShareToWhatsApp} className="button-primary inline-flex items-center gap-2">
                        <WhatsappIcon className="w-5 h-5" /> Kirim via WhatsApp
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default WhatsappTemplateModal;
