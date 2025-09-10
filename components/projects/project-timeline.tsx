// components/projects/project-timeline.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, isAfter } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckSquare,
  AlertCircle,
  Flag,
  Video,
  CalendarDays,
  Target
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'

type Task = Database['public']['Tables']['tasks']['Row']

// Timeline Event Types
type TimelineEventType = 'delivery' | 'meeting' | 'milestone' | 'deadline'

interface TimelineEvent {
  id: string
  project_id: string
  title: string
  description?: string | null
  event_type: TimelineEventType
  event_date: string
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  meeting_link?: string | null
  attendees?: string[] | null
  created_by: string
  created_at: string
  updated_at: string
}

interface ProjectTimelineProps {
  projectId: string
  tasks: Task[]
}

// Create Timeline Event Modal
function CreateTimelineEventModal({ 
  open, 
  onOpenChange, 
  projectId, 
  onEventCreated 
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onEventCreated: (event: TimelineEvent) => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'delivery' as TimelineEventType,
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    meeting_link: '',
    attendees: ''
  })

  const { profile } = useAuthStore()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!profile || !formData.title.trim() || !formData.event_date) return

    setLoading(true)
    try {
      const attendeesList = formData.attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email)

      const { data, error } = await supabase
        .from('timeline_events')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          event_type: formData.event_type,
          event_date: formData.event_date,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          location: formData.location.trim() || null,
          meeting_link: formData.meeting_link.trim() || null,
          attendees: attendeesList.length > 0 ? attendeesList : null,
          project_id: projectId,
          created_by: profile.id
        })
        .select()
        .single()

      if (error) throw error

      onEventCreated(data)
      onOpenChange(false)
      setFormData({
        title: '',
        description: '',
        event_type: 'delivery',
        event_date: '',
        start_time: '',
        end_time: '',
        location: '',
        meeting_link: '',
        attendees: ''
      })
      toast.success('Timeline event created successfully')
    } catch (error) {
      console.error('Error creating timeline event:', error)
      toast.error('Failed to create timeline event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
          <DialogDescription>
            Create a new event, meeting, or milestone for your project timeline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="event_type">Event Type</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value: TimelineEventType) => 
                setFormData(prev => ({ ...prev, event_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
          </div>

          {formData.event_type === 'meeting' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Meeting location or 'Online'"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  id="meeting_link"
                  placeholder="Zoom, Teams, or other meeting link"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_link: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendees">Attendees</Label>
                <Input
                  id="attendees"
                  placeholder="Enter email addresses separated by commas"
                  value={formData.attendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.title.trim() || !formData.event_date}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Timeline Event Card Component
function TimelineEventCard({ 
  event, 
  onEdit, 
  onDelete 
}: { 
  event: TimelineEvent
  onEdit: (event: TimelineEvent) => void
  onDelete: (eventId: string) => void
}) {
  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'delivery': return <Target className="h-4 w-4" />
      case 'meeting': return <Video className="h-4 w-4" />
      case 'milestone': return <Flag className="h-4 w-4" />
      case 'deadline': return <AlertCircle className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getEventColor = (type: TimelineEventType) => {
    switch (type) {
      case 'delivery': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200'
      case 'milestone': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isEventPast = isBefore(parseISO(event.event_date), new Date())
  const isEventToday = isToday(parseISO(event.event_date))

  return (
    <Card className={`relative ${isEventPast ? 'opacity-75' : ''} ${isEventToday ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${getEventColor(event.event_type)} flex items-center space-x-1`}>
              {getEventIcon(event.event_type)}
              <span className="capitalize">{event.event_type}</span>
            </Badge>
            {isEventToday && <Badge variant="outline">Today</Badge>}
            {isEventPast && <Badge variant="secondary">Past</Badge>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(event)}>
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
                    <AlertDialogTitle>Delete Timeline Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{event.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(event.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{event.title}</CardTitle>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {format(parseISO(event.event_date), 'MMM dd, yyyy')}
          </div>
          {event.start_time && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {event.start_time}
              {event.end_time && ` - ${event.end_time}`}
            </div>
          )}
        </div>
      </CardHeader>
      {(event.description || event.location || event.meeting_link || event.attendees) && (
        <CardContent className="pt-0">
          {event.description && (
            <p className="text-sm text-gray-600 mb-3">{event.description}</p>
          )}
          {event.location && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
          )}
          {event.meeting_link && (
            <div className="flex items-center text-sm mb-2">
              <Video className="h-4 w-4 mr-2" />
              <a 
                href={event.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Join Meeting
              </a>
            </div>
          )}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// Task Due Date Card Component
function TaskDueDateCard({ task }: { task: Task }) {
  const isPastDue = task.due_date && isBefore(parseISO(task.due_date), new Date())
  const isDueToday = task.due_date && isToday(parseISO(task.due_date))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in_progress': return 'text-blue-600'
      case 'todo': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className={`relative ${isPastDue && task.status !== 'completed' ? 'border-red-200 bg-red-50' : ''} ${isDueToday ? 'ring-2 ring-orange-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className={`h-4 w-4 ${getStatusColor(task.status)}`} />
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            {isDueToday && <Badge variant="outline">Due Today</Badge>}
            {isPastDue && task.status !== 'completed' && <Badge variant="destructive">Overdue</Badge>}
          </div>
        </div>
        <CardTitle className="text-lg">{task.title}</CardTitle>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Due {format(parseISO(task.due_date!), 'MMM dd, yyyy')}
          </div>
          <Badge variant="outline" className="text-xs">
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      {task.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600">{task.description}</p>
        </CardContent>
      )}
    </Card>
  )
}

// Calendar View Component
function CalendarView({ 
  events, 
  tasks, 
  currentDate, 
  onDateChange 
}: {
  events: TimelineEvent[]
  tasks: Task[]
  currentDate: Date
  onDateChange: (date: Date) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDay = (date: Date) => {
    const dayEvents = events.filter(event => isSameDay(parseISO(event.event_date), date))
    const dayTasks = tasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), date))
    return { events: dayEvents, tasks: dayTasks }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    onDateChange(newDate)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {monthDays.map(day => {
          const { events: dayEvents, tasks: dayTasks } = getEventsForDay(day)
          const hasItems = dayEvents.length > 0 || dayTasks.length > 0
          const isCurrentDay = isToday(day)
          
          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                ${isCurrentDay ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                ${hasItems ? 'border-purple-200' : 'border-gray-200'}
              `}
            >
              <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate"
                  >
                    {event.title}
                  </div>
                ))}
                {dayTasks.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    className="text-xs px-1 py-0.5 rounded bg-orange-100 text-orange-800 truncate"
                  >
                    {task.title}
                  </div>
                ))}
                {(dayEvents.length + dayTasks.length) > 2 && (
                  <div className="text-xs text-gray-500">
                    +{(dayEvents.length + dayTasks.length) - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main Timeline Component
export function ProjectTimeline({ projectId, tasks }: ProjectTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const supabase = createClient()

  // Load timeline events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('timeline_events')
          .select('*')
          .eq('project_id', projectId)
          .order('event_date', { ascending: true })

        if (error) throw error
        setEvents(data || [])
      } catch (error) {
        console.error('Error loading timeline events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [projectId, supabase])

  // Filter tasks that have due dates
  const tasksWithDueDates = useMemo(() => 
    tasks.filter(task => task.due_date).sort((a, b) => 
      new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    ), [tasks]
  )

  // Combine and sort all timeline items
  const allTimelineItems = useMemo(() => {
    const items: Array<{ type: 'event' | 'task', date: string, item: TimelineEvent | Task }> = []
    
    events.forEach(event => {
      items.push({ type: 'event', date: event.event_date, item: event })
    })
    
    tasksWithDueDates.forEach(task => {
      items.push({ type: 'task', date: task.due_date!, item: task })
    })
    
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events, tasksWithDueDates])

  const handleEventCreated = (newEvent: TimelineEvent) => {
    setEvents(prev => [...prev, newEvent])
  }

  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event)
    // Open edit modal (we'll implement this later)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(prev => prev.filter(e => e.id !== eventId))
      toast.success('Timeline event deleted successfully')
    } catch (error) {
      console.error('Error deleting timeline event:', error)
      toast.error('Failed to delete timeline event')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project Timeline</h2>
          <p className="text-gray-600">Manage deliveries, meetings, milestones, and task deadlines</p>
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'calendar')}>
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setCreateEventOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Timeline Content */}
      {viewMode === 'calendar' ? (
        <CalendarView
          events={events}
          tasks={tasksWithDueDates}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      ) : (
        <div className="space-y-6">
          {/* Timeline Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasks with Due Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasksWithDueDates.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allTimelineItems.filter(item => isAfter(parseISO(item.date), new Date())).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {tasksWithDueDates.filter(task => 
                    isBefore(parseISO(task.due_date!), new Date()) && task.status !== 'completed'
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Items */}
          <div className="space-y-4">
            {allTimelineItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline items yet</h3>
                  <p className="text-gray-500 mb-4">
                    Add events, meetings, or create tasks with due dates to build your project timeline.
                  </p>
                  <Button onClick={() => setCreateEventOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              allTimelineItems.map((item, index) => (
                <div key={`${item.type}-${item.item.id}`} className="relative">
                  {/* Timeline connector line */}
                  {index < allTimelineItems.length - 1 && (
                    <div className="absolute left-4 top-16 w-0.5 h-16 bg-gray-200 z-0"></div>
                  )}
                  
                  {/* Timeline dot */}
                  <div className="absolute left-2 top-6 w-4 h-4 rounded-full bg-white border-2 border-gray-300 z-10"></div>
                  
                  {/* Timeline content */}
                  <div className="ml-8">
                    {item.type === 'event' ? (
                      <TimelineEventCard
                        event={item.item as TimelineEvent}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                      />
                    ) : (
                      <TaskDueDateCard task={item.item as Task} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Timeline Event Modal */}
      <CreateTimelineEventModal
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        projectId={projectId}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}