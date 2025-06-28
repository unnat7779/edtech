"use client"

import Button from "@/components/ui/Button"
import { Home, History, BarChart3 } from "lucide-react"

export default function FeedbackHeader({ router, onShowHistory }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Feedback Management
          </h1>
          <p className="text-slate-400">Manage and respond to student feedback efficiently</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={onShowHistory}>
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          {/* <Button variant="outline" size="sm" onClick={() => router.push("/admin/analytics")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button> */}
        </div>
      </div>
    </div>
  )
}
