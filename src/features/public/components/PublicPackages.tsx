import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, AddOn, Profile, Client, Project, Transaction, Lead, Notification, Card, ClientStatus, PaymentStatus, TransactionType, LeadStatus, ContactChannel, ClientType, BookingStatus, ViewType, PromoCode } from '@/types';
import { useApp } from "@/app/AppContext";
import Modal from '@/shared/ui/Modal';
import { CheckIcon, CameraIcon, WhatsappIcon, cleanPhoneNumber } from '@/constants';
import { listPackages } from '@/services/packages';
import { listAddOns } from '@/services/addOns';
import { getProfile } from '@/services/profile';
import { createClient } from '@/services/clients';
import { createProject } from '@/services/projects';
import { createLead as createLeadRow } from '@/services/leads';
import { uploadDpProof } from '@/services/storage';
import { createTransaction } from '@/services/transactions';
import RupiahInput from '@/shared/form/RupiahInput';


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

interface PublicPackagesProps {
    userProfile?: Profile;
    showNotification?: (message: string) => void;
    setClients?: React.Dispatch<React.SetStateAction<Client[]>>;
    setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
    setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
    setCards?: React.Dispatch<React.SetStateAction<Card[]>>;
    setLeads?: React.Dispatch<React.SetStateAction<Lead[]>>;
    addNotification?: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    cards?: Card[];
    projects?: Project[];
    promoCodes?: PromoCode[];
    setPromoCodes?: React.Dispatch<React.SetStateAction<PromoCode[]>>;
}


const AddOnItem: React.FC<{ addOn: AddOn }> = ({ addOn }) => {
    return (
        <div className="border-b border-brand-border last:border-b-0 p-4 flex justify-between items-center">
            <p className="font-semibold text-brand-text-light">{addOn.name}</p>
            <p className="text-sm font-bold text-brand-accent">{formatCurrency(addOn.price)}</p>
        </div>
    );
};

const initialForm = {
    clientName: '', email: '', phone: '', instagram: '', date: new Date().toISOString().split('T')[0], location: '', transportCost: '', selectedAddOnIds: [] as string[], promoCode: '', dp: '', dpPaymentRef: '', durationSelection: '' as string, unitPrice: undefined as number | undefined
};



