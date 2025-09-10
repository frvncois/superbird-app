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
import { createClient } from '@/lib/supabase/client'

type ProjectStatus = 'active' | 'inactive' | 'completed'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
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
    status: 'active' as ProjectStatus
  })

  const { profile } = useAuthStore()
  const { addProject } = useProjectStore()
  const supabase = createClient()

const handleSubmit = async () => {
  console.log('🔍 Submit clicked')
  console.log('🔍 Profile:', profile)
  console.log('🔍 Form data:', formData)
  
  if (!profile || !formData.name.trim()) {
    console.log('🔍 Validation failed - missing profile or name')
    return
  }

  setLoading(true)
  try {
    console.log('🔍 Attempting to insert project...')
    
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

    console.log('🔍 Supabase response:', { data, error })

    if (error) {
      console.error('🔍 Database error:', error)
      alert(`Error creating project: ${error.message}`)
      return
    }

    console.log('🔍 Adding project to store:', data)
    addProject(data)
    onOpenChange(false)
    setFormData({ name: '', description: '', url: '', status: 'active' as ProjectStatus })
    console.log('🔍 Project created successfully:', data.name)
  } catch (error) {
    console.error('🔍 Catch error:', error)
    alert('An unexpected error occurred. Please try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}