import Breadcrumb from "@/components/ui/Breadcrumb"
import { Home } from "lucide-react"
import TestCreationForm from "@/components/admin/TestCreationForm"
import React from "react"
export default function CreateTestPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", path: "/"},
          { label: "Admin Dashboard", path: "/admin" },
          { label: "Test Management", path: "/admin/tests" },
          { label: "Create Test" },
        ]}
      />
      <div className="min-h-screen bg-slate-900">
      <TestCreationForm />
    </div>
    </div>
  )
}
