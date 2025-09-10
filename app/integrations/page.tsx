'use client'

import { IntegrationSettings } from '@/components/settings/integration-settings'

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-2">
          Connect your favorite tools and services to streamline your workflow
        </p>
      </div>

      <IntegrationSettings />
    </div>
  )
}