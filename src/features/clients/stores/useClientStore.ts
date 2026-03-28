import { create } from 'zustand';
import { Client } from '@/types';

interface ClientUIState {
  isFormModalOpen: boolean;
  setIsFormModalOpen: (isOpen: boolean) => void;
  formMode: 'add' | 'edit';
  setFormMode: (mode: 'add' | 'edit') => void;
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;

  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (isOpen: boolean) => void;

  isBroadcastModalOpen: boolean;
  setIsBroadcastModalOpen: (isOpen: boolean) => void;

  chatModalData: { client: Client } | null;
  setChatModalData: (data: { client: Client } | null) => void;
}

export const useClientStore = create<ClientUIState>((set) => ({
  isFormModalOpen: false,
  setIsFormModalOpen: (isOpen) => set({ isFormModalOpen: isOpen }),
  formMode: 'add',
  setFormMode: (mode) => set({ formMode: mode }),
  selectedClient: null,
  setSelectedClient: (client) => set({ selectedClient: client }),

  isDetailModalOpen: false,
  setIsDetailModalOpen: (isOpen) => set({ isDetailModalOpen: isOpen }),

  isBroadcastModalOpen: false,
  setIsBroadcastModalOpen: (isOpen) => set({ isBroadcastModalOpen: isOpen }),

  chatModalData: null,
  setChatModalData: (data) => set({ chatModalData: data }),
}));
