"use client"

import { useCallback } from "react"
import { useTestPersistence } from "./useTestPersistence"

export const useAuthCleanup = () => {
  const { clearUserData } = useTestPersistence(null) // No specific test ID for global cleanup

  const handleLogout = useCallback(async () => {
    try {
      // 1. Clear authentication token
      localStorage.removeItem("token")
      sessionStorage.removeItem("token")

      // 2. Clear all user-specific test data
      clearUserData()

      // 3. Clear any other user-specific data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.includes("user_") || key.includes("profile_") || key.includes("session_") || key.includes("auth_"))
        ) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      // 4. Call logout API
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      } catch (error) {
        console.warn("Logout API call failed:", error)
        // Continue with client-side cleanup even if API fails
      }

      console.log("✅ Complete logout cleanup performed")
      return true
    } catch (error) {
      console.error("❌ Logout cleanup failed:", error)
      return false
    }
  }, [clearUserData])

  const handleSessionExpiry = useCallback(() => {
    // Similar to logout but might preserve some non-sensitive data
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    clearUserData()
    console.log("🔒 Session expired, user data cleared")
  }, [clearUserData])

  return {
    handleLogout,
    handleSessionExpiry,
  }
}
