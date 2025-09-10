// components/modals/invite-collaborator-modal.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  UserPlus, 
  Mail,
  Copy,
  Send,
  Users,
  Shield,
  User,
  Crown,
  AlertCircle,
  CheckCircle,
  Link,
  Settings
} from 'lucide-react'

interface InviteTeamMemberProps {
  onInviteSent?: (invitation: TeamInvitation) => void
  buttonVariant?: 'default' | 'outline' | 'ghost'
  buttonSize?: 'sm' | 'default' | 'lg'
  showAsIcon?: boolean
  className?: string
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

export function InviteTeamMember({ 
  onInviteSent,
  buttonVariant = 'default',
  buttonSize = 'default',
  showAsIcon = false,
  className 
}: InviteTeamMemberProps) {
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteMethod, setInviteMethod] = useState<'email' | 'link'>('email')
  const [bulkInvite, setBulkInvite] = useState(false)
  
  const [inviteForm, setInviteForm] = useState({
    emails: [''],
    role: 'member' as 'admin' | 'member',
    message: '',
    sendWelcomeEmail: true,
    linkExpiration: '7' // days
  })

  const [generatedLink, setGeneratedLink] = useState('')

  const handleAddEmail = () => {
    setInviteForm(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }))
  }

  const handleRemoveEmail = (index: number) => {
    setInviteForm(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }))
  }

  const handleEmailChange = (index: number, value: string) => {
    setInviteForm(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }))
  }

  const handleBulkEmailsChange = (value: string) => {
    const emails = value.split(/[,\n]/).map(email => email.trim()).filter(Boolean)
    setInviteForm(prev => ({
      ...prev,
      emails: emails
    }))
  }

  const handleSendInvitations = async () => {
    const validEmails = inviteForm.emails.filter(email => 
      email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    )

    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address')
      return
    }

    setLoading(true)
    try {
      // Send invitations logic here
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      // Create invitation objects
      const invitations = validEmails.map(email => ({
        id: Math.random().toString(36).substring(2),
        email: email.trim(),
        role: inviteForm.role,
        message: inviteForm.message,
        invitedBy: 'Current User', // Replace with actual user
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }))

      // Call callback if provided
      invitations.forEach(invitation => {
        onInviteSent?.(invitation)
      })

      toast.success(`${validEmails.length} invitation${validEmails.length > 1 ? 's' : ''} sent successfully`)
      
      // Reset form
      setInviteForm({
        emails: [''],
        role: 'member',
        message: '',
        sendWelcomeEmail: true,
        linkExpiration: '7'
      })
      setDialogOpen(false)
    } catch (error) {
      console.error('Error sending invitations:', error)
      toast.error('Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInviteLink = async () => {
    setLoading(true)
    try {
      // Generate invite link logic here
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const link = `${window.location.origin}/invite/${Math.random().toString(36).substring(2)}?role=${inviteForm.role}&expires=${inviteForm.linkExpiration}`
      setGeneratedLink(link)
      
      toast.success('Invite link generated successfully')
    } catch (error) {
      toast.error('Failed to generate invite link')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(generatedLink)
    toast.success('Invite link copied to clipboard')
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Can manage projects, invite members, and configure settings'
      case 'member':
        return 'Can create and edit projects, manage assigned tasks'
      default:
        return ''
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className={className}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {showAsIcon ? null : 'Invite Team Member'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Add new members to your team and assign appropriate roles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Method Selection */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Invitation Method:</Label>
            <div className="flex gap-2">
              <Button
                variant={inviteMethod === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInviteMethod('email')}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
              <Button
                variant={inviteMethod === 'link' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInviteMethod('link')}
              >
                <Link className="h-4 w-4 mr-1" />
                Invite Link
              </Button>
            </div>
          </div>

          {inviteMethod === 'email' ? (
            <>
              {/* Email Invitations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Email Addresses</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={bulkInvite}
                      onCheckedChange={setBulkInvite}
                    />
                    <Label className="text-sm">Bulk invite</Label>
                  </div>
                </div>

                {bulkInvite ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Enter email addresses separated by commas or new lines&#10;john@example.com, jane@example.com&#10;bob@example.com"
                      value={inviteForm.emails.join(', ')}
                      onChange={(e) => handleBulkEmailsChange(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple email addresses with commas or new lines
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inviteForm.emails.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="colleague@company.com"
                          value={email}
                          onChange={(e) => handleEmailChange(index, e.target.value)}
                        />
                        {inviteForm.emails.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveEmail(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddEmail}
                      className="w-full"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Another Email
                    </Button>
                  </div>
                )}

                {/* Personal Message */}
                <div className="space-y-2">
                  <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Hi! I'd like to invite you to join our team on Superbird..."
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Welcome Email Option */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Send welcome email</Label>
                    <p className="text-sm text-muted-foreground">
                      Include getting started guide and tips
                    </p>
                  </div>
                  <Switch
                    checked={inviteForm.sendWelcomeEmail}
                    onCheckedChange={(checked) => 
                      setInviteForm(prev => ({ ...prev, sendWelcomeEmail: checked }))
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Invite Link Generation */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Link Expiration</Label>
                  <Select
                    value={inviteForm.linkExpiration}
                    onValueChange={(value) => 
                      setInviteForm(prev => ({ ...prev, linkExpiration: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {generatedLink ? (
                  <div className="space-y-2">
                    <Label>Generated Invite Link</Label>
                    <div className="flex gap-2">
                      <Input value={generatedLink} readOnly />
                      <Button variant="outline" onClick={copyInviteLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Share this link with team members. It will expire in {inviteForm.linkExpiration} day{inviteForm.linkExpiration !== '1' ? 's' : ''}.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <Button onClick={handleGenerateInviteLink} disabled={loading} className="w-full">
                    {loading ? 'Generating...' : 'Generate Invite Link'}
                  </Button>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Role Selection */}
          <div className="space-y-4">
            <Label>Assign Role</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  inviteForm.role === 'member' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setInviteForm(prev => ({ ...prev, role: 'member' }))}
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Member</div>
                    <div className="text-sm text-muted-foreground">
                      {getRoleDescription('member')}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  inviteForm.role === 'admin' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setInviteForm(prev => ({ ...prev, role: 'admin' }))}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Administrator</div>
                    <div className="text-sm text-muted-foreground">
                      {getRoleDescription('admin')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Permissions Preview */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {inviteForm.role === 'admin' ? 'Administrator' : 'Member'} permissions include:
                </p>
                <ul className="text-sm space-y-1">
                  {inviteForm.role === 'admin' ? (
                    <>
                      <li>• Manage projects and tasks</li>
                      <li>• Invite and remove team members</li>
                      <li>• Configure integrations</li>
                      <li>• View analytics and reports</li>
                    </>
                  ) : (
                    <>
                      <li>• Create and edit projects</li>
                      <li>• Manage assigned tasks</li>
                      <li>• Comment and collaborate</li>
                      <li>• Upload and share content</li>
                    </>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {inviteMethod === 'email' ? (
              <Button onClick={handleSendInvitations} disabled={loading}>
                {loading ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {inviteForm.emails.filter(e => e.trim()).length > 1 ? 'Invitations' : 'Invitation'}
                  </>
                )}
              </Button>
            ) : (
              generatedLink && (
                <Button onClick={copyInviteLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}