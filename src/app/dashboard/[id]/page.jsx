"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Dashboard from "@/components/dashboard/Dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdminViewing, setIsAdminViewing] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if admin is viewing a student
        const adminViewMode = localStorage.getItem("adminViewMode")
        const adminViewingStudent = localStorage.getItem("adminViewingStudent")

        if (adminViewMode === "true" && adminViewingStudent) {
          // Admin viewing mode
          const studentData = JSON.parse(adminViewingStudent)
          if (studentData._id === userId) {
            setUser(studentData)
            setIsAdminViewing(true)
          } else {
            // Fetch the specific user data by ID
            await fetchUserById(userId)
            setIsAdminViewing(true)
          }
        } else {
          // Normal user viewing their own dashboard
          const currentUser = localStorage.getItem("user")
          if (currentUser) {
            const userData = JSON.parse(currentUser)
            if (userData._id === userId) {
              setUser(userData)
            } else {
              // User trying to access someone else's dashboard - redirect
              router.push(`/dashboard/${userData._id}`)
              return
            }
          } else {
            // No user logged in - redirect to login
            router.push("/login")
            return
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadUserData()
    }
  }, [userId, router])

  const fetchUserById = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        throw new Error("Failed to fetch user data")
      }
    } catch (error) {
      console.error("Error fetching user by ID:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-300">User not found</div>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Admin Viewing Banner */}
      {isAdminViewing && (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="font-medium">👁️ Admin View: Viewing {user.name}'s Dashboard</span>
            <button
              onClick={() => {
                localStorage.removeItem("adminViewingStudent")
                localStorage.removeItem("adminViewMode")
                router.push("/admin/analytics/students")
              }}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Return to Admin Panel
            </button>
          </div>
        </div>
      )}

      <Dashboard user={user} isAdminViewing={isAdminViewing} />
    </div>
  )
}
