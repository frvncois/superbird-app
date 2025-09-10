// lib/hooks/use-global-search.ts
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useProjectStore } from '@/lib/stores/project-store'
import { createClient } from '@/lib/supabase/client'

export interface SearchResult {
  id: string
  title: string
  type: 'page' | 'project' | 'task' | 'content' | 'team' | 'client' | 'setting'
  href: string
  description?: string
  badge?: string
  metadata?: Record<string, any>
}

// Static pages/routes for quick navigation
const staticPages: SearchResult[] = [
  { id: 'dashboard', title: 'Dashboard', type: 'page', href: '/dashboard', description: 'Overview and analytics' },
  { id: 'projects', title: 'Projects', type: 'page', href: '/projects', description: 'Manage all projects' },
  { id: 'tasks', title: 'Tasks', type: 'page', href: '/tasks', description: 'Task management' },
  { id: 'content', title: 'Content', type: 'page', href: '/content', description: 'Content management' },
  { id: 'team', title: 'Team', type: 'page', href: '/team', description: 'Team members and roles' },
  { id: 'clients', title: 'Clients', type: 'page', href: '/clients', description: 'Client management' },
  { id: 'settings', title: 'Settings', type: 'page', href: '/settings', description: 'Application settings' },
  { id: 'profile', title: 'Profile', type: 'page', href: '/profile', description: 'User profile settings' },
  { id: 'billing', title: 'Billing', type: 'page', href: '/billing', description: 'Subscription and billing' },
]

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const { projects } = useProjectStore()
  const supabase = createClient()

  // Search function that combines multiple data sources
  const performSearch = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) {
      // Return recent/popular items when no query
      return [
        ...staticPages.slice(0, 4),
        ...projects.slice(0, 3).map(project => ({
          id: project.id,
          title: project.name,
          type: 'project' as const,
          href: `/projects/${project.id}`,
          description: project.description || undefined, // Convert null to undefined
          badge: project.status,
        }))
      ]
    }

    setIsLoading(true)
    const searchResults: SearchResult[] = []

    try {
      // Search static pages
      const pageResults = staticPages.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      searchResults.push(...pageResults)

      // Search projects
      const projectResults: SearchResult[] = projects
        .filter(project =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(project => ({
          id: project.id,
          title: project.name,
          type: 'project' as const,
          href: `/projects/${project.id}`,
          description: project.description || undefined, // Convert null to undefined
          badge: project.status,
        }))
      searchResults.push(...projectResults)

      // Search tasks (if you have a tasks table)
      try {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, description, status, project_id')
          .ilike('title', `%${searchQuery}%`)
          .limit(5)

        if (tasks) {
          const taskResults: SearchResult[] = tasks.map(task => ({
            id: task.id,
            title: task.title,
            type: 'task' as const,
            href: `/tasks/${task.id}`,
            description: task.description || undefined, // Convert null to undefined
            badge: task.status || undefined,
          }))
          searchResults.push(...taskResults)
        }
      } catch (error) {
        console.log('Tasks search skipped - table may not exist')
      }

      // Search content (if you have a content table)
      try {
        const { data: content } = await supabase
          .from('content')
          .select('id, title, excerpt, type, status')
          .ilike('title', `%${searchQuery}%`)
          .limit(5)

        if (content) {
          const contentResults: SearchResult[] = content.map(item => ({
            id: item.id,
            title: item.title,
            type: 'content' as const,
            href: `/content/${item.id}`,
            description: item.excerpt || undefined, // Convert null to undefined
            badge: item.status || undefined,
          }))
          searchResults.push(...contentResults)
        }
      } catch (error) {
        console.log('Content search skipped - table may not exist')
      }

      // Search team members (if you have a team_members table)
      try {
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('id, name, email, role')
          .ilike('name', `%${searchQuery}%`)
          .limit(5)

        if (teamMembers) {
          const teamResults: SearchResult[] = teamMembers.map(member => ({
            id: member.id,
            title: member.name,
            type: 'team' as const,
            href: `/team/${member.id}`,
            description: `${member.role} • ${member.email}`,
          }))
          searchResults.push(...teamResults)
        }
      } catch (error) {
        console.log('Team search skipped - table may not exist')
      }

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }

    return searchResults
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const searchResults = await performSearch(query)
      setResults(searchResults)
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [query, projects])

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    results.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = []
      }
      groups[result.type].push(result)
    })
    return groups
  }, [results])

  return {
    query,
    setQuery,
    results,
    groupedResults,
    isLoading,
    performSearch,
  }
}

// lib/search/search-providers.ts
export interface SearchProvider {
  name: string
  type: string
  search: (query: string) => Promise<SearchResult[]>
  icon: any
}

// You can extend this with more providers
export const searchProviders: SearchProvider[] = [
  // Add providers for different data sources
  // e.g., GitHub integration, Google Drive, etc.
]