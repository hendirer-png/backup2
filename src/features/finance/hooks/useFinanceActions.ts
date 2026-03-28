import { useState } from 'react';
import {
    Transaction, FinancialPocket, Card, Project, Profile,
    TransactionType, PocketType, CardType
} from '@/types';
import * as transactionService from '@/services/transactions';
import * as pocketService from '@/services/pockets';
import * as cardService from '@/services/cards';
import * as projectService from '@/services/projects';

interface UseFinanceActionsProps {
    profile: Profile;
}

export const useFinanceActions = ({
    profile
}: UseFinanceActionsProps) => {
    const [modalState, setModalState] = useState<{ type: string | null; mode: 'add' | 'edit'; data?: any }>({ type: null, mode: 'add' });
    const [form, setForm] = useState<any>({});

    const toast = {
        success: (msg: string) => console.log('Success:', msg),
        error: (msg: string) => console.error('Error:', msg)
    };

    const handleOpenModal = (type: any, mode: 'add' | 'edit' = 'add', data?: any) => {
        setModalState({ type, mode, data });
        if (mode === 'edit' && data) {
            setForm({ ...data });
        } else {
            const initialForm: any = {
                date: new Date().toISOString().split('T')[0],
                type: TransactionType.EXPENSE,
                method: 'Transfer Bank',
                description: '',
                amount: '0',
                category: '',
                projectId: '',
                sourceId: '',
                cardId: ''
            };
            if (type === 'card') {
                initialForm.cardType = CardType.DEBIT;
                initialForm.bankName = '';
                initialForm.cardHolderName = '';
                initialForm.lastFourDigits = '';
            } else if (type === 'pocket') {
                initialForm.type = PocketType.SAVING;
                initialForm.icon = 'Wallet';
                initialForm.name = '';
                initialForm.description = '';
            } else if (type === 'topup-cash') {
                initialForm.type = 'topup-cash';
            } else if (type === 'transfer') {
                initialForm.type = 'transfer';
            }
            setForm(initialForm);
        }
    };

    const handleCloseModal = () => {
        setModalState({ type: null, mode: 'add' });
        setForm({});
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { type, mode, data: originalData } = modalState;

        try {
            if (type === 'transaction') {
                const isExpense = form.type === TransactionType.EXPENSE;
                let cardId = form.cardId || null;
                let pocketId = form.pocketId || null;

                if (isExpense && form.sourceId) {
                    if (form.sourceId.startsWith('card-')) cardId = form.sourceId.replace('card-', '');
                    else if (form.sourceId.startsWith('pocket-')) pocketId = form.sourceId.replace('pocket-', '');
                }

                const payload = {
                    ...form,
                    amount: Number(form.amount || 0),
                    cardId: cardId || null,
                    pocketId: pocketId || null,
                    projectId: form.projectId || null,
                    method: form.method || 'Transfer Bank'
                };
                delete (payload as any).sourceId;

                if (mode === 'add') {
                    await transactionService.createTransaction(payload);
                    toast.success('Transaksi berhasil disimpan');
                } else {
                    await transactionService.updateTransaction(originalData.id, payload);
                    toast.success('Transaksi berhasil diperbarui');
                }
            } else if (type === 'pocket') {
                const payload = {
                    ...form,
                    amount: Number(form.amount || 0),
                    sourceCardId: form.sourceCardId || null
                };
                if (mode === 'add') {
                    await pocketService.createPocket({ ...payload, amount: 0 });
                    toast.success('Kantong berhasil dibuat');
                } else {
                    await pocketService.updatePocket(originalData.id, payload);
                    toast.success('Kantong berhasil diperbarui');
                }
            } else if (type === 'card') {
                if (mode === 'add') {
                    await cardService.createCard({
                        card_holder_name: form.cardHolderName,
                        bank_name: form.bankName || null,
                        card_type: form.cardType,
                        last_four_digits: form.lastFourDigits,
                        initialBalance: Number(form.initialBalance) || 0
                    } as any);
                    toast.success('Kartu/Akun berhasil ditambah');
                } else {
                    await cardService.updateCard(originalData.id, form);
                    toast.success('Kartu/Akun berhasil diperbarui');
                }
            } else if (type === 'transfer' || type === 'topup-cash') {
                const isTopup = type === 'topup-cash';
                await transactionService.transferFunds({
                    fromCardId: form.fromCardId || undefined,
                    toPocketId: !isTopup && form.type === 'deposit' ? originalData.id : undefined,
                    fromPocketId: !isTopup && form.type === 'withdraw' ? originalData.id : undefined,
                    isCashTopup: isTopup,
                    amount: Number(form.amount || 0)
                });
                toast.success(isTopup ? 'Top-up tunai berhasil' : 'Transfer berhasil');
            }
            handleCloseModal();
        } catch (err: any) {
            toast.error(err.message || 'Terjadi kesalahan');
        }
    };

    const handleDelete = async (type: 'transaction' | 'pocket' | 'card', id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        try {
            if (type === 'transaction') {
                await transactionService.deleteTransaction(id);
            } else if (type === 'pocket') {
                await pocketService.deletePocket(id);
            } else if (type === 'card') {
                await cardService.deleteCard(id);
            }
            toast.success('Data berhasil dihapus');
        } catch (err: any) {
            toast.error(err.message || 'Gagal menghapus data');
        }
    };

    const handleCloseBudget = async (pocket: FinancialPocket) => {
        if (!confirm(`Tutup anggaran "${pocket.name}"? Sisa dana ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(pocket.amount)} akan dikembalikan ke kartu utama.`)) return;
        try {
            await pocketService.closePocketBudget(pocket.id);
            toast.success('Anggaran berhasil ditutup');
        } catch (err: any) {
            toast.error(err.message || 'Gagal menutup anggaran');
        }
    };

    return {
        modalState,
        form,
        setForm,
        handleOpenModal,
        handleCloseModal,
        handleFormChange,
        handleSubmit,
        handleDelete,
        handleCloseBudget
    };
};