const PublicPackages: React.FC<PublicPackagesProps> = (props) => {
    const { 
        showNotification: contextShowNotification 
    } = useApp();

    const [searchParams] = useSearchParams();
    const regionParam = searchParams.get('region');

    const initialUserProfile = props.userProfile;
    const showNotification = props.showNotification || contextShowNotification;
    const { setClients, setProjects, setTransactions, setCards, setLeads, addNotification, cards = [], projects = [], promoCodes = [], setPromoCodes } = props;

    const [packages, setPackages] = useState<Package[]>([]);
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [userProfile, setUserProfile] = useState<Profile | undefined>(initialUserProfile);
    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    // Safe destructure — defer until userProfile is loaded (guarded below)

    // Update userProfile when initialUserProfile changes
    useEffect(() => {
        if (initialUserProfile) {
            setUserProfile(initialUserProfile);
        }
    }, [initialUserProfile]);

    // Load data from Supabase
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                // Load packages
                const packagesData = await listPackages();
                setPackages(packagesData);

                // Load add-ons
                const addOnsData = await listAddOns();
                setAddOns(addOnsData);

                // Load profile if not provided
                if (!initialUserProfile) {
                    const profileData = await getProfile();
                    if (profileData) {
                        setUserProfile(profileData);
                    }
                }
                setError(null);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Gagal memuat data. Silakan coba lagi nanti.');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Parse region from URL parameters
    useEffect(() => {
        console.log("Page Loaded: Public Packages", regionParam);
        if (regionParam) {
            const normalizedRegion = regionParam.toLowerCase();
            setSelectedRegion(normalizedRegion);
            if (import.meta.env.DEV) {
                console.log('Region selected from URL parameter (PublicPackages):', normalizedRegion);
            }
        } else {
            setSelectedRegion(null);
        }
    }, [regionParam]);
    const template = userProfile?.publicPageConfig?.template ?? 'modern';
    const visiblePackages = useMemo(() => {
        if (!selectedRegion) return packages;
        return packages.filter(p => (p.region ? p.region === selectedRegion : false));
    }, [packages, selectedRegion]);

    const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; pkg: Package | null }>({ isOpen: false, pkg: null });
    const [formData, setFormData] = useState(initialForm);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [promoFeedback, setPromoFeedback] = useState({ type: '', message: '' });
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    // Note: We avoid early returns before all hooks to keep hook order stable across renders.

    // Group packages by category
    const packagesByCategory = useMemo(() => {
        const grouped: Record<string, Package[]> = {};

        if (!Array.isArray(packages)) {
            console.error('Packages is not an array:', packages);
            return {};
        }

        for (const pkg of packages) {
            if (!pkg) continue;

            const category = pkg.category || 'Lainnya';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(pkg);
        }

        const orderedGrouped: Record<string, Package[]> = {};

        if (userProfile?.packageCategories?.length) {
            userProfile.packageCategories.forEach((category: string) => {
                if (grouped[category]) {
                    orderedGrouped[category] = grouped[category];
                    delete grouped[category];
                }
            });
        }

        // Add remaining categories
        Object.keys(grouped).forEach(category => {
            orderedGrouped[category] = grouped[category];
        });

        return orderedGrouped;
    }, [packages, userProfile?.packageCategories]);

    const mostPopularPackageId = useMemo(() => {
        if (projects.length === 0) return null;
        const packageCounts = projects.reduce((acc, p) => {
            if (p.packageId) {
                acc[p.packageId] = (acc[p.packageId] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        if (Object.keys(packageCounts).length === 0) return null;

        return Object.keys(packageCounts).sort((a, b) => packageCounts[b] - packageCounts[a])[0];
    }, [projects]);


    const categoryDescriptions: Record<string, string> = {
        'Pernikahan': "Layanan profesional untuk mendukung kelancaran hari bahagia Anda. Yuk konsultasikan kebutuhan Anda sekarang.",
        'Lamaran / Engagement': "Momen spesial komitmen Anda akan kami layani dengan sepenuh hati.",
        'Ulang Tahun': "Rayakan pertambahan usia dengan layanan terbaik yang menyenangkan.",
        'Corporate / Event': "Dukungan profesional untuk kesuksesan Acara Pernikahan perusahaan dan gathering Anda.",
        'Wisuda': "Rayakan pencapaian akademik Anda dengan layanan spesial dari kami.",
        'Keluarga': "Menciptakan momen berharga dan layanan terbaik untuk kebahagiaan keluarga Anda."
    };

    const formattedTerms = useMemo(() => {
        if (!userProfile?.termsAndConditions) return null;
        return userProfile.termsAndConditions.split('\n').map((line, index) => {
            if (line.trim() === '') return <div key={index} className="h-4"></div>;
            const emojiRegex = /^(📜|📅|💰|📦|⏱|➕)\s/;
            if (emojiRegex.test(line)) {
                return <h3 key={index} className="text-lg font-semibold text-gradient mt-4 mb-2">{line}</h3>;
            }
            if (line.trim().startsWith('- ')) {
                return <p key={index} className="ml-4 text-brand-text-primary">{line.trim().substring(2)}</p>;
            }
            return <p key={index} className="text-brand-text-primary">{line}</p>;
        });
    }, [userProfile?.termsAndConditions]);

    const whatsappUrl = useMemo(() => {
        if (!bookingModal.pkg || !isSubmitted || !userProfile?.phone) return '';
        const message = `Halo, saya ${formData.clientName}, baru saja melakukan booking untuk Package "${bookingModal.pkg.name}". Mohon untuk diproses. Terima kasih.`;
        return `https://wa.me/${cleanPhoneNumber(userProfile.phone)}?text=${encodeURIComponent(message)}`;
    }, [isSubmitted, formData.clientName, bookingModal.pkg, userProfile?.phone]);

    const { totalBeforeDiscount, discountAmount, totalProject, discountText } = useMemo(() => {
        if (!bookingModal.pkg) return { totalBeforeDiscount: 0, discountAmount: 0, totalProject: 0, discountText: '' };
        // Determine package price based on selected duration option (flexible labels)
        let packagePrice = bookingModal.pkg.price;
        const opts = bookingModal.pkg.durationOptions;
        if (opts && opts.length > 0) {
            const selected = opts.find(o => o.label === formData.durationSelection) || opts.find(o => o.default) || opts[0];
            packagePrice = selected?.price ?? bookingModal.pkg.price;
        }
        const addOnsPrice = addOns
            .filter(addon => formData.selectedAddOnIds.includes(addon.id))
            .reduce((sum, addon) => sum + addon.price, 0);

        const transportFee = Number(formData.transportCost) || 0;
        const totalBeforeDiscount = packagePrice + addOnsPrice;
        let discountAmount = 0;
        let discountText = '';

        const enteredPromoCode = formData.promoCode.toUpperCase().trim();
        if (enteredPromoCode) {
            const promoCode = promoCodes.find(p => p.code === enteredPromoCode && p.isActive);
            if (promoCode) {
                const isExpired = promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date();
                const isMaxedOut = promoCode.maxUsage != null && promoCode.usageCount >= promoCode.maxUsage;

                if (!isExpired && !isMaxedOut) {
                    if (promoCode.discountType === 'percentage') {
                        discountAmount = (totalBeforeDiscount * promoCode.discountValue) / 100;
                        discountText = `${promoCode.discountValue}%`;
                    } else {
                        discountAmount = promoCode.discountValue;
                        discountText = formatCurrency(promoCode.discountValue);
                    }
                    setPromoFeedback({ type: 'success', message: `Kode promo diterapkan! Diskon ${discountText}.` });
                } else {
                    setPromoFeedback({ type: 'error', message: 'Kode promo tidak valid atau sudah habis.' });
                }
            } else {
                setPromoFeedback({ type: 'error', message: 'Kode promo tidak ditemukan.' });
            }
        } else {
            setPromoFeedback({ type: '', message: '' });
        }

        const totalProject = totalBeforeDiscount - discountAmount + transportFee;
        return { totalBeforeDiscount, discountAmount, totalProject, discountText };
    }, [formData.selectedAddOnIds, formData.promoCode, formData.transportCost, formData.durationSelection, bookingModal.pkg, addOns, promoCodes]);

    const handleOpenBookingModal = (pkg: Package) => {
        setBookingModal({ isOpen: true, pkg });
        setIsSubmitted(false);
        // Set default duration selection if durationOptions exist
        const defaultOpt = (pkg.durationOptions && pkg.durationOptions.length > 0)
            ? (pkg.durationOptions.find(o => o.default) || pkg.durationOptions[0])
            : undefined;
        setFormData({ ...initialForm, durationSelection: defaultOpt?.label || '', unitPrice: defaultOpt ? Number(defaultOpt.price) : pkg.price });
        setPaymentProof(null);
        setPromoFeedback({ type: '', message: '' });
    };

    const handleCloseBookingModal = () => {
        setBookingModal({ isOpen: false, pkg: null });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { id, checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, selectedAddOnIds: checked ? [...prev.selectedAddOnIds, id] : prev.selectedAddOnIds.filter(addOnId => addOnId !== id) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('Ukuran file tidak boleh melebihi 10MB.');
                e.target.value = '';
                return;
            }
            setPaymentProof(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingModal.pkg) return;
        setIsSubmitting(true);

        const dpAmount = Number(formData.dp) || 0;
        const destinationCard = cards.find(c => c.id !== 'CARD_CASH') || cards[0];
        if (dpAmount > 0 && !destinationCard) {
            alert('Sistem pembayaran tidak dikonfigurasi. Hubungi vendor.');
            setIsSubmitting(false);
            return;
        }

        let promoCodeAppliedId: string | undefined;
        if (discountAmount > 0 && formData.promoCode) {
            const promoCode = promoCodes.find(p => p.code === formData.promoCode.toUpperCase().trim());
            if (promoCode) promoCodeAppliedId = promoCode.id;
        }

        let dpProofUrl = '';
        if (paymentProof) {
            try {
                // Upload ke Supabase Storage, gunakan URL publik
                dpProofUrl = await uploadDpProof(paymentProof);
            } catch (error) {
                console.error('Error uploading DP proof:', error);
                alert('Gagal mengunggah bukti transfer. Silakan coba lagi.');
                setIsSubmitting(false);
                return;
            }
        }

        const selectedAddOns = addOns.filter(addon => formData.selectedAddOnIds.includes(addon.id));
        const remainingPayment = totalProject - dpAmount;
        const transportFee = Number(formData.transportCost) || 0;

        // Persist to Supabase
        const createdClient = await createClient({
            name: formData.clientName,
            email: formData.email,
            phone: formData.phone,
            whatsapp: formData.phone || undefined,
            instagram: formData.instagram || undefined,
            since: new Date().toISOString().split('T')[0],
            status: ClientStatus.ACTIVE,
            clientType: ClientType.DIRECT,
            lastContact: new Date().toISOString(),
            portalAccessId: crypto.randomUUID(),
        });

        const createdProject = await createProject({
            projectName: `${formData.clientName} (${bookingModal.pkg.name})`,
            clientName: createdClient.name,
            clientId: createdClient.id,
            projectType: bookingModal.pkg.category,
            packageName: bookingModal.pkg.name,
            date: formData.date,
            location: formData.location || 'Akan dikonfirmasi',
            status: 'Dikonfirmasi',
            bookingStatus: BookingStatus.BARU,
            totalCost: totalProject,
            amountPaid: dpAmount,
            paymentStatus: dpAmount >= totalProject ? PaymentStatus.LUNAS : (dpAmount > 0 ? PaymentStatus.DP_TERBAYAR : PaymentStatus.BELUM_BAYAR),
            notes: `Booking dari halaman Package. Ref: ${formData.dpPaymentRef}${formData.durationSelection ? ` | Durasi dipilih: ${formData.durationSelection}` : ''}`,
            durationSelection: formData.durationSelection || undefined,
            unitPrice: formData.unitPrice !== undefined ? Number(formData.unitPrice) : undefined,
            promoCodeId: promoCodeAppliedId,
            discountAmount: discountAmount > 0 ? discountAmount : undefined,
            transportCost: transportFee > 0 ? transportFee : undefined,
            completedDigitalItems: [],
            dpProofUrl: dpProofUrl || undefined,
            addOns: selectedAddOns.map(a => ({ id: a.id, name: a.name, price: a.price })),
        });

        const createdLead = await createLeadRow({
            name: createdClient.name,
            contactChannel: ContactChannel.WEBSITE,
            location: createdProject.location,
            status: LeadStatus.CONVERTED,
            date: new Date().toISOString(),
            notes: `Dikonversi dari halaman Package. Acara Pernikahan: ${createdProject.projectName}. Pengantin ID: ${createdClient.id}`,
            whatsapp: createdClient.phone,
        } as any);

        setClients(prev => [createdClient, ...prev]);
        // Pastikan muncul di halaman Booking
        const createdProjectWithBooking: Project = { ...createdProject, bookingStatus: BookingStatus.BARU } as Project;
        setProjects(prev => [createdProjectWithBooking, ...prev]);
        setLeads(prev => [createdLead, ...prev]);

        if (promoCodeAppliedId) {
            setPromoCodes(prev => prev.map(p => p.id === promoCodeAppliedId ? { ...p, usageCount: p.usageCount + 1 } : p));
        }

        if (dpAmount > 0) {
            const today = new Date().toISOString().split('T')[0];
            try {
                const createdTx = await createTransaction({
                    date: today,
                    description: `DP Acara Pernikahan ${createdProject.projectName}`,
                    amount: dpAmount,
                    type: TransactionType.INCOME,
                    projectId: createdProject.id,
                    category: 'DP Acara Pernikahan',
                    method: 'Transfer Bank',
                    cardId: destinationCard.id,
                } as any);
                setTransactions(prev => [createdTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setCards(prev => prev.map(c => c.id === destinationCard.id ? { ...c, balance: c.balance + dpAmount } : c));
            } catch (err) {
                console.error('Gagal mencatat transaksi DP ke Supabase:', err);
                // fallback: tetap update lokal
                const localTx: Transaction = {
                    id: `TRN-DP-${createdProject.id}`,
                    date: today,
                    description: `DP Acara Pernikahan ${createdProject.projectName}`,
                    amount: dpAmount,
                    type: TransactionType.INCOME,
                    projectId: createdProject.id,
                    category: 'DP Acara Pernikahan',
                    method: 'Transfer Bank',
                    cardId: destinationCard.id,
                };
                setTransactions(prev => [localTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setCards(prev => prev.map(c => c.id === destinationCard.id ? { ...c, balance: c.balance + dpAmount } : c));
            }
        }

        addNotification({
            title: 'Booking Baru Diterima!',
            message: `Booking dari ${createdClient.name} untuk Package "${bookingModal.pkg.name}" menunggu konfirmasi.`,
            icon: 'lead',
            link: { view: ViewType.BOOKING }
        });

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const suggestedDp = totalProject * 0.3;

    return (
        isLoading || !userProfile ? (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A] mx-auto mb-4"></div>
                    <p className="text-[#4A4A4A] font-medium tracking-widest uppercase text-[10px]">Memuat Keindahan...</p>
                </div>
            </div>
        ) : error ? (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
                <div className="text-center p-8 max-w-md mx-auto bg-white rounded-[2.5rem] shadow-xl border border-black/5">
                    <div className="text-red-400 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">Terjadi Kesalahan</h3>
                    <p className="text-[#666666] mb-8 leading-relaxed font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl hover:bg-[#333333] transition-all duration-300 font-bold tracking-wide shadow-lg shadow-black/10 active:scale-[0.98]"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        ) : (
            <div className={`template-wrapper template-${template} min-h-screen bg-[#FAF9F6] selection:bg-[#B69255]/20`}>
                <style>{`
                .template-wrapper { 
                    font-family: 'Manrope', sans-serif;
                    color: #1A1A1A;
                    overflow-x: hidden;
                }
                .aesthetic-shadow {
                    box-shadow: 0 10px 50px -12px rgba(0, 0, 0, 0.08);
                }
                .aesthetic-card {
                    background: white;
                    border: 1px solid rgba(0, 0, 0, 0.04);
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .premium-button {
                    background: #1A1A1A;
                    color: white;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hero-reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    animation: aestheticReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes aestheticReveal {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #B69255;
                    border-radius: 10px;
                }
            `}</style>
                
                <div className="w-full max-w-7xl mx-auto py-16 md:py-8 px-6 md:px-12">

                    {userProfile?.publicPageConfig?.galleryImages && userProfile.publicPageConfig.galleryImages.length > 0 && (
                        <section className="mb-32 hero-reveal" style={{ animationDelay: '200ms' }}>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                {userProfile.publicPageConfig.galleryImages.map((imgSrc: string, index: number) => (
                                    <div key={index} className="break-inside-avoid relative group overflow-hidden rounded-[2.5rem] aesthetic-shadow bg-white">
                                        <img
                                            src={imgSrc}
                                            alt={`Gallery capture ${index + 1}`}
                                            loading="lazy"
                                            className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="mb-32 grid md:grid-cols-2 gap-8 hero-reveal" style={{ animationDelay: '300ms' }}>
                        <div className="aesthetic-card rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-[#B69255]/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
                            <button onClick={() => setIsWorkflowOpen(!isWorkflowOpen)} className="w-full flex justify-between items-center text-left relative z-10">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#B69255]">The Process</span>
                                    <h3 className="text-3xl font-extrabold tracking-tight">Timeline & Workflow</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-full border border-black/5 flex items-center justify-center transition-all duration-500 ${isWorkflowOpen ? 'bg-black text-white rotate-180 shadow-xl' : 'bg-white text-black'}`}>
                                    <ChevronDownIcon className="w-5 h-5" />
                                </div>
                            </button>
                            <div className={`transition-all duration-700 ease-in-out grid ${isWorkflowOpen ? 'grid-rows-[1fr] mt-10 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="space-y-10">
                                        <div className="relative pl-8 border-l border-[#B69255]/20 space-y-8">
                                            {[
                                                { t: "Konsep & Konsultasi", d: "H-90 • Mematangkan visi hari bahagia Anda bersama tim kami." },
                                                { t: "Pemilihan Vendor & Detail", d: "H-60 • Kurasi terbaik untuk setiap aspek dokumentasi." },
                                                { t: "Technical Meeting", d: "H-14 • Memastikan setiap detail berjalan sempurna." },
                                                { t: "The Wedding Day", d: "Hari H • Kami mengabadikan setiap emosi dengan tulus." },
                                                { t: "Final Handover", d: "H+30 • Hasil karya terbaik sampai di tangan Anda." }
                                            ].map((step, i) => (
                                                <div key={i} className="relative">
                                                    <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-[#B69255] border-4 border-white shadow-sm"></div>
                                                    <h4 className="font-extrabold text-[#1A1A1A] text-lg mb-1">{step.t}</h4>
                                                    <p className="text-[#666666] text-sm font-medium">{step.d}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="aesthetic-card rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
                            <button onClick={() => setIsTermsOpen(!isTermsOpen)} className="w-full flex justify-between items-center text-left relative z-10">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#B69255]">General</span>
                                    <h3 className="text-3xl font-extrabold tracking-tight">Terms & Conditions</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-full border border-black/5 flex items-center justify-center transition-all duration-500 ${isTermsOpen ? 'bg-black text-white rotate-180 shadow-xl' : 'bg-white text-black'}`}>
                                    <ChevronDownIcon className="w-5 h-5" />
                                </div>
                            </button>
                            <div className={`transition-all duration-700 ease-in-out grid ${isTermsOpen ? 'grid-rows-[1fr] mt-10 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="max-h-80 overflow-y-auto pr-6 space-y-6 text-[#666666] font-medium leading-relaxed custom-scrollbar text-sm">
                                        {formattedTerms ? (
                                            <div className="aesthetic-terms">{formattedTerms}</div>
                                        ) : (
                                            <p className="text-center py-12 opacity-50 italic">Syarat dan ketentuan belum diatur.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div id="packages-section" className="space-y-32">
                        {Object.entries(packagesByCategory as Record<string, Package[]>).map(([category, pkgs], catIdx) => (
                            <section key={category} className="hero-reveal" style={{ animationDelay: `${400 + catIdx * 100}ms` }}>
                                <div className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                                    <div className="max-w-2xl">
                                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#B69255] mb-4 block">Collection Category</span>
                                        <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{category}</h3>
                                        <div className="text-[#666666] text-lg font-medium leading-relaxed">
                                            {categoryDescriptions[category] || `Berbagai pilihan Package untuk kebutuhan ${category.toLowerCase()} Anda.`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-[#B69255] font-black text-xs tracking-widest uppercase bg-[#B69255]/5 px-6 py-3 rounded-full">
                                        <span>{pkgs.length} Collections</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                                    {pkgs.map((pkg, index) => (
                                        <div key={pkg.id} className="aesthetic-card rounded-[3rem] overflow-hidden flex flex-col hero-reveal relative" style={{ animationDelay: `${500 + index * 100}ms` }}>
                                            {pkg.id === mostPopularPackageId && (
                                                <div className="absolute top-6 right-6 bg-[#B69255] text-white text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full shadow-2xl z-20">Popular Choice</div>
                                            )}
                                            <div className="w-full h-[350px] relative overflow-hidden group p-4 pb-0">
                                                <div className="w-full h-full overflow-hidden rounded-[2.5rem] bg-[#1A1A1A]/5">
                                                    {pkg.coverImage ? (
                                                        <img
                                                            src={pkg.coverImage}
                                                            alt={pkg.name}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center opacity-20">
                                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="px-8 pt-8 pb-10 flex flex-col flex-grow">
                                                <h4 className="text-xl md:text-2xl font-black mb-2 text-[#1A1A1A]">{pkg.name}</h4>
                                                <span className="text-2xl font-black text-[#B69255] mb-8">{formatCurrency(pkg.price)}</span>
                                                
                                                <div className="space-y-4 mb-10 flex-grow">
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {[
                                                            { label: pkg.photographers, icon: 'camera' },
                                                            { label: pkg.videographers, icon: 'video' },
                                                            ...(pkg.digitalItems.map(item => ({ label: item, icon: 'digital' }))),
                                                            ...(pkg.physicalItems.map(item => ({ label: item.name, icon: 'physical' })))
                                                        ].filter(item => item.label).map((item, i) => (
                                                            <div key={i} className="flex items-center gap-3 text-sm font-semibold text-[#666666]">
                                                                <div className="w-1 h-1 rounded-full bg-[#B69255]"></div>
                                                                <span className="leading-snug">{item.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <button onClick={() => handleOpenBookingModal(pkg)} className="premium-button w-full py-5 rounded-[1.5rem] font-bold tracking-wide uppercase text-xs shadow-xl shadow-black/5">
                                                    Booking Sekarang
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                      </div>

                    {addOns.length > 0 && (
                        <section className="mt-48 hero-reveal" style={{ animationDelay: '600ms' }}>
                            <div className="text-center mb-16">
                                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#B69255] mb-4 block">Enhancements</span>
                                <h3 className="text-4xl font-black">Optional Add-ons</h3>
                                <p className="text-[#666666] font-medium mt-4">Lengkapi momen Anda dengan berbagai pilihan tambahan eksklusif.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {addOns.map(addOn => (
                                    <div key={addOn.id} className="p-10 rounded-[2.5rem] bg-white aesthetic-shadow flex flex-col justify-between group hover:bg-[#1A1A1A] transition-all duration-500">
                                        <div className="mb-8">
                                            <h4 className="text-lg font-extrabold mb-3 group-hover:text-white transition-colors">{addOn.name}</h4>
                                            <p className="text-sm text-[#666666] font-medium group-hover:text-white/60 transition-colors">Layanan tambahan premium untuk menyempurnakan hari bahagia Anda.</p>
                                        </div>
                                        <span className="text-xl font-black text-[#B69255]">{formatCurrency(addOn.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {userProfile?.phone && (
                        <section className="py-32 mt-32 border-t border-black/5 hero-reveal" style={{ animationDelay: '700ms' }}>
                            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-[#B69255]/10 flex items-center justify-center mb-10 shadow-inner">
                                    <WhatsappIcon className="w-8 h-8 text-[#B69255]" />
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Miliki Moment Indah Anda,<br/>Konsultasikan Sekarang.</h3>
                                <p className="text-lg text-[#666666] mb-12 max-w-2xl font-medium leading-relaxed">
                                    Tim kami siap membantu Anda merencanakan dokumentasi terbaik. Klik tombol di bawah untuk terhubung langsung dengan admin kami.
                                </p>
                                <a
                                    href={`https://wa.me/${cleanPhoneNumber(userProfile.phone)}?text=${encodeURIComponent('Halo Admin, saya butuh bantuan.')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="premium-button inline-flex items-center gap-4 px-12 py-6 rounded-[2rem] font-bold shadow-2xl shadow-black/20"
                                >
                                    Chat WhatsApp ({userProfile.phone})
                                </a>
                            </div>
                        </section>
                    )}

                    <footer className="pt-24 pb-12 border-t border-black/5 hero-reveal" style={{ animationDelay: '800ms' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                            <div className="lg:col-span-2">
                                <div className="mb-8">
                                    {userProfile.logoBase64 ? (
                                        <img src={userProfile.logoBase64} alt="Brand Logo" className="h-8 object-contain" />
                                    ) : (
                                        <span className="text-xl font-black tracking-tighter uppercase">{userProfile.companyName}</span>
                                    )}
                                </div>
                                <p className="text-[#666666] font-medium leading-relaxed max-w-sm">
                                    Membantu Anda mengabadikan setiap detik berharga dengan kualitas terbaik dan dedikasi penuh.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-black tracking-widest uppercase text-[#B69255] mb-8">Navigation</h4>
                                <ul className="space-y-4 text-sm font-bold text-[#1A1A1A]">
                                    <li><a href="#" className="hover:text-[#B69255] transition-colors">Our Packages</a></li>
                                    <li><a href="#" className="hover:text-[#B69255] transition-colors">Gallery</a></li>
                                    <li><a href="#" className="hover:text-[#B69255] transition-colors">Contact</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-black tracking-widest uppercase text-[#B69255] mb-8">Contacts</h4>
                                <p className="text-sm font-semibold text-[#1A1A1A] leading-relaxed mb-6 whitespace-pre-line">
                                    {userProfile.address || 'Address information not available.'}
                                </p>
                                <div className="flex flex-col gap-2 text-sm font-bold">
                                    <a href={`mailto:${userProfile.email}`} className="text-[#666666] hover:text-[#B69255] transition-colors">{userProfile.email}</a>
                                    <a href={`tel:${userProfile.phone}`} className="text-[#666666] hover:text-[#B69255] transition-colors">{userProfile.phone}</a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-8 border-t border-black/5 opacity-40">
                            <p className="text-[10px] font-black tracking-widest uppercase">&copy; {new Date().getFullYear()} {userProfile.companyName}. All Rights Reserved.</p>
                            <div className="flex gap-8 text-[10px] font-black tracking-widest uppercase">
                                <a href="#" className="hover:text-[#B69255] transition-colors" onClick={() => setIsTermsModalOpen(true)}>Terms</a>
                                <a href="#" className="hover:text-[#B69255] transition-colors">Privacy</a>
                            </div>
                        </div>
                    </footer>
                </div>

                <Modal isOpen={bookingModal.isOpen} onClose={handleCloseBookingModal} title={`Reservation: ${bookingModal.pkg?.name}`} size="4xl">
                    {isSubmitted ? (
                        <div className="text-center py-16 px-8 animate-fade-in bg-white rounded-[2rem]">
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-3xl font-black text-[#1A1A1A] mb-4">Pemesanan Terkirim!</h3>
                            <p className="text-[#666666] font-medium max-w-md mx-auto mb-12">Terima kasih atas kepercayaan Anda. Tim kami akan segera meninjau pesanan Anda dan memberikan konfirmasi melalui WhatsApp.</p>
                            <div className="flex flex-col gap-4">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="premium-button py-5 px-10 rounded-2xl font-bold tracking-wide shadow-xl shadow-black/10 text-center"
                                >
                                    Konfirmasi via WhatsApp
                                </a>
                                <button onClick={handleCloseBookingModal} className="py-4 text-sm font-black text-[#666666] hover:text-[#1A1A1A] transition-colors">Tutup Jendela Ini</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-12 py-6 px-2">
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black tracking-[0.2em] uppercase text-[#B69255] border-b border-black/5 pb-4">Personal Details</h4>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest uppercase opacity-50">Full Name</label>
                                                <input type="text" name="clientName" value={formData.clientName} onChange={handleFormChange} className="w-full bg-[#1A1A1A]/5 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-[#B69255]/20 font-semibold" placeholder="Nama Lengkap Anda" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest uppercase opacity-50">Email Address</label>
                                                <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full bg-[#1A1A1A]/5 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-[#B69255]/20 font-semibold" placeholder="email@contoh.com" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest uppercase opacity-50">WhatsApp Number</label>
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className="w-full bg-[#1A1A1A]/5 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-[#B69255]/20 font-semibold" placeholder="08..." required />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black tracking-[0.2em] uppercase text-[#B69255] border-b border-black/5 pb-4">Event Information</h4>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest uppercase opacity-50">Event Date</label>
                                                <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="w-full bg-[#1A1A1A]/5 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-[#B69255]/20 font-semibold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest uppercase opacity-50">Location / Venue</label>
                                                <input type="text" name="location" value={formData.location} onChange={handleFormChange} className="w-full bg-[#1A1A1A]/5 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-[#B69255]/20 font-semibold" placeholder="Lokasi Acara" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black tracking-[0.2em] uppercase text-[#B69255] border-b border-black/5 pb-4">Reservation Summary</h4>
                                        <div className="bg-[#1A1A1A]/5 rounded-[2rem] p-8 space-y-6">
                                            <div className="flex justify-between items-center text-sm font-bold">
                                                <span className="opacity-50">Package Selection</span>
                                                <span className="text-[#1A1A1A]">{bookingModal.pkg?.name}</span>
                                            </div>
                                            
                                            {bookingModal.pkg?.durationOptions && bookingModal.pkg.durationOptions.length > 0 && (
                                                <div className="space-y-4 pt-4 border-t border-black/5">
                                                    <label className="text-[10px] font-black tracking-widest uppercase text-[#B69255]">Working Hours Option</label>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {bookingModal.pkg.durationOptions.map(opt => (
                                                            <label key={opt.label} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.durationSelection === opt.label ? 'border-[#B69255] bg-white shadow-lg' : 'border-transparent bg-white/50 hover:bg-white'}`}>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-black">{opt.label}</span>
                                                                    <span className="text-[10px] opacity-60 font-bold">{formatCurrency(opt.price)}</span>
                                                                </div>
                                                                <input type="radio" name="durationSelection" value={opt.label} checked={formData.durationSelection === opt.label} onChange={handleFormChange} className="accent-[#B69255]" />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {formData.selectedAddOnIds.length > 0 && (
                                                <div className="space-y-3 pt-4 border-t border-black/5">
                                                     <label className="text-[10px] font-black tracking-widest uppercase text-[#B69255]">Selected Add-ons</label>
                                                     {addOns.filter(a => formData.selectedAddOnIds.includes(a.id)).map(a => (
                                                        <div key={a.id} className="flex justify-between items-center text-xs font-bold">
                                                            <span className="opacity-50">{a.name}</span>
                                                            <span>{formatCurrency(a.price)}</span>
                                                        </div>
                                                     ))}
                                                </div>
                                            )}
                                            
                                            <div className="pt-6 border-t-2 border-dashed border-black/10 flex justify-between items-center">
                                                <span className="text-xs font-black tracking-widest uppercase">Estimated Total</span>
                                                <span className="text-2xl font-black text-[#B69255]">{formatCurrency(totalProject)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black tracking-[0.2em] uppercase text-[#B69255] border-b border-black/5 pb-4">Payment & Confirmation</h4>
                                        <div className="space-y-6">
                                            <div className="bg-[#B69255]/5 rounded-2xl p-6 border border-[#B69255]/10 text-center">
                                                <p className="text-[10px] font-black tracking-widest uppercase opacity-50 mb-1 text-center">Bank Account for Deposit</p>
                                                <p className="text-xl font-black text-[#1A1A1A] tracking-tight">{userProfile.bankAccount}</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black tracking-widest uppercase opacity-50">DP Amount</label>
                                                    <RupiahInput
                                                        name="dp"
                                                        value={String(formData.dp ?? '')}
                                                        onChange={(raw) => setFormData(prev => ({ ...prev, dp: raw }))}
                                                        className="w-full bg-[#1A1A1A]/5 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-[#B69255]/20 font-bold"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black tracking-widest uppercase opacity-50">Reference ID</label>
                                                    <input type="text" name="dpPaymentRef" value={formData.dpPaymentRef} onChange={handleFormChange} className="w-full bg-[#1A1A1A]/5 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-[#B69255]/20 font-bold" placeholder="Digit Terakhir" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black tracking-widest uppercase opacity-50 block">Upload Transfer Proof</label>
                                                <div className="relative group">
                                                    <input type="file" id="dpPaymentProof" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                                                    <div className="border-2 border-dashed border-black/10 rounded-[2rem] p-10 text-center transition-all group-hover:border-[#B69255]/30 group-hover:bg-[#B69255]/5">
                                                        <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110">
                                                            <UploadIcon className="w-5 h-5 text-[#B69255]" />
                                                        </div>
                                                        <span className="text-xs font-bold block">{paymentProof ? paymentProof.name : "Klik atau seret file ke sini"}</span>
                                                        <span className="text-[10px] opacity-40 font-bold mt-1 block uppercase tracking-widest">Max 10MB • JPG, PNG, PDF</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                             
                             <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-black/5">
                                <p className="text-[10px] font-bold text-[#666666] max-w-sm leading-relaxed">Dengan mengirimkan form ini, Anda menyetujui syarat dan ketentuan yang berlaku sebagaimana telah dijabarkan oleh vendor terkait.</p>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button type="button" onClick={handleCloseBookingModal} className="flex-1 md:flex-none px-10 py-5 rounded-2xl text-xs font-black tracking-widest uppercase text-[#666666] hover:bg-black/5 transition-colors">Batal</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none premium-button px-12 py-5 rounded-2xl font-bold tracking-wide shadow-2xl shadow-black/20">
                                        {isSubmitting ? 'Processing...' : 'Selesaikan Booking'}
                                    </button>
                                </div>
                             </div>
                        </form>
                    )}
                </Modal>

                <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} title="Syarat & Ketentuan Umum">
                    <div className="max-h-[70vh] overflow-y-auto pr-6 custom-scrollbar text-[#666666] font-medium leading-relaxed aesthetic-terms">
                        {formattedTerms ? (
                            <div>{formattedTerms}</div>
                        ) : (
                            <p className="text-center py-12 opacity-50 italic">Syarat dan ketentuan belum diatur oleh vendor.</p>
                        )}
                    </div>
                </Modal>
            </div>
        )
    );
};

export default PublicPackages;
