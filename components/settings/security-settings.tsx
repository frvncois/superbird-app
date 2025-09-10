'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  MapPin,
  Copy,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Fingerprint,
  Lock,
  Unlock,
  Globe,
  Activity,
  History,
  FileText,
  Zap,
  Camera,
  QrCode
} from 'lucide-react'

interface LoginSession {
  id: string
  device: string
  browser: string
  os: string
  location: string
  ip: string
  lastActive: string
  current: boolean
  trusted: boolean
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  created: string
  lastUsed?: string
  expiresAt?: string
  status: 'active' | 'revoked' | 'expired'
}

interface SecurityEvent {
  id: string
  type: 'login' | 'password_change' | 'api_key_created' | 'suspicious_activity' | 'device_trusted'
  description: string
  timestamp: string
  ip?: string
  location?: string
  severity: 'low' | 'medium' | 'high'
  status: 'resolved' | 'pending' | 'investigating'
}

interface TwoFactorBackupCode {
  id: string
  code: string
  used: boolean
  usedAt?: string
}

export function SecuritySettings() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Password change states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 2FA states
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
  const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [twoFactorSecret, setTwoFactorSecret] = useState('')

  // API Key states
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[],
    expiresIn: '30' // days
  })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    loginNotifications: true,
    apiAccess: false,
    deviceTrustEnabled: true,
    sessionTimeout: 24, // hours
    requireStrongPassword: true,
    allowMultipleSessions: true,
    ipWhitelistEnabled: false,
    suspiciousActivityDetection: true
  })

  // Mock data - replace with real data from your backend
  const [sessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome 118.0',
      os: 'macOS 14.0',
      location: 'Montreal, QC, Canada',
      ip: '192.168.1.100',
      lastActive: '5 minutes ago',
      current: true,
      trusted: true
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      browser: 'Safari 17.0',
      os: 'iOS 17.1',
      location: 'Montreal, QC, Canada',
      ip: '192.168.1.101',
      lastActive: '2 hours ago',
      current: false,
      trusted: true
    },
    {
      id: '3',
      device: 'Dell Laptop',
      browser: 'Chrome 118.0',
      os: 'Windows 11',
      location: 'Toronto, ON, Canada',
      ip: '203.0.113.45',
      lastActive: '3 days ago',
      current: false,
      trusted: false
    },
    {
      id: '4',
      device: 'Unknown Device',
      browser: 'Firefox 119.0',
      os: 'Ubuntu 22.04',
      location: 'Unknown Location',
      ip: '198.51.100.42',
      lastActive: '1 week ago',
      current: false,
      trusted: false
    }
  ])

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Development API',
      key: 'ab_test_1234567890abcdef1234567890abcdef',
      permissions: ['projects:read', 'projects:write', 'tasks:read'],
      created: '2024-09-01T00:00:00Z',
      lastUsed: '2 hours ago',
      expiresAt: '2024-12-01T00:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mobile App',
      key: 'ab_live_abcdef1234567890abcdef1234567890',
      permissions: ['projects:read', 'tasks:read', 'tasks:write'],
      created: '2024-08-15T00:00:00Z',
      lastUsed: '1 day ago',
      expiresAt: '2025-08-15T00:00:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: 'Legacy Integration',
      key: 'ab_test_oldkey123456789oldkey123456789',
      permissions: ['projects:read'],
      created: '2024-06-01T00:00:00Z',
      lastUsed: '1 month ago',
      status: 'revoked'
    }
  ])

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      description: 'Successful login from new device (Dell Laptop)',
      timestamp: '2024-09-07T14:30:00Z',
      ip: '203.0.113.45',
      location: 'Toronto, ON, Canada',
      severity: 'medium',
      status: 'resolved'
    },
    {
      id: '2',
      type: 'password_change',
      description: 'Password changed successfully',
      timestamp: '2024-09-05T09:15:00Z',
      severity: 'low',
      status: 'resolved'
    },
    {
      id: '3',
      type: 'api_key_created',
      description: 'New API key created: Mobile App',
      timestamp: '2024-08-15T16:45:00Z',
      severity: 'low',
      status: 'resolved'
    },
    {
      id: '4',
      type: 'suspicious_activity',
      description: 'Multiple failed login attempts detected',
      timestamp: '2024-09-03T02:30:00Z',
      ip: '198.51.100.99',
      location: 'Unknown Location',
      severity: 'high',
      status: 'investigating'
    }
  ])

  const [backupCodes] = useState<TwoFactorBackupCode[]>([
    { id: '1', code: '1234-5678', used: false },
    { id: '2', code: '9876-5432', used: true, usedAt: '2024-08-15T10:30:00Z' },
    { id: '3', code: '4567-8901', used: false },
    { id: '4', code: '2345-6789', used: false },
    { id: '5', code: '8765-4321', used: false },
    { id: '6', code: '3456-7890', used: false },
    { id: '7', code: '7654-3210', used: false },
    { id: '8', code: '5678-9012', used: false }
  ])

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

  const supabase = createClient()

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleSecuritySettingChange = (key: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }))
    toast.success('Security setting updated')
  }

  const handleRevokeSession = async (sessionId: string) => {
    const confirmed = window.confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')
    if (!confirmed) return

    try {
      // Revoke session logic here
      toast.success('Session revoked successfully')
    } catch (error) {
      toast.error('Failed to revoke session')
    }
  }

  const handleTrustDevice = async (sessionId: string, trusted: boolean) => {
    try {
      // Trust/untrust device logic here
      toast.success(`Device ${trusted ? 'trusted' : 'untrusted'} successfully`)
    } catch (error) {
      toast.error('Failed to update device trust status')
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
      const apiKey: APIKey = {
        id: Date.now().toString(),
        name: newApiKey.name,
        key: `sk_${Math.random().toString(36).substring(2, 30)}`,
        permissions: newApiKey.permissions,
        created: new Date().toISOString(),
        expiresAt: new Date(Date.now() + parseInt(newApiKey.expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      }
      
      setApiKeys(prev => [...prev, apiKey])
      setNewApiKey({ name: '', permissions: [], expiresIn: '30' })
      setApiKeyDialogOpen(false)
      
      toast.success('API key created successfully')
    } catch (error) {
      toast.error('Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeApiKey = async (keyId: string) => {
    const confirmed = window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')
    if (!confirmed) return

    try {
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

  const handleEnable2FA = async () => {
    setLoading(true)
    try {
      // Generate 2FA secret and QR code
      const secret = Math.random().toString(36).substring(2, 18)
      const qrUrl = `otpauth://totp/Superbird:${profile?.email}?secret=${secret}&issuer=Superbird`
      
      setTwoFactorSecret(secret)
      setQrCodeUrl(qrUrl)
      setTwoFactorDialogOpen(true)
    } catch (error) {
      toast.error('Failed to setup two-factor authentication')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    try {
      // Verify 2FA code logic here
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }))
      setTwoFactorDialogOpen(false)
      setVerificationCode('')
      toast.success('Two-factor authentication enabled successfully')
    } catch (error) {
      toast.error('Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    const confirmed = window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')
    if (!confirmed) return

    try {
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }))
      toast.success('Two-factor authentication disabled')
    } catch (error) {
      toast.error('Failed to disable two-factor authentication')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const downloadBackupCodes = () => {
    const codes = backupCodes.filter(code => !code.used).map(code => code.code).join('\n')
    const blob = new Blob([`Superbird 2FA Backup Codes\n\n${codes}\n\nKeep these codes safe and secure.`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'superbird-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  const generateNewBackupCodes = async () => {
    const confirmed = window.confirm('This will invalidate all existing backup codes. Continue?')
    if (!confirmed) return

    try {
      // Generate new backup codes logic here
      toast.success('New backup codes generated')
    } catch (error) {
      toast.error('Failed to generate new backup codes')
    }
  }

  const exportSecurityData = async () => {
    try {
      const data = {
        sessions: sessions,
        apiKeys: apiKeys.map(key => ({ ...key, key: key.key.substring(0, 8) + '...' })),
        securityEvents: securityEvents,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'security-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Security data exported successfully')
    } catch (error) {
      toast.error('Failed to export security data')
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.match(/[a-z]/)) strength += 25
    if (password.match(/[A-Z]/)) strength += 25
    if (password.match(/[0-9]/)) strength += 25
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25
    return Math.min(strength, 100)
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 50) return 'bg-red-500'
    if (strength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 25) return 'Very Weak'
    if (strength < 50) return 'Weak'
    if (strength < 75) return 'Good'
    if (strength < 100) return 'Strong'
    return 'Very Strong'
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'medium':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'low':
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'investigating':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Investigating</Badge>
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Security Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
              <CardDescription>
                Your account security status and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {securitySettings.twoFactorEnabled ? '✓' : '×'}
                  </div>
                  <div className="text-sm text-muted-foreground">2FA Status</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {sessions.filter(s => s.current || s.trusted).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Trusted Devices</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {apiKeys.filter(k => k.status === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active API Keys</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {securityEvents.filter(e => e.severity === 'high' && e.status !== 'resolved').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Security Alerts</div>
                </div>
              </div>

              <Separator />

              {/* Security Recommendations */}
              <div className="space-y-4">
                <h4 className="font-medium">Security Recommendations</h4>
                <div className="space-y-3">
                  {!securitySettings.twoFactorEnabled && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span>Enable two-factor authentication for better security</span>
                          <Button size="sm" onClick={handleEnable2FA}>
                            Enable 2FA
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {sessions.filter(s => !s.trusted && !s.current).length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span>You have {sessions.filter(s => !s.trusted && !s.current).length} untrusted device(s) with access</span>
                          <Button size="sm" variant="outline" onClick={() => setActiveTab('sessions')}>
                            Review Sessions
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {apiKeys.filter(k => k.status === 'active' && !k.expiresAt).length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span>Some API keys don't have expiration dates</span>
                          <Button size="sm" variant="outline" onClick={() => setActiveTab('api')}>
                            Review API Keys
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Security Actions</CardTitle>
              <CardDescription>
                Common security tasks and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setActiveTab('authentication')}>
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Change Password</div>
                      <div className="text-sm text-muted-foreground">Update your account password</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4" onClick={handleEnable2FA}>
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Setup 2FA</div>
                      <div className="text-sm text-muted-foreground">Enable two-factor authentication</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setActiveTab('sessions')}>
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Manage Sessions</div>
                      <div className="text-sm text-muted-foreground">Review active sessions</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4" onClick={exportSecurityData}>
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Export Security Data</div>
                      <div className="text-sm text-muted-foreground">Download security information</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordForm.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Password strength:</span>
                      <span className={passwordStrength >= 75 ? 'text-green-600' : passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Your password should be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
                </AlertDescription>
              </Alert>

              <Button onClick={handlePasswordChange} disabled={loading || passwordStrength < 50}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Two-Factor Authentication</Label>
                    {securitySettings.twoFactorEnabled ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use an authenticator app to generate verification codes
                  </p>
                </div>
                {!securitySettings.twoFactorEnabled ? (
                  <Button onClick={handleEnable2FA} disabled={loading}>
                    {loading ? 'Setting up...' : 'Enable 2FA'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setBackupCodesDialogOpen(true)}>
                      Backup Codes
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleDisable2FA}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                )}
              </div>

              {securitySettings.twoFactorEnabled && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is enabled. You'll need your authenticator app to sign in.
                    Make sure to keep your backup codes in a safe place.
                  </AlertDescription>
                </Alert>
              )}

              {/* 2FA Setup Dialog */}
              <Dialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      Scan the QR code with your authenticator app and enter the verification code
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="bg-white p-4 rounded-lg border inline-block">
                        <QrCode className="h-32 w-32 mx-auto" />
                        <p className="text-xs text-muted-foreground mt-2">QR Code Placeholder</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Manual Entry Key</Label>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                            {twoFactorSecret}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(twoFactorSecret, 'Secret key')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input
                        id="verification-code"
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setTwoFactorDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleVerify2FA} disabled={loading || verificationCode.length !== 6}>
                        {loading ? 'Verifying...' : 'Verify & Enable'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Backup Codes Dialog */}
              <Dialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Two-Factor Backup Codes</DialogTitle>
                    <DialogDescription>
                      Use these codes to access your account if you lose your authenticator device
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code) => (
                        <div
                          key={code.id}
                          className={`p-2 font-mono text-sm border rounded ${
                            code.used ? 'bg-muted text-muted-foreground line-through' : 'bg-background'
                          }`}
                        >
                          {code.code}
                        </div>
                      ))}
                    </div>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Each backup code can only be used once. Store these codes in a secure location.
                        You have {backupCodes.filter(c => !c.used).length} unused codes remaining.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={downloadBackupCodes}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Codes
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={generateNewBackupCodes}>
                          Generate New Codes
                        </Button>
                        <Button onClick={() => setBackupCodesDialogOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Security Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Notifications
              </CardTitle>
              <CardDescription>
                Get notified about security events on your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email notifications for security events</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about password changes, new logins, etc.
                  </p>
                </div>
                <Switch
                  checked={securitySettings.emailNotifications}
                  onCheckedChange={(checked) => handleSecuritySettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone signs into your account
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => handleSecuritySettingChange('loginNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Suspicious activity detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect and alert on suspicious account activity
                  </p>
                </div>
                <Switch
                  checked={securitySettings.suspiciousActivityDetection}
                  onCheckedChange={(checked) => handleSecuritySettingChange('suspiciousActivityDetection', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          {/* Session Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage where you're signed in and control device access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Session timeout</Label>
                  <Select
                    value={securitySettings.sessionTimeout.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                      <SelectItem value="720">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow multiple sessions</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow signing in from multiple devices
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.allowMultipleSessions}
                    onCheckedChange={(checked) => handleSecuritySettingChange('allowMultipleSessions', checked)}
                  />
                </div>
              </div>

              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{session.device}</p>
                      </div>
                      {session.current && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Current
                        </Badge>
                      )}
                      {session.trusted && (
                        <Badge variant="outline" className="text-xs">
                          <Fingerprint className="h-3 w-3 mr-1" />
                          Trusted
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{session.browser} on {session.os}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.ip}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.lastActive}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!session.current && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrustDevice(session.id, !session.trusted)}
                        >
                          {session.trusted ? (
                            <>
                              <Unlock className="h-4 w-4 mr-1" />
                              Untrust
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Trust
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Revoke
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for programmatic access to your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow API access to your account
                  </p>
                </div>
                <Switch
                  checked={securitySettings.apiAccess}
                  onCheckedChange={(checked) => handleSecuritySettingChange('apiAccess', checked)}
                />
              </div>

              {securitySettings.apiAccess && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Active API Keys</h4>
                    <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          Generate New Key
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
                            <Label htmlFor="api-key-name">Key Name</Label>
                            <Input
                              id="api-key-name"
                              placeholder="My API Key"
                              value={newApiKey.name}
                              onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Permissions</Label>
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

                          <div className="space-y-2">
                            <Label>Expires In</Label>
                            <Select
                              value={newApiKey.expiresIn}
                              onValueChange={(value) => setNewApiKey(prev => ({ ...prev, expiresIn: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                                <SelectItem value="0">Never</SelectItem>
                              </SelectContent>
                            </Select>
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

                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No API keys created yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{key.name}</p>
                              {getStatusBadge(key.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Created: {new Date(key.created).toLocaleDateString()}</span>
                              {key.lastUsed && <span>Last used: {key.lastUsed}</span>}
                              {key.expiresAt && (
                                <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {key.permissions.map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                                {key.key.substring(0, 12)}...
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.key, 'API key')}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {key.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeApiKey(key.id)}
                              className="text-destructive hover:text-destructive ml-4"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Security Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Activity
              </CardTitle>
              <CardDescription>
                Recent security events and account activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Monitor security events for your account
                </p>
                <Button variant="outline" size="sm" onClick={exportSecurityData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Activity
                </Button>
              </div>

              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {event.type === 'login' && <Monitor className="h-4 w-4 text-blue-500" />}
                      {event.type === 'password_change' && <Key className="h-4 w-4 text-green-500" />}
                      {event.type === 'api_key_created' && <Zap className="h-4 w-4 text-purple-500" />}
                      {event.type === 'suspicious_activity' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {event.type === 'device_trusted' && <Fingerprint className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{event.description}</p>
                        {getSeverityBadge(event.severity)}
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        {event.ip && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {event.ip}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {securityEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No security events recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}