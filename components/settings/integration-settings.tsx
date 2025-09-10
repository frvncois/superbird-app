'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Plug, 
  Github, 
  Slack, 
  Mail,
  Calendar,
  Database,
  Cloud,
  Webhook,
  Settings,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Zap,
  MessageSquare,
  Video,
  Globe,
  Search,
  BarChart3
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  status: 'connected' | 'disconnected' | 'error'
  category: 'development' | 'communication' | 'productivity' | 'storage' | 'analytics'
  settings?: Record<string, any>
  lastSync?: string
  features?: string[]
  plan?: 'free' | 'pro' | 'enterprise'
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  lastTriggered?: string
  secret?: string
  retryCount: number
  lastResponse?: string
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  created: string
  lastUsed?: string
  status: 'active' | 'revoked'
}

export function IntegrationSettings() {
  const [loading, setLoading] = useState(false)
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false)
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [integrationConfigOpen, setIntegrationConfigOpen] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: ''
  })

  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[]
  })

  // Mock data - replace with real data from your backend
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Sync repositories and track commits',
      icon: Github,
      status: 'connected',
      category: 'development',
      settings: {
        repositories: ['superbird-app', 'client-portal'],
        autoSync: true,
        webhookUrl: 'https://api.github.com/repos/user/repo/hooks'
      },
      lastSync: '2 hours ago',
      features: ['Repository sync', 'Commit tracking', 'Issue integration', 'Pull request notifications'],
      plan: 'pro'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications to Slack channels',
      icon: Slack,
      status: 'connected',
      category: 'communication',
      settings: {
        workspace: 'mycompany.slack.com',
        channel: '#general',
        notifications: ['project_updates', 'task_completed'],
        botToken: 'xoxb-***'
      },
      lastSync: '5 minutes ago',
      features: ['Channel notifications', 'Direct messages', 'Custom commands', 'File sharing'],
      plan: 'free'
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync deadlines and meetings',
      icon: Calendar,
      status: 'disconnected',
      category: 'productivity',
      features: ['Event sync', 'Deadline reminders', 'Meeting integration'],
      plan: 'free'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Store and sync project files',
      icon: Cloud,
      status: 'error',
      category: 'storage',
      lastSync: '3 days ago',
      features: ['File storage', 'Auto backup', 'Team folders', 'Version history'],
      plan: 'pro'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Send email notifications',
      icon: Mail,
      status: 'disconnected',
      category: 'communication',
      features: ['Email delivery', 'Templates', 'Analytics', 'A/B testing'],
      plan: 'pro'
    },
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      description: 'Track website performance',
      icon: BarChart3,
      status: 'connected',
      category: 'analytics',
      settings: {
        trackingId: 'GA-XXXXX-X',
        events: ['page_views', 'conversions']
      },
      lastSync: '1 hour ago',
      features: ['Traffic analysis', 'Goal tracking', 'Custom events'],
      plan: 'free'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Schedule and manage meetings',
      icon: Video,
      status: 'disconnected',
      category: 'communication',
      features: ['Meeting scheduling', 'Recording access', 'Participant management'],
      plan: 'pro'
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sync projects and documentation',
      icon: FileText,
      status: 'disconnected',
      category: 'productivity',
      features: ['Page sync', 'Database integration', 'Content sharing'],
      plan: 'enterprise'
    }
  ])

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Project Updates',
      url: 'https://api.example.com/webhooks/projects',
      events: ['project.created', 'project.updated', 'project.completed'],
      status: 'active',
      lastTriggered: '1 hour ago',
      secret: 'whsec_1234567890abcdef',
      retryCount: 3,
      lastResponse: '200 OK'
    },
    {
      id: '2',
      name: 'Task Notifications',
      url: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
      events: ['task.assigned', 'task.completed'],
      status: 'active',
      lastTriggered: '3 hours ago',
      secret: 'whsec_abcdef1234567890',
      retryCount: 3,
      lastResponse: '200 OK'
    },
    {
      id: '3',
      name: 'Failed Webhook',
      url: 'https://broken.example.com/webhook',
      events: ['team.member_added'],
      status: 'inactive',
      lastTriggered: '2 days ago',
      secret: 'whsec_failed123456',
      retryCount: 0,
      lastResponse: '404 Not Found'
    }
  ])

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Development API',
      key: 'sk_test_1234567890abcdef',
      permissions: ['projects:read', 'projects:write', 'tasks:read'],
      created: '2024-09-01T00:00:00Z',
      lastUsed: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mobile App',
      key: 'sk_live_abcdef1234567890',
      permissions: ['projects:read', 'tasks:read', 'tasks:write'],
      created: '2024-08-15T00:00:00Z',
      lastUsed: '1 day ago',
      status: 'active'
    },
    {
      id: '3',
      name: 'Legacy Integration',
      key: 'sk_test_oldkey123456',
      permissions: ['projects:read'],
      created: '2024-06-01T00:00:00Z',
      lastUsed: '1 month ago',
      status: 'revoked'
    }
  ])

  const availableEvents = [
    'project.created',
    'project.updated',
    'project.completed',
    'project.deleted',
    'task.created',
    'task.assigned',
    'task.updated',
    'task.completed',
    'task.deleted',
    'task.overdue',
    'team.member_added',
    'team.member_removed',
    'team.role_changed',
    'comment.created',
    'file.uploaded',
    'integration.connected',
    'integration.disconnected'
  ]

  const availablePermissions = [
    'projects:read',
    'projects:write',
    'projects:delete',
    'tasks:read',
    'tasks:write',
    'tasks:delete',
    'team:read',
    'team:write',
    'analytics:read',
    'integrations:read',
    'integrations:write'
  ]

  const handleConnect = async (integrationId: string) => {
    setLoading(true)
    try {
      // Connect integration logic here
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'connected' as const, lastSync: 'Just now' }
            : integration
        )
      )
      
      toast.success('Integration connected successfully')
    } catch (error) {
      toast.error('Failed to connect integration')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    const confirmed = window.confirm('Are you sure you want to disconnect this integration? This will stop all data syncing.')
    if (!confirmed) return

    setLoading(true)
    try {
      // Disconnect integration logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'disconnected' as const, settings: undefined }
            : integration
        )
      )
      
      toast.success('Integration disconnected')
    } catch (error) {
      toast.error('Failed to disconnect integration')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (integrationId: string) => {
    setLoading(true)
    try {
      // Sync integration logic here
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, lastSync: 'Just now' }
            : integration
        )
      )
      
      toast.success('Sync completed successfully')
    } catch (error) {
      toast.error('Sync failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Create webhook logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const webhook: Webhook = {
        id: Date.now().toString(),
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        status: 'active',
        secret: newWebhook.secret || `whsec_${Math.random().toString(36).substring(2, 15)}`,
        retryCount: 3
      }
      
      setWebhooks(prev => [...prev, webhook])
      setNewWebhook({ name: '', url: '', events: [], secret: '' })
      setWebhookDialogOpen(false)
      
      toast.success('Webhook created successfully')
    } catch (error) {
      toast.error('Failed to create webhook')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApiKey = async () => {
    if (!newApiKey.name || newApiKey.permissions.length === 0) {
      toast.error('Please provide a name and select permissions')
      return
    }

    setLoading(true)
    try {
      // Create API key logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const apiKey: APIKey = {
        id: Date.now().toString(),
        name: newApiKey.name,
        key: `sk_${Math.random().toString(36).substring(2, 25)}`,
        permissions: newApiKey.permissions,
        created: new Date().toISOString(),
        status: 'active'
      }
      
      setApiKeys(prev => [...prev, apiKey])
      setNewApiKey({ name: '', permissions: [] })
      setApiKeyDialogOpen(false)
      
      toast.success('API key created successfully')
    } catch (error) {
      toast.error('Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this webhook?')
    if (!confirmed) return

    try {
      // Delete webhook logic here
      setWebhooks(prev => prev.filter(w => w.id !== webhookId))
      toast.success('Webhook deleted')
    } catch (error) {
      toast.error('Failed to delete webhook')
    }
  }

  const handleRevokeApiKey = async (keyId: string) => {
    const confirmed = window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')
    if (!confirmed) return

    try {
      // Revoke API key logic here
      setApiKeys(prev => 
        prev.map(key => 
          key.id === keyId 
            ? { ...key, status: 'revoked' as const }
            : key
        )
      )
      toast.success('API key revoked')
    } catch (error) {
      toast.error('Failed to revoke API key')
    }
  }

  const handleToggleWebhook = async (webhookId: string, status: 'active' | 'inactive') => {
    try {
      // Toggle webhook status logic here
      setWebhooks(prev => 
        prev.map(webhook => 
          webhook.id === webhookId 
            ? { ...webhook, status }
            : webhook
        )
      )
      toast.success(`Webhook ${status === 'active' ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update webhook')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const testWebhook = async (webhookId: string) => {
    setLoading(true)
    try {
      // Test webhook logic here
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Test webhook sent successfully')
    } catch (error) {
      toast.error('Failed to send test webhook')
    } finally {
      setLoading(false)
    }
  }

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanBadge = (plan?: string) => {
    if (!plan) return null
    
    switch (plan) {
      case 'free':
        return <Badge variant="secondary" className="text-xs">Free</Badge>
      case 'pro':
        return <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">Pro</Badge>
      case 'enterprise':
        return <Badge variant="default" className="text-xs bg-purple-100 text-purple-800">Enterprise</Badge>
      default:
        return null
    }
  }

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = []
    }
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<string, Integration[]>)

  const IntegrationConfigDialog = ({ integration }: { integration: Integration }) => (
    <Dialog open={integrationConfigOpen === integration.id} onOpenChange={() => setIntegrationConfigOpen(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <integration.icon className="h-5 w-5" />
            Configure {integration.name}
          </DialogTitle>
          <DialogDescription>
            Manage settings and preferences for this integration
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {integration.settings && (
            <div className="space-y-4">
              <h4 className="font-medium">Current Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(integration.settings).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                    <Input 
                      value={Array.isArray(value) ? value.join(', ') : String(value)}
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h4 className="font-medium">Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {integration.features?.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIntegrationConfigOpen(null)}>
              Cancel
            </Button>
            <Button>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Integrations Overview
          </CardTitle>
          <CardDescription>
            Connect your favorite tools and services to streamline your workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {integrations.filter(i => i.status === 'connected').length}
              </div>
              <div className="text-sm text-muted-foreground">Connected</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {integrations.filter(i => i.status === 'disconnected').length}
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {integrations.filter(i => i.status === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {webhooks.filter(w => w.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Webhooks</div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some integrations require specific plan levels. Upgrade your plan to access premium integrations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Available Integrations by Category */}
          {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  {category === 'development' && <Github className="h-5 w-5" />}
                  {category === 'communication' && <MessageSquare className="h-5 w-5" />}
                  {category === 'productivity' && <CheckCircle className="h-5 w-5" />}
                  {category === 'storage' && <Cloud className="h-5 w-5" />}
                  {category === 'analytics' && <BarChart3 className="h-5 w-5" />}
                  {category} Integrations
                </CardTitle>
                <CardDescription>
                  Manage your {category} tool integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryIntegrations.map((integration) => {
                    const IconComponent = integration.icon
                    return (
                      <div key={integration.id}>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{integration.name}</h4>
                                {getStatusBadge(integration.status)}
                                {getPlanBadge(integration.plan)}
                              </div>
                              <p className="text-sm text-muted-foreground">{integration.description}</p>
                              {integration.lastSync && (
                                <p className="text-xs text-muted-foreground">
                                  Last synced: {integration.lastSync}
                                </p>
                              )}
                              {integration.status === 'error' && (
                                <p className="text-xs text-red-600">
                                  Connection failed. Please reconfigure.
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {integration.status === 'connected' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSync(integration.id)}
                                  disabled={loading}
                                >
                                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                  Sync
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIntegrationConfigOpen(integration.id)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {integration.status === 'connected' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDisconnect(integration.id)}
                                disabled={loading}
                              >
                                Disconnect
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleConnect(integration.id)}
                                disabled={loading}
                              >
                                {loading ? 'Connecting...' : 'Connect'}
                              </Button>
                            )}
                          </div>
                        </div>
                        <IntegrationConfigDialog integration={integration} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          {/* Webhooks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications about events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Send HTTP requests to your endpoints when events occur in your workspace
                  </p>
                </div>
                <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Webhook</DialogTitle>
                      <DialogDescription>
                        Configure a new webhook endpoint to receive real-time notifications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhook-name">Name *</Label>
                        <Input
                          id="webhook-name"
                          placeholder="My Webhook"
                          value={newWebhook.name}
                          onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhook-url">Endpoint URL *</Label>
                        <Input
                          id="webhook-url"
                          placeholder="https://api.example.com/webhook"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                        <Input
                          id="webhook-secret"
                          placeholder="webhook_secret_key"
                          value={newWebhook.secret}
                          onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Used to verify webhook authenticity
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Events to Subscribe *</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                          {availableEvents.map((event) => (
                            <div key={event} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={event}
                                checked={newWebhook.events.includes(event)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewWebhook(prev => ({ 
                                      ...prev, 
                                      events: prev.events.filter(e => e !== event) 
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={event} className="text-sm">
                                {event}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateWebhook} disabled={loading}>
                          {loading ? 'Creating...' : 'Create Webhook'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{webhook.name}</h4>
                          {getStatusBadge(webhook.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Events: {webhook.events.length}</span>
                          {webhook.lastTriggered && <span>Last triggered: {webhook.lastTriggered}</span>}
                          {webhook.lastResponse && <span>Last response: {webhook.lastResponse}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testWebhook(webhook.id)}
                          disabled={loading}
                        >
                          Test
                        </Button>
                        <Switch
                          checked={webhook.status === 'active'}
                          onCheckedChange={(checked) => 
                            handleToggleWebhook(webhook.id, checked ? 'active' : 'inactive')
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">SUBSCRIBED EVENTS</Label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {webhook.secret && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">WEBHOOK SECRET</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {showSecrets[webhook.id] ? webhook.secret : '••••••••••••••••'}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSecretVisibility(webhook.id)}
                              className="h-6 w-6 p-0"
                            >
                              {showSecrets[webhook.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(webhook.secret!, 'Secret')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {webhooks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No webhooks configured</h3>
                    <p className="text-sm mb-4">Create your first webhook to start receiving real-time notifications</p>
                    <Button onClick={() => setWebhookDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Webhook
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for programmatic access to your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Create API keys to access your workspace data programmatically
                  </p>
                </div>
                <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate API Key</DialogTitle>
                      <DialogDescription>
                        Create a new API key with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="api-key-name">Key Name *</Label>
                        <Input
                          id="api-key-name"
                          placeholder="My API Key"
                          value={newApiKey.name}
                          onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions *</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                          {availablePermissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={permission}
                                checked={newApiKey.permissions.includes(permission)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewApiKey(prev => ({ 
                                      ...prev, 
                                      permissions: [...prev.permissions, permission] 
                                    }))
                                  } else {
                                    setNewApiKey(prev => ({ 
                                      ...prev, 
                                      permissions: prev.permissions.filter(p => p !== permission) 
                                    }))
                                  }
                                }}
                              />
                              <Label htmlFor={permission} className="text-sm">
                                {permission}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          API keys provide full access to the selected permissions. Store them securely and never share them publicly.
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateApiKey} disabled={loading}>
                          {loading ? 'Generating...' : 'Generate Key'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{apiKey.name}</h4>
                          {getStatusBadge(apiKey.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {new Date(apiKey.created).toLocaleDateString()}</span>
                          {apiKey.lastUsed && <span>Last used: {apiKey.lastUsed}</span>}
                          <span>Permissions: {apiKey.permissions.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiKey.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeApiKey(apiKey.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">API KEY</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                            {showSecrets[apiKey.id] ? apiKey.key : `${apiKey.key.slice(0, 7)}${'•'.repeat(20)}`}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(apiKey.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showSecrets[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key, 'API key')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">PERMISSIONS</Label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {apiKeys.filter(k => k.status === 'active').length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No active API keys</h3>
                    <p className="text-sm mb-4">Generate your first API key to start building integrations</p>
                    <Button onClick={() => setApiKeyDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate API Key
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                API Documentation
              </CardTitle>
              <CardDescription>
                Learn how to integrate with our APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">REST API</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Access your data programmatically via REST endpoints with JSON responses
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View REST Docs
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Try in Postman
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <h4 className="font-medium">GraphQL API</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Query your data with GraphQL for flexible and efficient data fetching
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View GraphQL Docs
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      GraphQL Playground
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Quick Start Examples</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs font-medium">GET PROJECTS</Label>
                    <code className="block text-xs mt-1 font-mono">
                    </code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-xs font-medium">CREATE TASK</Label>
                    <code className="block text-xs mt-1 font-mono">
                    
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Integrations</CardTitle>
          <CardDescription>
            Don't see your tool? Request a custom integration or build your own
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Custom integrations are available for Enterprise customers. Contact our team to discuss your specific integration needs.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Request Integration
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Integration Guide
            </Button>
            <Button variant="outline">
              <Github className="h-4 w-4 mr-2" />
              SDK & Examples
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Popular Integration Requests</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                { name: 'Jira', votes: 45 },
                { name: 'Trello', votes: 32 },
                { name: 'Asana', votes: 28 },
                { name: 'Monday.com', votes: 25 },
                { name: 'Notion', votes: 22 },
                { name: 'Airtable', votes: 18 },
                { name: 'Zapier', votes: 35 },
                { name: 'Microsoft Teams', votes: 30 },
                { name: 'Linear', votes: 15 }
              ].map((tool) => (
                <div key={tool.name} className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm font-medium">{tool.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{tool.votes} votes</Badge>
                    <Button variant="ghost" size="sm" className="text-xs h-6">
                      Vote
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}