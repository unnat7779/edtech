"use client"

import { useState, useEffect } from "react"

export function useRetentionData(timeRange = "30", cohortType = "weekly") {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/admin/analytics/retention?timeRange=${timeRange}&cohortType=${cohortType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error("Error fetching retention data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange, cohortType])

  const refresh = () => {
    fetchData()
  }

  return { data, loading, error, refresh }
}

export function useCohortData(cohortType = "weekly", periods = 12) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `/api/admin/analytics/retention/cohorts?cohortType=${cohortType}&periods=${periods}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error("Error fetching cohort data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [cohortType, periods])

  const refresh = () => {
    fetchData()
  }

  return { data, loading, error, refresh }
}

export function useRetentionTrends(timeRange = "30") {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/admin/analytics/retention?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result.trends || [])
    } catch (err) {
      console.error("Error fetching retention trends:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const refresh = () => {
    fetchData()
  }

  return { data, loading, error, refresh }
}
