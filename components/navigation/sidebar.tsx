// components/navigation/sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { useUIStore } from '@/lib/stores/ui-store'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  FileText,
  CheckSquare,
  Settings,
  HelpCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuthStore()
  const { projects, currentProject } = useProjectStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {sidebarOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WM</span>
            </div>
            <span className="font-semibold text-gray-900">WebManager</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 h-auto"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Current Project */}
      {sidebarOpen && currentProject && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Current Project
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentProject.name}
              </p>
            </div>
            <Badge variant={currentProject.status === 'active' ? 'default' : 'secondary'}>
              {currentProject.status}
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'flex-shrink-0 h-5 w-5',
                  sidebarOpen ? 'mr-3' : 'mx-auto'
                )}
              />
              {sidebarOpen && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Recent Projects (when sidebar is open) */}
      {sidebarOpen && projects.length > 0 && (
        <div className="px-2 py-4 border-t">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Recent Projects
            </p>
            <Button variant="ghost" size="sm" className="h-auto p-1">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex items-center px-2 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User Profile */}
      {sidebarOpen && profile && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>
                {profile.full_name
                  ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : profile.email[0].toUpperCase()
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.full_name || profile.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

