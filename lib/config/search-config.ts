// lib/config/search-config.ts
import { SearchResult } from '@/lib/hooks/use-global-search'

export interface SearchConfig {
  // Enable/disable search for different data types
  enabledSources: {
    pages: boolean
    projects: boolean
    tasks: boolean
    content: boolean
    team: boolean
    clients: boolean
  }
  
  // Limits for each source type
  limits: {
    pages: number
    projects: number
    tasks: number
    content: number
    team: number
    clients: number
  }
  
  // Search behavior
  debounceMs: number
  minQueryLength: number
  showRecentOnEmpty: boolean
  maxRecentItems: number
  
  // UI customization
  placeholder: string
  shortcutKey: string
  showKeyboardShortcut: boolean
  maxHeight: string
}

export const defaultSearchConfig: SearchConfig = {
  enabledSources: {
    pages: true,
    projects: true,
    tasks: true,
    content: true,
    team: true,
    clients: true,
  },
  limits: {
    pages: 5,
    projects: 8,
    tasks: 5,
    content: 5,
    team: 5,
    clients: 3,
  },
  debounceMs: 200,
  minQueryLength: 1,
  showRecentOnEmpty: true,
  maxRecentItems: 8,
  placeholder: 'Search projects, tasks, content...',
  shortcutKey: 'k',
  showKeyboardShortcut: true,
  maxHeight: '400px',
}

// Recent search storage
export class RecentSearches {
  private static readonly STORAGE_KEY = 'webmanager-recent-searches'
  private static readonly MAX_RECENT = 10

  static get(): SearchResult[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static add(result: SearchResult): void {
    if (typeof window === 'undefined') return
    
    try {
      const recent = this.get()
      const filtered = recent.filter(item => item.id !== result.id)
      const updated = [result, ...filtered].slice(0, this.MAX_RECENT)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

// Search analytics (optional)
export class SearchAnalytics {
  private static readonly STORAGE_KEY = 'webmanager-search-analytics'

  static trackSearch(query: string, resultCount: number): void {
    if (typeof window === 'undefined') return
    
    try {
      const data = {
        query,
        resultCount,
        timestamp: new Date().toISOString(),
      }
      
      // In a real app, you'd send this to your analytics service
      console.log('Search tracked:', data)
    } catch {
      // Ignore analytics errors
    }
  }

  static trackSelection(result: SearchResult, query: string): void {
    if (typeof window === 'undefined') return
    
    try {
      const data = {
        query,
        selectedId: result.id,
        selectedType: result.type,
        selectedTitle: result.title,
        timestamp: new Date().toISOString(),
      }
      
      // In a real app, you'd send this to your analytics service
      console.log('Selection tracked:', data)
    } catch {
      // Ignore analytics errors
    }
  }
}