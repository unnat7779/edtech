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
  const [activeSubject, setActiveSubject] = useState("all")
  const [hydrationComplete, setHydrationComplete] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testStartTime, setTestStartTime] = useState(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const intervalRef = useRef(null)

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

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setShowMobileSidebar((prev) => !prev)
  }

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.getElementById("mobile-sidebar")
      if (sidebar && !sidebar.contains(e.target) && showMobileSidebar) {
        // Check if the click was on the toggle button
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

    // Method 1: Direct questionType check
    if (question.questionType === "numerical") return true

    // Method 2: Type field check (uppercase)
    if (question.type === "NUMERICAL") return true

    // Method 3: Check if question has no options (likely numerical)
    if (!question.options || question.options.length === 0) return true

    // Method 4: Check tags array for numerical indicators
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

    // Method 5: Check metadata
    if (question.metadata?.questionType === "NUMERICAL") return true

    // Method 6: Check if numericalAnswer exists
    if (question.numericalAnswer !== undefined && question.numericalAnswer !== null) return true

    // Method 7: Heuristic analysis
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

  // Hydration-Safe Data Restoration
  useEffect(() => {
    if (isClient && !hydrationComplete) {
      console.log("🔄 Starting hydration-safe data restoration...")
      const restored = restoreDataOnLoad()

      if (Object.keys(restored.answers).length > 0) {
        console.log("🎯 Applying restored answers after hydration:", restored.answers)
        setAnswers(restored.answers)

        if (restored.currentQuestion !== null) {
          setCurrentQuestion(restored.currentQuestion)
        }
      }

      setHydrationComplete(true)
    }
  }, [isClient, restoreDataOnLoad, hydrationComplete])

  // Initialize test with proper data restoration
  useEffect(() => {
    if (isClient) {
      initializeTest()
    }

    // Network status monitoring - only on client
    if (isClient) {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      window.addEventListener("beforeunload", handleBeforeUnload)
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      stopAutoSave()
      if (isClient) {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
        window.removeEventListener("beforeunload", handleBeforeUnload)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }
  }, [testId, isClient])

  const handleBeforeUnload = (e) => {
    if (isClient) {
      persistDataImmediately(answers, currentQuestion, timeLeft)
    }
  }

  const handleVisibilityChange = () => {
    if (document.hidden && isClient) {
      persistDataImmediately(answers, currentQuestion, timeLeft)
      if (attempt) {
        const timeSpent = calculateTimeSpent()
        debouncedAutoSave(attempt, answers, timeSpent)
      }
    }
  }

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

      // STEP 1: Check if there's an existing attempt
      const savedAttemptId = getSavedAttemptId()

      if (savedAttemptId) {
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

              // STEP 2: Merge with any restored data
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
              const elapsed = Math.floor((new Date() - startTime) / 1000)
              const remaining = Math.max(0, duration - elapsed)

              setTimeLeft(remaining)
              setLoading(false)

              startTimer(remaining)
              startAutoSave()

              return
            }
          }
        } catch (error) {
          console.error("Error loading saved attempt:", error)
        }
      }

      // STEP 3: Create new attempt if no existing one
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

      // Use any restored answers if available
      const restoredData = restoreDataOnLoad()
      if (Object.keys(restoredData.answers).length > 0) {
        console.log("🎯 Using restored answers for new attempt:", restoredData.answers)
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

      const duration = testData.test.duration * 60
      const elapsed = Math.floor((new Date() - startTime) / 1000)
      const remaining = Math.max(0, duration - elapsed)

      setTimeLeft(remaining)
      setLoading(false)

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

  // Answer handling functions
  const handleAnswerSelect = useCallback(
    (questionIndex, answerIndex) => {
      console.log(`🎯 Answer selected: Q${questionIndex + 1} -> Option ${answerIndex}`)

      const answerData = {
        selectedAnswer: answerIndex,
        timeTaken: 0,
        timestamp: Date.now(),
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

      const answerData = {
        numericalAnswer: value,
        timeTaken: 0,
        timestamp: Date.now(),
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

  // Navigation and action handlers
  const handleQuestionNavigation = (questionIndex) => {
    setCurrentQuestion(questionIndex)
    if (isClient) {
      persistDataImmediately(answers, questionIndex, timeLeft)
    }
    // Close mobile sidebar after navigation
    setShowMobileSidebar(false)
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
      const token = isClient ? localStorage.getItem("token") : null
      if (!token) {
        console.error("❌ No authentication token found")
        alert("You need to be logged in to submit the test.")
        router.push("/login")
        return
      }

      // Calculate time spent
      const timeSpent = calculateTimeSpent()

      console.log("📡 Sending submission request to server...")
      console.log("📊 Submission data:", {
        answers: Object.keys(answers).length,
        timeSpent,
        timeSpentMinutes: (timeSpent / 60).toFixed(2),
        isAutoSubmit,
        testStartTime: testStartTime?.toISOString(),
      })

      const response = await fetch(`/api/test-attempts/${attempt._id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          timeSpent,
          isAutoSubmit,
        }),
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
        stopAutoSave()
        console.log("💾 Auto-save stopped")

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

  const handleClearResponse = () => {
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
      setCurrentQuestion(currentQuestion + 1)
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
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleBack = () => {
    handleQuestionNavigation(Math.max(0, currentQuestion - 1))
  }

  const handleNext = () => {
    handleQuestionNavigation(Math.min(test.questions.length - 1, currentQuestion + 1))
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
            setActiveSubject={setActiveSubject}
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
              setActiveSubject={setActiveSubject}
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
