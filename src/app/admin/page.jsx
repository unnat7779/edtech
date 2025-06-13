"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/admin/AdminDashboard"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // Get data from localStorage
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")

      console.log("Admin access check - Token exists:", !!token)
      console.log("Admin access check - User string:", userStr)

      let storedUser = null
      try {
        storedUser = userStr ? JSON.parse(userStr) : null
      } catch (e) {
        console.error("Error parsing stored user:", e)
        localStorage.removeItem("user")
      }

      console.log("Admin access check - Parsed user:", storedUser)
      console.log("Admin access check - User role:", storedUser?.role)

      setDebugInfo({
        hasToken: !!token,
        hasUser: !!storedUser,
        userRole: storedUser?.role,
        isAdmin: storedUser?.role === "admin",
      })

      if (!token || !storedUser) {
        console.log("No token or user, redirecting to login")
        router.push("/login")
        return
      }

      // Check if user is admin
      if (storedUser.role !== "admin") {
        console.log("User is not admin, role:", storedUser.role)
        setError(`Access denied. You are logged in as: ${storedUser.role}. Admin privileges required.`)
        setTimeout(() => router.push("/dashboard"), 3000)
        setLoading(false)
        return
      }

      console.log("User is admin, setting user and loading dashboard")
      setUser(storedUser)
      setLoading(false)
    } catch (error) {
      console.error("Admin access check failed:", error)
      setError("Failed to verify admin access: " + error.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">Checking admin access...</div>
          <div className="text-sm text-gray-600 mt-2">Debug: {JSON.stringify(debugInfo)}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <div className="text-sm text-gray-600 mb-4">Debug Info: {JSON.stringify(debugInfo, null, 2)}</div>
          <div className="space-x-4">
            <button onClick={() => router.push("/login")} className="bg-blue-500 text-white px-4 py-2 rounded">
              Go to Login
            </button>
            <button onClick={() => router.push("/dashboard")} className="bg-green-500 text-white px-4 py-2 rounded">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Access denied. Admin privileges required.</div>
          <div className="text-sm text-gray-600 mb-4">Current role: {user?.role || "unknown"}</div>
          <div className="text-sm text-gray-600">Redirecting to dashboard...</div>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
