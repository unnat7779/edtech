"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export const useTestAutoSave = () => {
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle") // idle, saving, saved, error
  const [networkStatus, setNetworkStatus] = useState(true)
  const [lastSavedData, setLastSavedData] = useState(null)
  const saveTimeoutRef = useRef(null)
  const statusTimeoutRef = useRef(null)

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Auto-save: Network Online")
      setNetworkStatus(true)
    }

    const handleOffline = () => {
      console.log("🌐 Auto-save: Network Offline")
      setNetworkStatus(false)
    }

    if (typeof window !== "undefined") {
      setNetworkStatus(navigator.onLine)
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  // Helper function to compare answers and detect changes
  const hasDataChanged = useCallback(
    (newAnswers, newTimeSpent) => {
      if (!lastSavedData) return true // First save

      // Compare answers
      const oldAnswers = lastSavedData.answers || {}
      const newAnswersKeys = Object.keys(newAnswers)
      const oldAnswersKeys = Object.keys(oldAnswers)

      // Check if number of answers changed
      if (newAnswersKeys.length !== oldAnswersKeys.length) return true

      // Check if any answer content changed
      for (const key of newAnswersKeys) {
        const oldAnswer = oldAnswers[key]
        const newAnswer = newAnswers[key]

        if (!oldAnswer) return true // New answer

        // Compare answer content
        if (
          oldAnswer.selectedAnswer !== newAnswer.selectedAnswer ||
          oldAnswer.numericalAnswer !== newAnswer.numericalAnswer ||
          oldAnswer.markedForReview !== newAnswer.markedForReview
        ) {
          return true
        }
      }

      // Check if time spent changed significantly (more than 5 seconds)
      const timeDiff = Math.abs((newTimeSpent || 0) - (lastSavedData.timeSpent || 0))
      if (timeDiff > 5) return true

      return false
    },
    [lastSavedData],
  )

  // Auto-save function that only saves when data actually changes
  const autoSaveProgress = useCallback(
    async (attempt, answers, timeSpent, forceSync = false) => {
      // Only proceed if online
      if (!networkStatus && !forceSync) {
        console.log("⚠️ Auto-save skipped: offline")
        return
      }

      // Check if data has actually changed
      if (!forceSync && !hasDataChanged(answers, timeSpent)) {
        console.log("⚠️ Auto-save skipped: no changes detected")
        return
      }

      try {
        setAutoSaveStatus("saving")

        const token = localStorage.getItem("token")
        const response = await fetch(`/api/test-attempts/${attempt._id}/auto-save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers,
            timeSpent,
            timestamp: Date.now(),
          }),
        })

        if (response.ok) {
          setAutoSaveStatus("saved")
          setLastSavedData({ answers, timeSpent, timestamp: Date.now() })
          console.log("✅ Auto-save successful:", {
            answersCount: Object.keys(answers).length,
            timeSpent,
          })

          // Clear the "saved" status after 2 seconds
          if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)
          statusTimeoutRef.current = setTimeout(() => {
            setAutoSaveStatus("idle")
          }, 2000)
        } else {
          throw new Error("Auto-save failed")
        }
      } catch (error) {
        console.error("❌ Auto-save error:", error)
        setAutoSaveStatus("error")

        // Clear the "error" status after 3 seconds
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)
        statusTimeoutRef.current = setTimeout(() => {
          setAutoSaveStatus("idle")
        }, 3000)
      }
    },
    [networkStatus, hasDataChanged],
  )

  // Debounced auto-save that waits for user to stop making changes
  const debouncedAutoSave = useCallback(
    (attempt, answers, timeSpent, delay = 1000) => {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Only proceed if data has changed
      if (!hasDataChanged(answers, timeSpent)) {
        return
      }

      // Set a new timeout
      saveTimeoutRef.current = setTimeout(() => {
        autoSaveProgress(attempt, answers, timeSpent)
      }, delay)
    },
    [autoSaveProgress, hasDataChanged],
  )

  // Start auto-save (legacy function for compatibility)
  const startAutoSave = useCallback((saveFunction) => {
    console.log("🚀 Auto-save initialized (change-based)")
    // No longer using interval-based saving
  }, [])

  // Stop auto-save
  const stopAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current)
      statusTimeoutRef.current = null
    }
    setAutoSaveStatus("idle")
    console.log("🛑 Auto-save stopped")
  }, [])

  // Handle online event
  const handleOnline = useCallback(() => {
    setNetworkStatus(true)
  }, [])

  // Handle offline event
  const handleOffline = useCallback(() => {
    setNetworkStatus(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)
    }
  }, [])

  return {
    autoSaveStatus,
    networkStatus,
    autoSaveProgress,
    debouncedAutoSave, // New debounced version
    startAutoSave,
    stopAutoSave,
    handleOnline,
    handleOffline,
  }
}
