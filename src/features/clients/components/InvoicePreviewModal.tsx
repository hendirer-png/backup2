import React, { useState } from 'react';
import { Project, Profile, Package, Client } from '@/types';
import InvoiceDocument from '@/features/finance/components/InvoiceDocument';
import Modal from '@/shared/ui/Modal';
import SignaturePad from '@/shared/ui/SignaturePad';
import { UniversalShareModal } from '@/shared/components/UniversalShareModal';
import { DownloadIcon, PencilIcon, WhatsappIcon } from '@/constants';

interface InvoicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    profile: Profile;
    packages: Package[];
    client?: Client;
    onEdit?: () => void;
    onSign?: (signature: string) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
    isOpen,
    onClose,
    project,
    profile,
    packages,
    client,
    onEdit,
    onSign
}) => {
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        const element = document.getElementById('modal-invoice-document');
        if (!element) return;

        try {
            const opt = {
                margin: 10,
                filename: `Invoice_${project?.clientName?.replace(/\s+/g, '_') || 'Klien'}_${project.id.slice(-8)}.pdf`,
                image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    windowWidth: 1200,
                    onclone: (clonedDoc: any) => {
                        const el = clonedDoc.getElementById('modal-invoice-document');
                        if (el) el.classList.add('force-desktop');
                    }
                },
                jsPDF: { unit: 'mm' as 'mm', format: 'a4' as 'a4', orientation: 'portrait' as 'portrait' }
            };

            const html2pdf = (await import('html2pdf.js')).default;
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal mengunduh PDF. Silakan coba lagi.');
        }
    };

    const handleSignatureSave = (signatureData: string) => {
        if (onSign) {
            onSign(signatureData);
        }
        setIsSignatureModalOpen(false);
    };

    const portalUrl = `${window.location.host === 'localhost:3000' ? 'http://localhost:3000' : 'https://vandel-pro.web.app'}/#/portal/invoice/${project.id}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invoice" size="4xl">
            <div className="flex flex-col h-full max-h-[85vh]">
                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 rounded-t-lg custom-scrollbar">
                    <div className="max-w-4xl mx-auto shadow-sm">
                        <InvoiceDocument
                            id="modal-invoice-document"
                            project={project}
                            profile={profile}
                            packages={packages}
                            client={client}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap justify-center sm:justify-end gap-3 rounded-b-lg shrink-0">
                    {onSign && !project.invoiceSignature && (
                        <button
                            onClick={() => {
                                if (profile.signatureBase64) {
                                    onSign(profile.signatureBase64);
                                } else {
                                    setIsSignatureModalOpen(true);
                                }
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold rounded-lg transition-colors shadow-sm"
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span className="text-sm">Tanda Tangani</span>
                        </button>
                    )}
                    
                    {onEdit && (
                        <button
                            onClick={() => {
                                onClose();
                                onEdit();
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold rounded-lg transition-colors shadow-sm"
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span className="text-sm">Edit</span>
                        </button>
                    )}
                    
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-6 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span className="text-sm">Unduh PDF</span>
                    </button>

                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                        <WhatsappIcon className="w-4 h-4" />
                        <span className="text-sm">Kirim ke WA</span>
                    </button>
                </div>

                {/* Signature Document Wrapper */}
                <Modal
                    isOpen={isSignatureModalOpen}
                    onClose={() => setIsSignatureModalOpen(false)}
                    title="Tanda Tangan Authorized"
                    size="lg"
                >
                    <SignaturePad onSave={handleSignatureSave} onClose={() => setIsSignatureModalOpen(false)} />
                </Modal>

                {/* Universal Share Modal */}
                <UniversalShareModal 
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    type="invoiceShareTemplate"
                    profile={profile}
                    variables={{
                        '{clientName}': client?.name || project.clientName,
                        '{companyName}': profile.companyName,
                        '{projectName}': project.projectName,
                        '{totalCost}': `Rp ${project.totalCost.toLocaleString('id-ID')}`,
                        '{amountPaid}': `Rp ${project.amountPaid.toLocaleString('id-ID')}`,
                        '{sisaTagihan}': `Rp ${(project.totalCost - (project.amountPaid || 0)).toLocaleString('id-ID')}`,
                        '{invoiceLink}': portalUrl,
                        '{portalLink}': portalUrl,
                        '{bankAccount}': profile.bankAccount || ''
                    }}
                    phone={client?.whatsapp || client?.phone}
                    title="Kirim Invoice via WhatsApp"
                    showNotification={() => {}} 
                />
            </div>
        </Modal>
    );
};
