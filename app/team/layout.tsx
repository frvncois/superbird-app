import { AuthGuard } from '@/components/common/auth-guard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function TeamLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  )
}