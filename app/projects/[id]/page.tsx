// app/projects/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from "@/components/ui/separator"
import { useProjectStore } from '@/lib/stores/project-store'
import { useTaskStore } from '@/lib/stores/task-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { ProjectTasks } from '@/components/projects/project-tasks'
import { ProjectTimeline } from '@/components/projects/project-timeline'
import { ProjectContent } from '@/components/projects/project-content'
import { 
  ExternalLink, 
  Calendar, 
  Users, 
  CheckSquare, 
  FileText,
  Settings,
  Edit3,
  TrendingUp,
  Clock,
  Target,
  Activity
} from 'lucide-react'

type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentProject } = useProjectStore()
  const { user } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (!id || !user) return

    const loadProjectData = async () => {
      try {
        // Load project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()

        if (projectError) {
          console.error('Error loading project:', projectError)
          return
        }

        if (projectData) {
          setProject(projectData)
          setCurrentProject(projectData)
        }

        // Load project tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false })

        if (tasksError) {
          console.error('Error loading tasks:', tasksError)
        } else if (tasksData) {
          setTasks(tasksData)
        }
      } catch (error) {
        console.error('Error loading project data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [id, user, supabase, setCurrentProject])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
        <p className="text-gray-600">The project you're looking for doesn't exist.</p>
      </div>
    )
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const todoTasks = tasks.filter(t => t.status === 'todo').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Project Navigation Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        {/* Project Header with Tabs and Buttons */}
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({totalTasks})</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Open Editor
            </Button>
          </div>
        </div>

        {/* Overview Tab - Contains project info and main content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Project Info - Name, Status, Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            {project.description && (
              <p className="text-gray-600 text-lg">{project.description}</p>
            )}
          </div>

          {/* Project Metadata */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Created {new Date(project.created_at).toLocaleDateString()}
            </div>
            {project.url && (
              <a 
                href={project.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Visit Website
              </a>
            )}
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  All project tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Finished tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Active tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Project progress
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Project Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest project updates and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(task.created_at).toLocaleDateString()} • {task.status.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          task.status === 'completed' ? 'default' : 
                          task.status === 'in_progress' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No activity yet. Create your first task to get started!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Health */}
            <Card>
              <CardHeader>
                <CardTitle>Project Health</CardTitle>
                <CardDescription>Key metrics and indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Task Completion</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{completedTasks}</div>
                    <div className="text-xs text-gray-500">Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{inProgressTasks}</div>
                    <div className="text-xs text-gray-500">Working</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">{todoTasks}</div>
                    <div className="text-xs text-gray-500">To Do</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>Project Status</span>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">

              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Project tasks
              </CardTitle>
              <CardDescription>Upload and manage project assets</CardDescription>
            <Separator />
              <ProjectTasks projectId={project.id} tasks={tasks} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <ProjectTimeline projectId={project.id} tasks={tasks} />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <ProjectContent projectId={project.id} tasks={tasks} />
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Project Files
              </CardTitle>
              <CardDescription>Upload and manage project assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                <p className="text-gray-500 mb-4">Upload files and assets for this project</p>
                <Button>Upload Files</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Project Team
              </CardTitle>
              <CardDescription>Manage project team members and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-500 mb-4">Invite team members to collaborate</p>
                <Button>Invite Members</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}