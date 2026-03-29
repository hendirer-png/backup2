import React, { useState } from 'react';
import { Transaction, Profile, Project, Client, TransactionType } from '@/types';
import Modal from '@/shared/ui/Modal';
import SignaturePad from '@/shared/ui/SignaturePad';
import { UniversalShareModal } from '@/shared/components/UniversalShareModal';
import { DownloadIcon, PencilIcon, WhatsappIcon, Share2Icon } from '@/constants';

interface ReceiptPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
    project?: Project | null;
    client?: Client | null;
    profile: Profile;
    onEdit?: () => void;
    onSign?: (signature: string) => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
    isOpen,
    onClose,
    transaction,
    project,
    client,
    profile,
    onEdit,
    onSign
}) => {
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    if (!isOpen) return null;

    const isExpense = transaction.type === TransactionType.EXPENSE;
    const documentTitle = isExpense ? 'Bukti Pengeluaran' : 'Tanda Terima';
    const statusText = isExpense ? 'Telah Dibayarkan Secara Sah' : 'Telah Diterima Secara Sah';
    const statusColor = isExpense ? 'text-blue-600' : 'text-green-600';

    let targetName = client?.name || 'Klien';
    if (isExpense) {
        if (transaction.category === 'Gaji Tim / Vendor') {
            const match = transaction.description?.match(/Gaji Vendor - (.+?) \(/);
            targetName = match && match[1] ? match[1] : 'Vendor / Tim';
        } else {
            targetName = 'Pihak Lain';
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('modal-receipt-document');
        if (!element) return;

        try {
            const opt = {
                margin: 10,
                filename: `Tanda_Terima-${transaction.id.slice(0, 8)}.pdf`,
                image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    windowWidth: 1200,
                    onclone: (clonedDoc: any) => {
                        const el = clonedDoc.getElementById('modal-receipt-document');
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

    const portalUrl = `${window.location.host === 'localhost:3000' ? 'http://localhost:3000' : 'https://vandel-pro.web.app'}/#/portal/receipt/${transaction.id}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tanda Terima" size="4xl">
            <div className="flex flex-col h-full max-h-[85vh]">
                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 rounded-t-lg custom-scrollbar">
                    <div id="modal-receipt-document" className="bg-white border border-slate-200 shadow-sm mx-auto p-8 sm:p-12 font-sans text-slate-900 print:shadow-none print:border-none print:bg-white print:max-w-none max-w-4xl">
                        <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-brand-accent">
                            <div>
                                {profile.logoBase64 ? (
                                    <img src={profile.logoBase64} alt="Company Logo" className="h-20 object-contain mb-4" />
                                ) : (
                                    <h2 className="text-2xl font-bold text-brand-accent mb-2">{profile.companyName}</h2>
                                )}
                                <div className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                                    <p className="font-bold text-slate-700">{profile.companyName}</p>
                                    <p>{profile.address}</p>
                                    <p>{profile.phone} • {profile.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-4xl font-black text-slate-200 uppercase tracking-tighter leading-none mb-4">{documentTitle}</h1>
                                <div className="inline-block bg-slate-100 px-3 py-1 rounded text-[10px] font-mono text-slate-500 uppercase">
                                    REF: #{transaction.id.slice(0, 8).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-2xl mb-12 border border-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status Konfirmasi</p>
                                    <p className={`text-sm font-black ${statusColor} uppercase`}>{statusText}</p>
                                </div>
                                <div className="text-center sm:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Jumlah Pembayaran</p>
                                    <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{formatCurrency(transaction.amount)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Pihak Terkait</h4>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-slate-800">{targetName}</p>
                                        <p className="text-xs text-slate-500">{isExpense ? 'Penerima Pembayaran' : 'Pemberi Pembayaran'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Metode & Waktu</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Metode</span>
                                            <span className="font-bold text-slate-800">{transaction.method}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Tanggal</span>
                                            <span className="font-bold text-slate-800">{formatDate(transaction.date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Keterangan</h4>
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{transaction.description}</p>
                                    </div>
                                </div>
                                {project && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Informasi Acara</h4>
                                        <div className="p-4 bg-brand-accent/5 rounded-xl border border-brand-accent/10">
                                            <p className="text-xs font-bold text-brand-accent mb-2">{project.projectName}</p>
                                            <div className="grid grid-cols-2 gap-4 text-[11px]">
                                                <div>
                                                    <p className="text-slate-400 uppercase tracking-tighter mb-0.5">Total Tagihan</p>
                                                    <p className="font-bold text-slate-700">{formatCurrency(project.totalCost)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 uppercase tracking-tighter mb-0.5">Sisa Tagihan</p>
                                                    <p className="font-bold text-brand-accent">{formatCurrency(project.totalCost - (project.amountPaid || 0))}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-end pt-12 border-t border-slate-100">
                            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black max-w-[200px]">
                                Dokumen ini diterbitkan secara resmi melalui sistem manajemen {profile.companyName}
                            </div>
                            <div className="text-center w-56 shrink-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 font-mono">Tanda Tangan</p>
                                <div className="h-20 flex items-center justify-center mb-4">
                                    {transaction.vendorSignature ? (
                                        <img src={transaction.vendorSignature} alt="Tanda Tangan" className="max-h-full object-contain grayscale" />
                                    ) : profile.signatureBase64 ? (
                                        <img src={profile.signatureBase64} alt="Authorized" className="max-h-full object-contain grayscale" />
                                    ) : (
                                        <div className="h-px w-32 bg-slate-200 mx-auto" />
                                    )}
                                </div>
                                <p className="text-sm font-black text-slate-800 underline underline-offset-8 decoration-slate-200">{profile.authorizedSigner || profile.companyName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap justify-center sm:justify-end gap-3 rounded-b-lg shrink-0">
                    {onSign && !transaction.vendorSignature && (
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
                    <SignaturePad 
                        onSave={(sig: string) => {
                            if (onSign) onSign(sig);
                            setIsSignatureModalOpen(false);
                        }} 
                        onClose={() => setIsSignatureModalOpen(false)} 
                    />
                </Modal>

                {/* Universal Share Modal */}
                <UniversalShareModal 
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    type={isExpense ? 'expenseShareTemplate' : 'receiptShareTemplate'}
                    profile={profile}
                    variables={{
                        '{clientName}': targetName,
                        '{companyName}': profile.companyName,
                        '{amount}': formatCurrency(transaction.amount),
                        '{description}': transaction.description || '',
                        '{date}': formatDate(transaction.date),
                        '{receiptLink}': portalUrl,
                        '{portalLink}': portalUrl,
                        '{method}': transaction.method || ''
                    }}
                    phone={client?.whatsapp || client?.phone}
                    title={isExpense ? 'Kirim Bukti Pengeluaran' : 'Kirim Tanda Terima'}
                    showNotification={() => {}}
                />
            </div>
        </Modal>
    );
};
