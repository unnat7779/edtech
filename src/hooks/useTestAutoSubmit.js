"use client"

import { useEffect, useRef } from "react"

export function useTestAutoSubmit(attemptId, isActive = true) {
  const autoSubmitTimeoutRef = useRef(null)
  const visibilityTimeoutRef = useRef(null)
  const isSubmittedRef = useRef(false)

  const autoSubmitTest = async (reason = "abandoned") => {
    if (isSubmittedRef.current || !attemptId) return

    try {
      isSubmittedRef.current = true
      const token = localStorage.getItem("token")

      await fetch(`/api/test-attempts/${attemptId}/auto-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })

      console.log(`Test auto-submitted due to: ${reason}`)
    } catch (error) {
      console.error("Auto-submit failed:", error)
      isSubmittedRef.current = false
    }
  }

  // Handle page visibility changes
  useEffect(() => {
    if (!isActive || !attemptId) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Start a timer when page becomes hidden
        visibilityTimeoutRef.current = setTimeout(
          () => {
            autoSubmitTest("page-hidden")
          },
          5 * 60 * 1000,
        ) // 5 minutes
      } else {
        // Clear timer when page becomes visible again
        if (visibilityTimeoutRef.current) {
          clearTimeout(visibilityTimeoutRef.current)
          visibilityTimeoutRef.current = null
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
    }
  }, [isActive, attemptId])

  // Handle page unload
  useEffect(() => {
    if (!isActive || !attemptId) return

    const handleBeforeUnload = (e) => {
      // Set a flag to auto-submit after a delay
      setTimeout(() => {
        autoSubmitTest("page-unload")
      }, 1000)
    }

    const handleUnload = () => {
      autoSubmitTest("page-unload")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("unload", handleUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("unload", handleUnload)
    }
  }, [isActive, attemptId])

  // Cleanup function
  const cleanup = () => {
    if (autoSubmitTimeoutRef.current) {
      clearTimeout(autoSubmitTimeoutRef.current)
    }
    if (visibilityTimeoutRef.current) {
      clearTimeout(visibilityTimeoutRef.current)
    }
  }

  return { autoSubmitTest, cleanup }
}
