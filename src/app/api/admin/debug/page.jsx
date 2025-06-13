"use client"

import { useEffect, useState } from "react"

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    let user = null

    try {
      user = userStr ? JSON.parse(userStr) : null
    } catch (e) {
      console.error("Error parsing user:", e)
    }

    setDebugInfo({
      hasToken: !!token,
      token: token ? token.substring(0, 20) + "..." : null,
      hasUser: !!user,
      user: user,
      userRole: user?.role,
      isAdmin: user?.role === "admin",
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Debug Information</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => (window.location.href = "/admin")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go to Admin
          </button>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-green-500 text-white px-4 py-2 rounded ml-4"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
