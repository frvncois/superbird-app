// lib/stores/content-store.ts
import { create } from 'zustand'
import { Database } from '@/types/database.types'

type ProjectContent = Database['public']['Tables']['content']['Row']

interface ContentState {
  content: ProjectContent[]
  loading: boolean
  setContent: (content: ProjectContent[]) => void
  addContent: (content: ProjectContent) => void
  updateContent: (id: string, updates: Partial<ProjectContent>) => void
  removeContent: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useContentStore = create<ContentState>((set, get) => ({
  content: [],
  loading: false,
  setContent: (content) => set({ content }),
  addContent: (content) => {
    const { content: existingContent } = get()
    set({ content: [content, ...existingContent] })
  },
  updateContent: (id, updates) => {
    const { content } = get()
    const updatedContent = content.map(c => 
      c.id === id ? { ...c, ...updates } : c
    )
    set({ content: updatedContent })
  },
  removeContent: (id) => {
    const { content } = get()
    set({ content: content.filter(c => c.id !== id) })
  },
  setLoading: (loading) => set({ loading }),
}))