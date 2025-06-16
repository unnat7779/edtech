"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/Button"
import { X, Search, Filter, MessageSquare, RefreshCw } from "lucide-react"
import FeedbackCard from "./FeedbackCard"

export default function FeedbackHistoryModal({ isOpen, onClose }) {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
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
    if (isOpen) {
      fetchFeedbackHistory()
    }
  }, [isOpen, filters, pagination.current])

  const fetchFeedbackHistory = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: "10",
        includeResolved: "true",
      })

      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "all") {
          params.append(key, filters[key])
        }
      })

      const response = await fetch(`/api/admin/feedbacks/history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data.feedbacks || [])
        setPagination(data.pagination || { current: 1, total: 1, totalItems: 0 })
      }
    } catch (error) {
      console.error("Error fetching feedback history:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] mx-4 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Feedback History
            </h2>
            <p className="text-slate-400 mt-1">Complete history of all feedback and responses</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
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

            <Button variant="outline" size="sm" onClick={fetchFeedbackHistory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} isHistoryView={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No feedback history found</h3>
              <p className="text-slate-400">No feedback matches your current filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-700 bg-slate-800/50">
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
    </div>
  )
}
