"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Send,
  Eye,
  User,
  Calendar,
  RefreshCw,
  Home,
  History,
  BarChart3,
} from "lucide-react"
import FeedbackHistoryModal from "@/components/feedback/FeedbackHistoryModal"

export default function AdminFeedbacksPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({})
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    priority: "all",
    search: "",
  })
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0,
  })
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [replyData, setReplyData] = useState({
    message: "",
    status: "",
    priority: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  useEffect(() => {
    fetchFeedbacks()
  }, [filters, pagination.current])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: "20",
      })

      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "all") {
          params.append(key, filters[key])
        }
      })

      const response = await fetch(`/api/admin/feedbacks?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data.feedbacks || [])
        setPagination(data.pagination)
        setStatistics(data.statistics || {})
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (feedbackId) => {
    if (!replyData.message.trim()) return

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/feedbacks/${feedbackId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(replyData),
      })

      if (response.ok) {
        // Update local state
        setFeedbacks((prev) =>
          prev.map((feedback) =>
            feedback.id === feedbackId
              ? {
                  ...feedback,
                  status: replyData.status || feedback.status,
                  priority: replyData.priority || feedback.priority,
                  adminResponse: {
                    message: replyData.message,
                    respondedAt: new Date().toISOString(),
                    respondedBy: { name: "Admin" },
                  },
                }
              : feedback,
          ),
        )

        // Reset reply form
        setReplyData({ message: "", status: "", priority: "" })
        setSelectedFeedback(null)

        // Refresh statistics
        fetchFeedbacks()
      }
    } catch (error) {
      console.error("Error sending reply:", error)
    } finally {
      setSubmitting(false)
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
        return "text-red-400 bg-red-900/20 border-red-800"
      case "test-issue":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-800"
      case "query":
        return "text-blue-400 bg-blue-900/20 border-blue-800"
      default:
        return "text-slate-400 bg-slate-800/20 border-slate-700"
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-400 bg-red-900/20"
      case "high":
        return "text-orange-400 bg-orange-900/20"
      case "medium":
        return "text-yellow-400 bg-yellow-900/20"
      case "low":
        return "text-green-400 bg-green-900/20"
      default:
        return "text-slate-400 bg-slate-800/20"
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card variant="secondary">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )

  const FeedbackCard = ({ feedback }) => {
    const TypeIcon = getTypeIcon(feedback.type)
    const isSelected = selectedFeedback?.id === feedback.id

    return (
      <Card variant="primary" className={`transition-all duration-200 ${isSelected ? "ring-2 ring-teal-500" : ""}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${getTypeColor(feedback.type)}`}>
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
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                {feedback.priority}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(feedback.status)}`}>
                {feedback.status.replace("-", " ")}
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="flex items-center gap-2 mb-3 text-sm text-slate-400">
            <User className="h-4 w-4" />
            <span>{feedback.student?.name}</span>
            <span>•</span>
            <span>{feedback.student?.email}</span>
            {feedback.student?.class && (
              <>
                <span>•</span>
                <span>Class {feedback.student.class}</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-300 mb-4">{feedback.description}</p>

          {/* Images */}
          {feedback.images && feedback.images.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">{feedback.images.length} image(s) attached</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {feedback.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url || "/placeholder.svg"}
                    alt={`Feedback image ${index + 1}`}
                    className="w-full h-20 object-cover rounded border border-slate-700 cursor-pointer hover:opacity-80"
                    onClick={() => window.open(image.url, "_blank")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Existing Admin Response */}
          {feedback.adminResponse && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-teal-400">Previous Response</span>
                <span className="text-xs text-slate-500">
                  {new Date(feedback.adminResponse.respondedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-300">{feedback.adminResponse.message}</p>
            </div>
          )}

          {/* Reply Section */}
          {isSelected ? (
            <div className="border-t border-slate-700 pt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reply Message</label>
                  <textarea
                    value={replyData.message}
                    onChange={(e) => setReplyData((prev) => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-teal-500 focus:outline-none resize-vertical"
                    placeholder="Type your response to the student..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Update Status</label>
                    <select
                      value={replyData.status}
                      onChange={(e) => setReplyData((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                    >
                      <option value="">Keep current status</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Update Priority</label>
                    <select
                      value={replyData.priority}
                      onChange={(e) => setReplyData((prev) => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                    >
                      <option value="">Keep current priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleReply(feedback.id)}
                    disabled={!replyData.message.trim() || submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFeedback(null)
                      setReplyData({ message: "", status: "", priority: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{feedback.formattedDate}</span>
                </div>
                <span>{feedback.timeAgo}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedFeedback(feedback)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Feedback Management
              </h1>
              <p className="text-slate-400">Manage and respond to student feedback</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/analytics")}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total" value={statistics.total || 0} icon={MessageSquare} color="text-slate-400" />
          <StatCard title="Open" value={statistics.open || 0} icon={Clock} color="text-yellow-400" />
          <StatCard title="In Progress" value={statistics.inProgress || 0} icon={AlertCircle} color="text-blue-400" />
          <StatCard title="Resolved" value={statistics.resolved || 0} icon={CheckCircle} color="text-green-400" />
          <StatCard title="Bugs" value={statistics.bugs || 0} icon={Bug} color="text-red-400" />
          <StatCard title="Urgent" value={statistics.urgent || 0} icon={AlertCircle} color="text-red-400" />
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
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
              >
                <option value="all">All Types</option>
                <option value="bug">Bug Reports</option>
                <option value="test-issue">Test Issues</option>
                <option value="query">Queries</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-400"
                  />
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={fetchFeedbacks}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
                  Page {pagination.current} of {pagination.total} ({pagination.totalItems} total)
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
              <p className="text-slate-400">No feedback matches your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feedback History Modal */}
      <FeedbackHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
    </div>
  )
}
