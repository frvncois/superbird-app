import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useTaskStore } from '@/lib/stores/task-store'
import { TaskQueries } from '@/lib/supabase/queries'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

type TaskPriority = 'low' | 'medium' | 'high'

export function TaskForm({ open, onOpenChange, projectId }: TaskFormProps) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    priority: TaskPriority
    due_date: string
  }>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  })
  const [loading, setLoading] = useState(false)
  
  const { profile } = useAuthStore()
  const { addTask } = useTaskStore()
  const taskQueries = new TaskQueries()

  const handleSubmit = async () => {
    if (!profile || !formData.title.trim()) return

    setLoading(true)
    try {
      const task = await taskQueries.createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        project_id: projectId,
        created_by: profile.id,
        due_date: formData.due_date || null
      })

      addTask(task)
      onOpenChange(false)
      setFormData({ title: '', description: '', priority: 'medium', due_date: '' })
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
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
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.title.trim()}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}