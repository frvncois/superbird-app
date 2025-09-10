'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Settings, 
  Mail, 
  Globe, 
  Moon, 
  Sun, 
  Monitor,
  AlertTriangle,
  Trash2
} from 'lucide-react'

export function AccountSettings() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    emailOnProjectUpdates: true,
    emailOnTaskAssignment: true,
    emailOnMention: true,
    autoSaveEnabled: true,
    showOnlineStatus: true
  })

  const supabase = createClient()

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      // Here you would save preferences to your database
      // For now, we'll just show a success message
      toast.success('Preferences updated successfully')
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // Export user data logic here
      toast.success('Data export started. You will receive an email when ready.')
    } catch (error) {
      toast.error('Failed to start data export')
    }
  }

  const handleDeleteAccount = async () => {
    // This would show a confirmation dialog in a real app
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    
    if (!confirmed) return

    try {
      // Account deletion logic here
      toast.success('Account deletion request submitted')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="space-y-6">
      {/* General Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Preferences
          </CardTitle>
          <CardDescription>
            Customize your application experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => handlePreferenceChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => handlePreferenceChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) => handlePreferenceChange('timeFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Hour</SelectItem>
                  <SelectItem value="24">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Application Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Application Settings</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your work every few minutes
                </p>
              </div>
              <Switch
                checked={preferences.autoSaveEnabled}
                onCheckedChange={(checked) => handlePreferenceChange('autoSaveEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show online status</Label>
                <p className="text-sm text-muted-foreground">
                  Let team members see when you're online
                </p>
              </div>
              <Switch
                checked={preferences.showOnlineStatus}
                onCheckedChange={(checked) => handlePreferenceChange('showOnlineStatus', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Project updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when projects you're involved in are updated
              </p>
            </div>
            <Switch
              checked={preferences.emailOnProjectUpdates}
              onCheckedChange={(checked) => handlePreferenceChange('emailOnProjectUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Task assignments</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when tasks are assigned to you
              </p>
            </div>
            <Switch
              checked={preferences.emailOnTaskAssignment}
              onCheckedChange={(checked) => handlePreferenceChange('emailOnTaskAssignment', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mentions</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone mentions you in comments
              </p>
            </div>
            <Switch
              checked={preferences.emailOnMention}
              onCheckedChange={(checked) => handlePreferenceChange('emailOnMention', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export your data</Label>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your data
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Actions that cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting your account will permanently remove all your data, projects, and team memberships. This action cannot be undone.
            </AlertDescription>
          </Alert>
          
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}