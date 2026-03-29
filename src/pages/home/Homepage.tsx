
import React, { useState } from 'react';
import { 
    FolderKanbanIcon, 
    DollarSignIcon, 
    UsersIcon, 
    CheckIcon, 
    CalendarIcon, 
    PackageIcon, 
    ChartPieIcon, 
    SparkleIcon, 
    StarIcon, 
    UserCheckIcon, 
    LightbulbIcon, 
    CheckCircleIcon,
    WhatsappIcon,
    ChevronDownIcon,
    FileTextIcon,
    PencilIcon
} from '@/constants';

// --- Components ---

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-brand-border/50 py-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-2 hover:text-brand-accent transition-colors group"
            >
                <span className="font-bold text-lg text-brand-text-light group-hover:text-brand-accent">{question}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-accent' : 'text-brand-text-secondary'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <p className="text-brand-text-secondary leading-relaxed pb-4">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const FloatingWhatsAppButton = () => (
    <a 
        href="https://wa.me/6281234567890?text=Halo%20weddfin,%20saya%20tertarik%20tahu%20lebih%20lanjut" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[200] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce-subtle group"
    >
        <WhatsappIcon className="w-8 h-8" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-brand-text-light px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-brand-border">
            Tanya Tim Sales
        </span>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-pulse border-2 border-white"></div>
    </a>
);

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="glass-card p-8 rounded-3xl border border-brand-border/50 card-hover-lift group">
        <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6 text-brand-accent group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-brand-text-light mb-3 group-hover:text-brand-accent transition-colors">{title}</h3>
        <p className="text-brand-text-secondary leading-relaxed">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{ name: string; role: string; content: string; image?: string }> = ({ name, role, content, image }) => (
    <div className="glass-card p-8 rounded-3xl border border-brand-border/50 card-hover-lift relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <SparkleIcon className="w-12 h-12" />
        </div>
        <div className="flex items-center gap-1 mb-4 text-amber-400">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4 fill-current" />)}
        </div>
        <p className="text-brand-text-primary italic mb-6">"{content}"</p>
        <div className="flex items-center gap-4 border-t border-brand-border/30 pt-4">
            <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center font-bold text-brand-accent">
                {image ? <img src={image} alt={name} className="w-full h-full rounded-full object-cover" /> : name[0]}
            </div>
            <div>
                <h4 className="font-bold text-brand-text-light">{name}</h4>
                <p className="text-xs text-brand-text-secondary">{role}</p>
            </div>
        </div>
    </div>
);

