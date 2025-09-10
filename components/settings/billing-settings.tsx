'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  CreditCard, 
  Download, 
  Calendar,
  Users,
  Zap,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ArrowUpCircle
} from 'lucide-react'

interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'past_due' | 'cancelled'
  currentPeriodEnd: string
  nextBillingDate: string
  amount: number
  currency: string
}

interface Usage {
  projects: { current: number; limit: number }
  storage: { current: number; limit: number } // in GB
  teamMembers: { current: number; limit: number }
  apiCalls: { current: number; limit: number }
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  downloadUrl: string
}

export function BillingSettings() {
  const [loading, setLoading] = useState(false)
  
  // Mock data - replace with real data from your backend
  const [billingInfo] = useState<BillingInfo>({
    plan: 'pro',
    status: 'active',
    currentPeriodEnd: '2024-10-10T00:00:00Z',
    nextBillingDate: '2024-10-10T00:00:00Z',
    amount: 29.99,
    currency: 'USD'
  })

  const [usage] = useState<Usage>({
    projects: { current: 12, limit: 50 },
    storage: { current: 8.5, limit: 100 },
    teamMembers: { current: 4, limit: 10 },
    apiCalls: { current: 1250, limit: 10000 }
  })

  const [invoices] = useState<Invoice[]>([
    {
      id: 'inv_001',
      date: '2024-09-10T00:00:00Z',
      amount: 29.99,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'inv_002',
      date: '2024-08-10T00:00:00Z',
      amount: 29.99,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'inv_003',
      date: '2024-07-10T00:00:00Z',
      amount: 29.99,
      status: 'paid',
      downloadUrl: '#'
    }
  ])

  const handleUpgradePlan = () => {
    // Redirect to upgrade page or open upgrade modal
    toast.success('Redirecting to upgrade page...')
  }

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your current billing period.'
    )
    
    if (!confirmed) return

    setLoading(true)
    try {
      // Cancel subscription logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Subscription cancelled. Access will continue until your current period ends.')
    } catch (error) {
      toast.error('Failed to cancel subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePaymentMethod = () => {
    // Open payment method update modal or redirect to payment page
    toast.success('Redirecting to payment method update...')
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Download invoice logic here
    toast.success(`Downloading invoice ${invoice.id}...`)
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getPlanFeatures = (plan: string) => {
    switch (plan) {
      case 'free':
        return [
          '5 projects',
          '2 team members',
          '1GB storage',
          'Basic support'
        ]
      case 'pro':
        return [
          '50 projects',
          '10 team members',
          '100GB storage',
          'Priority support',
          'Advanced analytics',
          'API access'
        ]
      case 'enterprise':
        return [
          'Unlimited projects',
          'Unlimited team members',
          '1TB storage',
          '24/7 support',
          'Custom integrations',
          'SLA guarantee'
        ]
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold capitalize">{billingInfo.plan} Plan</h3>
                <Badge 
                  variant={billingInfo.status === 'active' ? 'default' : 'destructive'}
                  className={billingInfo.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {billingInfo.status === 'active' ? 'Active' : billingInfo.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                ${billingInfo.amount} / month • Next billing: {new Date(billingInfo.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              {billingInfo.plan !== 'enterprise' && (
                <Button onClick={handleUpgradePlan}>
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
              <Button variant="outline" onClick={handleUpdatePaymentMethod}>
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getPlanFeatures(billingInfo.plan).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {feature}
              </div>
            ))}
          </div>

          {billingInfo.status === 'active' && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Your subscription will automatically renew on {new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Usage & Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usage & Limits
          </CardTitle>
          <CardDescription>
            Monitor your current usage across different features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Projects</span>
                <span className={`text-sm ${getUsageColor(getUsagePercentage(usage.projects.current, usage.projects.limit))}`}>
                  {usage.projects.current} / {usage.projects.limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.projects.current, usage.projects.limit)} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <span className={`text-sm ${getUsageColor(getUsagePercentage(usage.storage.current, usage.storage.limit))}`}>
                  {usage.storage.current}GB / {usage.storage.limit}GB
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.storage.current, usage.storage.limit)} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Team Members</span>
                <span className={`text-sm ${getUsageColor(getUsagePercentage(usage.teamMembers.current, usage.teamMembers.limit))}`}>
                  {usage.teamMembers.current} / {usage.teamMembers.limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.teamMembers.current, usage.teamMembers.limit)} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Calls (monthly)</span>
                <span className={`text-sm ${getUsageColor(getUsagePercentage(usage.apiCalls.current, usage.apiCalls.limit))}`}>
                  {usage.apiCalls.current.toLocaleString()} / {usage.apiCalls.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.apiCalls.current, usage.apiCalls.limit)} 
                className="h-2"
              />
            </div>
          </div>

          {Object.values(usage).some(u => getUsagePercentage(u.current, u.limit) >= 80) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're approaching your plan limits. Consider upgrading to avoid service interruption.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleUpdatePaymentMethod}>
              Update
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              We'll automatically charge your card on file for your next billing cycle.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            Download invoices and view payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      ${invoice.amount.toFixed(2)}
                    </span>
                    <Badge 
                      variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                      className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString()} • Invoice {invoice.id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadInvoice(invoice)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Compare plans and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="p-6 border rounded-lg relative">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Free</h3>
                  <p className="text-3xl font-bold">$0</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <ul className="space-y-2 text-sm">
                  {getPlanFeatures('free').map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {billingInfo.plan === 'free' ? (
                  <Badge className="w-full justify-center">Current Plan</Badge>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Downgrade
                  </Button>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="p-6 border rounded-lg relative">
              {billingInfo.plan === 'pro' && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Current Plan
                </Badge>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <p className="text-3xl font-bold">$29.99</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <ul className="space-y-2 text-sm">
                  {getPlanFeatures('pro').map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {billingInfo.plan === 'pro' ? (
                  <Badge className="w-full justify-center">Current Plan</Badge>
                ) : (
                  <Button className="w-full" onClick={handleUpgradePlan}>
                    {billingInfo.plan === 'free' ? 'Upgrade' : 'Switch'}
                  </Button>
                )}
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 border rounded-lg relative">
              {billingInfo.plan === 'enterprise' && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  Current Plan
                </Badge>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Enterprise</h3>
                  <p className="text-3xl font-bold">Custom</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <ul className="space-y-2 text-sm">
                  {getPlanFeatures('enterprise').map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {billingInfo.plan === 'enterprise' ? (
                  <Badge className="w-full justify-center">Current Plan</Badge>
                ) : (
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact Sales
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {billingInfo.status === 'active' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Cancel Subscription</CardTitle>
            <CardDescription>
              Cancel your subscription and downgrade to the free plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cancelling will remove access to Pro features at the end of your current billing period. 
                Your data will be preserved but some features may become unavailable.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}