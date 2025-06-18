"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Get current user and redirect to their dashboard
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      router.push(`/dashboard/${userData._id}`)
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
        <div className="text-lg font-medium text-slate-300">Redirecting to dashboard...</div>
      </div>
    </div>
  )
}
