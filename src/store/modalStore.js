import { create } from 'zustand';

export const useModalStore = create((set) => ({
  isOpen: false,
  postId: '',
  openModal: (id) => set({ isOpen: true, postId: id }),
  closeModal: () => set({ isOpen: false, postId: '' }),
}));