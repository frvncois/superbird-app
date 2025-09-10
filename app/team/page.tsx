'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Mail, Settings, Crown, Shield, User } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { InviteTeamMember } from '@/components/modals/invite-collaborator-modal'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending'
  joinedAt: string
}

interface TeamInvitation {
  id: string
  email: string
  role: 'admin' | 'member'
  message?: string
  invitedBy: string
  invitedAt: string
  expiresAt: string
}

export default function TeamPage() {
  // This would be replaced with actual team data from Supabase
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    // Example data - remove when integrating with real data
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '',
      role: 'owner',
      status: 'active',
      joinedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: '',
      role: 'admin',
      status: 'active',
      joinedAt: '2024-02-01'
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      avatar: '',
      role: 'member',
      status: 'pending',
      joinedAt: '2024-02-15'
    }
  ])

  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([])

  const handleInviteSent = (invitation: TeamInvitation) => {
    // Add the new invitation to pending list
    setPendingInvitations(prev => [...prev, invitation])
    
    // Here you would also make an API call to save the invitation
    console.log('New invitation sent:', invitation)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      case 'member': return <User className="h-4 w-4 text-gray-500" />
      default: return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-yellow-100 text-yellow-800">Owner</Badge>
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
      case 'member':
        return <Badge variant="secondary">Member</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const activeMembers = teamMembers.filter(member => member.status === 'active')
  const pendingMembers = teamMembers.filter(member => member.status === 'pending')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team</h1>
        <InviteTeamMember onInviteSent={handleInviteSent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-12 w-12 mx-auto" />}
                  title="No team members yet"
                  description="Invite team members to start collaborating on projects"
                  action={{
                    label: "Invite Team Member",
                    onClick: () => console.log("Invite member")
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {(pendingMembers.length > 0 || pendingInvitations.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Team members who haven't accepted their invitations yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(member.role)}
                        <Button variant="outline" size="sm">
                          Resend
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            <Mail className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{invitation.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Invited {new Date(invitation.invitedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(invitation.role)}
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Just Sent
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Members</span>
                <Badge variant="secondary">{teamMembers.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Members</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {activeMembers.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Invites</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingMembers.length + pendingInvitations.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Administrators</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InviteTeamMember 
                onInviteSent={handleInviteSent}
                buttonVariant="outline"
                className="w-full justify-start"
              />
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Team Update
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Team Settings
              </Button>
            </CardContent>
          </Card>

          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Owners</span>
                </div>
                <Badge variant="secondary">
                  {teamMembers.filter(m => m.role === 'owner').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Administrators</span>
                </div>
                <Badge variant="secondary">
                  {teamMembers.filter(m => m.role === 'admin').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Members</span>
                </div>
                <Badge variant="secondary">
                  {teamMembers.filter(m => m.role === 'member').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}