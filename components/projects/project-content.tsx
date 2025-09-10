// components/projects/project-content.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  FileText,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  CheckSquare,
  Paperclip,
  Search,
  Filter
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

type Task = Database['public']['Tables']['tasks']['Row']
type ProjectContent = Database['public']['Tables']['content']['Row']

interface ProjectContentProps {
  projectId: string
  tasks: Task[]
}

// Enhanced Rich Text Editor Component
function RichTextEditor({ 
  value, 
  onChange, 
  placeholder 
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const insertText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end)
    const beforeText = value.slice(0, start)
    const afterText = value.slice(end)
    
    const newText = beforeText + prefix + selectedText + suffix + afterText
    onChange(newText)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  const handleHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' '
    insertText(prefix)
  }

  const handleFormat = (type: string) => {
    switch (type) {
      case 'bold':
        insertText('**', '**')
        break
      case 'italic':
        insertText('*', '*')
        break
      case 'underline':
        insertText('<u>', '</u>')
        break
      case 'link':
        insertText('[', '](url)')
        break
    }
  }

  return (
    <div className="border rounded-lg">
      <div className="border-b p-3 bg-gray-50 flex items-center space-x-1 flex-wrap gap-1">
        {/* Headings */}
        <div className="flex items-center space-x-1 border-r pr-2 mr-2">
          {[1, 2, 3, 4].map((level) => (
            <Button
              key={level}
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => handleHeading(level)}
              className="px-2 py-1 h-8 text-xs font-semibold"
            >
              H{level}
            </Button>
          ))}
        </div>
        
        {/* Formatting */}
        <div className="flex items-center space-x-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => handleFormat('bold')}
            className="px-2 py-1 h-8 font-bold"
          >
            B
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => handleFormat('italic')}
            className="px-2 py-1 h-8 italic"
          >
            I
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => handleFormat('underline')}
            className="px-2 py-1 h-8 underline"
          >
            U
          </Button>
        </div>
        
        {/* Link */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => handleFormat('link')}
          className="px-2 py-1 h-8 text-xs"
        >
          🔗 Link
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={12}
        className="border-0 resize-none focus:ring-0 text-sm font-mono"
      />
    </div>
  )
}

// Create Content Sheet
function CreateContentSheet({
  open,
  onOpenChange,
  projectId,
  tasks,
  onContentCreated
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  tasks: Task[]
  onContentCreated: (content: ProjectContent) => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    content_details: '',
    assigned_task_id: 'none',
    attached_files: [] as string[],
    status: 'draft' as ProjectContent['status']
  })

  const { profile } = useAuthStore()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!profile || !formData.title.trim() || !formData.content.trim()) return

    setLoading(true)
    try {
      console.log('Creating content with data:', formData)
      
      const { data, error } = await supabase
        .from('project_content')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          content_details: formData.content_details.trim() || null,
          assigned_task_id: formData.assigned_task_id === 'none' ? null : formData.assigned_task_id || null,
          attached_files: formData.attached_files.length > 0 ? formData.attached_files : null,
          status: formData.status,
          project_id: projectId,
          created_by: profile.id
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Content created successfully:', data)
      onContentCreated(data)
      onOpenChange(false)
      setFormData({
        title: '',
        content: '',
        content_details: '',
        assigned_task_id: 'none',
        attached_files: [],
        status: 'draft'
      })
      toast.success('Content created successfully')
    } catch (error) {
      console.error('Error creating content:', error)
      toast.error('Failed to create content')
    } finally {
      setLoading(false)
    }
  }

  const handleFileAttachment = (fileName: string) => {
    setFormData(prev => ({
      ...prev,
      attached_files: [...prev.attached_files, fileName]
    }))
  }

  const removeFileAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attached_files: prev.attached_files.filter((_, i) => i !== index)
    }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
  className="overflow-y-auto" 
  style={{ 
    width: '50vw',
    maxWidth: '50vw'
  }}
