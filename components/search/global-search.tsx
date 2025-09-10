// components/search/global-search.tsx
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  FileText,
  FolderOpen,
  Users,
  CheckSquare,
  Settings,
  LayoutDashboard,
  Calendar,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for search results
interface SearchResult {
  id: string
  title: string
  type: 'page' | 'project' | 'task' | 'content' | 'team' | 'setting'
  href: string
  description?: string
  badge?: string
}

// Mock data - replace with your actual data sources
const mockSearchResults: SearchResult[] = [
  // Pages
  { id: '1', title: 'Dashboard', type: 'page', href: '/dashboard', description: 'Main dashboard overview' },
  { id: '2', title: 'Projects', type: 'page', href: '/projects', description: 'Manage all projects' },
  { id: '3', title: 'Team Management', type: 'page', href: '/team', description: 'Team members and roles' },
  { id: '4', title: 'Settings', type: 'page', href: '/settings', description: 'Application settings' },
  
  // Projects
  { id: '5', title: 'Website Redesign', type: 'project', href: '/projects/website-redesign', description: 'Q1 2024 redesign project', badge: 'Active' },
  { id: '6', title: 'Mobile App', type: 'project', href: '/projects/mobile-app', description: 'iOS and Android app development', badge: 'In Progress' },
  { id: '7', title: 'E-commerce Platform', type: 'project', href: '/projects/ecommerce', description: 'Online store development', badge: 'Completed' },
  
  // Tasks
  { id: '8', title: 'Update hero section', type: 'task', href: '/tasks/hero-update', description: 'Refresh homepage hero content' },
  { id: '9', title: 'Database migration', type: 'task', href: '/tasks/db-migration', description: 'Migrate to new database schema' },
  
  // Content
  { id: '10', title: 'Blog: Next.js Tutorial', type: 'content', href: '/content/nextjs-tutorial', description: 'Complete Next.js guide' },
  { id: '11', title: 'Landing Page Copy', type: 'content', href: '/content/landing-copy', description: 'Homepage marketing copy' },
  
  // Team
  { id: '12', title: 'John Doe', type: 'team', href: '/team/john-doe', description: 'Frontend Developer' },
  { id: '13', title: 'Jane Smith', type: 'team', href: '/team/jane-smith', description: 'UI/UX Designer' },
]

const typeIcons = {
  page: LayoutDashboard,
  project: FolderOpen,
  task: CheckSquare,
  content: FileText,
  team: Users,
  setting: Settings,
}

const typeLabels = {
  page: 'Pages',
  project: 'Projects',
  task: 'Tasks',
  content: 'Content',
  team: 'Team',
  setting: 'Settings',
}

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const router = useRouter()

  // Filter results based on query
  const filteredResults = React.useMemo(() => {
    if (!query) return mockSearchResults.slice(0, 8) // Show recent/popular items when no query
    
    return mockSearchResults.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  // Group results by type
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    filteredResults.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = []
      }
      groups[result.type].push(result)
    })
    return groups
  }, [filteredResults])

  const handleSelect = (href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between text-muted-foreground hover:text-foreground',
            'min-w-[200px] max-w-[300px]',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search projects, tasks, content..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No results found.</CommandEmpty>
            
            {Object.entries(groupedResults).map(([type, results], groupIndex) => {
              const Icon = typeIcons[type as keyof typeof typeIcons]
              const label = typeLabels[type as keyof typeof typeLabels]
              
              return (
                <React.Fragment key={type}>
                  {groupIndex > 0 && <CommandSeparator />}
                  <CommandGroup heading={label}>
                    {results.map((result) => (
                      <CommandItem
                        key={result.id}
                        value={`${result.title} ${result.description}`}
                        onSelect={() => handleSelect(result.href)}
                        className="flex items-center gap-3 p-3"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{result.title}</span>
                            {result.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {result.badge}
                              </Badge>
                            )}
                          </div>
                          {result.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                          )}
                        </div>
                        <Hash className="h-3 w-3 text-muted-foreground opacity-50" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}