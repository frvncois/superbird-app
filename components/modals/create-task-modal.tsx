// components/modals/create-task-modal.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { useTaskStore } from '@/lib/stores/task-store'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'

type Task = Database['public']['Tables']['tasks']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type TaskPriority = 'low' | 'medium' | 'high'

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated?: (task: Task) => void
  projects?: Project[]
}

export function CreateTaskModal({ open, onOpenChange, onTaskCreated, projects: propProjects }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    priority: TaskPriority
    projectId: string
    dueDate: string
  }>({
    title: '',
    description: '',
    priority: 'medium',
    projectId: '',
    dueDate: ''
  })

  const { profile } = useAuthStore()
  const { projects: storeProjects } = useProjectStore()
  const { addTask } = useTaskStore()
  const supabase = createClient()

  // Use projects from props if provided, otherwise use from store
  const availableProjects = propProjects || storeProjects

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      priority: 'medium', 
      projectId: '', 
      dueDate: '' 
    })
  }

  const handleSubmit = async () => {
    if (!profile || !formData.title.trim() || !formData.projectId) {
      if (!formData.title.trim()) {
        toast.error('Task title is required')
      }
      if (!formData.projectId) {
        toast.error('Please select a project')
      }
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          project_id: formData.projectId,
          created_by: profile.id,
          due_date: formData.dueDate || null
        })
        .select()
        .single()

      if (error) throw error

      // Add to store
      addTask(data)
      
      // Call the callback if provided
      onTaskCreated?.(data)
      
      // Close modal and reset form
      onOpenChange(false)
      resetForm()
      
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to track your project progress.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={loading}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.title.trim() || !formData.projectId}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}