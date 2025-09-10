// lib/stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  searchQuery: string
  setSidebarOpen: (open: boolean) => void
  setActiveModal: (modal: string | null) => void
  setSearchQuery: (query: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  searchQuery: '',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))