const PricingCard: React.FC<{ 
    tier: string; 
    price: string; 
    features: string[]; 
    isPopular?: boolean;
    cta: string;
}> = ({ tier, price, features, isPopular, cta }) => (
    <div className={`relative p-8 rounded-3xl border transition-all duration-300 ${
        isPopular 
        ? 'bg-brand-surface shadow-2xl border-brand-accent scale-105 z-10' 
        : 'bg-white/50 border-brand-border hover:border-brand-accent/50'
    }`}>
        {isPopular && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Paling Populer
            </div>
        )}
        <h3 className="text-2xl font-bold text-brand-text-light mb-2">{tier}</h3>
        <div className="mb-6">
            <span className="text-4xl font-extrabold text-brand-text-light">{price}</span>
            <span className="text-brand-text-secondary text-sm ml-1">/ tahun</span>
        </div>
        <ul className="space-y-4 mb-8">
            {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-brand-text-primary">
                    <CheckCircleIcon className="w-5 h-5 text-brand-success flex-shrink-0" />
                    <span>{f}</span>
                </li>
            ))}
        </ul>
        <button 
            type="button" 
            onClick={() => window.location.hash = '#/login'}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
                isPopular ? 'button-primary' : 'bg-brand-bg text-brand-text-light hover:bg-brand-border'
            }`}
        >
            {cta}
        </button>
    </div>
);

const Homepage: React.FC = () => {
    return (
        <div className="bg-brand-bg text-brand-text-primary selection:bg-brand-accent/20">
            <FloatingWhatsAppButton />

            {/* Header / Navbar */}
            <header className="py-4 px-6 md:px-12 flex justify-between items-center bg-brand-surface/70 backdrop-blur-md sticky top-0 z-[100] border-b border-brand-border/50">
                <div className="flex items-center gap-2">
                    <img src="/assets/images/logos/logoIcon.svg" alt="weddfin logo" className="w-8 h-8" />
                    <span className="text-2xl font-black text-brand-text-light tracking-tighter">weddfin</span>
                </div>
                
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-semibold hover:text-brand-accent transition-colors">Fitur</a>
                    <a href="#testimonials" className="text-sm font-semibold hover:text-brand-accent transition-colors">Testimoni</a>
                    <a href="#pricing" className="text-sm font-semibold hover:text-brand-accent transition-colors">Harga</a>
                    <a href="#faq" className="text-sm font-semibold hover:text-brand-accent transition-colors">FAQ</a>
                </nav>

                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={() => window.location.hash = '#/login'} 
                        className="button-primary px-6 py-2.5 text-sm"
                    >
                        Masuk Dasbor
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden">
                    {/* Background decor */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 mt-[-100px]">
                        <div className="absolute top-0 left-[10%] w-[400px] h-[400px] bg-brand-accent/10 blur-[120px] rounded-full"></div>
                        <div className="absolute bottom-0 right-[10%] w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full"></div>
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/5 border border-brand-accent/10 mb-8 animate-fade-in">
                            <SparkleIcon className="w-4 h-4 text-brand-accent" />
                            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Satu Solusi Untuk Ribuan Vendor</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black text-brand-text-light leading-[1.1] tracking-tight mb-8 max-w-4xl animate-slide-up">
                            Kelola Bisnis Wedding Anda <br />
                            <span className="text-gradient">Lebih Profesional.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-brand-text-secondary max-w-2xl mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Platform manajemen vendor pernikahan all-in-one. Dari pencatatan acara, pembayaran klien, hingga jadwal tim—semua dalam satu dasbor cerdas.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <button onClick={() => window.location.hash = '#/login'} className="button-primary px-10 py-4 text-lg font-bold">Mulai Sekarang</button>
                            <a href="#features" className="button-secondary px-10 py-4 text-lg font-bold">Lihat Fitur</a>
                        </div>

                        <div className="mt-20 relative w-full animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.15)] border-[8px] border-white/80">
                                <img src="/assets/images/landingpage/banner-img.png" alt="Dashboard Preview" className="w-full h-auto" />
                            </div>
                            {/* Floating Card UI Simulation */}
                            <div className="hidden lg:block absolute -left-12 top-11/12 glass-card p-6 rounded-3xl shadow-2xl border border-white animate-bounce-subtle translate-y-[-150%]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-2xl text-green-600"><CheckIcon className="w-6 h-6" /></div>
                                    <div>
                                        <div className="text-xs text-brand-text-secondary">Vendor Pelunasan</div>
                                        <div className="font-black text-brand-text-light">Rp 15.000.000</div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:block absolute -right-12 bottom-20 glass-card p-6 rounded-3xl shadow-2xl border border-white float-animation">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><CalendarIcon className="w-6 h-6" /></div>
                                    <div>
                                        <div className="text-xs text-brand-text-secondary">Jadwal Minggu Ini</div>
                                        <div className="font-black text-brand-text-light">5 Acara Aktif</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WhatsApp Integration Highlight */}
                <section className="py-24 px-6 bg-[#075e54] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                                <WhatsappIcon className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Notifikasi Terotomatisasi</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                Kirim Update Langsung ke <br />
                                <span className="text-[#25D366]">WhatsApp Klien.</span>
                            </h2>
                            <p className="text-white/80 text-lg">
                                Tidak perlu lagi mengetik manual satu-satu. Kirim invoice, tanda terima, atau link portal pengantin dengan satu klik saja.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-3 items-center">
                                    <CheckCircleIcon className="w-6 h-6 text-[#25D366]" />
                                    <span>Reminder Pembayaran Otomatis</span>
                                </li>
                                <li className="flex gap-3 items-center">
                                    <CheckCircleIcon className="w-6 h-6 text-[#25D366]" />
                                    <span>Kirim Link Portal Pengantin Instan</span>
                                </li>
                                <li className="flex gap-3 items-center">
                                    <CheckCircleIcon className="w-6 h-6 text-[#25D366]" />
                                    <span>Laporan Pekerjaan Tim / Vendor</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                             <div className="glass-card bg-white p-6 rounded-[2.5rem] shadow-2xl max-w-sm mx-auto overflow-hidden text-brand-text-light">
                                <div className="flex items-center gap-3 mb-6 bg-brand-bg -m-6 p-6 border-b border-brand-border">
                                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold">W</div>
                                    <div className="font-bold">weddfin Business</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-sm self-start max-w-[90%] border border-slate-200 shadow-sm leading-relaxed">
                                        Halo *Anissa & Dimas*! 👋 <br /><br />
                                        Berikut invoice terbaru untuk Acara Pernikahan Anda. Klik link di bawah untuk melihat detail:<br />
                                        <span className="text-blue-600 underline">portal.weddfin.id/INV-2024-001</span>
                                    </div>
                                    <div className="bg-[#dcf8c6] p-4 rounded-2xl rounded-tr-none text-sm self-end ml-auto max-w-[90%] border border-[#c7eba7] shadow-sm leading-relaxed">
                                        Wah terima kasih banyak weddfin! Sangat membantu 🙏
                                    </div>
                                </div>
                             </div>
                             <div className="absolute -z-10 -bottom-10 -left-10 w-32 h-32 bg-[#25D366]/30 blur-[40px] rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </section>

                {/* Digital Contract Highlight */}
                <section className="py-24 px-6 bg-brand-surface border-b border-brand-border/30">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="flex-1 space-y-8">
                             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/5 border border-brand-accent/20">
                                <PencilIcon className="w-5 h-5 text-brand-accent" />
                                <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Kontrak Tanpa Kertas</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-brand-text-light leading-tight">
                                Tanda Tangan Kontrak <br />
                                <span className="text-brand-accent">Kapan Saja, Dimana Saja.</span>
                            </h2>
                            <p className="text-brand-text-secondary text-lg leading-relaxed">
                                Berhenti repot cetak kertas dan kirim kurir. Dengan fitur Kontrak Digital, klien Anda bisa menanda tangani SPK langsung dari layar ponsel mereka secara sah.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-brand-bg rounded-3xl border border-brand-border">
                                    <FileTextIcon className="w-8 h-8 text-brand-accent mb-4" />
                                    <h5 className="font-bold text-brand-text-light">Template SPK</h5>
                                    <p className="text-xs text-brand-text-secondary">Simpan pasal-pasal standar Anda untuk digunakan berulang kali.</p>
                                </div>
                                <div className="p-6 bg-brand-bg rounded-3xl border border-brand-border">
                                    <UserCheckIcon className="w-8 h-8 text-brand-accent mb-4" />
                                    <h5 className="font-bold text-brand-text-light">Verifikasi Klien</h5>
                                    <p className="text-xs text-brand-text-secondary">Sistem mencatat IP & Waktu tanda tangan demi keamanan hukum.</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative glass-card bg-white p-10 rounded-3xl border border-brand-border/50 shadow-2xl">
                                    <div className="border-b border-brand-border pb-6 mb-8 flex justify-between items-center">
                                        <div className="font-black text-2xl tracking-tighter">SPK #9921</div>
                                        <div className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full uppercase">Perlu Tanda Tangan</div>
                                    </div>
                                    <div className="space-y-4 mb-10">
                                        <div className="h-4 w-full bg-brand-bg rounded"></div>
                                        <div className="h-4 w-5/6 bg-brand-bg rounded"></div>
                                        <div className="h-4 w-4/6 bg-brand-bg rounded"></div>
                                    </div>
                                    <div className="border-2 border-dashed border-brand-border rounded-2xl h-32 flex items-center justify-center text-brand-text-secondary italic text-sm bg-brand-bg/50">
                                        Klik untuk Tanda Tangan
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 px-6 bg-brand-bg">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-brand-text-light mb-4">Fitur Tanpa Kompromi.</h2>
                            <p className="text-brand-text-secondary max-w-xl mx-auto">Dirancang spesifik untuk kebutuhan industri pernikahan di Indonesia.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard 
                                title="Manajemen Acara" 
                                description="Papan Kanban visual untuk melacak progres tiap pengantin dari DP hingga Peluncuran file."
                                icon={<FolderKanbanIcon className="w-8 h-8" />}
                            />
                            <FeatureCard 
                                title="Keuangan & Cashflow" 
                                description="Kelola pengeluaran vendor pendukung dan monitor margin keuntungan Anda secara real-time."
                                icon={<DollarSignIcon className="w-8 h-8" />}
                            />
                            <FeatureCard 
                                title="Portal Klien" 
                                description="Berikan pengalaman VIP kepada pengantin dengan akses melihat detail acara mereka sendiri."
                                icon={<UsersIcon className="w-8 h-8" />}
                            />
                            <FeatureCard 
                                title="Kalender Pintar" 
                                description="Cegah bentrok jadwal! Sistem akan memberi tahu jika ada acara di hari yang sama."
                                icon={<CalendarIcon className="w-8 h-8" />}
                            />
                            <FeatureCard 
                                title="Layanan & Package" 
                                description="Kelola penawaran paket Anda dengan mudah di sistem."
                                icon={<PackageIcon className="w-8 h-8" />}
                            />
                            <FeatureCard 
                                title="Analitik & Laporan" 
                                description="Laporan performa bulanan dan tahunan untuk membantu Anda mengambil keputusan bisnis."
                                icon={<ChartPieIcon className="w-8 h-8" />}
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 px-6 bg-brand-surface relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-brand-text-light mb-4">Harga Jujur & Terjangkau.</h2>
                            <p className="text-brand-text-secondary">Pilih paket yang paling cocok dengan kapasitas bisnis Anda saat ini.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8 lg:px-20">
                            <PricingCard 
                                tier="Starter" 
                                price="Rp 499rb" 
                                features={[
                                    "Hingga 20 Acara Pernikahan",
                                    "Manajemen Keuangan Dasar",
                                    "Kalender Acara",
                                    "Dukungan Email"
                                ]} 
                                cta="Coba Gratis"
                            />
                            <PricingCard 
                                tier="Pro" 
                                price="Rp 1.490rb" 
                                isPopular={true}
                                features={[
                                    "Acara Pernikahan Tak Terbatas",
                                    "Portal Klien Eksklusif",
                                    "Manajemen Tim & Vendor",
                                    "Invoice & PDF Otomatis",
                                    "Laporan Keuangan Advanced"
                                ]} 
                                cta="Langganan Sekarang"
                            />
                            <PricingCard 
                                tier="Elite" 
                                price="Rp 2.990rb" 
                                features={[
                                    "Semua Fitur Pro",
                                    "Multi-Akun Cabang",
                                    "Kustomisasi Branding",
                                    "Manajer Akun Prioritas",
                                    "Integrasi WhatsApp"
                                ]} 
                                cta="Hubungi Kami"
                            />
                        </div>
                        
                        <p className="mt-12 text-center text-sm text-brand-text-secondary">
                            * Seluruh harga di atas berlaku untuk 1 tahun berlangganan. <br />
                            Butuh solusi kustom? <a href="#" className="text-brand-accent font-bold">Chat Tim Sales Kami</a>
                        </p>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-24 px-6 bg-brand-bg">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-brand-text-light mb-4">Tanya Jawab.</h2>
                            <p className="text-brand-text-secondary">Segala yang perlu Anda ketahui untuk memulai.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <FAQItem 
                                question="Apakah data saya aman di weddfin?" 
                                answer="Sangat aman. Kami menggunakan enkripsi standar perbankan dan pencadangan harian untuk memastikan semua data klien dan bisnis Anda terlindungi setiap saat." 
                            />
                            <FAQItem 
                                question="Apakah bisa upgrade paket di tengah jalan?" 
                                answer="Tentu saja! Anda bisa melakukan upgrade kapan saja melalui menu pengaturan akun. Tim kami akan membantu menyesuaikan tagihan secara prorata." 
                            />
                            <FAQItem 
                                question="Butuh berapa lama untuk belajar cara memakainya?" 
                                answer="Interface weddfin dirancang sangat user-friendly. Sebagian besar vendor sudah bisa menggunakan fitur dasar dalam waktu kurang dari 30 menit. Kami juga menyediakan tutorial lengkap." 
                            />
                            <FAQItem 
                                question="Apa yang terjadi jika saya memutuskan untuk berhenti?" 
                                answer="Data tetap milik Anda. Anda bisa mendownload semua rekap data ke format Excel/CSV sebelum masa berlangganan berakhir." 
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-6">
                    <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-brand-accent to-blue-700 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                        {/* Decor blobs */}
                        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 blur-[80px] rounded-full"></div>
                        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 blur-[80px] rounded-full"></div>
                        
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10 leading-tight">
                            Siap Transformasi Bisnis <br className="hidden md:block" /> Wedding Anda?
                        </h2>
                        <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10">
                            Bergabunglah dengan ratusan vendor profesional lainnya. Kelola proyek dengan cerdas, bukan keras.
                        </p>
                        <div className="relative z-10">
                            <button onClick={() => window.location.hash = '#/login'} className="bg-white text-brand-accent px-12 py-5 rounded-2xl font-black text-xl hover:bg-opacity-90 hover:scale-[1.05] transition-all shadow-xl">
                                Daftar Dasbor Gratis Sekarang
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-brand-surface pt-20 pb-12 px-6 border-t border-brand-border/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="/assets/images/logos/logoIcon.svg" alt="weddfin logo" className="w-8 h-8" />
                                <span className="text-2xl font-black text-brand-text-light tracking-tighter">weddfin</span>
                            </div>
                            <p className="text-brand-text-secondary max-w-xs mb-8">
                                Solusi manajemen terlengkap untuk vendor pernikahan digital di Indonesia. Efisiensi, Transparansi, dan Pertumbuhan.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text-light mb-6">Navigasi</h5>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><a href="#features" className="hover:text-brand-accent">Fitur</a></li>
                                <li><a href="#testimonials" className="hover:text-brand-accent">Testimoni</a></li>
                                <li><a href="#pricing" className="hover:text-brand-accent">Harga</a></li>
                                <li><a href="#faq" className="hover:text-brand-accent">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-brand-text-light mb-6">Kontak</h5>
                            <ul className="space-y-4 text-sm font-medium text-brand-text-secondary">
                                <li>halo@weddfin.id</li>
                                <li>WhatsApp: +62 812-xxxx-xxxx</li>
                                <li>Bandung, Indonesia</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-brand-border/30 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-brand-text-secondary">
                        <p>&copy; {new Date().getFullYear()} weddfin (by Digital Wedding Indonesia). Hak Cipta Dilindungi.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-brand-accent">Syarat & Ketentuan</a>
                            <a href="#" className="hover:text-brand-accent">Kebijakan Privasi</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;

