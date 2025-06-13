"use client"

import { useState, useCallback, useMemo, useEffect } from "react"

export const useTestPersistence = (testId, userId = null) => {
  // SSR-Safe Initialization
  const [isClient, setIsClient] = useState(false)
  const [dataRestored, setDataRestored] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(true) // Default to true for SSR

  // Client-side detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Universal Storage Access Guard
  const safeLocalStorage = useMemo(
    () => ({
      getItem: (key) => (isClient && typeof window !== "undefined" ? localStorage.getItem(key) : null),
      setItem: (key, value) => isClient && typeof window !== "undefined" && localStorage.setItem(key, value),
      removeItem: (key) => isClient && typeof window !== "undefined" && localStorage.removeItem(key),
      key: (index) => (isClient && typeof window !== "undefined" ? localStorage.key(index) : null),
      get length() {
        return isClient && typeof window !== "undefined" ? localStorage.length : 0
      },
    }),
    [isClient],
  )

  const safeSessionStorage = useMemo(
    () => ({
      getItem: (key) => (isClient && typeof window !== "undefined" ? sessionStorage.getItem(key) : null),
      setItem: (key, value) => isClient && typeof window !== "undefined" && sessionStorage.setItem(key, value),
      removeItem: (key) => isClient && typeof window !== "undefined" && sessionStorage.removeItem(key),
    }),
    [isClient],
  )

  // Get user ID from token - SSR safe
  const getUserId = useCallback(() => {
    if (userId) return userId
    if (!isClient) return "anonymous"

    try {
      const token = safeLocalStorage.getItem("token")
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return payload.userId || payload.id || "anonymous"
      }
    } catch (error) {
      console.warn("Could not extract user ID from token:", error)
    }
    return "anonymous"
  }, [userId, isClient, safeLocalStorage])

  // Memoized storage keys with user-specific prefixes
  const storageKeys = useMemo(() => {
    const currentUserId = getUserId()
    return {
      answers: `answer_${currentUserId}_${testId}`,
      progress: `progress_${currentUserId}_${testId}`,
      attempt: `attempt_${currentUserId}_${testId}`,
      backup: `backup_${currentUserId}_${testId}`,
      queue: `queue_${currentUserId}_${testId}`,
      metadata: `metadata_${currentUserId}_${testId}`,
    }
  }, [testId, getUserId])

  // Network status monitoring - client-side only
  useEffect(() => {
    if (!isClient) return

    const handleOnline = () => {
      console.log("🌐 Network: Online")
      setNetworkStatus(true)
    }

    const handleOffline = () => {
      console.log("🌐 Network: Offline")
      setNetworkStatus(false)
    }

    // Set initial network status
    if (typeof navigator !== "undefined") {
      setNetworkStatus(navigator.onLine)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [isClient])

  // Get all stored answers - SSR safe
  const getAllStoredAnswers = useCallback(() => {
    if (!isClient) return {}

    try {
      const stored = safeLocalStorage.getItem(storageKeys.answers)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn("Failed to get stored answers:", error)
      return {}
    }
  }, [storageKeys.answers, isClient, safeLocalStorage])

  // Get specific answer for a question - SSR safe
  const getStoredAnswer = useCallback(
    (questionIndex) => {
      if (!isClient) return null

      try {
        const answerKey = `${storageKeys.answers}_q${questionIndex}`
        const stored = safeLocalStorage.getItem(answerKey)
        return stored ? JSON.parse(stored) : null
      } catch (error) {
        console.warn(`Failed to get stored answer for Q${questionIndex}:`, error)
        return null
      }
    },
    [storageKeys.answers, isClient, safeLocalStorage],
  )

  // Get sync queue - SSR safe
  const getSyncQueue = useCallback(() => {
    if (!isClient) return {}

    try {
      const stored = safeLocalStorage.getItem(storageKeys.queue)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn("Failed to get sync queue:", error)
      return {}
    }
  }, [storageKeys.queue, isClient, safeLocalStorage])

  // Add answer to sync queue for offline handling
  const addToSyncQueue = useCallback(
    (questionIndex, answerData) => {
      if (!isClient) return

      try {
        const queue = getSyncQueue()
        queue[questionIndex] = {
          ...answerData,
          queuedAt: Date.now(),
        }
        safeLocalStorage.setItem(storageKeys.queue, JSON.stringify(queue))
        console.log(`📤 Added to sync queue: Q${questionIndex + 1}`)
      } catch (error) {
        console.error("Failed to add to sync queue:", error)
      }
    },
    [storageKeys.queue, isClient, safeLocalStorage, getSyncQueue],
  )

  // Enhanced immediate data persistence with SSR safety
  const persistAnswerImmediately = useCallback(
    (questionIndex, answerData, metadata = {}) => {
      // SSR safety check
      if (!isClient) return false

      try {
        const timestamp = Date.now()
        const answerKey = `${storageKeys.answers}_q${questionIndex}`

        const dataToSave = {
          ...answerData,
          questionIndex,
          timestamp,
          testId,
          userId: getUserId(),
          synced: false, // Mark as not synced to server
          ...metadata,
        }

        // Primary storage - localStorage for individual answers
        safeLocalStorage.setItem(answerKey, JSON.stringify(dataToSave))

        // Backup storage - sessionStorage
        safeSessionStorage.setItem(answerKey, JSON.stringify(dataToSave))

        // Update consolidated answers object
        const allAnswers = getAllStoredAnswers()
        allAnswers[questionIndex] = dataToSave
        safeLocalStorage.setItem(storageKeys.answers, JSON.stringify(allAnswers))

        // If offline, add to sync queue
        if (!networkStatus) {
          addToSyncQueue(questionIndex, dataToSave)
        }

        console.log(`✅ Answer persisted immediately: Q${questionIndex + 1}`, {
          type: answerData.selectedAnswer !== undefined ? "MCQ" : "Numerical",
          value: answerData.selectedAnswer !== undefined ? answerData.selectedAnswer : answerData.numericalAnswer,
          synced: dataToSave.synced,
        })

        return true
      } catch (error) {
        console.error("❌ Failed to persist answer:", error)
        return false
      }
    },
    [
      storageKeys,
      networkStatus,
      getUserId,
      testId,
      isClient,
      safeLocalStorage,
      safeSessionStorage,
      getAllStoredAnswers,
      addToSyncQueue,
    ],
  )

  // Clear sync queue after successful sync
  const clearSyncQueue = useCallback(() => {
    if (!isClient) return

    safeLocalStorage.removeItem(storageKeys.queue)
    console.log("🧹 Sync queue cleared")
  }, [storageKeys.queue, isClient, safeLocalStorage])

  // Mark answer as synced
  const markAnswerAsSynced = useCallback(
    (questionIndex) => {
      if (!isClient) return

      try {
        const answerKey = `${storageKeys.answers}_q${questionIndex}`
        const stored = safeLocalStorage.getItem(answerKey)

        if (stored) {
          const answerData = JSON.parse(stored)
          answerData.synced = true
          answerData.syncedAt = Date.now()

          safeLocalStorage.setItem(answerKey, JSON.stringify(answerData))

          // Update consolidated answers
          const allAnswers = getAllStoredAnswers()
          allAnswers[questionIndex] = answerData
          safeLocalStorage.setItem(storageKeys.answers, JSON.stringify(allAnswers))

          console.log(`✅ Answer marked as synced: Q${questionIndex + 1}`)
        }
      } catch (error) {
        console.error("Failed to mark answer as synced:", error)
      }
    },
    [storageKeys, getAllStoredAnswers, isClient, safeLocalStorage],
  )

  // Hydration-Safe Data Restoration
  const restoreDataOnLoad = useCallback(() => {
    console.log("🔄 Starting enhanced data restoration...")

    // SSR safety check - return early if not on client
    if (!isClient) {
      console.log("⚠️ Cannot restore data: not on client side")
      return { answers: {}, progress: null, currentQuestion: null }
    }

    try {
      let restoredAnswers = {}
      let restoredProgress = null

      // Strategy 1: Try consolidated answers storage
      const consolidatedAnswers = getAllStoredAnswers()
      if (Object.keys(consolidatedAnswers).length > 0) {
        restoredAnswers = consolidatedAnswers
        console.log("✅ Restored from consolidated storage:", Object.keys(restoredAnswers).length, "answers")
      }

      // Strategy 2: Try individual answer keys (fallback)
      if (Object.keys(restoredAnswers).length === 0) {
        for (let i = 0; i < 200; i++) {
          // Check up to 200 questions
          const answerKey = `${storageKeys.answers}_q${i}`
          const stored = safeLocalStorage.getItem(answerKey)
          if (stored) {
            try {
              const answerData = JSON.parse(stored)
              restoredAnswers[i] = answerData
            } catch (e) {
              console.warn(`Failed to parse answer for Q${i}:`, e)
            }
          }
        }
        console.log("✅ Restored from individual keys:", Object.keys(restoredAnswers).length, "answers")
      }

      // Strategy 3: Try backup storage (sessionStorage)
      if (Object.keys(restoredAnswers).length === 0) {
        for (let i = 0; i < 200; i++) {
          const answerKey = `${storageKeys.answers}_q${i}`
          const stored = safeSessionStorage.getItem(answerKey)
          if (stored) {
            try {
              const answerData = JSON.parse(stored)
              restoredAnswers[i] = answerData
            } catch (e) {
              console.warn(`Failed to parse backup answer for Q${i}:`, e)
            }
          }
        }
        console.log("✅ Restored from backup storage:", Object.keys(restoredAnswers).length, "answers")
      }

      // Try to restore progress data
      try {
        const progressData = safeLocalStorage.getItem(storageKeys.progress)
        if (progressData) {
          restoredProgress = JSON.parse(progressData)
          console.log("✅ Restored progress data:", restoredProgress)
        }
      } catch (e) {
        console.warn("Failed to restore progress data:", e)
      }

      // Convert to the format expected by the test portal
      const formattedAnswers = {}
      Object.entries(restoredAnswers).forEach(([questionIndex, answerData]) => {
        formattedAnswers[questionIndex] = {
          selectedAnswer: answerData.selectedAnswer,
          numericalAnswer: answerData.numericalAnswer,
          markedForReview: answerData.markedForReview,
          timeTaken: answerData.timeTaken || 0,
          timestamp: answerData.timestamp,
        }
      })

      console.log("🎯 Data restoration complete:", {
        totalAnswers: Object.keys(formattedAnswers).length,
        hasProgress: !!restoredProgress,
        unsyncedAnswers: Object.values(restoredAnswers).filter((a) => !a.synced).length,
      })

      return {
        answers: formattedAnswers,
        progress: restoredProgress,
        currentQuestion: restoredProgress?.currentQuestion || null,
      }
    } catch (error) {
      console.error("❌ Data restoration failed:", error)
      return { answers: {}, progress: null, currentQuestion: null }
    }
  }, [storageKeys, getAllStoredAnswers, isClient, safeLocalStorage, safeSessionStorage])

  // Save progress data (current question, time, etc.) - SSR safe
  const saveProgress = useCallback(
    (currentQuestion, timeLeft, additionalData = {}) => {
      if (!isClient) return false

      try {
        const progressData = {
          currentQuestion,
          timeLeft,
          timestamp: Date.now(),
          testId,
          userId: getUserId(),
          ...additionalData,
        }

        safeLocalStorage.setItem(storageKeys.progress, JSON.stringify(progressData))
        safeSessionStorage.setItem(storageKeys.progress, JSON.stringify(progressData))

        console.log("💾 Progress saved:", { currentQuestion, timeLeft })
        return true
      } catch (error) {
        console.error("Failed to save progress:", error)
        return false
      }
    },
    [storageKeys, testId, getUserId, isClient, safeLocalStorage, safeSessionStorage],
  )

  // Clear all stored data for this test - SSR safe
  const clearAllStoredData = useCallback(() => {
    if (!isClient) return

    try {
      // Clear consolidated storage
      safeLocalStorage.removeItem(storageKeys.answers)
      safeLocalStorage.removeItem(storageKeys.progress)
      safeLocalStorage.removeItem(storageKeys.attempt)
      safeLocalStorage.removeItem(storageKeys.queue)
      safeLocalStorage.removeItem(storageKeys.metadata)

      // Clear individual answer keys
      for (let i = 0; i < 200; i++) {
        const answerKey = `${storageKeys.answers}_q${i}`
        safeLocalStorage.removeItem(answerKey)
        safeSessionStorage.removeItem(answerKey)
      }

      // Clear backup storage
      safeSessionStorage.removeItem(storageKeys.progress)
      safeSessionStorage.removeItem(storageKeys.backup)

      console.log("🧹 All stored data cleared for test:", testId)
    } catch (error) {
      console.error("Failed to clear stored data:", error)
    }
  }, [storageKeys, testId, isClient, safeLocalStorage, safeSessionStorage])

  // Clear data for specific user (useful for logout) - SSR safe
  const clearUserData = useCallback(
    (specificUserId = null) => {
      if (!isClient) return

      try {
        const targetUserId = specificUserId || getUserId()
        const keysToRemove = []

        // Find all keys for this user
        for (let i = 0; i < safeLocalStorage.length; i++) {
          const key = safeLocalStorage.key(i)
          if (key && key.includes(`_${targetUserId}_`)) {
            keysToRemove.push(key)
          }
        }

        // Remove all user-specific keys
        keysToRemove.forEach((key) => {
          safeLocalStorage.removeItem(key)
          safeSessionStorage.removeItem(key)
        })

        console.log(`🧹 Cleared all data for user: ${targetUserId}`, keysToRemove.length, "keys removed")
      } catch (error) {
        console.error("Failed to clear user data:", error)
      }
    },
    [getUserId, isClient, safeLocalStorage, safeSessionStorage],
  )

  // Save attempt ID - SSR safe
  const saveAttemptId = useCallback(
    (attemptId) => {
      if (!isClient) return
      safeLocalStorage.setItem(storageKeys.attempt, attemptId)
    },
    [storageKeys, isClient, safeLocalStorage],
  )

  // Get saved attempt ID - SSR safe
  const getSavedAttemptId = useCallback(() => {
    if (!isClient) return null
    return safeLocalStorage.getItem(storageKeys.attempt)
  }, [storageKeys, isClient, safeLocalStorage])

  // Legacy function for backward compatibility - SSR safe
  const persistDataImmediately = useCallback(
    (answers, currentQuestion, timeLeft, questionIndex = null) => {
      if (!isClient) return false

      try {
        const dataToSave = {
          answers,
          currentQuestion: questionIndex !== null ? questionIndex : currentQuestion,
          timeLeft,
          timestamp: Date.now(),
          testId,
        }

        // Primary storage - localStorage
        safeLocalStorage.setItem(storageKeys.answers, JSON.stringify(answers))
        safeLocalStorage.setItem(storageKeys.progress, JSON.stringify(dataToSave))

        // Backup storage - sessionStorage
        safeSessionStorage.setItem(storageKeys.backup, JSON.stringify(dataToSave))

        // Additional backup in a different key format
        safeLocalStorage.setItem(`backup_${storageKeys.answers}`, JSON.stringify(answers))

        console.log("✅ Data persisted immediately:", {
          questionIndex: questionIndex !== null ? questionIndex : currentQuestion,
          answer: answers[questionIndex !== null ? questionIndex : currentQuestion],
          totalAnswers: Object.keys(answers).length,
        })

        return true
      } catch (error) {
        console.error("❌ Failed to persist data:", error)
        return false
      }
    },
    [storageKeys, testId, isClient, safeLocalStorage, safeSessionStorage],
  )

  // Set dataRestored flag when client is ready
  useEffect(() => {
    if (isClient) {
      setDataRestored(true)
    }
  }, [isClient])

  return {
    // Core persistence functions
    persistAnswerImmediately,
    restoreDataOnLoad,
    saveProgress,
    persistDataImmediately, // Legacy function

    // Answer management
    getAllStoredAnswers,
    getStoredAnswer,
    markAnswerAsSynced,

    // Sync queue management
    getSyncQueue,
    clearSyncQueue,
    addToSyncQueue,

    // Cleanup functions
    clearAllStoredData,
    clearUserData,

    // Attempt management
    saveAttemptId,
    getSavedAttemptId,

    // Status
    dataRestored,
    networkStatus,
    storageKeys,
    isClient, // Export isClient for components to check
  }
}
