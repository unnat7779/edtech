"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTestPersistence } from "@/hooks/useTestPersistence"
import { useTestAutoSave } from "@/hooks/useTestAutoSave"
import AutoSaveIndicator from "./AutoSaveIndicator"
import TestHeader from "./TestHeader"
import QuestionDisplay from "./QuestionDisplay"
import TestSidebar from "./TestSidebar"
import TestActions from "./TestActions"
import NetworkStatusIndicator from "./NetworkStatusIndicator"
import SubmitConfirmationModal from "./SubmitConfirmationModal"
import TestLoadingScreen from "./TestLoadingScreen"
import TestErrorScreen from "./TestErrorScreen"
import { Layers, X } from "lucide-react"

export default function TestPortal({ testId }) {
  const router = useRouter()
  const [test, setTest] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState("physics")
  const [hydrationComplete, setHydrationComplete] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testStartTime, setTestStartTime] = useState(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [testActive, setTestActive] = useState(false)
  const [manualSubjectSelection, setManualSubjectSelection] = useState(false)

  // Enhanced time tracking with refs to avoid re-renders
  const questionStartTimeRef = useRef(null)
  const questionTimeTrackingRef = useRef({})
  const currentQuestionRef = useRef(0)
  const attemptRef = useRef(null)
  const isTestActiveRef = useRef(true)
  const navigationBlockedRef = useRef(false)
  const autoSubmitTriggeredRef = useRef(false)

  const intervalRef = useRef(null)
  const heartbeatIntervalRef = useRef(null)

  // Update refs when state changes
  useEffect(() => {
    currentQuestionRef.current = currentQuestion
  }, [currentQuestion])

  useEffect(() => {
    attemptRef.current = attempt
  }, [attempt])

  // Custom hooks
  const {
    persistDataImmediately,
    restoreDataOnLoad,
    clearStoredData,
    saveAttemptId,
    getSavedAttemptId,
    dataRestored,
    clearAllStoredData,
    markAnswerAsSynced,
    persistAnswerImmediately,
    getSyncQueue,
    networkStatus: persistenceNetworkStatus,
    isClient,
  } = useTestPersistence(testId)

  const {
    autoSaveStatus,
    networkStatus: autoSaveNetworkStatus,
    handleOnline,
    handleOffline,
    startAutoSave,
    stopAutoSave,
    debouncedAutoSave,
  } = useTestAutoSave()

  const networkStatus = persistenceNetworkStatus

  // Function to detect question subject
  const getQuestionSubject = useCallback((question) => {
    if (!question) return "physics"

    // Check various properties where subject might be stored
    if (question.subject) {
      const subject = question.subject.toLowerCase()
      if (subject === "physics") return "physics"
      if (subject === "chemistry") return "chemistry"
      if (subject === "mathematics" || subject === "maths") return "mathematics"
    }

    if (question.tags && Array.isArray(question.tags)) {
      const subjectTag = question.tags.find((tag) =>
        ["physics", "chemistry", "mathematics", "maths"].includes(tag.toLowerCase()),
      )
      if (subjectTag) {
        const subject = subjectTag.toLowerCase()
        if (subject === "maths") return "mathematics"
        return subject
      }
    }

    if (question.topic) {
      const topicLower = question.topic.toLowerCase()
      if (["physics", "chemistry", "mathematics", "maths"].includes(topicLower)) {
        return topicLower === "maths" ? "mathematics" : topicLower
      }
    }

    // Default fallback
    return "physics"
  }, [])

  // Handle manual subject selection
  const handleManualSubjectChange = useCallback((subjectId) => {
    console.log(`👆 Manual subject selection: ${subjectId}`)
    setActiveSubject(subjectId)
    setManualSubjectSelection(true)

    // Reset manual selection flag after 10 seconds to allow auto-switching to resume
    setTimeout(() => {
      setManualSubjectSelection(false)
      console.log("🔄 Manual subject selection timeout - auto-switching resumed")
    }, 10000)
  }, [])

  // Auto-update subject tab when current question changes (enhanced to respect manual selection)
  useEffect(() => {
    if (test?.questions && test.questions[currentQuestion] && !manualSubjectSelection) {
      const questionSubject = getQuestionSubject(test.questions[currentQuestion])
      if (questionSubject !== activeSubject) {
        console.log(
          `🔄 Auto-switching subject tab from ${activeSubject} to ${questionSubject} for question ${currentQuestion + 1}`,
        )
        setActiveSubject(questionSubject)
      }
    }
  }, [currentQuestion, test?.questions, activeSubject, getQuestionSubject, manualSubjectSelection])

  // 🔒 ENHANCED NAVIGATION RESTRICTIONS WITH TAB CLOSE DETECTION
  useEffect(() => {
    if (!isClient || !testActive) return

    let isNavigationBlocked = true

    // Enhanced beforeunload handler with better tab close detection
    const handleBeforeUnload = (e) => {
      if (isNavigationBlocked && testActive && !isSubmitting && !autoSubmitTriggeredRef.current) {
        console.log("🚨 Tab close/refresh detected - triggering auto-submit")

        // Set flag to prevent multiple triggers
        autoSubmitTriggeredRef.current = true

        // Immediate auto-submit attempt
        triggerAutoSubmit("tab-close")

        // Standard browser warning
        const message = "⚠️ Your test is in progress. Leaving will auto-submit your test. Are you sure?"
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    // Enhanced unload handler for final cleanup
    const handleUnload = () => {
      if (testActive && !isSubmitting && !autoSubmitTriggeredRef.current) {
        console.log("🚨 Page unload detected - final auto-submit attempt")
        autoSubmitTriggeredRef.current = true
        triggerAutoSubmit("page-unload")
      }
    }

    // Block browser back/forward buttons
    const handlePopState = (e) => {
      if (isNavigationBlocked && testActive) {
        e.preventDefault()
        window.history.pushState(null, "", window.location.href)
        alert("⚠️ Navigation is blocked during test. Please submit your test to continue.")
        return false
      }
    }

    // Enhanced keyboard blocking
    const handleKeyDown = (e) => {
      if (!testActive) return

      // Block F5 (refresh)
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault()
        alert("⚠️ Page refresh is blocked during test.")
        return false
      }

      // Block Ctrl+W (close tab) - Enhanced detection
      if (e.ctrlKey && (e.key === "w" || e.key === "W")) {
        e.preventDefault()
        if (!autoSubmitTriggeredRef.current) {
          autoSubmitTriggeredRef.current = true
          triggerAutoSubmit("keyboard-close")
        }
        alert("⚠️ Closing tab is blocked during test. Your test will be auto-submitted.")
        return false
      }

      // Block Alt+F4 (close window)
      if (e.altKey && e.key === "F4") {
        e.preventDefault()
        if (!autoSubmitTriggeredRef.current) {
          autoSubmitTriggeredRef.current = true
          triggerAutoSubmit("alt-f4")
        }
        alert("⚠️ Closing window is blocked during test. Your test will be auto-submitted.")
        return false
      }

      // Block Ctrl+Shift+W (close window)
      if (e.ctrlKey && e.shiftKey && (e.key === "w" || e.key === "W")) {
        e.preventDefault()
        if (!autoSubmitTriggeredRef.current) {
          autoSubmitTriggeredRef.current = true
          triggerAutoSubmit("ctrl-shift-w")
        }
        alert("⚠️ Closing window is blocked during test. Your test will be auto-submitted.")
        return false
      }

      // Block Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        alert("⚠️ Developer tools are blocked during test.")
        return false
      }

      // Block F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault()
        alert("⚠️ Developer tools are blocked during test.")
        return false
      }
    }

    // Block right-click context menu
    const handleContextMenu = (e) => {
      if (testActive) {
        e.preventDefault()
        alert("⚠️ Right-click is disabled during test.")
        return false
      }
    }

    // Block text selection
    const handleSelectStart = (e) => {
      if (testActive) {
        const target = e.target
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault()
          return false
        }
      }
    }

    // Enhanced visibility change handler
    const handleVisibilityChange = () => {
      if (document.hidden && testActive && !autoSubmitTriggeredRef.current) {
        console.log("🚨 Page hidden - starting auto-submit timer")
        // Give user 30 seconds to return before auto-submitting
        setTimeout(() => {
          if (document.hidden && testActive && !autoSubmitTriggeredRef.current) {
            console.log("🚨 Page still hidden after 30s - auto-submitting")
            autoSubmitTriggeredRef.current = true
            triggerAutoSubmit("page-hidden")
          }
        }, 30000)
      }
    }

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("unload", handleUnload)
    window.addEventListener("popstate", handlePopState)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Push initial state to prevent back navigation
    window.history.pushState(null, "", window.location.href)

    // Cleanup function
    return () => {
      isNavigationBlocked = false
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("unload", handleUnload)
      window.removeEventListener("popstate", handlePopState)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [testActive, isClient, isSubmitting])

  // 🚨 ENHANCED AUTO-SUBMIT FUNCTION
  const triggerAutoSubmit = async (reason) => {
    if (!attemptRef.current || autoSubmitTriggeredRef.current) return

    try {
      console.log(`🚨 Triggering auto-submit due to: ${reason}`)

      const token = localStorage.getItem("token")
      if (!token) return

      // Use sendBeacon for reliable delivery even during page unload
      const submissionData = {
        answers: answers,
        timeSpent: calculateTimeSpent(),
        isAutoSubmit: true,
        reason: reason,
        questionTimeTracking: questionTimeTrackingRef.current,
      }

      const blob = new Blob([JSON.stringify(submissionData)], {
        type: "application/json",
      })

      // Try sendBeacon first (most reliable for page unload)
      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(`/api/test-attempts/${attemptRef.current._id}/auto-submit`, blob)
        if (success) {
          console.log("✅ Auto-submit sent via sendBeacon")
          return
        }
      }

      // Fallback to fetch with keepalive
      fetch(`/api/test-attempts/${attemptRef.current._id}/auto-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
        keepalive: true,
      })
        .then(() => {
          console.log("✅ Auto-submit sent via fetch")
        })
        .catch((error) => {
          console.error("❌ Auto-submit failed:", error)
        })
    } catch (error) {
      console.error("❌ Auto-submit error:", error)
    }
  }

  // 💓 HEARTBEAT SYSTEM TO DETECT DISCONNECTION
  useEffect(() => {
    if (!testActive || !attemptRef.current) return

    const startHeartbeat = () => {
      heartbeatIntervalRef.current = setInterval(async () => {
        try {
          const token = localStorage.getItem("token")
          const response = await fetch(`/api/test-attempts/${attemptRef.current._id}/heartbeat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              currentQuestion: currentQuestionRef.current,
            }),
          })

          if (!response.ok) {
            console.warn("⚠️ Heartbeat failed - connection issues detected")
          }
        } catch (error) {
          console.warn("⚠️ Heartbeat error:", error)
        }
      }, 30000) // Send heartbeat every 30 seconds
    }

    startHeartbeat()

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [testActive])

  // Enhanced time tracking functions using refs
  const startQuestionTimer = useCallback(
    (questionIndex) => {
      const now = new Date()
      questionStartTimeRef.current = now

      // Log question navigation
      if (attemptRef.current && isClient) {
        fetch(`/api/test-attempts/${attemptRef.current._id}/track-time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            questionIndex,
            action: "view",
            timestamp: now.toISOString(),
          }),
        }).catch(console.error)
      }
    },
    [isClient],
  )

  const stopQuestionTimer = useCallback(
    (questionIndex) => {
      if (questionStartTimeRef.current && questionIndex !== null && questionIndex !== undefined) {
        const now = new Date()
        const timeSpent = Math.floor((now - questionStartTimeRef.current) / 1000)

        if (timeSpent > 0) {
          // Update local tracking using ref
          const currentTracking = questionTimeTrackingRef.current[questionIndex] || {}
          questionTimeTrackingRef.current[questionIndex] = {
            ...currentTracking,
            totalTime: (currentTracking.totalTime || 0) + timeSpent,
            lastSession: timeSpent,
            sessions: [
              ...(currentTracking.sessions || []),
              {
                start: questionStartTimeRef.current,
                end: now,
                duration: timeSpent,
              },
            ],
          }

          // Update server
          if (attemptRef.current && isClient) {
            fetch(`/api/test-attempts/${attemptRef.current._id}/track-time`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                questionIndex,
                action: "navigate-away",
                timeSpent,
                timestamp: now.toISOString(),
              }),
            }).catch(console.error)
          }
        }

        questionStartTimeRef.current = null
      }
    },
    [isClient],
  )

  // Track window focus/blur for accurate time tracking
  useEffect(() => {
    const handleFocus = () => {
      isTestActiveRef.current = true
      if (currentQuestionRef.current !== null) {
        startQuestionTimer(currentQuestionRef.current)
      }
    }

    const handleBlur = () => {
      isTestActiveRef.current = false
      if (currentQuestionRef.current !== null) {
        stopQuestionTimer(currentQuestionRef.current)
      }
    }

    if (isClient) {
      window.addEventListener("focus", handleFocus)
      window.addEventListener("blur", handleBlur)
    }

    return () => {
      if (isClient) {
        window.removeEventListener("focus", handleFocus)
        window.removeEventListener("blur", handleBlur)
      }
    }
  }, [isClient, startQuestionTimer, stopQuestionTimer])

  // Start question timer when current question changes (simplified)
  useEffect(() => {
    if (test && currentQuestion !== null) {
      // Stop previous question timer
      stopQuestionTimer(currentQuestionRef.current)

      // Start new question timer
      startQuestionTimer(currentQuestion)
    }

    // Cleanup on unmount
    return () => {
      if (currentQuestion !== null) {
        stopQuestionTimer(currentQuestion)
      }
    }
  }, [currentQuestion, test])

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setShowMobileSidebar((prev) => !prev)
  }

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.getElementById("mobile-sidebar")
      if (sidebar && !sidebar.contains(e.target) && showMobileSidebar) {
        const toggleButton = document.getElementById("mobile-sidebar-toggle")
        if (!toggleButton || !toggleButton.contains(e.target)) {
          setShowMobileSidebar(false)
        }
      }
    }

    if (isClient && showMobileSidebar) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      if (isClient) {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [showMobileSidebar, isClient])

  // Enhanced function to check if a question is numerical type
  const isNumericalQuestion = useCallback((question) => {
    if (!question) return false
    if (question.questionType === "numerical") return true
    if (question.type === "NUMERICAL") return true
    if (!question.options || question.options.length === 0) return true
    if (question.tags && Array.isArray(question.tags)) {
      const numericalTags = question.tags.filter(
        (tag) =>
          tag &&
          (tag.toLowerCase().includes("numerical") ||
            tag.toLowerCase().includes("integer") ||
            tag.toLowerCase() === "numerical"),
      )
      if (numericalTags.length > 0) return true
    }
    if (question.metadata?.questionType === "NUMERICAL") return true
    if (question.numericalAnswer !== undefined && question.numericalAnswer !== null) return true
    const questionText = question.questionText?.toLowerCase() || ""
    const hasNumericalKeywords =
      questionText.includes("find") ||
      questionText.includes("calculate") ||
      questionText.includes("radius") ||
      questionText.includes("value") ||
      questionText.includes("maximum") ||
      questionText.includes("minimum")
    if (hasNumericalKeywords && (!question.options || question.options.length === 0)) return true
    return false
  }, [])

  // 🔄 CLEAR ALL TEST DATA FOR NEW ATTEMPT
  const clearTestData = useCallback(() => {
    console.log("🧹 Clearing all test data for fresh attempt...")

    // Clear state
    setAnswers({})
    setCurrentQuestion(0)
    setTimeLeft(0)
    setTestStartTime(null)

    // Clear refs
    questionTimeTrackingRef.current = {}
    questionStartTimeRef.current = null
    currentQuestionRef.current = 0
    autoSubmitTriggeredRef.current = false

    // Clear local storage
    if (isClient) {
      clearAllStoredData()

      // Clear any cached data
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.includes(testId) || key.includes("test_") || key.includes("answer_")) {
          localStorage.removeItem(key)
        }
      })

      // Clear session storage
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach((key) => {
        if (key.includes(testId) || key.includes("test_") || key.includes("answer_")) {
          sessionStorage.removeItem(key)
        }
      })
    }

    console.log("✅ Test data cleared successfully")
  }, [testId, isClient, clearAllStoredData])

  // Hydration-Safe Data Restoration - Modified to handle fresh attempts
  useEffect(() => {
    if (isClient && !hydrationComplete) {
      console.log("🔄 Starting hydration-safe data restoration...")

      // For new attempts, don't restore old data
      const urlParams = new URLSearchParams(window.location.search)
      const isNewAttempt = urlParams.get("new") === "true"

      if (isNewAttempt) {
        console.log("🆕 New attempt detected - skipping data restoration")
        clearTestData()
      } else {
        const restored = restoreDataOnLoad()
        if (Object.keys(restored.answers).length > 0) {
          console.log("🎯 Applying restored answers after hydration:", restored.answers)
          setAnswers(restored.answers)

          if (restored.currentQuestion !== null) {
            setCurrentQuestion(restored.currentQuestion)
          }
        }
      }

      setHydrationComplete(true)
    }
  }, [isClient, restoreDataOnLoad, hydrationComplete, clearTestData])

  // Initialize test with proper data restoration
  useEffect(() => {
    if (isClient) {
      initializeTest()
    }

    // Network status monitoring - only on client
    if (isClient) {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
      stopAutoSave()
      if (isClient) {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [testId, isClient])

  // Calculate time spent based on test start time
  const calculateTimeSpent = useCallback(() => {
    if (!testStartTime) {
      console.log("⚠️ No test start time available")
      return 0
    }

    const now = new Date()
    const timeSpentSeconds = Math.floor((now - testStartTime) / 1000)
    console.log("⏱️ Calculated time spent:", {
      startTime: testStartTime.toISOString(),
      currentTime: now.toISOString(),
      timeSpentSeconds,
      timeSpentMinutes: (timeSpentSeconds / 60).toFixed(2),
    })
    return Math.max(0, timeSpentSeconds)
  }, [testStartTime])

  const initializeTest = async () => {
    try {
      const token = isClient ? localStorage.getItem("token") : null
      if (!token) {
        router.push("/login")
        return
      }

      // Check if this is a new attempt
      const urlParams = new URLSearchParams(window.location.search)
      const isNewAttempt = urlParams.get("new") === "true"

      if (isNewAttempt) {
        console.log("🆕 Initializing fresh test attempt...")
        clearTestData()
      }

      // STEP 1: Check if there's an existing attempt (only if not new attempt)
      const savedAttemptId = !isNewAttempt ? getSavedAttemptId() : null

      if (savedAttemptId && !isNewAttempt) {
        try {
          console.log("🚀 Loading existing attempt...")
          const attemptResponse = await fetch(`/api/test-attempts/${savedAttemptId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (attemptResponse.ok) {
            const attemptData = await attemptResponse.json()

            if (attemptData.attempt && attemptData.attempt.status === "in-progress") {
              setTest(attemptData.test)
              setAttempt(attemptData.attempt)

              // Set test start time from the attempt
              const startTime = new Date(attemptData.attempt.startTime)
              setTestStartTime(startTime)
              console.log("⏱️ Test start time set from existing attempt:", startTime.toISOString())

              // STEP 2: Merge with any restored data (only if not new attempt)
              console.log("🚀 Merging data...")
              const restoredData = restoreDataOnLoad()
              let finalAnswers = { ...restoredData.answers }

              if (attemptData.attempt.autoSaveData?.answers) {
                console.log("📡 Server data found:", attemptData.attempt.autoSaveData.answers)
                finalAnswers = { ...attemptData.attempt.autoSaveData.answers, ...restoredData.answers }
              }

              console.log("🎯 Final merged answers:", finalAnswers)
              setAnswers(finalAnswers)

              if (restoredData.currentQuestion !== null) {
                setCurrentQuestion(restoredData.currentQuestion)
              }

              Object.entries(finalAnswers).forEach(([questionIndex, answerData]) => {
                persistAnswerImmediately(Number.parseInt(questionIndex), answerData, {
                  restored: true,
                  source: "merge",
                })
              })

              // Calculate time left
              const duration = attemptData.test.duration * 60
              const now = new Date()
              const elapsed = Math.floor((new Date() - startTime) / 1000)
              const remaining = Math.max(0, duration - elapsed)

              console.log("⏱️ Timer calculation:", {
                duration: attemptData.test.duration,
                durationSeconds: duration,
                startTime: startTime.toISOString(),
                currentTime: now.toISOString(),
                elapsedSeconds: elapsed,
                remainingSeconds: remaining,
                remainingMinutes: (remaining / 60).toFixed(2),
              })

              setTimeLeft(remaining)
              setLoading(false)
              setTestActive(true)

              startTimer(remaining)
              startAutoSave()

              return
            }
          }
        } catch (error) {
          console.error("Error loading saved attempt:", error)
        }
      }

      // STEP 3: Create new attempt
      console.log("🚀 Creating new attempt...")
      const testResponse = await fetch(`/api/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const testData = await testResponse.json()

      if (!testResponse.ok) throw new Error(testData.error)

      const attemptResponse = await fetch("/api/test-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ testId }),
      })
      const attemptData = await attemptResponse.json()

      if (!attemptResponse.ok) throw new Error(attemptData.error)

      saveAttemptId(attemptData.attempt._id)

      setTest(testData.test)
      setAttempt(attemptData.attempt)

      // Set test start time from the new attempt
      const startTime = new Date(attemptData.attempt.startTime)
      setTestStartTime(startTime)
      console.log("⏱️ Test start time set from new attempt:", startTime.toISOString())

      // For new attempts, start fresh
      if (isNewAttempt) {
        console.log("🆕 Starting with fresh data for new attempt")
        setAnswers({})
        setCurrentQuestion(0)
      } else {
        // Use any restored answers if available (for resumed attempts)
        const restoredData = restoreDataOnLoad()
        if (Object.keys(restoredData.answers).length > 0) {
          console.log("🎯 Using restored answers for resumed attempt:", restoredData.answers)
          setAnswers(restoredData.answers)

          Object.entries(restoredData.answers).forEach(([questionIndex, answerData]) => {
            persistAnswerImmediately(Number.parseInt(questionIndex), answerData, {
              restored: true,
              source: "new_attempt",
            })
          })
        }

        if (restoredData.currentQuestion !== null) {
          setCurrentQuestion(restoredData.currentQuestion)
        }
      }

      const duration = testData.test.duration * 60
      const now = new Date()
      const elapsed = Math.floor((new Date() - startTime) / 1000)
      const remaining = Math.max(0, duration - elapsed)

      console.log("⏱️ New attempt timer calculation:", {
        duration: testData.test.duration,
        durationSeconds: duration,
        startTime: startTime.toISOString(),
        elapsedSeconds: elapsed,
        remainingSeconds: remaining,
        remainingMinutes: (remaining / 60).toFixed(2),
      })

      setTimeLeft(remaining)
      setLoading(false)
      setTestActive(true)

      startTimer(remaining)
      startAutoSave()
    } catch (error) {
      console.error("Test initialization error:", error)
      alert("Failed to load test. Please try again.")
      router.push("/tests")
    }
  }

  const startTimer = (initialTime) => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Enhanced answer handling functions with time tracking
  const handleAnswerSelect = useCallback(
    (questionIndex, answerIndex) => {
      console.log(`🎯 Answer selected: Q${questionIndex + 1} -> Option ${answerIndex}`)

      const now = new Date()
      const answerData = {
        selectedAnswer: answerIndex,
        timeTaken: 0,
        timestamp: Date.now(),
        answerTime: now,
      }

      // Track answer action
      if (attemptRef.current && isClient) {
        fetch(`/api/test-attempts/${attemptRef.current._id}/track-time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            questionIndex,
            action: "answer",
            selectedAnswer: answerIndex,
            timestamp: now.toISOString(),
          }),
        }).catch(console.error)
      }

      if (isClient) {
        persistDataImmediately(answers, currentQuestion, timeLeft, questionIndex)
        persistAnswerImmediately(questionIndex, answerData, { type: "MCQ" })
      }

      setAnswers((prev) => {
        const newAnswers = {
          ...prev,
          [questionIndex]: {
            ...prev[questionIndex],
            ...answerData,
          },
        }

        if (attempt && isClient && navigator.onLine) {
          const timeSpent = calculateTimeSpent()
          debouncedAutoSave(attempt, newAnswers, timeSpent)
        }

        return newAnswers
      })
    },
    [
      persistDataImmediately,
      currentQuestion,
      timeLeft,
      attempt,
      debouncedAutoSave,
      testId,
      persistAnswerImmediately,
      isClient,
      calculateTimeSpent,
    ],
  )

  const handleNumericalAnswer = useCallback(
    (questionIndex, value) => {
      console.log(`🔢 Numerical answer entered: Q${questionIndex + 1} -> ${value}`)

      const now = new Date()
      const answerData = {
        numericalAnswer: value,
        timeTaken: 0,
        timestamp: Date.now(),
        answerTime: now,
      }

      // Track answer action
      if (attemptRef.current && isClient) {
        fetch(`/api/test-attempts/${attemptRef.current._id}/track-time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            questionIndex,
            action: "answer",
            numericalAnswer: value,
            timestamp: now.toISOString(),
          }),
        }).catch(console.error)
      }

      if (isClient) {
        persistDataImmediately(answers, currentQuestion, timeLeft, questionIndex)
        persistAnswerImmediately(questionIndex, answerData, { type: "Numerical" })
      }

      setAnswers((prev) => {
        const newAnswers = {
          ...prev,
          [questionIndex]: {
            ...prev[questionIndex],
            ...answerData,
          },
        }

        if (attempt && isClient && navigator.onLine) {
          const timeSpent = calculateTimeSpent()
          debouncedAutoSave(attempt, newAnswers, timeSpent)
        }

        return newAnswers
      })
    },
    [
      persistDataImmediately,
      currentQuestion,
      timeLeft,
      attempt,
      debouncedAutoSave,
      testId,
      persistAnswerImmediately,
      isClient,
      calculateTimeSpent,
    ],
  )

  // Navigation and action handlers with enhanced time tracking
  const handleQuestionNavigation = (questionIndex) => {
    // Stop timer for current question
    stopQuestionTimer(currentQuestionRef.current)

    // Update current question
    setCurrentQuestion(questionIndex)

    // Mark question as visited - THIS IS THE KEY FIX
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        visited: true,
        timestamp: prev[questionIndex]?.timestamp || Date.now(),
      },
    }))

    if (isClient) {
      persistDataImmediately(answers, questionIndex, timeLeft)
    }
    // Close mobile sidebar after navigation
    setShowMobileSidebar(false)
  }

  const handleClearResponse = () => {
    const now = new Date()

    // Track clear action
    if (attemptRef.current && isClient) {
      fetch(`/api/test-attempts/${attemptRef.current._id}/track-time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          questionIndex: currentQuestion,
          action: "clear",
          timestamp: now.toISOString(),
        }),
      }).catch(console.error)
    }

    setAnswers((prev) => {
      const newAnswers = { ...prev }
      delete newAnswers[currentQuestion]

      if (isClient) {
        persistDataImmediately(newAnswers, currentQuestion, timeLeft)
        if (attempt) {
          const timeSpent = calculateTimeSpent()
          debouncedAutoSave(attempt, newAnswers, timeSpent)
        }
      }
      return newAnswers
    })
  }

  const handleMarkForReview = () => {
    const now = new Date()

    // Track mark action
    if (attemptRef.current && isClient) {
      fetch(`/api/test-attempts/${attemptRef.current._id}/track-time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          questionIndex: currentQuestion,
          action: "mark",
          timestamp: now.toISOString(),
        }),
      }).catch(console.error)
    }

    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [currentQuestion]: {
          ...prev[currentQuestion],
          markedForReview: true,
          timestamp: Date.now(),
        },
      }

      if (isClient) {
        persistDataImmediately(newAnswers, currentQuestion, timeLeft)
        if (attempt) {
          const timeSpent = calculateTimeSpent()
          debouncedAutoSave(attempt, newAnswers, timeSpent)
        }
      }
      return newAnswers
    })

    if (currentQuestion < test.questions.length - 1) {
      handleQuestionNavigation(currentQuestion + 1)
    }
  }

  const handleSaveAndNext = () => {
    if (isClient) {
      persistDataImmediately(answers, currentQuestion, timeLeft)
      if (attempt) {
        const timeSpent = calculateTimeSpent()
        debouncedAutoSave(attempt, answers, timeSpent)
      }
    }

    if (currentQuestion < test.questions.length - 1) {
      handleQuestionNavigation(currentQuestion + 1)
    }
  }

  const handleBack = () => {
    handleQuestionNavigation(Math.max(0, currentQuestion - 1))
  }

  const handleNext = () => {
    handleQuestionNavigation(Math.min(test.questions.length - 1, currentQuestion + 1))
  }

  const handleSubmitButtonClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("🚀 SUBMIT BUTTON CLICKED - Starting submission process...")

    if (isSubmitting) {
      console.log("⚠️ Already submitting, ignoring click")
      return
    }

    console.log("📝 Showing submit confirmation modal...")
    setShowSubmitModal(true)
  }

  const confirmSubmit = async () => {
    console.log("✅ User confirmed submission - proceeding...")

    if (isSubmitting) {
      console.log("⚠️ Already submitting, ignoring confirmation")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("🔄 Setting submission state to true")

      await submitTest(false)
    } catch (error) {
      console.error("❌ Error during test submission:", error)
      alert("There was a problem submitting your test. Please try again.")
      setIsSubmitting(false)
      setShowSubmitModal(false)
    }
  }

  const handleCancelSubmit = () => {
    console.log("🚫 User cancelled submission")
    setShowSubmitModal(false)
    setIsSubmitting(false)
  }

  const handleAutoSubmit = async () => {
    console.log("⏰ Auto-submitting test due to time expiry...")
    await submitTest(true)
  }

  const submitTest = async (isAutoSubmit = false) => {
    console.log("🚀 Starting test submission process...", { isAutoSubmit, attemptId: attempt?._id })

    if (!attempt || !test) {
      console.error("❌ Missing test or attempt data")
      alert("Test data is missing. Please refresh and try again.")
      setIsSubmitting(false)
      return
    }

    try {
      // Stop current question timer
      stopQuestionTimer(currentQuestionRef.current)

      const token = isClient ? localStorage.getItem("token") : null
      if (!token) {
        console.error("❌ No authentication token found")
        alert("You need to be logged in to submit the test.")
        router.push("/login")
        return
      }

      // Calculate time spent
      const timeSpent = calculateTimeSpent()

      // Include time tracking data
      const submissionData = {
        answers,
        timeSpent,
        isAutoSubmit,
        questionTimeTracking: questionTimeTrackingRef.current,
      }

      console.log("📡 Sending submission request to server...")
      console.log("📊 Submission data:", {
        answers: Object.keys(answers).length,
        timeSpent,
        timeSpentMinutes: (timeSpent / 60).toFixed(2),
        isAutoSubmit,
        testStartTime: testStartTime?.toISOString(),
        questionTimeTracking: Object.keys(questionTimeTrackingRef.current).length,
      })

      const response = await fetch(`/api/test-attempts/${attempt._id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      })

      console.log("📡 Server response status:", response.status)
      const data = await response.json()
      console.log("📡 Server response data:", data)

      if (response.ok) {
        console.log("✅ Test submitted successfully!")

        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          console.log("⏰ Timer stopped")
        }
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          console.log("💓 Heartbeat stopped")
        }
        stopAutoSave()
        console.log("💾 Auto-save stopped")

        // Disable test restrictions
        setTestActive(false)

        if (isClient) {
          clearAllStoredData()

          Object.keys(answers).forEach((questionIndex) => {
            markAnswerAsSynced(Number.parseInt(questionIndex))
          })

          console.log("🧹 Local data cleared")
        }

        console.log("🎯 Redirecting to results page...")
        router.push(`/test-results/${attempt._id}`)
      } else {
        throw new Error(data.error || `Server error: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Submit error:", error)
      alert(`Failed to submit test: ${error.message || "Unknown error"}. Please try again.`)
      setIsSubmitting(false)
      setShowSubmitModal(false)
    }
  }

  // Show loading until client hydration is complete
  if (!isClient || loading) {
    return <TestLoadingScreen isClient={isClient} />
  }

  if (!test || !attempt) {
    return <TestErrorScreen onReturnToTests={() => router.push("/tests")} />
  }

  const currentQ = test.questions[currentQuestion]
  const isNumerical = isNumericalQuestion(currentQ)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col animate-fade-in">
      {/* 🔒 Test Active Indicator */}
      {/* {testActive && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-sm font-medium z-50">
          🔒 Test in Progress - Navigation Restricted | Tab Closing Blocked
        </div>
      )} */}

      {/* Status Indicators */}
      <AutoSaveIndicator status={autoSaveStatus} />
      <NetworkStatusIndicator syncQueue={getSyncQueue()} networkStatus={networkStatus} />

      {/* Header */}
      <TestHeader
        test={test}
        currentQuestion={currentQuestion}
        totalQuestions={test.questions.length}
        onSubmit={handleSubmitButtonClick}
        isSubmitting={isSubmitting}
        timeLeft={timeLeft}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-gradient-to-b from-transparent to-slate-900/20">
          <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
            {/* Question Card */}
            <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-8 shadow-2xl border border-slate-700/30 hover:border-teal-500/30 transition-all duration-500 animate-slide-up">
              <QuestionDisplay
                currentQuestion={currentQuestion}
                question={currentQ}
                answers={answers}
                onAnswerSelect={handleAnswerSelect}
                onNumericalAnswer={handleNumericalAnswer}
                isNumerical={isNumerical}
              />
            </div>

            {/* Action Buttons */}
            <div
              className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-slate-700/30 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <TestActions
                onSaveAndNext={handleSaveAndNext}
                onMarkForReview={handleMarkForReview}
                onClearResponse={handleClearResponse}
                onBack={handleBack}
                onNext={handleNext}
                currentQuestion={currentQuestion}
                totalQuestions={test.questions.length}
              />
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block md:w-80 glass-card border-l border-slate-700/50 overflow-y-auto shadow-2xl">
          <TestSidebar
            test={test}
            answers={answers}
            currentQuestion={currentQuestion}
            onQuestionNavigation={handleQuestionNavigation}
            isNumericalQuestion={isNumericalQuestion}
            activeSubject={activeSubject}
            setActiveSubject={handleManualSubjectChange}
          />
        </div>

        {/* Mobile Sidebar Toggle Button */}
        <div className="fixed bottom-4 right-4 md:hidden z-50">
          <button
            id="mobile-sidebar-toggle"
            onClick={toggleMobileSidebar}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center shadow-lg"
          >
            <Layers className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Sidebar */}
        <div
          id="mobile-sidebar"
          className={`fixed inset-0 bg-slate-900/95 z-40 md:hidden transform transition-transform duration-300 ${
            showMobileSidebar ? "translate-x-0" : "translate-x-full"
          } overflow-y-auto`}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-200">Question Palette</h3>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <TestSidebar
              test={test}
              answers={answers}
              currentQuestion={currentQuestion}
              onQuestionNavigation={handleQuestionNavigation}
              isNumericalQuestion={isNumericalQuestion}
              activeSubject={activeSubject}
              setActiveSubject={handleManualSubjectChange}
            />
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        isSubmitting={isSubmitting}
        onConfirm={confirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </div>
  )
}
