"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = useCallback(() => {
    try {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

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

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  }
}
