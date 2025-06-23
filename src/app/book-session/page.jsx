"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import AuthGuard from "@/components/auth/AuthGuard"
import ConditionalDoubtBooking from "@/components/doubt-session/ConditionalDoubtBooking"

export default function BookSessionPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Back to Dashboard Button - Top Left Corner */}
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-600/30 hover:border-slate-500/50 text-gray-300 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        <ConditionalDoubtBooking />
      </div>
    </AuthGuard>
  )
}
