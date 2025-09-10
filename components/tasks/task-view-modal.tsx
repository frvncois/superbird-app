// components/tasks/task-view-modal.tsx
'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  IconFlag,
  IconFolder,
  IconCalendar,
  IconUser,
  IconClock,
  IconMessage,
  IconCircleCheckFilled,
  IconLoader,
  IconEdit
} from '@tabler/icons-react'
import { formatDistanceToNow } from 'date-fns'
import { TaskComments } from './task-comments'
import { Database } from '@/types/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface TaskWithProject extends Task {
  project?: Project
  created_by_profile?: Profile
}

interface TaskViewModalProps {
  task: TaskWithProject
  onEdit: () => void
}

export function TaskViewModal({ task, onEdit }: TaskViewModalProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': 
        return <IconCircleCheckFilled className="fill-green-500 size-5" />
      case 'in_progress': 
        return <IconLoader className="text-blue-500 size-5" />
      case 'todo': 
        return <IconClock className="text-gray-500 size-5" />
      default: 
        return <IconClock className="text-gray-500 size-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {getStatusIcon(task.status)}
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
          {task.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-6">{task.description}</p>
          )}
        </div>
        <Button onClick={onEdit} variant="outline" className="flex items-center gap-2 ml-4">
          <IconEdit className="h-4 w-4" />
          Edit Task
        </Button>
      </div>

      {/* Task Details - Simple List */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500 w-20">Status</span>
          <Badge className={`${getStatusColor(task.status)} text-sm`}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500 w-20">Priority</span>
          <Badge className={`${getPriorityColor(task.priority)} text-sm flex items-center gap-1 w-fit`}>
            <IconFlag className="h-3 w-3" />
            {task.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500 w-20">Project</span>
          {task.project ? (
            <Badge variant="outline" className="text-sm flex items-center gap-1 w-fit">
              <IconFolder className="h-3 w-3" />
              {task.project.name}
            </Badge>
          ) : (
            <span className="text-gray-400 text-sm">No project assigned</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500 w-20">Due Date</span>
          {task.due_date ? (
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(task.due_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric', 
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              {isOverdue && (
                <span className="text-xs text-red-500 font-medium">
                  {formatDistanceToNow(new Date(task.due_date))} overdue
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No due date</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500 w-20">Created By</span>
          <span className="text-sm font-medium text-gray-900">
            {task.created_by_profile?.full_name || 'Unknown'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500 w-20">Created</span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {new Date(task.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short', 
                day: 'numeric'
              })}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Comments Section */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-4">
          <IconMessage className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Discussion</h3>
        </div>
        <div className="h-full">
          <TaskComments 
            taskId={task.id} 
            onClose={() => {}} 
          />
        </div>
      </div>
    </div>
  )
}