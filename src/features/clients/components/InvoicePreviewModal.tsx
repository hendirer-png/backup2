import React, { useState } from 'react';
import { Project, Profile, Package, Client } from '@/types';
import InvoiceDocument from '@/features/finance/components/InvoiceDocument';
import { DownloadIcon, Share2Icon, PencilIcon } from '@/constants';
import Modal from '@/shared/ui/Modal';
import SignaturePad from '@/shared/ui/SignaturePad';

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


    const handleShareWA = () => {
        const portalUrl = `${window.location.origin}/#/portal/invoice/${project.id}`;
        
        let message = `Halo ${project.clientName},\n\n`;
        message += `Berikut adalah Invoice untuk layanan ${project.projectName}.\n`;
        message += `Total Tagihan: Rp ${project.totalCost.toLocaleString('id-ID')}\n`;
        if (project.amountPaid > 0) {
            message += `Sudah Dibayar: Rp ${project.amountPaid.toLocaleString('id-ID')}\n`;
            message += `Sisa Pembayaran: Rp ${(project.totalCost - project.amountPaid).toLocaleString('id-ID')}\n`;
        }
        message += `\nAnda dapat melihat detail invoice melalui link berikut:\n${portalUrl}\n\n`;
        message += `Terima kasih,\n${profile.companyName}`;
        
        const encodedMessage = encodeURIComponent(message);
        
        // Coba nomor klien, atau buka kosong
        const phone = client?.phone ? client.phone.replace(/\D/g, '') : '';
        const whatsappUrl = phone 
            ? `https://wa.me/${phone}?text=${encodedMessage}` 
            : `https://wa.me/?text=${encodedMessage}`;
            
        window.open(whatsappUrl, '_blank');
    };

    const handleSignatureSave = (signatureData: string) => {
        if (onSign) {
            onSign(signatureData);
        }
        setIsSignatureModalOpen(false);
    };

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
                        onClick={handleShareWA}
                        className="flex items-center gap-2 px-6 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                        <Share2Icon className="w-4 h-4" />
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
            </div>
        </Modal>
    );
};
