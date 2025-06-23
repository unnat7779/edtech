"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TestResultsPage({ params }) {
  const router = useRouter()

  useEffect(() => {
    const redirectToAnalytics = async () => {
      try {
        const resolvedParams = await params
        console.log("🔄 Redirecting to analytics for attempt:", resolvedParams.id)

        // Redirect directly to the analytics page
        router.replace(`/analytics/student/${resolvedParams.id}`)
      } catch (error) {
        console.error("❌ Error redirecting to analytics:", error)
        // Fallback to dashboard if there's an error
        router.replace("/dashboard")
      }
    }

    redirectToAnalytics()
  }, [params, router])

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
        <div className="text-lg font-medium text-slate-300">Loading your detailed analytics...</div>
        <div className="text-sm text-slate-400 mt-2">Redirecting to comprehensive test analysis</div>
      </div>
    </div>
  )
}