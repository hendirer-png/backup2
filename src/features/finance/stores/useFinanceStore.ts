import { create } from 'zustand';
import { Transaction, Card, FinancialPocket } from '@/types';

interface FinanceUIState {
  // Modal States
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (isOpen: boolean) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;

  isCardModalOpen: boolean;
  setIsCardModalOpen: (isOpen: boolean) => void;
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;

  isPocketModalOpen: boolean;
  setIsPocketModalOpen: (isOpen: boolean) => void;
  selectedPocket: FinancialPocket | null;
  setSelectedPocket: (pocket: FinancialPocket | null) => void;

  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (isOpen: boolean) => void;
}

export const useFinanceStore = create<FinanceUIState>((set) => ({
  isTransactionModalOpen: false,
  setIsTransactionModalOpen: (isOpen) => set({ isTransactionModalOpen: isOpen }),
  selectedTransaction: null,
  setSelectedTransaction: (tx) => set({ selectedTransaction: tx }),

  isCardModalOpen: false,
  setIsCardModalOpen: (isOpen) => set({ isCardModalOpen: isOpen }),
  selectedCard: null,
  setSelectedCard: (card) => set({ selectedCard: card }),

  isPocketModalOpen: false,
  setIsPocketModalOpen: (isOpen) => set({ isPocketModalOpen: isOpen }),
  selectedPocket: null,
  setSelectedPocket: (pocket) => set({ selectedPocket: pocket }),

  isTransferModalOpen: false,
  setIsTransferModalOpen: (isOpen) => set({ isTransferModalOpen: isOpen }),
}));
