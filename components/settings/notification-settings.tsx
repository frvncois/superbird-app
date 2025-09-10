'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor,
  Users,
  CheckSquare,
  MessageSquare,
  Calendar,
  AlertCircle,
  Volume2,
  Clock,
  Settings,
  Plus,
  Trash2,
  Edit,
  Moon,
  Sun,
  Zap,
  FileText,
  Shield,
  Activity
} from 'lucide-react'

interface NotificationPreference {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
  inApp: boolean
  category: 'projects' | 'tasks' | 'team' | 'system' | 'security'
  priority: 'low' | 'medium' | 'high'
}

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'push' | 'in-app'
  active: boolean
}

interface NotificationSchedule {
  id: string
  name: string
  days: string[]
  startTime: string
  endTime: string
  timezone: string
  active: boolean
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [testNotificationOpen, setTestNotificationOpen] = useState(false)
  
  const [globalSettings, setGlobalSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    frequency: 'instant', // instant, hourly, daily
    timezone: 'America/Montreal',
    soundEnabled: true,
    vibrationEnabled: true,
    desktopNotifications: true,
    mobileNotifications: true,
    digestEnabled: true,
    digestTime: '09:00',
    weekendNotifications: false
  })

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    // Projects
    {
      id: 'project_created',
      title: 'New project created',
      description: 'When a new project is created in your workspace',
      email: true,
      push: true,
      inApp: true,
      category: 'projects',
      priority: 'medium'
    },
    {
      id: 'project_updated',
      title: 'Project updates',
      description: 'When projects you\'re involved in are updated',
      email: true,
      push: false,
      inApp: true,
      category: 'projects',
      priority: 'low'
    },
    {
      id: 'project_completed',
      title: 'Project completed',
      description: 'When a project is marked as completed',
      email: true,
      push: true,
      inApp: true,
      category: 'projects',
      priority: 'high'
    },
    {
      id: 'project_deadline_approaching',
      title: 'Project deadline approaching',
      description: 'When project deadlines are within 24-48 hours',
      email: true,
      push: true,
      inApp: true,
      category: 'projects',
      priority: 'high'
    },
    {
      id: 'project_overdue',
      title: 'Project overdue',
      description: 'When projects become overdue',
      email: true,
      push: true,
      inApp: true,
      category: 'projects',
      priority: 'high'
    },

    // Tasks
    {
      id: 'task_assigned',
      title: 'Task assigned to you',
      description: 'When a task is assigned to you',
      email: true,
      push: true,
      inApp: true,
      category: 'tasks',
      priority: 'high'
    },
    {
      id: 'task_due_soon',
      title: 'Task due soon',
      description: 'When your tasks are due within 24 hours',
      email: true,
      push: true,
      inApp: true,
      category: 'tasks',
      priority: 'high'
    },
    {
      id: 'task_overdue',
      title: 'Task overdue',
      description: 'When your tasks become overdue',
      email: true,
      push: true,
      inApp: true,
      category: 'tasks',
      priority: 'high'
    },
    {
      id: 'task_completed',
      title: 'Task completed',
      description: 'When tasks assigned to you are completed by others',
      email: false,
      push: false,
      inApp: true,
      category: 'tasks',
      priority: 'low'
    },
    {
      id: 'task_comment',
      title: 'Task comments',
      description: 'When someone comments on your tasks',
      email: true,
      push: false,
      inApp: true,
      category: 'tasks',
      priority: 'medium'
    },
    {
      id: 'task_status_changed',
      title: 'Task status changed',
      description: 'When task status is updated',
      email: false,
      push: false,
      inApp: true,
      category: 'tasks',
      priority: 'low'
    },

    // Team
    {
      id: 'team_invitation',
      title: 'Team invitations',
      description: 'When you\'re invited to join a team',
      email: true,
      push: true,
      inApp: true,
      category: 'team',
      priority: 'high'
    },
    {
      id: 'team_member_joined',
      title: 'New team member',
      description: 'When someone joins your team',
      email: false,
      push: false,
      inApp: true,
      category: 'team',
      priority: 'low'
    },
    {
      id: 'mention',
      title: 'Mentions',
      description: 'When someone mentions you in comments',
      email: true,
      push: true,
      inApp: true,
      category: 'team',
      priority: 'high'
    },
    {
      id: 'comment_reply',
      title: 'Comment replies',
      description: 'When someone replies to your comment',
      email: true,
      push: false,
      inApp: true,
      category: 'team',
      priority: 'medium'
    },
    {
      id: 'team_role_changed',
      title: 'Role changes',
      description: 'When your team role is changed',
      email: true,
      push: true,
      inApp: true,
      category: 'team',
      priority: 'high'
    },

    // System
    {
      id: 'system_maintenance',
      title: 'System maintenance',
      description: 'Important system updates and maintenance notifications',
      email: true,
      push: true,
      inApp: true,
      category: 'system',
      priority: 'high'
    },
    {
      id: 'feature_updates',
      title: 'Feature updates',
      description: 'When new features are released',
      email: true,
      push: false,
      inApp: true,
      category: 'system',
      priority: 'low'
    },
    {
      id: 'storage_warning',
      title: 'Storage warnings',
      description: 'When approaching storage limits',
      email: true,
      push: true,
      inApp: true,
      category: 'system',
      priority: 'medium'
    },

    // Security
    {
      id: 'security_alerts',
      title: 'Security alerts',
      description: 'Login attempts and security-related notifications',
      email: true,
      push: true,
      inApp: true,
      category: 'security',
      priority: 'high'
    },
    {
      id: 'password_changed',
      title: 'Password changes',
      description: 'When your password is changed',
      email: true,
      push: true,
      inApp: true,
      category: 'security',
      priority: 'high'
    },
    {
      id: 'new_device_login',
      title: 'New device login',
      description: 'When you sign in from a new device',
      email: true,
      push: true,
      inApp: true,
      category: 'security',
      priority: 'high'
    }
  ])

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Task Assignment',
      subject: 'New Task Assigned: {{task_title}}',
      content: 'You have been assigned a new task: {{task_title}} in project {{project_name}}. Due date: {{due_date}}',
      type: 'email',
      active: true
    },
    {
      id: '2',
      name: 'Project Completion',
      subject: 'Project Completed: {{project_name}}',
      content: 'Great news! The project {{project_name}} has been completed successfully.',
      type: 'email',
      active: true
    }
  ])

  const [schedules, setSchedules] = useState<NotificationSchedule[]>([
    {
      id: '1',
      name: 'Work Hours',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'America/Montreal',
      active: true
    }
  ])

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'email' as 'email' | 'push' | 'in-app'
  })

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    days: [] as string[],
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'America/Montreal'
  })

  const [testNotification, setTestNotification] = useState({
    type: 'email' as 'email' | 'push' | 'in-app',
    title: 'Test Notification',
    message: 'This is a test notification to verify your settings are working correctly.'
  })

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  const handleGlobalSettingChange = (key: string, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handlePreferenceChange = (id: string, type: 'email' | 'push' | 'inApp', value: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, [type]: value } : pref
      )
    )
  }

  const handleBulkChange = (category: string, type: 'email' | 'push' | 'inApp', value: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.category === category ? { ...pref, [type]: value } : pref
      )
    )
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Save notification preferences to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Notification preferences saved successfully')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Test ${testNotification.type} notification sent!`)
      setTestNotificationOpen(false)
    } catch (error) {
      toast.error('Failed to send test notification')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const template: NotificationTemplate = {
        id: Date.now().toString(),
        name: newTemplate.name,
        subject: newTemplate.subject,
        content: newTemplate.content,
        type: newTemplate.type,
        active: true
      }
      
      setTemplates(prev => [...prev, template])
      setNewTemplate({ name: '', subject: '', content: '', type: 'email' })
      setTemplateDialogOpen(false)
      
      toast.success('Notification template created successfully')
    } catch (error) {
      toast.error('Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async () => {
    if (!newSchedule.name || newSchedule.days.length === 0) {
      toast.error('Please provide a name and select at least one day')
      return
    }

    setLoading(true)
    try {
      const schedule: NotificationSchedule = {
        id: Date.now().toString(),
        name: newSchedule.name,
        days: newSchedule.days,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        timezone: newSchedule.timezone,
        active: true
      }
      
      setSchedules(prev => [...prev, schedule])
      setNewSchedule({ name: '', days: [], startTime: '09:00', endTime: '17:00', timezone: 'America/Montreal' })
      setScheduleDialogOpen(false)
      
      toast.success('Notification schedule created successfully')
    } catch (error) {
      toast.error('Failed to create schedule')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    toast.success('Template deleted')
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    toast.success('Schedule deleted')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'projects': return <CheckSquare className="h-4 w-4" />
      case 'tasks': return <Calendar className="h-4 w-4" />
      case 'team': return <Users className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>
      case 'medium':
        return <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low</Badge>
      default:
        return null
    }
  }

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = []
    }
    acc[pref.category].push(pref)
    return acc
  }, {} as Record<string, NotificationPreference[]>)

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Global Notification Settings
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications across all channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Notification Channels</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label>Email notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.emailEnabled}
                    onCheckedChange={(checked) => handleGlobalSettingChange('emailEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label>Push notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on mobile devices
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.pushEnabled}
                    onCheckedChange={(checked) => handleGlobalSettingChange('pushEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <Label>In-app notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Show notifications in the web application
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.inAppEnabled}
                    onCheckedChange={(checked) => handleGlobalSettingChange('inAppEnabled', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Device Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <Label>Sound notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Play sound for notifications
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.soundEnabled}
                    onCheckedChange={(checked) => handleGlobalSettingChange('soundEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label>Vibration</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vibrate on mobile notifications
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.vibrationEnabled}
                    onCheckedChange={(checked) => handleGlobalSettingChange('vibrationEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <Label>Desktop notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Show browser notifications
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.desktopNotifications}
                    onCheckedChange={(checked) => handleGlobalSettingChange('desktopNotifications', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Timing & Frequency</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Notification frequency</Label>
                  <Select
                    value={globalSettings.frequency}
                    onValueChange={(value) => handleGlobalSettingChange('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="hourly">Hourly digest</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={globalSettings.timezone}
                    onValueChange={(value) => handleGlobalSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Montreal">Eastern Time (Montreal)</SelectItem>
                      <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                      <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (Los Angeles)</SelectItem>
                      <SelectItem value="Europe/London">GMT (London)</SelectItem>
                      <SelectItem value="Europe/Paris">CET (Paris)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <Label>Quiet hours</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Don't send notifications during specified hours
                </p>
              </div>
              <Switch
                checked={globalSettings.quietHours}
                onCheckedChange={(checked) => handleGlobalSettingChange('quietHours', checked)}
              />
            </div>

            {globalSettings.quietHours && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quietStart">Start time</Label>
                  <Select
                    value={globalSettings.quietStart}
                    onValueChange={(value) => handleGlobalSettingChange('quietStart', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietEnd">End time</Label>
                  <Select
                    value={globalSettings.quietEnd}
                    onValueChange={(value) => handleGlobalSettingChange('quietEnd', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekend notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on weekends
                </p>
              </div>
              <Switch
                checked={globalSettings.weekendNotifications}
                onCheckedChange={(checked) => handleGlobalSettingChange('weekendNotifications', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <Label>Daily digest</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of notifications
                </p>
              </div>
              <Switch
                checked={globalSettings.digestEnabled}
                onCheckedChange={(checked) => handleGlobalSettingChange('digestEnabled', checked)}
              />
            </div>

            {globalSettings.digestEnabled && (
              <div className="space-y-2">
                <Label>Digest delivery time</Label>
                <Select
                  value={globalSettings.digestTime}
                  onValueChange={(value) => handleGlobalSettingChange('digestTime', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Dialog open={testNotificationOpen} onOpenChange={setTestNotificationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Test Notification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Test Notification</DialogTitle>
                  <DialogDescription>
                    Send a test notification to verify your settings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notification Type</Label>
                    <Select
                      value={testNotification.type}
                      onValueChange={(value: 'email' | 'push' | 'in-app') => 
                        setTestNotification(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="in-app">In-App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={testNotification.title}
                      onChange={(e) => setTestNotification(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Test notification title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={testNotification.message}
                      onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Test notification message"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setTestNotificationOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleTestNotification} disabled={loading}>
                      {loading ? 'Sending...' : 'Send Test'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          {/* Detailed Preferences by Category */}
          {Object.entries(groupedPreferences).map(([category, prefs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {getCategoryIcon(category)}
                  {category} Notifications
                </CardTitle>
                <CardDescription>
                  Configure {category}-related notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bulk Actions */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Bulk actions for {category}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkChange(category, 'email', true)}
                    >
                      Enable All Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkChange(category, 'push', true)}
                    >
                      Enable All Push
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkChange(category, 'email', false)}
                    >
                      Disable All
                    </Button>
                  </div>
                </div>

                {/* Individual Preferences */}
                <div className="space-y-4">
                  {prefs.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{pref.title}</h4>
                          {getPriorityBadge(pref.priority)}
                          {(pref.email || pref.push || pref.inApp) && (
                            <Badge variant="secondary" className="text-xs">
                              {[pref.email && 'Email', pref.push && 'Push', pref.inApp && 'In-app']
                                .filter(Boolean)
                                .join(', ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{pref.description}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            checked={pref.email && globalSettings.emailEnabled}
                            disabled={!globalSettings.emailEnabled}
                            onCheckedChange={(checked) => handlePreferenceChange(pref.id, 'email', checked)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            checked={pref.push && globalSettings.pushEnabled}
                            disabled={!globalSettings.pushEnabled}
                            onCheckedChange={(checked) => handlePreferenceChange(pref.id, 'push', checked)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            checked={pref.inApp && globalSettings.inAppEnabled}
                            disabled={!globalSettings.inAppEnabled}
                            onCheckedChange={(checked) => handlePreferenceChange(pref.id, 'inApp', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Notification Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notification Templates
              </CardTitle>
              <CardDescription>
                Customize notification content and formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Create custom templates for different types of notifications
                </p>
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Notification Template</DialogTitle>
                      <DialogDescription>
                        Design a custom template for your notifications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          placeholder="My Template"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-type">Type</Label>
                        <Select
                          value={newTemplate.type}
                          onValueChange={(value: 'email' | 'push' | 'in-app') => 
                            setNewTemplate(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="push">Push Notification</SelectItem>
                            <SelectItem value="in-app">In-App Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-subject">Subject/Title</Label>
                        <Input
                          id="template-subject"
                          placeholder="{{event_type}}: {{title}}"
                          value={newTemplate.subject}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-content">Content</Label>
                        <Textarea
                          id="template-content"
                          placeholder="Hello {{user_name}}, {{description}}"
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Use variables to personalize notifications.
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateTemplate} disabled={loading}>
                          {loading ? 'Creating...' : 'Create Template'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant={template.active ? "default" : "secondary"} className="text-xs">
                            {template.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {template.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.active}
                          onCheckedChange={(checked) => {
                            setTemplates(prev => 
                              prev.map(t => 
                                t.id === template.id ? { ...t, active: checked } : t
                              )
                            )
                          }}
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded text-sm">
                      <p className="font-medium mb-1">Preview:</p>
                      <p className="text-muted-foreground">{template.content}</p>
                    </div>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No custom templates created yet</p>
                    <p className="text-sm">Create templates to customize your notification messages</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          {/* Notification Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Notification Schedules
              </CardTitle>
              <CardDescription>
                Set up custom notification schedules and time windows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Define when you want to receive notifications based on your schedule
                </p>
                <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Notification Schedule</DialogTitle>
                      <DialogDescription>
                        Set up a custom schedule for receiving notifications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="schedule-name">Schedule Name</Label>
                        <Input
                          id="schedule-name"
                          placeholder="Work Hours"
                          value={newSchedule.name}
                          onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Days of the Week</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {weekDays.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={day.value}
                                checked={newSchedule.days.includes(day.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewSchedule(prev => ({ 
                                      ...prev, 
                                      days: [...prev.days, day.value] 
                                    }))
                                  } else {
                                    setNewSchedule(prev => ({ 
                                      ...prev, 
                                      days: prev.days.filter(d => d !== day.value) 
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={day.value} className="text-sm">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="schedule-start">Start Time</Label>
                          <Select
                            value={newSchedule.startTime}
                            onValueChange={(value) => setNewSchedule(prev => ({ ...prev, startTime: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0')
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hour}:00
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule-end">End Time</Label>
                          <Select
                            value={newSchedule.endTime}
                            onValueChange={(value) => setNewSchedule(prev => ({ ...prev, endTime: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0')
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hour}:00
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schedule-timezone">Timezone</Label>
                        <Select
                          value={newSchedule.timezone}
                          onValueChange={(value) => setNewSchedule(prev => ({ ...prev, timezone: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Montreal">Eastern Time (Montreal)</SelectItem>
                            <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                            <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (Los Angeles)</SelectItem>
                            <SelectItem value="Europe/London">GMT (London)</SelectItem>
                            <SelectItem value="Europe/Paris">CET (Paris)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateSchedule} disabled={loading}>
                          {loading ? 'Creating...' : 'Create Schedule'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{schedule.name}</h4>
                          <Badge variant={schedule.active ? "default" : "secondary"} className="text-xs">
                            {schedule.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                          <span>{schedule.timezone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.active}
                          onCheckedChange={(checked) => {
                            setSchedules(prev => 
                              prev.map(s => 
                                s.id === schedule.id ? { ...s, active: checked } : s
                              )
                            )
                          }}
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">ACTIVE DAYS</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {schedule.days.map((day) => (
                          <Badge key={day} variant="secondary" className="text-xs capitalize">
                            {weekDays.find(d => d.value === day)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {schedules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No custom schedules created yet</p>
                    <p className="text-sm">Create schedules to control when you receive notifications</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  )
}