"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/auth/useAuth"

export default function TokenRefreshHandler() {
  const { token, refreshToken, logout } = useAuth()

  useEffect(() => {
    if (!token) return

    // Check token expiration every 5 minutes
    const interval = setInterval(
      async () => {
        try {
          // Decode token to check expiration (without verification)
          const payload = JSON.parse(atob(token.split(".")[1]))
          const currentTime = Date.now() / 1000
          const timeUntilExpiry = payload.exp - currentTime

          // If token expires in less than 1 hour, refresh it
          if (timeUntilExpiry < 3600) {
            console.log("🔄 Token expiring soon, refreshing...")
            const newToken = await refreshToken()
            if (!newToken) {
              console.log("❌ Token refresh failed, logging out")
              logout()
            }
          }
        } catch (error) {
          console.error("Error checking token expiration:", error)
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [token, refreshToken, logout])

  return null
}
