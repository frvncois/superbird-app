'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'
import { 
  Users, 
  UserPlus, 
  Settings, 
  Crown,
  Shield,
  User,
  Mail,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface TeamMember {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending' | 'inactive'
  joined_at: string
  last_active?: string
}

interface PendingInvitation {
  id: string
  email: string
  role: 'admin' | 'member'
  invited_by: string
  invited_at: string
  expires_at: string
}

export function TeamSettings() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'admin' | 'member'
  })

  // Mock data - replace with real data from your backend
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: profile?.id || '1',
      email: profile?.email || 'owner@example.com',
      full_name: profile?.full_name || 'Team Owner',
      role: 'owner',
      status: 'active',
      joined_at: '2024-01-01T00:00:00Z',
      last_active: '5 minutes ago'
    },
    {
      id: '2',
      email: 'admin@example.com',
      full_name: 'Admin User',
      role: 'admin',
      status: 'active',
      joined_at: '2024-01-15T00:00:00Z',
      last_active: '2 hours ago'
    },
    {
      id: '3',
      email: 'member@example.com',
      full_name: 'Team Member',
      role: 'member',
      status: 'active',
      joined_at: '2024-02-01T00:00:00Z',
      last_active: '1 day ago'
    },
    {
      id: '4',
      email: 'inactive@example.com',
      full_name: 'Inactive Member',
      role: 'member',
      status: 'inactive',
      joined_at: '2024-01-20T00:00:00Z',
      last_active: '1 month ago'
    }
  ])

  const [pendingInvitations] = useState<PendingInvitation[]>([
    {
      id: '1',
      email: 'pending@example.com',
      role: 'member',
      invited_by: profile?.full_name || 'Team Owner',
      invited_at: '2024-09-08T00:00:00Z',
      expires_at: '2024-09-15T00:00:00Z'
    }
  ])

  const handleInviteMember = async () => {
    if (!inviteForm.email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      // Send invitation logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success(`Invitation sent to ${inviteForm.email}`)
      setInviteForm({ email: '', role: 'member' })
      setInviteDialogOpen(false)
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      // Update role logic here
      toast.success('Role updated successfully')
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this team member?')
    if (!confirmed) return

    try {
      // Remove member logic here
      toast.success('Team member removed')
    } catch (error) {
      toast.error('Failed to remove team member')
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      // Resend invitation logic here
      toast.success('Invitation resent')
    } catch (error) {
      toast.error('Failed to resend invitation')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      // Cancel invitation logic here
      toast.success('Invitation cancelled')
    } catch (error) {
      toast.error('Failed to cancel invitation')
    }
  }

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/team-123`
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied to clipboard')
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-amber-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      case 'member': return <User className="h-4 w-4 text-gray-500" />
      default: return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const canManageMembers = profile?.role === 'owner' || profile?.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Overview
          </CardTitle>
          <CardDescription>
            Manage your team members and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {teamMembers.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingInvitations.length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Invites</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {teamMembers.filter(m => m.role === 'admin').length + 1}
              </div>
              <div className="text-sm text-muted-foreground">Administrators</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Members */}
      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Team Members
            </CardTitle>
            <CardDescription>
              Add new members to your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite by Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your team
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select
                        value={inviteForm.role}
                        onValueChange={(value: 'admin' | 'member') => 
                          setInviteForm(prev => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Member
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Administrator
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteMember} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={copyInviteLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Invite Link
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invited members will receive an email with instructions to join your team.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              Manage pending team invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invitation.email}</span>
                      <Badge variant="secondary">{invitation.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Invited by {invitation.invited_by} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvitation(invitation.id)}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            View and manage current team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || ''} />
                    <AvatarFallback>
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.full_name}</span>
                      {member.id === profile?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{member.email}</span>
                      <span>•</span>
                      <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                      {member.last_active && (
                        <>
                          <span>•</span>
                          <span>Active {member.last_active}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span className="text-sm font-medium capitalize">{member.role}</span>
                  </div>
                  {getStatusBadge(member.status)}
                  {canManageMembers && member.id !== profile?.id && (
                    <div className="flex gap-2">
                      {member.role !== 'owner' && (
                        <Select
                          value={member.role}
                          onValueChange={(value: 'admin' | 'member') => 
                            handleUpdateRole(member.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            Understand what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h4 className="font-medium">Owner</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full access to all features</li>
                  <li>• Manage team members</li>
                  <li>• Billing and subscriptions</li>
                  <li>• Delete workspace</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Administrator</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Manage projects and tasks</li>
                  <li>• Invite team members</li>
                  <li>• Configure integrations</li>
                  <li>• View analytics</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <h4 className="font-medium">Member</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create and edit projects</li>
                  <li>• Manage assigned tasks</li>
                  <li>• Comment and collaborate</li>
                  <li>• Upload content</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}