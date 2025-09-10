// components/tasks/task-list.tsx
'use client'

import React, { useState, useMemo } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  IconCircleCheckFilled,
  IconLoader,
  IconClock,
  IconFlag,
  IconUser,
  IconCalendar,
  IconDotsVertical,
  IconEdit,
  IconMessage,
  IconSquareCheck,
  IconPlayerPlay,
  IconSquare,
  IconGripVertical,
  IconFolder
} from '@tabler/icons-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { TaskComments } from './task-comments'
import { TaskEditForm } from './task-edit-form'
import { TaskViewModal } from './task-view-modal'

type Task = Database['public']['Tables']['tasks']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface TaskWithProject extends Task {
  project?: Project
  created_by_profile?: Profile
}

interface TaskListProps {
  tasks: TaskWithProject[]
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: string) => void
}

// Drag Handle Component
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Draggable Row Component
function DraggableRow({ task, onStatusUpdate, openViewSheet, openEditSheet, getPriorityColor }: {
  task: TaskWithProject
  onStatusUpdate: (taskId: string, status: Task['status']) => void
  openViewSheet: (task: TaskWithProject) => void
  openEditSheet: (task: TaskWithProject) => void
  getPriorityColor: (priority: string) => string
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: task.id,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': 
        return <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-4" />
      case 'in_progress': 
        return <IconLoader className="text-blue-500 size-4" />
      case 'todo': 
        return <IconClock className="text-gray-500 size-4" />
      default: 
        return <IconClock className="text-gray-500 size-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return 'Unknown'
    }
  }

  return (
    <TableRow
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {/* Drag Handle */}
      <TableCell>
        <DragHandle id={task.id} />
      </TableCell>

      {/* Task */}
      <TableCell>
        <div className="flex items-center space-x-2">
          {getStatusIcon(task.status)}
          <div className="flex-1 min-w-0">
            <div 
              className="font-medium truncate hover:text-blue-600 cursor-pointer"
              onClick={() => openViewSheet(task)}
            >
              {task.title}
            </div>
            {task.description && (
              <div className="text-sm text-gray-500 truncate">{task.description}</div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Project */}
      <TableCell>
        {task.project ? (
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <IconFolder className="h-3 w-3" />
            {task.project.name}
          </Badge>
        ) : (
          <span className="text-gray-400 text-xs">No project</span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {task.status.replace('_', ' ')}
        </Badge>
      </TableCell>

      {/* Priority */}
      <TableCell>
        <Badge 
          variant="outline" 
          className={`text-xs ${getPriorityColor(task.priority)}`}
        >
          <IconFlag className="h-3 w-3 mr-1" />
          {task.priority}
        </Badge>
      </TableCell>

      {/* Due Date */}
      <TableCell>
        <div className="flex items-center text-sm">
          {task.due_date ? (
            <>
              <IconCalendar className="h-4 w-4 mr-1 text-gray-400" />
              {new Date(task.due_date).toLocaleDateString()}
            </>
          ) : (
            <span className="text-gray-400">No due date</span>
          )}
        </div>
      </TableCell>

      {/* Added By */}
      <TableCell>
        <div className="flex items-center text-sm">
          <IconUser className="h-4 w-4 mr-1 text-gray-400" />
          <span>
            {task.created_by_profile?.full_name || 'Unknown'}
          </span>
        </div>
      </TableCell>

      {/* Created */}
      <TableCell>
        <div className="text-sm text-gray-500">
          {formatTimeAgo(task.created_at)}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-muted-foreground h-8 w-8 p-0"
            >
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => openViewSheet(task)}>
              <IconUser className="mr-2 h-4 w-4" />
              View task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusUpdate(task.id, 'completed')}>
              <IconSquareCheck className="mr-2 h-4 w-4" />
              Mark completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusUpdate(task.id, 'in_progress')}>
              <IconPlayerPlay className="mr-2 h-4 w-4" />
              In progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusUpdate(task.id, 'todo')}>
              <IconSquare className="mr-2 h-4 w-4" />
              To do
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openEditSheet(task)}>
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function TaskList({ tasks, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  const [data, setData] = useState(() => tasks)
  const [viewSheetOpen, setViewSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null)

  const { user } = useAuthStore()
  const supabase = createClient()

  // Update data when tasks prop changes
  React.useEffect(() => {
    setData(tasks)
  }, [tasks])

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setData(prevData => 
        prevData.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      )

      onTaskUpdated(updatedTask)
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error('Failed to update task status')
    }
  }

  const openViewSheet = (task: TaskWithProject) => {
    setSelectedTask(task)
    setViewSheetOpen(true)
  }

  const openEditSheet = (task: TaskWithProject) => {
    setSelectedTask(task)
    setEditSheetOpen(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="h-24 text-center">
                No tasks found. Create your first task to get started.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                {data.map((task) => (
                  <DraggableRow 
                    key={task.id} 
                    task={task}
                    onStatusUpdate={handleStatusUpdate}
                    openViewSheet={openViewSheet}
                    openEditSheet={openEditSheet}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Task View Sheet - Beautiful comprehensive view */}
      <Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
        <SheetContent className="w-full sm:max-w-6xl">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <TaskViewModal 
              task={selectedTask}
              onEdit={() => {
                setViewSheetOpen(false)
                setEditSheetOpen(true)
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Task Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Edit Task</SheetTitle>
            <SheetDescription>
              Update task details and information
            </SheetDescription>
          </SheetHeader>
          {selectedTask && (
            <TaskEditForm 
              task={selectedTask} 
              onTaskUpdated={(updatedTask) => {
                onTaskUpdated(updatedTask)
                setEditSheetOpen(false)
              }}
              onClose={() => setEditSheetOpen(false)} 
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}