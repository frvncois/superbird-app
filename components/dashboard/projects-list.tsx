// components/dashboard/projects-list.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useProjectStore } from '@/lib/stores/project-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDistanceToNow } from 'date-fns'
import { 
  Plus, 
  Calendar, 
  FolderOpen,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  Edit,
  Trash2,
  CheckSquare,
  ArrowUpDown
} from 'lucide-react'

type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Content = Database['public']['Tables']['content']['Row']
type ProjectStatus = 'active' | 'inactive' | 'completed'

interface ProjectActivity {
  lastActivity: string
  activityType: 'project' | 'task' | 'content' | 'timeline'
  activityCount: number
}

interface ProjectWithStats extends Project {
  pendingTasks?: number
  activity?: ProjectActivity
}

// Function to get last activity for a project
async function getProjectActivity(projectId: string): Promise<ProjectActivity> {
  const supabase = createClient()
  
  try {
    // Get the latest project update
    const { data: project } = await supabase
      .from('projects')
      .select('updated_at')
      .eq('id', projectId)
      .single()

    // Get latest task activity
    const { data: latestTask } = await supabase
      .from('tasks')
      .select('updated_at, created_at')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    // Get latest content activity
    const { data: latestContent } = await supabase
      .from('content')
      .select('updated_at, created_at')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    // Get latest timeline event
    const { data: latestTimelineEvent } = await supabase
      .from('timeline_events')
      .select('created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get total activity count (tasks + content + timeline events)
    const { count: taskCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    const { count: contentCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    const { count: timelineCount } = await supabase
      .from('timeline_events')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Find the most recent activity
    const activities = [
      { date: project?.updated_at, type: 'project' as const },
      { date: latestTask?.updated_at, type: 'task' as const },
      { date: latestContent?.updated_at, type: 'content' as const },
      { date: latestTimelineEvent?.created_at, type: 'timeline' as const }
    ].filter(activity => activity.date)

    const mostRecentActivity = activities.reduce((latest, current) => {
      if (!latest || new Date(current.date!) > new Date(latest.date!)) {
        return current
      }
      return latest
    }, activities[0])

    return {
      lastActivity: mostRecentActivity?.date || project?.updated_at || '',
      activityType: mostRecentActivity?.type || 'project',
      activityCount: (taskCount || 0) + (contentCount || 0) + (timelineCount || 0)
    }
  } catch (error) {
    console.error('Error fetching project activity:', error)
    return {
      lastActivity: '',
      activityType: 'project',
      activityCount: 0
    }
  }
}

// Project Card Skeleton Component
function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Projects List Component
export function ProjectsList() {
  const { projects, loading, setCurrentProject, getPendingTasksCount } = useProjectStore()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'alphabetical' | 'newest' | 'updated'>('newest')
  const [projectActivities, setProjectActivities] = useState<Record<string, ProjectActivity>>({})
  const [loadingActivities, setLoadingActivities] = useState(false)
  const router = useRouter()

  // Load project activities when projects change
  useEffect(() => {
    const loadActivities = async () => {
      if (projects.length === 0) return
      
      setLoadingActivities(true)
      const activities: Record<string, ProjectActivity> = {}
      
      // Load activities for all projects in parallel
      const activityPromises = projects.map(async (project) => {
        const activity = await getProjectActivity(project.id)
        activities[project.id] = activity
      })
      
      await Promise.all(activityPromises)
      setProjectActivities(activities)
      setLoadingActivities(false)
    }

    loadActivities()
  }, [projects])

  const filteredProjects = projects
    .filter(project => filter === 'all' ? true : project.status === filter)
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name)
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated':
          const aActivity = projectActivities[a.id]?.lastActivity || a.updated_at || a.created_at
          const bActivity = projectActivities[b.id]?.lastActivity || b.updated_at || b.created_at
          return new Date(bActivity).getTime() - new Date(aActivity).getTime()
        default:
          return 0
      }
    })

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project)
    router.push(`/projects/${project.id}`)
  }

  const projectsWithStats: ProjectWithStats[] = filteredProjects.map(project => ({
    ...project,
    pendingTasks: getPendingTasksCount(project.id),
    activity: projectActivities[project.id]
  }))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <CreateProjectDialog />
      </div>

      <div className="flex items-center justify-between">
        {/* Filter Tabs - Left Aligned */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search, Sort, and View Controls - Right Aligned */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          {/* Sort By Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={sortBy === 'alphabetical'}
                onCheckedChange={() => setSortBy('alphabetical')}
              >
                Alphabetical
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'newest'}
                onCheckedChange={() => setSortBy('newest')}
              >
                Newest
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'updated'}
                onCheckedChange={() => setSortBy('updated')}
              >
                Updated recently
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Content */}
      {projectsWithStats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm 
                ? `No projects match "${searchTerm}"`
                : filter === 'all' 
                  ? "Get started by creating your first project"
                  : `No ${filter} projects at the moment`
              }
            </p>
            {filter === 'all' && !searchTerm && <CreateProjectDialog />}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {projectsWithStats.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              viewMode={viewMode}
              loadingActivity={loadingActivities}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Enhanced Project Card Component
function ProjectCard({ 
  project, 
  viewMode, 
  loadingActivity,
  onClick 
}: { 
  project: ProjectWithStats
  viewMode: 'grid' | 'list'
  loadingActivity: boolean
  onClick: () => void 
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const { updateProject, removeProject } = useProjectStore()
  const supabase = createClient()

  const handleStatusChange = async (newStatus: Project['status']) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', project.id)

      if (error) throw error
      updateProject(project.id, { status: newStatus })
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) throw error
      removeProject(project.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(project.created_at), { addSuffix: true }).replace('about ', '')
  
  // Use activity-based update time if available
  const lastActivityDate = project.activity?.lastActivity || project.updated_at
  const updatedAgo = lastActivityDate && lastActivityDate !== project.created_at
    ? formatDistanceToNow(new Date(lastActivityDate), { addSuffix: true }).replace('about ', '')
    : null

  if (viewMode === 'list') {
    return (
      <div className="border rounded-lg">
        <div className="p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0">
          <div className="flex items-center justify-between" onClick={onClick}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold truncate">{project.name}</h3>
                <Badge 
                  variant={
                    project.status === 'active' ? 'default' : 
                    project.status === 'completed' ? 'secondary' : 'outline'
                  }
                >
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {timeAgo}
                </div>
                {updatedAgo && !loadingActivity && (
                  <div className="flex items-center">
                    <span>Updated {updatedAgo}</span>
                  </div>
                )}
                {loadingActivity && (
                  <Skeleton className="h-4 w-20" />
                )}
                <div className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-1" />
                  {project.pendingTasks} tasks pending
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button 
                variant="default" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}
              >
                Open project
              </Button>
              <ProjectActionsDropdown 
                project={project}
                onStatusChange={handleStatusChange}
                onEdit={() => setEditSheetOpen(true)}
                onDelete={() => setDeleteDialogOpen(true)}
              />
            </div>
          </div>
        </div>
        
        <EditProjectSheet 
          project={project}
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
        />
        
        <DeleteProjectDialog
          project={project}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
        />
      </div>
    )
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <Badge 
            variant={
              project.status === 'active' ? 'default' : 
              project.status === 'completed' ? 'secondary' : 'outline'
            }
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Created {timeAgo}
            </div>
            {updatedAgo && !loadingActivity && (
              <div className="text-xs">
                Updated {updatedAgo}
              </div>
            )}
            {loadingActivity && (
              <Skeleton className="h-3 w-16" />
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CheckSquare className="h-4 w-4 mr-2" />
            {project.pendingTasks} tasks pending
          </div>

          <div className="flex items-center justify-between">
            <Button 
              variant="default" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              Open project
            </Button>
            
            <ProjectActionsDropdown 
              project={project}
              onStatusChange={handleStatusChange}
              onEdit={() => setEditSheetOpen(true)}
              onDelete={() => setDeleteDialogOpen(true)}
            />
          </div>
        </div>
      </CardContent>
      
      <EditProjectSheet 
        project={project}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
      
      <DeleteProjectDialog
        project={project}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </Card>
  )
}

// Project Actions Dropdown Component
function ProjectActionsDropdown({ 
  project, 
  onStatusChange, 
  onEdit, 
  onDelete 
}: {
  project: Project
  onStatusChange: (status: Project['status']) => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onStatusChange('active')}>
          Mark as Active
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('inactive')}>
          Mark as Inactive
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('completed')}>
          Mark as Completed
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Edit Project Sheet Component
function EditProjectSheet({ 
  project, 
  open, 
  onOpenChange 
}: {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    url: project.url || '',
    status: project.status
  })
  const [loading, setLoading] = useState(false)
  const { updateProject } = useProjectStore()
  const supabase = createClient()

  const handleSave = async () => {
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          url: formData.url.trim() || null,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id)

      if (error) throw error

      updateProject(project.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        url: formData.url.trim() || null,
        status: formData.status
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-6">
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription>
            Update project details and settings.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-url">Website URL</Label>
            <Input
              id="edit-url"
              type="url"
              value={formData.url}
              placeholder="https://example.com"
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: ProjectStatus) => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !formData.name.trim()}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Delete Project Dialog Component
function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onConfirm
}: {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{project.name}"? This action cannot be undone.
            All tasks and content associated with this project will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Create Project Dialog Component with proper typing
function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    url: string
    status: ProjectStatus
  }>({
    name: '',
    description: '',
    url: '',
    status: 'active'
  })

  const { profile } = useAuthStore()
  const { addProject } = useProjectStore()
  const supabase = createClient()

  const handleCreate = async () => {
    if (!profile || !formData.name.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          url: formData.url.trim() || null,
          status: formData.status,
          owner_id: profile.id
        })
        .select()
        .single()

      if (error) throw error

      addProject(data)
      setOpen(false)
      setFormData({ name: '', description: '', url: '', status: 'active' as ProjectStatus })
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to start organizing your work.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Project description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com (optional)"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: ProjectStatus) => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}