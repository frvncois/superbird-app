// lib/stores/task-store.ts
import { create } from 'zustand'
import { Database } from '@/types/database.types'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskState {
  tasks: Task[]
  loading: boolean
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  setLoading: (loading: boolean) => void
  getTasksByProject: (projectId: string) => Task[]
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => {
    const { tasks } = get()
    set({ tasks: [...tasks, task] })
  },
  updateTask: (id, updates) => {
    const { tasks } = get()
    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, ...updates } : t
    )
    set({ tasks: updatedTasks })
  },
  removeTask: (id) => {
    const { tasks } = get()
    set({ tasks: tasks.filter(t => t.id !== id) })
  },
  setLoading: (loading) => set({ loading }),
  getTasksByProject: (projectId) => {
    const { tasks } = get()
    return tasks.filter(task => task.project_id === projectId)
  },
}))

