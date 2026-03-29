import { DEFAULT_PACKAGE_SHARE_TEMPLATE, DEFAULT_BOOKING_FORM_TEMPLATE, DEFAULT_INVOICE_SHARE_TEMPLATE, DEFAULT_RECEIPT_SHARE_TEMPLATE, DEFAULT_EXPENSE_SHARE_TEMPLATE, DEFAULT_PORTAL_SHARE_TEMPLATE, DEFAULT_CONTRACT_SHARE_TEMPLATE, DEFAULT_BILLING_SHARE_TEMPLATE } from '@/constants';
import { ShareTemplateConfig, TemplateVariable } from '@/features/settings/types';

export const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export const VARIABLE_CHIPS: TemplateVariable[] = [
    { label: '{clientName}', desc: 'Nama pengantin' },
    { label: '{projectName}', desc: 'Nama acara' },
    { label: '{packageName}', desc: 'Nama paket' },
    { label: '{amountPaid}', desc: 'Sudah dibayar' },
    { label: '{totalCost}', desc: 'Total biaya' },
    { label: '{sisaTagihan}', desc: 'Sisa tagihan' },
    { label: '{portalLink}', desc: 'Link portal pengantin' },
    { label: '{companyName}', desc: 'Nama perusahaan' },
];

export const BILLING_VARIABLE_CHIPS: TemplateVariable[] = [
    { label: '{clientName}', desc: 'Nama pengantin' },
    { label: '{projectDetails}', desc: 'Rincian acara & sisa tagihan per acara' },
    { label: '{totalDue}', desc: 'Total sisa tagihan' },
    { label: '{portalLink}', desc: 'Link portal pengantin' },
    { label: '{bankAccount}', desc: 'No. rekening bank' },
    { label: '{companyName}', desc: 'Nama perusahaan' },
];

export const PREVIEW_VARS: Record<string, string> = {
    clientName: 'Budi & Ani',
    projectName: 'Wedding Budi & Ani',
    packageName: 'Gold Package',
    amountPaid: 'Rp 5.000.000',
    totalCost: 'Rp 10.000.000',
    sisaTagihan: 'Rp 5.000.000',
    portalLink: 'https://example.com/portal/abc123',
    projectDetails: '- Acara Pernikahan: *Wedding Budi & Ani*\n  Sisa Tagihan: Rp 5.000.000',
    totalDue: 'Rp 5.000.000',
    bankAccount: 'BCA 1234567890 a.n. Wedding Studio',
    companyName: 'Wedding Studio',
    leadName: 'Calon Pengantin',
    packageLink: 'https://example.com/packages/abc123',
    bookingFormLink: 'https://example.com/booking/abc123',
    invoiceLink: 'https://example.com/invoice/abc123',
    receiptLink: 'https://example.com/receipt/abc123',
    txDate: '14 Maret 2026',
    txAmount: 'Rp 2.000.000',
    txMethod: 'Transfer BCA',
    txDesc: 'Pelunasan biaya fotografi',
    targetName: 'Vendor Bunga',
};

