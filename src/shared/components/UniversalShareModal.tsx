import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/shared/ui/Modal';
import { Share2Icon, LinkIcon, WhatsappIcon, CopyIcon, cleanPhoneNumber } from '@/constants';
import { Profile, Lead, Project, Transaction, Gallery } from '@/types';
import { listGalleries } from '@/services/galleries';
import { upsertProfile } from '@/services/profile';
import { escapeRegExp } from '@/features/leads/utils/leads.utils';

export type ShareType = 
    | 'packageShareTemplate' 
    | 'bookingFormTemplate' 
    | 'invoiceShareTemplate' 
    | 'receiptShareTemplate' 
    | 'expenseShareTemplate' 
    | 'portalShareTemplate' 
    | 'contractShareTemplate' 
    | 'billingShareTemplate'
    | 'custom';

interface UniversalShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    type?: ShareType;
    profile: Profile;
    variables?: Record<string, string>;
    initialMessage?: string;
    phone?: string | null;
    title: string;
    showNotification: (message: string) => void;
    setProfile?: React.Dispatch<React.SetStateAction<Profile>>;
}

export const UniversalShareModal: React.FC<UniversalShareModalProps> = ({
    isOpen, onClose, type = 'custom', profile, variables = {}, initialMessage = '', phone, title, showNotification, setProfile
}) => {
    const [message, setMessage] = useState(initialMessage);
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [selectedGalleryId, setSelectedGalleryId] = useState<string>('');

    // Load initial message and replace variables
    useEffect(() => {
        if (!isOpen) return;
        
        // If custom type, use initialMessage as is
        if (type === 'custom') {
            setMessage(initialMessage);
            return;
        }

        const template = (profile as any)[type] || '';
        if (!template) {
            console.warn(`Template for ${type} is empty in profile.`);
            setMessage(initialMessage);
            return;
        }

        let processed = template;
        if (variables) {
            Object.entries(variables).forEach(([key, value]) => {
                const regex = new RegExp(escapeRegExp(key), 'g');
                processed = processed.replace(regex, value || '');
            });
        }
        
        setMessage(processed);
    }, [isOpen, type, profile, variables, initialMessage]);

    // Load galleries only for package sharing
    useEffect(() => {
        if (!isOpen || type !== 'packageShareTemplate') return;
        (async () => {
            try {
                const all = await listGalleries();
                const publicOnes = (all || []).filter(g => g.is_public && g.public_id);
                setGalleries(publicOnes);
                if (publicOnes.length > 0) setSelectedGalleryId(publicOnes[0].id);
            } catch (e) {
                console.warn('Failed to load galleries for share modal', e);
            }
        })();
    }, [isOpen, type]);

    const selectedGallery = useMemo(() => galleries.find(g => g.id === selectedGalleryId) || null, [galleries, selectedGalleryId]);
    const selectedGalleryLink = useMemo(() => selectedGallery ? `${window.location.origin}/#/gallery/${selectedGallery.public_id}` : '', [selectedGallery]);

    const handleShareToWhatsApp = () => {
        if (!message.trim()) {
            showNotification('Pesan tidak boleh kosong.');
            return;
        }

        const cleaned = cleanPhoneNumber(phone || '');
        const encoded = encodeURIComponent(message);
        const waUrl = cleaned
            ? `https://wa.me/${cleaned}?text=${encoded}`
            : `https://wa.me/?text=${encoded}`;

        window.open(waUrl, '_blank');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message);
            showNotification('Pesan disalin ke clipboard.');
        } catch {
            showNotification('Gagal menyalin pesan.');
        }
    };

    const handleSaveTemplate = async () => {
        try {
            // Reverse replace variables to get the raw template
            let rawTemplate = message;
            
            // Note: This logic is tricky if variables overlap. 
            // We prioritize longer values or specific markers.
            // For now, we follow the leads/ShareMessageModal pattern of simple replacement.
            Object.entries(variables).forEach(([key, value]) => {
                if (value && value.trim()) {
                    const regex = new RegExp(escapeRegExp(value), 'g');
                    rawTemplate = rawTemplate.replace(regex, key);
                }
            });

            if (setProfile) {
                setProfile(prev => ({ ...prev, [type]: rawTemplate }));
            }
            
            await upsertProfile({ id: profile.id, [type]: rawTemplate } as any);
            showNotification('Template berhasil diperbarui!');
        } catch (err) {
            showNotification('Gagal menyimpan template.');
        }
    };

    const canNativeShare = typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function';

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="2xl">
            <div className="space-y-4">
                <div className="input-group">
                    <textarea 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        rows={12} 
                        className="input-field w-full text-sm leading-relaxed font-mono bg-slate-50 border-slate-200" 
                        placeholder="Tulis pesan Anda di sini..."
                    ></textarea>
                    <label className="input-label bg-white px-1">Preview Pesan WhatsApp</label>
                </div>

                {type === 'packageShareTemplate' && galleries.length > 0 && (
                    <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-brand-text-light inline-flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-brand-accent" /> Sisipkan Link Pricelist
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                            <select 
                                value={selectedGalleryId} 
                                onChange={(e) => setSelectedGalleryId(e.target.value)} 
                                className="input-field md:col-span-2 !py-2.5"
                            >
                                {galleries.map(g => <option key={g.id} value={g.id}>{g.title} • {g.region}</option>)}
                            </select>
                            <div className="flex gap-2 w-full">
                                <button 
                                    type="button" 
                                    onClick={() => { if (selectedGalleryLink) setMessage(prev => (prev ? prev + `\n${selectedGalleryLink}` : selectedGalleryLink)); }} 
                                    className="button-primary flex-1 py-2.5 text-xs"
                                >
                                    Sisipkan
                                </button>
                            </div>
                        </div>
                        {selectedGalleryLink && <p className="text-[10px] text-brand-text-secondary break-all font-mono bg-white/50 p-2 rounded-lg">{selectedGalleryLink}</p>}
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:justify-between items-center gap-3 pt-6 border-t border-brand-border mt-2">
                    <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={handleSaveTemplate} 
                            className="button-secondary py-3 px-5 text-xs font-bold flex-1 md:flex-none border-brand-accent/20 text-brand-accent"
                        >
                            Simpan Template
                        </button>
                        <button 
                            onClick={handleCopy} 
                            className="button-secondary py-3 px-5 text-xs font-bold flex-1 md:flex-none"
                        >
                            <CopyIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        {canNativeShare && (
                            <button 
                                onClick={async () => { try { await (navigator as any).share({ text: message }); } catch (e) {} }} 
                                className="button-secondary py-3 px-5 text-xs font-bold flex-1 md:flex-none"
                            >
                                <Share2Icon className="w-4 h-4" /> Share
                            </button>
                        )}
                        <button 
                            onClick={handleShareToWhatsApp} 
                            className="button-primary py-3 px-6 text-sm font-black inline-flex items-center justify-center gap-2 w-full md:w-auto !bg-green-500 hover:!bg-green-600 shadow-lg shadow-green-200"
                        >
                            <WhatsappIcon className="w-5 h-5 text-white" /> Kirim ke WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
