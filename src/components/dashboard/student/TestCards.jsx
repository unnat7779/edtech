"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"

export default function TestCards({ tests = [], onStartTest, userId }) {
  const router = useRouter()
  const [filter, setFilter] = useState("all")
  const [recentAttempts, setRecentAttempts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchRecentAttempts()
    }
  }, [userId])

  const fetchRecentAttempts = async () => {
    try {
      setLoading(true)
      console.log("Fetching recent attempts for user:", userId)

      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/test-attempts?userId=${userId}&limit=5&recent=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecentAttempts(data.attempts || [])
      }
    } catch (error) {
      console.error("Error fetching recent attempts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!tests) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-800 border-t-teal-400 mx-auto mb-4"></div>
        <div className="text-slate-400">Loading tests...</div>
      </div>
    )
  }

  const filteredTests = (tests || []).filter((test) => {
    if (filter === "all") return test.isActive
    if (filter === "active") return test.isActive && test.questions?.length > 0
    if (filter === "draft") return test.isActive && (!test.questions || test.questions.length === 0)
    return true
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-8">
      {/* Recent Test Attempts Section */}
      {recentAttempts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-200">Recent Test Attempts</h2>
            <Button
              onClick={() => router.push("/test-history")}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              View History
            </Button>
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            <div className="grid grid-cols-1 gap-4 pr-2">
              {recentAttempts.map((attempt) => (
                <Card
                  key={attempt._id}
                  className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-200">{attempt.test?.title || "Test"}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                          <span>{attempt.test?.subject || "General"}</span>
                          <span>{formatDate(attempt.createdAt)}</span>
                          <span>
                            {attempt.score?.obtained || 0}/{attempt.score?.total || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-400">
                          {(attempt.score?.percentage || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Tests Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-6">Available Tests</h2>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { key: "all", label: "All Tests" },
            { key: "active", label: "Ready to Take" },
            { key: "draft", label: "Coming Soon" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            const hasQuestions = test.questions?.length > 0
            return (
              <Card key={test._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hasQuestions ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {hasQuestions ? "Available" : "Coming Soon"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm line-clamp-2">{test.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Subject:</span>
                        <div className="font-medium">{test.subject}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="font-medium">{test.duration} min</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Marks:</span>
                        <div className="font-medium">{test.totalMarks}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Questions:</span>
                        <div className="font-medium">{test.questions?.length || 0}</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <div>Created: {formatDate(test.createdAt)}</div>
                      {test.type === "chapter-wise" && test.chapter && <div>Chapter: {test.chapter}</div>}
                    </div>

                    <div className="pt-2">
                      {hasQuestions ? (
                        <Button onClick={() => onStartTest?.(test)} className="w-full">
                          Start Test
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          Questions Being Added
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No {filter !== "all" ? filter : ""} tests found</div>
            <p className="text-sm text-gray-400">Check back later for new tests</p>
          </div>
        )}
      </div>
    </div>
  )
}
