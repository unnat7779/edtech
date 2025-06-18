"use client"

import { useEffect, useState } from "react"

export default function AuthDebug() {
  const [authState, setAuthState] = useState({})

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    setAuthState({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + "..." : "No token",
      user: user,
      userRole: user.role,
      isAdmin: user.role === "admin",
    })
  }, [])

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>Has Token: {authState.hasToken ? "✅" : "❌"}</div>
        <div>Token Length: {authState.tokenLength}</div>
        <div>Token Preview: {authState.tokenPreview}</div>
        <div>User Role: {authState.userRole || "None"}</div>
        <div>Is Admin: {authState.isAdmin ? "✅" : "❌"}</div>
        <div>User Email: {authState.user?.email || "None"}</div>
      </div>
    </div>
  )
}
