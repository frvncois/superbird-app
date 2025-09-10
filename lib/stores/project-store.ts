// lib/stores/project-store.ts
import { create } from 'zustand'
import { Database } from '@/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  taskCounts: Record<string, { pending: number; total: number }>
  
  // Actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  setCurrentProject: (project: Project | null) => void
  setLoading: (loading: boolean) => void
  
  // Task count actions
  setTaskCounts: (projectId: string, counts: { pending: number; total: number }) => void
  updateTaskCounts: (projectId: string, tasks: Task[]) => void
  getPendingTasksCount: (projectId: string) => number
  getTotalTasksCount: (projectId: string) => number
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  taskCounts: {},

  setProjects: (projects) => set({ projects }),
  
  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects]
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    ),
    currentProject: state.currentProject?.id === id 
      ? { ...state.currentProject, ...updates }
      : state.currentProject
  })),
  
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(project => project.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject
  })),
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  setLoading: (loading) => set({ loading }),
  
  setTaskCounts: (projectId, counts) => set((state) => ({
    taskCounts: {
      ...state.taskCounts,
      [projectId]: counts
    }
  })),
  
  updateTaskCounts: (projectId, tasks) => {
    const pending = tasks.filter(task => 
      task.project_id === projectId && 
      (task.status === 'todo' || task.status === 'in_progress')
    ).length
    
    const total = tasks.filter(task => task.project_id === projectId).length
    
    set((state) => ({
      taskCounts: {
        ...state.taskCounts,
        [projectId]: { pending, total }
      }
    }))
  },
  
  getPendingTasksCount: (projectId) => {
    const counts = get().taskCounts[projectId]
    return counts?.pending || 0
  },
  
  getTotalTasksCount: (projectId) => {
    const counts = get().taskCounts[projectId]
    return counts?.total || 0
  }
}))