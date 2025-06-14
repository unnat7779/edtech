"use client"

import { useParams } from "next/navigation"
import Breadcrumb from "@/components/ui/Breadcrumb"
import EditTestForm from "@/components/admin/EditTestForm"
import { Home, Settings } from "lucide-react"

export default function EditTestPage() {
  const params = useParams()
  const testId = params.id

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Breadcrumb Navigation */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={[
              { label: "Home", path: "/", icon: Home },
              { label: "Admin Dashboard", path: "/admin" },
              { label: "Test Management", path: "/admin/tests" },
              { label: "Test Details", path: `/admin/tests/${testId}` },
              { label: "Edit Test", icon: Settings },
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <EditTestForm testId={testId} />
    </div>
  )
}
