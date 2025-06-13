import Dashboard from "@/components/dashboard/Dashboard"
import AuthGuard from "@/components/auth/AuthGuard"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
