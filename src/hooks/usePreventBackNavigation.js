"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

/**
 * Custom hook to prevent users from navigating back to a specific page
 * @param {boolean} shouldBlock - Whether navigation should be blocked
 */
const usePreventBackNavigation = (shouldBlock) => {
  const router = useRouter()
  const isBlockingRef = useRef(false)

  useEffect(() => {
    if (!shouldBlock || typeof window === "undefined") return

    console.log("🚫 Activating back navigation prevention")
    isBlockingRef.current = true

    // Add multiple history entries to make it harder to go back
    const addHistoryEntries = () => {
      for (let i = 0; i < 5; i++) {
        window.history.pushState(null, "", window.location.href)
      }
    }

    const handlePopState = (e) => {
      console.log("🚫 Back navigation attempted - blocking")

      // Prevent the default back navigation
      e.preventDefault()

      // Show alert to user
      alert("You cannot go back to the test after submission. Redirecting to dashboard...")

      // Add more history entries to prevent further back attempts
      addHistoryEntries()

      // Redirect to dashboard
      router.replace("/dashboard")
    }

    const handleBeforeUnload = (e) => {
      if (isBlockingRef.current) {
        e.preventDefault()
        e.returnValue = "Are you sure you want to leave? Your test has been submitted."
        return "Are you sure you want to leave? Your test has been submitted."
      }
    }

    // Initial setup
    addHistoryEntries()

    // Add event listeners
    window.addEventListener("popstate", handlePopState)
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Cleanup function
    return () => {
      console.log("🔓 Deactivating back navigation prevention")
      isBlockingRef.current = false
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [shouldBlock, router])

  return {
    isBlocking: isBlockingRef.current,
  }
}

export default usePreventBackNavigation
