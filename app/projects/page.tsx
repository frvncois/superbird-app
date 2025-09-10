// app/projects/page.tsx
'use client'

import { useEffect } from 'react'
import { ProjectsList } from '@/components/dashboard/projects-list'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { createClient } from '@/lib/supabase/client'

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const { setProjects, setLoading, updateTaskCounts } = useProjectStore()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const loadProjectsAndTasks = async () => {
      setLoading(true)
      try {
        // Load projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (projectsError) {
          console.error('Error loading projects:', projectsError)
          return
        }

        if (projects) {
          setProjects(projects)

          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .in('project_id', projects.map(p => p.id))

          if (tasksError) {
            console.error('Error loading tasks:', tasksError)
          } else if (tasks) {
            // Update task counts for each project
            projects.forEach(project => {
              updateTaskCounts(project.id, tasks)
            })
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjectsAndTasks()
  }, [user, supabase, setProjects, setLoading, updateTaskCounts])

  return <ProjectsList />
}