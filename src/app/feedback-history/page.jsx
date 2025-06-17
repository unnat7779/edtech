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
  MessageSquare,
  Filter,
  Search,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  GraduationCap,
  ImageIcon,
  Eye,
  Reply,
  CheckCircle2,
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
        return <Bug className="h-5 w-5 text-red-400" />
      case "test-issue":
        return <FileText className="h-5 w-5 text-blue-400" />
      case "query":
        return <HelpCircle className="h-5 w-5 text-green-400" />
      default:
        return <MessageSquare className="h-5 w-5 text-slate-400" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "bug":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "test-issue":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "query":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "in-progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "closed":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    let timeAgo
    if (diffDays > 0) timeAgo = `${diffDays}d ago`
    else if (diffHours > 0) timeAgo = `${diffHours}h ago`
    else if (diffMins > 0) timeAgo = `${diffMins}m ago`
    else timeAgo = "Just now"

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    return {
      date: formattedDate,
      time: formattedTime,
      timeAgo,
      full: `${formattedDate} at ${formattedTime}`,
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const FeedbackCard = ({ feedback }) => {
    const isHighlighted = feedback.feedbackId === highlightId
    const dateTime = formatDateTime(feedback.createdAt)
    const adminResponseDateTime = feedback.adminResponse ? formatDateTime(feedback.adminResponse.respondedAt) : null

    return (
      <Card
        variant="primary"
        className={`transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 ${
          isHighlighted ? "ring-2 ring-teal-500 shadow-lg shadow-teal-500/20" : ""
        }`}
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2 sm:p-3 rounded-lg border ${getTypeColor(feedback.type)} flex-shrink-0`}>
                {getTypeIcon(feedback.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-slate-100 text-lg sm:text-xl mb-2 break-words"
                  title={feedback.subject}
                >
                  {feedback.subject}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="capitalize font-medium text-slate-300">{feedback.type.replace("-", " ")}</span>
                    <span>•</span>
                    <span className="font-mono text-xs">ID: {feedback.feedbackId}</span>
                  </div>
                  {feedback.testName && (
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <span>Test: {feedback.testName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {feedback.priority && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(feedback.priority)}`}
                >
                  {feedback.priority}
                </span>
              )}
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(
                  feedback.status,
                )}`}
              >
                <Clock className="h-3 w-3" />
                {feedback.status.replace("-", " ")}
              </span>
            </div>
          </div>

          {/* Student Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium">{feedback.student?.name || "You"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mail className="h-4 w-4" />
              <span>{feedback.student?.email || "Your email"}</span>
            </div>
            {feedback.student?.class && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <GraduationCap className="h-4 w-4" />
                <span>Class {feedback.student.class}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words">{feedback.description}</p>
            </div>

            {/* Images */}
            {feedback.images && feedback.images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <ImageIcon className="h-4 w-4" />
                  <span>{feedback.images.length} attachment(s)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {feedback.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-600 hover:border-teal-500 transition-colors"
                      onClick={() => window.open(image.url, "_blank")}
                    >
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={`Feedback attachment ${index + 1}`}
                        className="w-full h-20 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Response */}
            {feedback.adminResponse && (
              <div className="border-l-4 border-teal-500 bg-slate-800/50 p-4 rounded-r-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-teal-400" />
                    <span className="text-sm font-medium text-teal-400">Admin Response</span>
                  </div>
                  <div className="text-xs text-slate-500">{adminResponseDateTime?.full}</div>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                  {feedback.adminResponse.message}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 mt-4 border-t border-slate-700/50 gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>{dateTime.full}</span>
              <span>•</span>
              <span>{dateTime.timeAgo}</span>
            </div>
            <div className="flex items-center gap-2">
              {feedback.adminResponse ? (
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Responded</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Pending Response</span>
                </div>
              )}
              {!feedback.isRead && <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Feedback History
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">Track your submitted feedback and responses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="text-sm">
              Dashboard
            </Button>
            <Button variant="primary" onClick={() => router.push("/feedback")} className="text-sm">
              Submit New Feedback
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card variant="secondary" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Filters:</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Types</option>
                  <option value="bug">Bug Reports</option>
                  <option value="test-issue">Test Issues</option>
                  <option value="query">Queries</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 focus:ring-2 focus:ring-teal-500"
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
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
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
          <div className="space-y-6">
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
