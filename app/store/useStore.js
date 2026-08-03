import { create } from 'zustand'

export const useStore = create((set) => ({
  // Seus estados iniciais
  user: null,
  isSidebarOpen: false,

  // Ações para modificar o estado
  setUser: (userData) => set({ user: userData }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  logout: () => set({ user: null })
}))