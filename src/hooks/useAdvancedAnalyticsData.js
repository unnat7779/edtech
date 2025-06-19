"use client"

import { useState, useEffect } from "react"

export function useAdvancedAnalyticsData(timeRange) {
  const [scoreTrendData, setScoreTrendData] = useState(null)
  const [attemptDistributionData, setAttemptDistributionData] = useState(null)
  const [categoryHeatmapData, setCategoryHeatmapData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get token from localStorage
        const token = localStorage.getItem("token")
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        // Fetch all data in parallel
        const [scoreTrendResponse, attemptDistributionResponse, categoryHeatmapResponse] = await Promise.all([
          fetch(`/api/admin/analytics/score-trends?timeRange=${timeRange}`, { headers }),
          fetch("/api/admin/analytics/attempt-distribution", { headers }),
          fetch("/api/admin/analytics/category-heatmap", { headers }),
        ])

        // Check for errors
        if (!scoreTrendResponse.ok) {
          throw new Error(`Score trends API error: ${scoreTrendResponse.status}`)
        }
        if (!attemptDistributionResponse.ok) {
          throw new Error(`Attempt distribution API error: ${attemptDistributionResponse.status}`)
        }
        if (!categoryHeatmapResponse.ok) {
          throw new Error(`Category heatmap API error: ${categoryHeatmapResponse.status}`)
        }

        // Parse responses
        const scoreTrendResult = await scoreTrendResponse.json()
        const attemptDistributionResult = await attemptDistributionResponse.json()
        const categoryHeatmapResult = await categoryHeatmapResponse.json()

        // Update state
        setScoreTrendData(scoreTrendResult.data)
        setAttemptDistributionData(attemptDistributionResult.data)
        setCategoryHeatmapData(categoryHeatmapResult.data)
      } catch (err) {
        console.error("Error fetching advanced analytics data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [timeRange])

  return {
    scoreTrendData,
    attemptDistributionData,
    categoryHeatmapData,
    loading,
    error,
  }
}
