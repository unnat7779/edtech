"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import TestRatingModal from "@/components/test/TestRatingModal"
import { Star, Trophy, Target, TrendingUp, Award, Clock } from "lucide-react"

export default function TestResultsPage({ params }) {
  const router = useRouter()
  const [attempt, setAttempt] = useState(null)
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [attemptId, setAttemptId] = useState(null)

  useEffect(() => {
    const initializePage = async () => {
      try {
        const resolvedParams = await params
        console.log("🔍 Resolved params:", resolvedParams)
        setAttemptId(resolvedParams.id)
        await fetchResults(resolvedParams.id)
      } catch (error) {
        console.error("Error resolving params:", error)
        router.push("/dashboard")
      }
    }

    initializePage()
  }, [params, router])

  const fetchResults = async (id) => {
    try {
      console.log("🚀 Fetching results for attempt ID:", id)
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("❌ No authentication token found")
        router.push("/login")
        return
      }

      const response = await fetch(`/api/test-attempts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      console.log("📊 API Response:", data)
      console.log("⏱️ Time data from API:", {
        timeSpent: data.attempt?.timeSpent,
        startTime: data.attempt?.startTime,
        endTime: data.attempt?.endTime,
        type: typeof data.attempt?.timeSpent,
      })

      if (response.ok) {
        setAttempt(data.attempt)
        setTest(data.test)

        console.log("✅ Test data loaded:", {
          testId: data.test?._id,
          testTitle: data.test?.title,
          attemptId: data.attempt?._id,
          timeSpent: data.attempt?.timeSpent,
        })

        // Check if user has already rated this test
        if (data.test?._id) {
          await checkUserRating(data.test._id)
        }

        // Show rating modal after a short delay if not rated
        setTimeout(() => {
          if (!hasRated && data.test?._id) {
            console.log("🌟 Showing rating modal for test:", data.test._id)
            setShowRatingModal(true)
          }
        }, 2000)
      } else {
        throw new Error(data.error || "Failed to fetch results")
      }
    } catch (error) {
      console.error("❌ Fetch results error:", error)
      alert("Failed to load results")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const checkUserRating = async (testId) => {
    try {
      console.log("🔍 Checking user rating for test:", testId)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tests/${testId}/rating`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("📊 Rating check response:", data)
        setHasRated(!!data.userRating)
      } else {
        console.warn("⚠️ Failed to check user rating:", response.status)
      }
    } catch (error) {
      console.error("❌ Check rating error:", error)
    }
  }

  const handleRatingSubmit = async (ratingData) => {
    try {
      console.log("🌟 Submitting rating for test:", test?._id)
      console.log("📊 Rating data:", ratingData)

      if (!test?._id) {
        throw new Error("Test ID is missing")
      }

      if (!attemptId) {
        throw new Error("Attempt ID is missing")
      }

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const response = await fetch(`/api/tests/${test._id}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...ratingData,
          testAttemptId: attemptId,
        }),
      })

      const responseData = await response.json()
      console.log("📊 Rating submission response:", responseData)

      if (response.ok) {
        setHasRated(true)
        setShowRatingModal(false)
        alert("Thank you for your feedback!")
      } else {
        throw new Error(responseData.error || "Failed to submit rating")
      }
    } catch (error) {
      console.error("❌ Submit rating error:", error)
      throw error
    }
  }

  const formatTime = (seconds) => {
    console.log("🕐 Formatting time:", { seconds, type: typeof seconds })

    // Handle invalid or missing values
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
      console.log("⚠️ Invalid time value, using fallback")
      return "Not recorded"
    }

    // Ensure seconds is a number
    const totalSeconds = Math.floor(Number(seconds))
    console.log("🕐 Total seconds after conversion:", totalSeconds)

    if (totalSeconds === 0) {
      return "Less than 1 second"
    }

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    // Format with proper labels
    let timeString = ""
    if (hours > 0) {
      timeString += `${hours}h `
    }
    if (minutes > 0 || hours > 0) {
      timeString += `${minutes}m `
    }
    timeString += `${secs}s`

    console.log("🕐 Formatted time string:", timeString)
    return timeString.trim()
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return "text-green-400"
    if (percentage >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Outstanding Performance! 🎉"
    if (percentage >= 80) return "Excellent Work! 🌟"
    if (percentage >= 70) return "Good Job! 👍"
    if (percentage >= 60) return "Keep Improving! 📈"
    return "More Practice Needed 💪"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading results...</div>
        </div>
      </div>
    )
  }

  if (!attempt || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-400">Results not found</div>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Test Results
            </h1>
          </div>
          <p className="text-slate-300 text-lg">{test.title}</p>
          <p className={`text-xl font-semibold mt-2 ${getPerformanceColor(attempt.score.percentage)}`}>
            {getPerformanceMessage(attempt.score.percentage)}
          </p>
        </div>

        {/* Score Overview */}
        <Card className="mb-8 bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <Award className="h-6 w-6 text-yellow-400" />
              Score Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className={`text-4xl font-bold ${getPerformanceColor(attempt.score.percentage)}`}>
                  {attempt.score.obtained}
                </div>
                <div className="text-sm text-slate-400 mt-1">Score Obtained</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-4xl font-bold text-slate-200">{attempt.score.total}</div>
                <div className="text-sm text-slate-400 mt-1">Total Marks</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className={`text-4xl font-bold ${getPerformanceColor(attempt.score.percentage)}`}>
                  {attempt.score.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-400 mt-1">Percentage</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">{formatTime(attempt.timeSpent)}</div>
                <div className="text-sm text-slate-400 mt-1">Time Taken</div>
                {/* Debug info - remove in production */}
                {/* <div className="text-xs text-slate-500 mt-1">
                  Raw: {attempt.timeSpent} ({typeof attempt.timeSpent})
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Analysis */}
        <Card className="mb-8 bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <Target className="h-6 w-6 text-blue-400" />
              Question Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/50">
                <div className="text-3xl font-bold text-green-400">{attempt.analysis.correct}</div>
                <div className="text-sm text-slate-400 mt-1">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-700/50">
                <div className="text-3xl font-bold text-red-400">{attempt.analysis.incorrect}</div>
                <div className="text-sm text-slate-400 mt-1">Incorrect</div>
              </div>
              <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
                <div className="text-3xl font-bold text-yellow-400">{attempt.analysis.unattempted}</div>
                <div className="text-sm text-slate-400 mt-1">Unattempted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Analysis */}
        {attempt.analysis.subjectWise && attempt.analysis.subjectWise.length > 0 && (
          <Card className="mb-8 bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-slate-200">
                <TrendingUp className="h-6 w-6 text-green-400" />
                Subject-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attempt.analysis.subjectWise.map((subject, index) => (
                  <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-slate-200">{subject.subject}</h4>
                      <span className="text-sm text-slate-400">Score: {subject.score}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-2 bg-green-900/20 rounded border border-green-700/30">
                        <div className="text-green-400 font-medium">{subject.correct}</div>
                        <div className="text-slate-400">Correct</div>
                      </div>
                      <div className="text-center p-2 bg-red-900/20 rounded border border-red-700/30">
                        <div className="text-red-400 font-medium">{subject.incorrect}</div>
                        <div className="text-slate-400">Incorrect</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-900/20 rounded border border-yellow-700/30">
                        <div className="text-yellow-400 font-medium">{subject.unattempted}</div>
                        <div className="text-slate-400">Unattempted</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Button
            onClick={() => router.push("/tests")}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Take Another Test
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
          >
            Go to Dashboard
          </Button>
          {!hasRated && test?._id && (
            <Button
              onClick={() => setShowRatingModal(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
            >
              <Star className="h-4 w-4 mr-2" />
              Rate This Test
            </Button>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && test && (
        <TestRatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          testData={test}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  )
}
