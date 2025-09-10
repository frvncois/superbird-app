// app/tasks/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  CheckSquare,
  Clock,
  Target,
  Search,
  Plus,
  ArrowUpDown,
  Grid3X3,
  List
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'
import { TaskList } from '@/components/tasks/task-list'
import { CreateTaskModal } from '@/components/modals/create-task-modal'

type Task = Database['public']['Tables']['tasks']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface TaskWithProject extends Task {
  project?: Project
  created_by_profile?: Profile
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('list')
  const [filter, setFilter] = useState('all')
  const [createTaskOpen, setCreateTaskOpen] = useState(false)

  const { user } = useAuthStore()
  const supabase = createClient()

  // Load user's tasks and projects
  useEffect(() => {
    const loadTasksAndProjects = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Load tasks with project information and creator profile
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            projects (
              id,
              name,
              status
            ),
            profiles!tasks_created_by_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

        if (tasksError) {
          console.error('Error loading tasks:', tasksError)
        } else if (tasksData) {
          const tasksWithProjects = tasksData.map(task => ({
            ...task,
            project: task.projects,
            created_by_profile: task.profiles
          }))
          setTasks(tasksWithProjects)
        }

        // Load projects for filter dropdown
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .order('name', { ascending: true })

        if (projectsError) {
          console.error('Error loading projects:', projectsError)
        } else if (projectsData) {
          setProjects(projectsData)
        }

      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    loadTasksAndProjects()
  }, [user, supabase])

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filter === 'all' || 
                         (filter === 'todo' && task.status === 'todo') ||
                         (filter === 'in_progress' && task.status === 'in_progress') ||
                         (filter === 'completed' && task.status === 'completed') ||
                         (filter === 'overdue' && task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed')
    return matchesSearch && matchesFilter
  })

  // Task statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const todoTasks = tasks.filter(t => t.status === 'todo').length
  const overdueTasks = tasks.filter(t => 
    t.due_date && 
    new Date(t.due_date) < new Date() && 
    t.status !== 'completed'
  ).length

  const handleTaskCreated = (newTask: Task) => {
    // Add the new task to the local state with project info
    const taskWithProject: TaskWithProject = {
      ...newTask,
      project: projects.find(p => p.id === newTask.project_id),
      created_by_profile: {
        id: user?.id || '',
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || 'You',
        avatar_url: user?.user_metadata?.avatar_url || null,
        role: 'owner' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    setTasks(prev => [taskWithProject, ...prev])
    toast.success('Task created successfully')
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id 
        ? { ...task, ...updatedTask }
        : task
    ))
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button onClick={() => setCreateTaskOpen(true)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            {overdueTasks > 0 && (
              <p className="text-xs text-muted-foreground">
                {overdueTasks} overdue
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs and Controls */}
      <div className="flex items-center justify-between">
        {/* Filter Tabs - Left Aligned */}
        <Tabs value={filter} onValueChange={(value: string) => setFilter(value)}>
          <TabsList>
            <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="todo">To Do ({todoTasks})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressTasks})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueTasks})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search, Sort, and View Controls - Right Aligned */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
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
                checked={sortBy === 'newest'}
                onCheckedChange={() => setSortBy('newest')}
              >
                Newest
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'alphabetical'}
                onCheckedChange={() => setSortBy('alphabetical')}
              >
                Alphabetical
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'priority'}
                onCheckedChange={() => setSortBy('priority')}
              >
                Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'due_date'}
                onCheckedChange={() => setSortBy('due_date')}
              >
                Due Date
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

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onTaskCreated={handleTaskCreated}
        projects={projects}
      />
    </div>
  )
}