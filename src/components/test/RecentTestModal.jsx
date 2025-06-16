"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, FileText, X, ArrowRight, BookOpen, History } from "lucide-react"
import Button from "@/components/ui/Button"

export default function RecentTestModal({ isOpen, onClose }) {
  const router = useRouter()
  const [recentAttempts, setRecentAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchRecentAttempts()
    }
  }, [isOpen])

  const fetchRecentAttempts = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("/api/test-attempts?limit=10&recent=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch recent attempts")
      }

      const data = await response.json()
      setRecentAttempts(data.attempts || [])
    } catch (error) {
      console.error("Error fetching recent attempts:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return "text-emerald-400"
    if (percentage >= 60) return "text-blue-400"
    if (percentage >= 40) return "text-amber-400"
    return "text-red-400"
  }

  const handleTestClick = (testId) => {
    router.push(`/test-history/${testId}`)
    onClose()
  }

  const handleViewAllTests = () => {
    router.push("/tests")
    onClose()
  }

  const handleViewAllHistory = () => {
    router.push("/test-history")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200">Recent Test Attempts</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleViewAllTests}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              View All Tests
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-300">Loading recent attempts...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">Error Loading Data</h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button onClick={fetchRecentAttempts} size="sm">
                Try Again
              </Button>
            </div>
          ) : recentAttempts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">No Recent Attempts</h3>
              <p className="text-slate-400 mb-6">You haven't taken any tests yet. Start with your first test!</p>
              <Button onClick={handleViewAllTests} className="bg-gradient-to-r from-teal-600 to-blue-600">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Tests
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  onClick={() => handleTestClick(attempt.test?._id)}
                  className="group p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-teal-500/50 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-slate-200 truncate group-hover:text-teal-400 transition-colors">
                          {attempt.test?.title || "Untitled Test"}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="capitalize">
                          {attempt.test?.type?.replace("-", " ") || "Test"} • {attempt.test?.subject || "General"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(attempt.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${getPerformanceColor(attempt.score?.percentage || 0)}`}>
                        {(attempt.score?.percentage || 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-400">
                        {attempt.score?.obtained || 0}/{attempt.score?.total || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && recentAttempts.length > 0 && (
          <div className="border-t border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">Showing {recentAttempts.length} recent attempts</div>
              <Button
                onClick={handleViewAllHistory}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                <History className="h-4 w-4 mr-2" />
                View All Attempts History
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
