'use client'

import { useEffect } from 'react'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { useTaskStore } from '@/lib/stores/task-store'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { setProjects, setLoading: setProjectLoading } = useProjectStore()
  const { setTasks, setLoading: setTaskLoading } = useTaskStore()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setProjectLoading(true)
      setTaskLoading(true)

      try {
        // Load projects
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })

        if (projects) {
          setProjects(projects)
        }

        // Load tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })

        if (tasks) {
          setTasks(tasks)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setProjectLoading(false)
        setTaskLoading(false)
      }
    }

    loadData()
  }, [user, supabase, setProjects, setTasks, setProjectLoading, setTaskLoading])

  return <DashboardOverview />
}