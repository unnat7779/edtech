"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const login = useCallback((userData, authToken) => {
    localStorage.setItem("token", authToken)
    localStorage.setItem("user", JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
  }, [router])

  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }, [])

  const refreshToken = useCallback(async () => {
    if (isRefreshing) return null

    setIsRefreshing(true)
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        login(data.user, data.token)
        return data.token
      } else {
        logout()
        return null
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      logout()
      return null
    } finally {
      setIsRefreshing(false)
    }
  }, [token, logout, isRefreshing])

  const checkAuthStatus = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        // Verify token is still valid
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (response.ok) {
          const parsedUser = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(parsedUser)
          setIsAuthenticated(true)
        } else if (response.status === 401) {
          // Token expired, try to refresh
          console.log("Token expired, attempting refresh...")
          const newToken = await refreshToken()
          if (!newToken) {
            logout()
          }
        } else {
          logout()
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }, [refreshToken, logout])

  useEffect(() => {
    checkAuthStatus()
  }, [])

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isRefreshing,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    refreshToken,
  }
}
