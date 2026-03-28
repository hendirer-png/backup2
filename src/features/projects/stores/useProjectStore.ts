import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectUIState {
  // Modals & Forms
  isFormModalOpen: boolean;
  setIsFormModalOpen: (isOpen: boolean) => void;
  formMode: 'add' | 'edit';
  setFormMode: (mode: 'add' | 'edit') => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (isOpen: boolean) => void;
  
  isBriefingModalOpen: boolean;
  setIsBriefingModalOpen: (isOpen: boolean) => void;
  briefingText: string;
  setBriefingText: (text: string) => void;

  quickStatusModalOpen: boolean;
  setQuickStatusModalOpen: (isOpen: boolean) => void;
  selectedProjectForStatus: Project | null;
  setSelectedProjectForStatus: (project: Project | null) => void;

  activeStatModal: string | null;
  setActiveStatModal: (id: string | null) => void;

  // Kanban Drag & Drop State
  draggedProjectId: string | null;
  setDraggedProjectId: (id: string | null) => void;
}

export const useProjectStore = create<ProjectUIState>((set) => ({
  isFormModalOpen: false,
  setIsFormModalOpen: (isOpen) => set({ isFormModalOpen: isOpen }),
  formMode: 'add',
  setFormMode: (mode) => set({ formMode: mode }),
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  
  isDetailModalOpen: false,
  setIsDetailModalOpen: (isOpen) => set({ isDetailModalOpen: isOpen }),
  
  isBriefingModalOpen: false,
  setIsBriefingModalOpen: (isOpen) => set({ isBriefingModalOpen: isOpen }),
  briefingText: '',
  setBriefingText: (text) => set({ briefingText: text }),

  quickStatusModalOpen: false,
  setQuickStatusModalOpen: (isOpen) => set({ quickStatusModalOpen: isOpen }),
  selectedProjectForStatus: null,
  setSelectedProjectForStatus: (project) => set({ selectedProjectForStatus: project }),

  activeStatModal: null,
  setActiveStatModal: (id) => set({ activeStatModal: id }),

  draggedProjectId: null,
  setDraggedProjectId: (id) => set({ draggedProjectId: id }),
}));
