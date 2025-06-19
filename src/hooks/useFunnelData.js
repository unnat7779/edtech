"use client"

import { useState, useEffect } from "react"

export function useFunnelData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFunnelData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🎯 Fetching funnel data...")

      // Get token from localStorage or cookies
      let token = null

      // Try localStorage first
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token")
        console.log("🎫 Token from localStorage:", !!token)
      }

      // Prepare headers
      const headers = {
        "Content-Type": "application/json",
      }

      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch("/api/admin/analytics/funnel", {
        method: "GET",
        credentials: "include", // This includes cookies
        headers,
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response URL:", response.url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API Error:", errorText)

        if (response.status === 401) {
          // Redirect to login if unauthorized
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ Funnel data received:", result)
      setData(result)
    } catch (err) {
      console.error("❌ Error fetching funnel data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFunnelData()
  }, [])

  return { data, loading, error, refetch: fetchFunnelData }
}