>
        <SheetHeader className="px-6 py-4">
          <SheetTitle>Create New Content</SheetTitle>
          <SheetDescription>
            Add new content to your project with rich text, assignments, and file attachments.
          </SheetDescription>
        </SheetHeader>
        
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Content Title</Label>
            <Input
              id="title"
              placeholder="Enter content title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Write your content here..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_details">Content Details</Label>
            <Textarea
              id="content_details"
              placeholder="Additional details, notes, or instructions..."
              value={formData.content_details}
              onChange={(e) => setFormData(prev => ({ ...prev, content_details: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_task">Assign to Task</Label>
              <Select
                value={formData.assigned_task_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_task_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a task (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No task assignment</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectContent['status']) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attached Files</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Attach files from your project files
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileAttachment(`sample-file-${Date.now()}.pdf`)}
                >
                  Browse Project Files
                </Button>
              </div>
              
              {formData.attached_files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.attached_files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{file}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFileAttachment(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? 'Creating...' : 'Create Content'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Content Card Component
function ContentCard({ 
  content, 
  tasks,
  onEdit, 
  onDelete,
  onView 
}: { 
  content: ProjectContent
  tasks: Task[]
  onEdit: (content: ProjectContent) => void
  onDelete: (contentId: string) => void
  onView: (content: ProjectContent) => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const assignedTask = tasks.find(task => task.id === content.assigned_task_id)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{content.title}</CardTitle>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getStatusColor(content.status)}>
                {content.status}
              </Badge>
              {assignedTask && (
                <Badge variant="outline" className="text-xs">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  {assignedTask.title}
                </Badge>
              )}
              {content.attached_files && content.attached_files.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Paperclip className="h-3 w-3 mr-1" />
                  {content.attached_files.length} file{content.attached_files.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(content)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(content)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Content</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{content.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(content.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="text-sm text-gray-600 line-clamp-2">
          {content.content.substring(0, 120)}...
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

// Main Project Content Component
export function ProjectContent({ projectId, tasks }: ProjectContentProps) {
  const [content, setContent] = useState<ProjectContent[]>([])
  const [loading, setLoading] = useState(true)
  const [createContentOpen, setCreateContentOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const supabase = createClient()

  // Load content
  useEffect(() => {
    const loadContent = async () => {
      try {
        console.log('Loading content for project:', projectId)
        
        const { data, error } = await supabase
          .from('project_content')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase error loading content:', error)
          if (error.code === '42P17') {
            console.log('Policy error detected, proceeding with empty content')
            setContent([])
            setLoading(false)
            return
          }
          throw error
        }

        console.log('Loaded content:', data)
        setContent(data || [])
        } catch (error: any) {
          console.error('Error loading content:', error)
          if (error.code !== '42P17') {
          toast.error('Failed to load content')
        }
        setContent([])
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadContent()
    }
  }, [projectId, supabase])

  // Filter content
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleContentCreated = (newContent: ProjectContent) => {
    console.log('Adding new content to list:', newContent)
    setContent(prev => [newContent, ...prev])
  }

  const handleEditContent = (content: ProjectContent) => {
    console.log('Edit content:', content)
  }

  const handleViewContent = (content: ProjectContent) => {
    console.log('View content:', content)
  }

  const handleDeleteContent = async (contentId: string) => {
    try {
      console.log('Deleting content:', contentId)
      
      const { error } = await supabase
        .from('project_content')
        .delete()
        .eq('id', contentId)

      if (error) throw error

      setContent(prev => prev.filter(c => c.id !== contentId))
      toast.success('Content deleted successfully')
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
  }

  console.log('Rendering content component. Loading:', loading, 'Content count:', content.length, 'Filtered count:', filteredContent.length)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  } 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project Content</h2>
          <p className="text-gray-600">Manage and organize your project content</p>
        </div>
        <Button onClick={() => setCreateContentOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {content.length === 0 ? 'No content yet' : 'No content matches your search'}
            </h3>
            <p className="text-gray-500 mb-4">
              {content.length === 0 
                ? 'Start creating content for this project'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {content.length === 0 && (
              <Button onClick={() => setCreateContentOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Content
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              tasks={tasks}
              onEdit={handleEditContent}
              onDelete={handleDeleteContent}
              onView={handleViewContent}
            />
          ))}
        </div>
      )}

      {/* Create Content Sheet */}
      <CreateContentSheet
        open={createContentOpen}
        onOpenChange={setCreateContentOpen}
        projectId={projectId}
        tasks={tasks}
        onContentCreated={handleContentCreated}
      />
    </div>
  )
}