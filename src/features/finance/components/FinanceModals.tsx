import React from 'react';
import Modal from '@/shared/ui/Modal';
import RupiahInput from '@/shared/form/RupiahInput';
import CollapsibleSection from '@/shared/ui/CollapsibleSection';
import { TransactionType, CardType, PocketType, Profile, Project, Card, FinancialPocket } from '@/types';
import { formatCurrency } from '@/features/finance/utils/finance.utils';

interface FinanceModalsProps {
    modalState: { type: any; mode: 'add' | 'edit'; data?: any };
    onClose: () => void;
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    cards: Card[];
    pockets: FinancialPocket[];
    projects: Project[];
    profile: Profile;
}

export const FinanceModals: React.FC<FinanceModalsProps> = ({
    modalState,
    onClose,
    form,
    setForm,
    onFormChange,
    onSubmit,
    cards,
    pockets,
    projects,
    profile
}) => {
    if (!modalState.type) return null;

    const renderTitle = () => {
        const { mode, type, data } = modalState;
        const prefix = mode === 'add' ? 'Tambah' : 'Edit';
        switch (type) {
            case 'transaction': return `${prefix} Transaksi`;
            case 'pocket': return `${prefix} Kantong`;
            case 'card': return `${prefix} Kartu/Akun`;
            case 'topup-cash': return 'Top-up Tunai';
            case 'transfer':
                if (form.type === 'withdraw') return `Tarik Dana dari "${data?.name}"`;
                if (form.type === 'deposit') return `Setor Dana ke "${data?.name}"`;
                return 'Transfer';
            default: return 'Modal Keuangan';
        }
    };

    return (
        <Modal isOpen={!!modalState.type} onClose={onClose} title={renderTitle()}>
            <form onSubmit={onSubmit} className="space-y-6">
                {modalState.type === 'transaction' && (
                    <CollapsibleSection title="Informasi Transaksi" defaultExpanded={true} variant="filled">
                        <div className="space-y-4 p-1">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Tanggal</label>
                                <input type="date" name="date" value={form.date || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-mono" required />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Jenis</label>
                                    <select name="type" value={form.type || TransactionType.EXPENSE} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold">
                                        <option value={TransactionType.EXPENSE}>Pengeluaran</option>
                                        <option value={TransactionType.INCOME}>Pemasukan</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Metode Pembayaran</label>
                                    <select name="method" value={form.method || 'Transfer Bank'} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required>
                                        <option value="Transfer Bank">Transfer Bank</option>
                                        <option value="Tunai">Tunai</option>
                                        <option value="E-Wallet">E-Wallet</option>
                                        <option value="Kartu">Kartu / CC</option>
                                        <option value="Sistem">Sistem</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Deskripsi</label>
                                <input type="text" name="description" value={form.description || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-semibold" placeholder="Nama transaksi..." required />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Jumlah (IDR)</label>
                                <RupiahInput
                                    value={String(form.amount ?? '')}
                                    onChange={(raw) => setForm((prev: any) => ({ ...prev, amount: raw }))}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-black text-blue-600 text-lg"
                                    placeholder="0"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Kategori</label>
                                    <select name="category" value={form.category || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required>
                                        <option value="">Pilih Kategori...</option>
                                        {(form.type === TransactionType.INCOME ? profile.incomeCategories : profile.expenseCategories).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                {form.type === TransactionType.INCOME ? (
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Setor Ke</label>
                                        <select name="cardId" value={form.cardId || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required>
                                            <option value="">Pilih Tujuan...</option>
                                            {cards.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.cardHolderName} {c.cardType !== CardType.TUNAI ? `(${c.bankName} **** ${c.lastFourDigits})` : '(Tunai)'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Sumber Dana</label>
                                        <select name="sourceId" value={form.sourceId || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required>
                                            <option value="">Pilih Sumber...</option>
                                            {cards.map(c => (
                                                <option key={c.id} value={`card-${c.id}`}>{c.cardHolderName} ({c.bankName || 'Tunai'})</option>
                                            ))}
                                            {pockets.filter(p => p.type === PocketType.EXPENSE).map(p => (
                                                <option key={p.id} value={`pocket-${p.id}`}>{p.name} (Sisa: {formatCurrency(p.amount)})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Terkait Proyek (Opsional)</label>
                                <select name="projectId" value={form.projectId || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-semibold">
                                    <option value="">Tidak Terkait Proyek</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.projectName} ({p.clientName})</option>)}
                                </select>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}

                {modalState.type === 'card' && (
                    <CollapsibleSection title="Detail Rekening / Akun" defaultExpanded={true} variant="filled">
                        <div className="space-y-4 p-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Jenis Akun</label>
                                    <select name="cardType" value={form.cardType || CardType.DEBIT} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold">
                                        {Object.values(CardType).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">{form.cardType === CardType.TUNAI ? 'Nama Akun Kas' : 'Nama Pemegang Kartu'}</label>
                                    <input type="text" name="cardHolderName" value={form.cardHolderName || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required />
                                </div>
                            </div>
                            {modalState.mode === 'add' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Saldo Awal</label>
                                    <RupiahInput value={String(form.initialBalance ?? '')} onChange={(raw) => setForm((p: any) => ({ ...p, initialBalance: raw }))} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-black text-blue-600 text-lg" placeholder="0" />
                                </div>
                            )}
                            {form.cardType !== CardType.TUNAI && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nama Bank</label>
                                        <input type="text" name="bankName" value={form.bankName || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">4 Digit Terakhir</label>
                                            <input type="text" name="lastFourDigits" value={form.lastFourDigits || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-mono font-bold" maxLength={4} required placeholder="0000" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Kadaluwarsa</label>
                                            <input type="text" name="expiryDate" value={form.expiryDate || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-mono" placeholder="MM/YY" />
                                        </div>
                                    </div>
                                </>
                            )}
                            {modalState.mode === 'edit' && (
                                <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10 mt-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3">Penyesuaian Saldo</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Jumlah</label>
                                            <RupiahInput allowNegative value={String(form.adjustmentAmount ?? '')} onChange={(raw) => setForm((p: any) => ({ ...p, adjustmentAmount: raw }))} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold text-red-500" placeholder="0" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Alasan</label>
                                            <input type="text" name="adjustmentReason" value={form.adjustmentReason || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-semibold" placeholder="..." />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>
                )}

                {modalState.type === 'pocket' && (
                    <CollapsibleSection title="Detail Kantong Keuangan" defaultExpanded={true} variant="filled">
                        <div className="space-y-4 p-1">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Nama Kantong</label>
                                <input type="text" name="name" value={form.name || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Deskripsi</label>
                                <textarea name="description" value={form.description || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white min-h-[80px] resize-none" placeholder="Tujuan kantong ini..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Sumber Dana Utama</label>
                                <select name="sourceCardId" value={form.sourceCardId || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required>
                                    <option value="">Pilih Sumber...</option>
                                    {cards.map(c => <option key={c.id} value={c.id}>{c.bankName || 'Tunai'} {c.lastFourDigits !== 'CASH' && `**** ${c.lastFourDigits}`}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Tipe</label>
                                    <select name="type" value={form.type || PocketType.SAVING} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold">
                                        {Object.values(PocketType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Target (Opsional)</label>
                                    <RupiahInput value={String(form.goalAmount ?? '')} onChange={(raw) => setForm((p: any) => ({ ...p, goalAmount: raw }))} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg/50 font-bold" placeholder="0" />
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}

                {(modalState.type === 'transfer' || modalState.type === 'topup-cash') && (
                    <CollapsibleSection title={modalState.type === 'transfer' ? 'Transfer Antar Rekening' : 'Top-up Kas Tunai'} defaultExpanded={true} variant="filled">
                        <div className="space-y-4 p-1">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Sumber Dana</label>
                                <select name="fromCardId" value={form.fromCardId || ''} onChange={onFormChange} className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-bold" required>
                                    <option value="">Pilih Kartu Sumber...</option>
                                    {cards.filter(c => c.cardType !== CardType.TUNAI).map(c => <option key={c.id} value={c.id}>{c.bankName} **** {c.lastFourDigits} (Saldo: {formatCurrency(c.balance)})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-brand-text-secondary">Jumlah (IDR)</label>
                                <RupiahInput
                                    value={String(form.amount ?? '')}
                                    onChange={(raw) => setForm((prev: any) => ({ ...prev, amount: raw }))}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white font-black text-blue-600 text-lg"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                    </CollapsibleSection>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-brand-border/10">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-brand-text-secondary hover:bg-brand-bg transition-colors">Batal</button>
                    <button type="submit" className="px-8 py-3 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        {modalState.mode === 'add' ? 'Simpan Data' : 'Update Data'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