export const SHARE_TEMPLATE_CONFIGS: readonly ShareTemplateConfig[] = [
    {
        key: 'packageShareTemplate',
        label: 'Bagikan Katalog Package',
        desc: 'Digunakan saat share link katalog package ke Calon Pengantin di halaman Leads.',
        icon: '📦', color: 'purple', placeholder: 'Tulis template pesan untuk berbagi katalog package...', defaultValue: DEFAULT_PACKAGE_SHARE_TEMPLATE,
        variables: [
            { label: '{leadName}', desc: 'Nama calon pengantin' },
            { label: '{companyName}', desc: 'Nama perusahaan' },
            { label: '{packageLink}', desc: 'Link katalog package' },
        ],
    },
    {
        key: 'bookingFormTemplate',
        label: 'Kirim Form Booking',
        desc: 'Digunakan saat mengirim link form booking ke Calon Pengantin.',
        icon: '📋', color: 'blue', placeholder: 'Tulis template pesan untuk mengirim form booking...', defaultValue: DEFAULT_BOOKING_FORM_TEMPLATE,
        variables: [
            { label: '{leadName}', desc: 'Nama calon pengantin' },
            { label: '{companyName}', desc: 'Nama perusahaan' },
            { label: '{bookingFormLink}', desc: 'Link form booking' },
        ],
    },
    {
        key: 'invoiceShareTemplate',
        label: 'Kirim Invoice',
        desc: 'Digunakan saat share link Invoice PDF via WhatsApp dari halaman Acara Pernikahan.',
        icon: '🧾', color: 'yellow', placeholder: 'Tulis template pesan untuk mengirim invoice...', defaultValue: DEFAULT_INVOICE_SHARE_TEMPLATE,
        variables: [
            { label: '{clientName}', desc: 'Nama pengantin' },
            { label: '{companyName}', desc: 'Nama perusahaan' },
            { label: '{projectName}', desc: 'Nama acara' },
            { label: '{totalCost}', desc: 'Total biaya' },
            { label: '{amountPaid}', desc: 'Sudah dibayar' },
            { label: '{sisaTagihan}', desc: 'Sisa tagihan' },
            { label: '{invoiceLink}', desc: 'Link invoice PDF' },
        ],
    },
    {
        key: 'receiptShareTemplate',
        label: 'Kirim Tanda Terima Pelanggan',
        desc: 'Digunakan saat share Tanda Terima Pembayaran PDF ke pelanggan.',
        icon: '✅', color: 'green', placeholder: 'Tulis template pesan untuk mengirim tanda terima...', defaultValue: DEFAULT_RECEIPT_SHARE_TEMPLATE,
        variables: [
            { label: '{clientName}', desc: 'Nama pengantin' },
            { label: '{companyName}', desc: 'Nama perusahaan' },
            { label: '{projectName}', desc: 'Nama acara' },
            { label: '{txDate}', desc: 'Tanggal transaksi' },
            { label: '{txAmount}', desc: 'Jumlah pembayaran' },
            { label: '{txMethod}', desc: 'Metode pembayaran' },
            { label: '{txDesc}', desc: 'Keterangan transaksi' },
            { label: '{receiptLink}', desc: 'Link tanda terima PDF' },
        ],
    },
    {
        key: 'expenseShareTemplate',
        label: 'Kirim Slip Pengeluaran',
        desc: 'Digunakan saat share Bukti Pengeluaran / Slip Pembayaran ke vendor/supplier.',
        icon: '💸', color: 'red', placeholder: 'Tulis template pesan untuk mengirim slip pengeluaran...', defaultValue: DEFAULT_EXPENSE_SHARE_TEMPLATE,
        variables: [
            { label: '{targetName}', desc: 'Nama penerima / vendor' },
            { label: '{companyName}', desc: 'Nama perusahaan' },
            { label: '{txDate}', desc: 'Tanggal transaksi' },
            { label: '{txAmount}', desc: 'Jumlah pembayaran' },
            { label: '{txMethod}', desc: 'Metode pembayaran' },
            { label: '{txDesc}', desc: 'Keterangan transaksi' },
            { label: '{receiptLink}', desc: 'Link slip PDF' },
        ],
    },
    {
        key: 'portalShareTemplate',
        label: 'Share Portal Pengantin',
        desc: 'Digunakan saat membagikan link Portal Pengantin ke klien.',
        icon: '🔗', color: 'cyan', placeholder: 'Tulis template pesan untuk share portal pengantin...', defaultValue: DEFAULT_PORTAL_SHARE_TEMPLATE,
        variables: [
            { label: '{clientName}', desc: 'Nama pengantin' },
            { label: '{companyName}', desc: 'Nama perusahaan' },
            { label: '{portalLink}', desc: 'Link portal pengantin' },
        ],
    },
    {
        key: 'contractShareTemplate',
        label: 'Kirim Kontrak Digital',
        desc: 'Digunakan saat mengirim link Kontrak Digital ke klien untuk ditandatangani.',
        icon: '🖋️', color: 'indigo', placeholder: 'Tulis template pesan untuk mengirim kontrak...', defaultValue: DEFAULT_CONTRACT_SHARE_TEMPLATE,
        variables: [
            { label: '{clientName}', desc: 'Nama pengantin' },
            { label: '{companyName}', desc: 'Nama perusahaan' },
            { label: '{contractLink}', desc: 'Link kontrak digital' },
        ],
    },
    {
        key: 'billingShareTemplate',
        label: 'Kirim Penagihan Pembayaran',
        desc: 'Digunakan saat mengirim rincian tagihan dan instruksi pembayaran.',
        icon: '🏦', color: 'amber', placeholder: 'Tulis template pesan untuk menagih pembayaran...', defaultValue: DEFAULT_BILLING_SHARE_TEMPLATE,
        variables: [
            { label: '{clientName}', desc: 'Nama pengantin' },
            { label: '{companyName}', desc: 'Nama perusahaan' },
            { label: '{projectDetails}', desc: 'Rincian acara & tagihan' },
            { label: '{totalDue}', desc: 'Total sisa tagihan' },
            { label: '{portalLink}', desc: 'Link portal pengantin' },
            { label: '{bankAccount}', desc: 'Informasi rekening bank' },
        ],
    },
];

export const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const DEFAULT_STATUS_CONFIG = [
    {
        id: '1',
        name: 'Booking',
        color: '#3b82f6',
        defaultProgress: 10,
        subStatuses: [
            { name: 'DP Terbayar', note: 'DP telah diterima' },
            { name: 'Kontrak Ditandatangani', note: 'Kontrak sudah oke' }
        ],
        note: 'Tahap awal pemesanan'
    },
    {
        id: '2',
        name: 'Direncanakan',
        color: '#eab308',
        defaultProgress: 30,
        subStatuses: [
            { name: 'Technical Meeting', note: 'Diskusi detail acara' },
            { name: 'Briefing Tim', note: 'Tim sudah siap' }
        ],
        note: 'Tahap perencanaan'
    },
    {
        id: '3',
        name: 'Sedang Berlangsung',
        color: '#a855f7',
        defaultProgress: 60,
        subStatuses: [
            { name: 'Hari H', note: 'Pelaksanaan acara' },
            { name: 'Backup Data', note: 'Data sudah aman' }
        ],
        note: 'Tahap produksi'
    },
    {
        id: '4',
        name: 'Selesai',
        color: '#22c55e',
        defaultProgress: 100,
        subStatuses: [
            { name: 'Editing Selesai', note: 'Output sudah jadi' },
            { name: 'Penyerahan', note: 'Klien sudah terima' }
        ],
        note: 'Proyek telah selesai'
    }
];
