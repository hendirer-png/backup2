import React from 'react';
import Modal from '@/shared/ui/Modal';
import { Share2Icon } from '@/constants';

interface PackageModalsProps {
    isInfoOpen: boolean;
    onInfoClose: () => void;
    isShareOpen: boolean;
    onShareClose: () => void;
    publicUrl: string;
    onCopyLink: () => void;
}

export const PackageInfoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Panduan Package Vendor">
        <div className="space-y-4 text-sm text-brand-text-primary text-justify leading-relaxed">
            <p>Halaman ini adalah pusat pengelolaan layanan Anda. Di sini Anda bisa mengatur Package utama dan layanan tambahan (add-ons).</p>
            <div className="space-y-3">
                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/40">
                    <h5 className="font-bold text-brand-accent mb-1">1. Package Utama</h5>
                    <p className="text-xs">Kelompokkan layanan Anda berdasarkan kategori. Anda bisa menambahkan opsi durasi dengan harga yang berbeda-beda untuk satu Package yang sama.</p>
                </div>
                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/40">
                    <h5 className="font-bold text-brand-accent mb-1">2. Opsi Durasi (Advanced)</h5>
                    <p className="text-xs">Saat mengedit Package, gunakan "Tambah Opsi Durasi" untuk membuat variasi (cth: 2 Jam, 4 Jam). Klik ikon detail pada opsi tersebut untuk mengatur tim dan item khusus untuk durasi tersebut.</p>
                </div>
                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/40">
                    <h5 className="font-bold text-brand-accent mb-1">3. Bagikan Portofolio</h5>
                    <p className="text-xs">Klik tombol "Bagikan" untuk mendapatkan tautan halaman publik Anda. Tautan ini bisa dikirimkan ke calon pengantin agar mereka bisa melihat rincian Package dan langsung melakukan booking.</p>
                </div>
            </div>
        </div>
    </Modal>
);

export const PackageShareModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    publicUrl: string; 
    bookingUrl: string;
    onCopyLink: () => void; 
    onCopyBookingLink: () => void;
    regionName?: string;
    unionRegions?: { value: string; label: string }[];
}> = ({ 
    isOpen, onClose, publicUrl, bookingUrl, onCopyLink, onCopyBookingLink, regionName, unionRegions = []
}) => {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
            .then(() => alert(`${label} berhasil disalin!`))
            .catch(err => console.error('Gagal menyalin:', err));
    };

    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Bagikan Tautan ${regionName ? `(${regionName})` : ''}`}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-sm text-brand-text-secondary italic">Pilih atau salin tautan spesifik wilayah untuk memudahkan calon pengantin Anda.</p>
                
                <div className="space-y-6">
                    {/* General Links Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-brand-accent uppercase tracking-widest px-1">Tautan Umum</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-brand-bg rounded-xl border border-brand-border flex flex-col gap-2">
                                <p className="text-[10px] font-bold text-brand-text-secondary uppercase">Katalog (Pricelist)</p>
                                <button onClick={onCopyLink} className="button-primary py-2 text-[10px] font-bold uppercase tracking-wider shadow-sm">Salin Katalog</button>
                            </div>
                            <div className="p-3 bg-brand-bg rounded-xl border border-brand-border flex flex-col gap-2">
                                <p className="text-[10px] font-bold text-brand-text-secondary uppercase">Form Booking</p>
                                <button onClick={onCopyBookingLink} className="button-secondary py-2 text-[10px] font-bold uppercase tracking-wider shadow-sm border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white">Salin Booking</button>
                            </div>
                        </div>
                    </div>

                    {/* Regional Links Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-brand-accent uppercase tracking-widest px-1">Tautan Per Wilayah</h4>
                        <div className="space-y-2">
                            {unionRegions.map(region => {
                                const regPackagesUrl = `${baseUrl}#/public-packages/VEN001?region=${region.value.toLowerCase()}`;
                                const regBookingUrl = `${baseUrl}#/public-booking?region=${region.value.toLowerCase()}`;
                                
                                return (
                                    <div key={region.value} className="p-4 bg-brand-surface/40 rounded-2xl border border-brand-border/60 hover:border-brand-accent transition-all group">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-black text-brand-text-light">{region.label}</span>
                                            <div className="flex gap-2">
                                                <span className="bg-brand-accent/10 px-2 py-0.5 rounded text-[8px] font-black text-brand-accent uppercase">Region Specific</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => copyToClipboard(regPackagesUrl, `Tautan Katalog ${region.label}`)}
                                                className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 border border-brand-border rounded-lg text-[9px] font-bold text-brand-text-secondary hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all"
                                            >
                                                Salin Katalog
                                            </button>
                                            <button 
                                                onClick={() => copyToClipboard(regBookingUrl, `Tautan Booking ${region.label}`)}
                                                className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 border border-brand-border rounded-lg text-[9px] font-bold text-brand-text-secondary hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all"
                                            >
                                                Salin Booking
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                <p className="text-[10px] text-brand-text-secondary italic text-center py-2 bg-brand-accent/5 rounded-lg border border-brand-accent/10">
                    * Tautan spesifik wilayah akan langsung menampilkan Paket & Add-on yang tersedia di wilayah tersebut.
                </p>
            </div>
        </Modal>
    );
};
