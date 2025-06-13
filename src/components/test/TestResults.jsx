"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"

export default function TestResults({ attemptId }) {
  const router = useRouter()
  const [attempt, setAttempt] = useState(null)
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [attemptId])

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/test-attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (response.ok) {
        setAttempt(data.attempt)
        setTest(data.test)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Fetch results error:", error)
      alert("Failed to load results")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading results...</div>
      </div>
    )
  }

  if (!attempt || !test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Results not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Results</h1>
          <p className="text-gray-600">{test.title}</p>
        </div>

        {/* Score Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Score Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{attempt.score.obtained}</div>
                <div className="text-sm text-gray-600">Score Obtained</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{attempt.score.total}</div>
                <div className="text-sm text-gray-600">Total Marks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{attempt.score.percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{formatTime(attempt.timeSpent)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{attempt.analysis.correct}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{attempt.analysis.incorrect}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{attempt.analysis.unattempted}</div>
                <div className="text-sm text-gray-600">Unattempted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attempt.analysis.subjectWise.map((subject, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{subject.subject}</h4>
                    <span className="text-sm text-gray-600">Score: {subject.score}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-medium">{subject.correct}</div>
                      <div className="text-gray-600">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-medium">{subject.incorrect}</div>
                      <div className="text-gray-600">Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 font-medium">{subject.unattempted}</div>
                      <div className="text-gray-600">Unattempted</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Button onClick={() => router.push("/tests")} variant="outline">
            Take Another Test
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="primary">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
