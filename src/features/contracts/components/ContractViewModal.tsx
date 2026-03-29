import React, { useState } from 'react';
import Modal from '@/shared/ui/Modal';
import SignaturePad from '@/shared/ui/SignaturePad';
import { Contract, Project, Profile, Client } from '@/types';
import ContractDocument from '@/features/contracts/components/ContractDocument';
import { DownloadIcon, PrinterIcon, QrCodeIcon, CheckSquareIcon, WhatsappIcon } from '@/constants';
import { UniversalShareModal } from '@/shared/components/UniversalShareModal';

interface ContractViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedContract: Contract | null;
    projects: Project[];
    clients: Client[];
    profile: Profile;
    isSignatureModalOpen: boolean;
    setIsSignatureModalOpen: (open: boolean) => void;
    handleSaveSignature: (signatureDataUrl: string) => void;
    handleDownloadPDF: () => void;
    handleDownloadPDFWithoutTTD: () => void;
    showNotification: (message: string) => void;
}

export const ContractViewModal: React.FC<ContractViewModalProps> = ({
    isOpen,
    onClose,
    selectedContract,
    projects,
    clients,
    profile,
    isSignatureModalOpen,
    setIsSignatureModalOpen,
    handleSaveSignature,
    handleDownloadPDF,
    handleDownloadPDFWithoutTTD,
    showNotification
}) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    if (!selectedContract) return null;
    
    const project = projects.find(p => p.id === selectedContract.projectId);
    const client = clients.find(c => c.id === selectedContract.clientId);

    if (!project) return null;

    const contractUrl = `https://vandel-pro.web.app/#/public/contract/${selectedContract.id}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail Kontrak" size="4xl">
            <div>
                {/* ... existing modal content ... */}
                <div className="max-h-[70vh] overflow-y-auto border border-slate-200 rounded-2xl bg-white custom-scrollbar shadow-2xl shadow-slate-200/50 ring-1 ring-slate-950/5 relative">
                    <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                    <ContractDocument 
                        id="contract-content-to-print"
                        contract={selectedContract} 
                        project={project} 
                        profile={profile} 
                    />
                    <div className="sticky bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
                </div>
                
                <div className="mt-8 flex flex-wrap justify-between items-center gap-6 border-t border-brand-border pt-6 non-printable">
                    <div className="flex items-center gap-8">
                        {/* Signature statuses */}
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl transition-all ${selectedContract.vendorSignature || profile.signatureBase64 ? 'bg-green-100 text-green-600 ring-4 ring-green-50' : 'bg-yellow-100 text-yellow-600 ring-4 ring-yellow-50'}`}>
                                <CheckSquareIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Vendor</span>
                                <span className={`text-xs font-bold ${selectedContract.vendorSignature || profile.signatureBase64 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {selectedContract.vendorSignature || profile.signatureBase64 ? 'Sudah TTD' : 'Belum TTD'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl transition-all ${selectedContract.clientSignature ? 'bg-green-100 text-green-600 ring-4 ring-green-50' : 'bg-yellow-100 text-yellow-600 ring-4 ring-yellow-50'}`}>
                                <CheckSquareIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Klien</span>
                                <span className={`text-xs font-bold ${selectedContract.clientSignature ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {selectedContract.clientSignature ? 'Sudah TTD' : 'Belum TTD'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {!selectedContract.vendorSignature && (
                            <button 
                                onClick={() => setIsSignatureModalOpen(true)} 
                                className="button-primary text-sm px-5 py-2.5 group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <CheckSquareIcon className="w-4 h-4" />
                                    Tanda Tangani
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                            </button>
                        )}
                        
                        <button 
                            onClick={handleDownloadPDF} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <DownloadIcon className="w-4 h-4"/>
                            <span>Download PDF</span>
                        </button>

                        <button 
                            onClick={handleDownloadPDFWithoutTTD} 
                            className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <PrinterIcon className="w-4 h-4"/>
                            <span>Bentuk Draft</span>
                        </button>

                        <button 
                            onClick={() => setIsShareModalOpen(true)} 
                            className="bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <WhatsappIcon className="w-4 h-4"/>
                            <span>Kirim ke WA</span>
                        </button>

                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(contractUrl);
                                showNotification('Tautan kontrak klien berhasil disalin!');
                            }} 
                            className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <QrCodeIcon className="w-4 h-4"/>
                            <span>Salin Link</span>
                        </button>
                        
                        <button onClick={onClose} className="button-secondary text-sm px-5 py-2.5 ml-2">Tutup</button>
                    </div>
                </div>

                {/* Signature Modal Overlay */}
                <Modal 
                    isOpen={isSignatureModalOpen} 
                    onClose={() => setIsSignatureModalOpen(false)} 
                    title="Tanda Tangan Digital (Vendor)"
                    size="lg"
                >
                        <SignaturePad onSave={handleSaveSignature} onClose={() => setIsSignatureModalOpen(false)} />
                </Modal>

                {/* WhatsApp Share Modal */}
                <UniversalShareModal 
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    type="contractShareTemplate"
                    profile={profile}
                    variables={{
                        '{clientName}': client?.name || '',
                        '{companyName}': profile.companyName,
                        '{contractLink}': contractUrl
                    }}
                    phone={client?.whatsapp || client?.phone}
                    title="Kirim Kontrak Digital"
                    showNotification={showNotification}
                />
            </div>
        </Modal>
    );
};
