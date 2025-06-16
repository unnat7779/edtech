"use client"

import { use } from "react"
import TestHistoryDashboard from "@/components/test/TestHistoryDashboard"

export default function TestHistoryPage({ params }) {
  const { testId } = use(params)

  const handleClose = () => {
    // Navigate back to previous page or dashboard
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = "/dashboard"
      }
    }
  }

  return <TestHistoryDashboard testId={testId} onClose={handleClose} />
}
