"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  Bug,
  FileText,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Filter,
  Search,
  ArrowLeft,
  Eye,
  Calendar,
} from "lucide-react"

function FeedbackHistoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("id")

  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    search: "",
  })
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0,
  })

  useEffect(() => {
    fetchFeedbacks()
  }, [filters, pagination.current])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: "10",
      })

      if (filters.type !== "all") params.append("type", filters.type)
      if (filters.status !== "all") params.append("status", filters.status)

      const response = await fetch(`/api/feedback?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data.feedbacks || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "bug":
        return Bug
      case "test-issue":
        return FileText
      case "query":
        return HelpCircle
      default:
        return MessageSquare
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "bug":
        return "text-red-400 bg-red-900/20"
      case "test-issue":
        return "text-yellow-400 bg-yellow-900/20"
      case "query":
        return "text-blue-400 bg-blue-900/20"
      default:
        return "text-slate-400 bg-slate-800/20"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return Clock
      case "in-progress":
        return AlertCircle
      case "resolved":
      case "closed":
        return CheckCircle
      default:
        return Clock
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-yellow-400 bg-yellow-900/20"
      case "in-progress":
        return "text-blue-400 bg-blue-900/20"
      case "resolved":
        return "text-green-400 bg-green-900/20"
      case "closed":
        return "text-slate-400 bg-slate-800/20"
      default:
        return "text-slate-400 bg-slate-800/20"
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const FeedbackCard = ({ feedback }) => {
    const TypeIcon = getTypeIcon(feedback.type)
    const StatusIcon = getStatusIcon(feedback.status)
    const isHighlighted = feedback.feedbackId === highlightId

    return (
      <Card
        variant="primary"
        className={`transition-all duration-200 hover:shadow-lg ${
          isHighlighted ? "ring-2 ring-teal-500 shadow-lg" : ""
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(feedback.type)}`}>
                <TypeIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 mb-1">{feedback.subject}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="capitalize">{feedback.type.replace("-", " ")}</span>
                  <span>•</span>
                  <span>ID: {feedback.feedbackId}</span>
                  {feedback.testName && (
                    <>
                      <span>•</span>
                      <span>{feedback.testName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
              <StatusIcon className="h-3 w-3 inline mr-1" />
              {feedback.status.replace("-", " ")}
            </div>
          </div>

          <p className="text-slate-300 mb-4 line-clamp-2">{feedback.description}</p>

          {feedback.images && feedback.images.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">{feedback.images.length} image(s) attached</span>
            </div>
          )}

          {feedback.adminResponse && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-teal-400">Admin Response</span>
                <span className="text-xs text-slate-500">
                  {new Date(feedback.adminResponse.respondedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-300">{feedback.adminResponse.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{feedback.formattedDate}</span>
              </div>
              <span>{feedback.timeAgo}</span>
            </div>
            {!feedback.isRead && <div className="w-2 h-2 bg-teal-400 rounded-full" />}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Feedback History
              </h1>
              <p className="text-slate-400">Track your submitted feedback and responses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="primary" onClick={() => router.push("/feedback")}>
              Submit New Feedback
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card variant="secondary" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Filters:</span>
              </div>

              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
              >
                <option value="all">All Types</option>
                <option value="bug">Bug Reports</option>
                <option value="test-issue">Test Issues</option>
                <option value="query">Queries</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-10 pr-4 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, current: prev.current - 1 }))}
                  disabled={pagination.current === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-400">
                  Page {pagination.current} of {pagination.total}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, current: prev.current + 1 }))}
                  disabled={pagination.current === pagination.total}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card variant="primary">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No feedback found</h3>
              <p className="text-slate-400 mb-6">You haven't submitted any feedback yet.</p>
              <Button variant="primary" onClick={() => router.push("/feedback")}>
                Submit Your First Feedback
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
        </div>
      </div>
    </div>
  )
}

export default function FeedbackHistoryPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FeedbackHistoryContent />
    </Suspense>
  )
}
