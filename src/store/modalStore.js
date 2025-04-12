import { create } from 'zustand';

export const useModalStore = create((set) => ({
  // Modal state
  isOpen: false,
  postId: '',
  openModal: (id) => set({ isOpen: true, postId: id }),
  closeModal: () => set({ isOpen: false, postId: '' }),

  // Session state
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));