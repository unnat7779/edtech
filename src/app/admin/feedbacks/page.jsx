"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FeedbackHeader from "@/components/admin/feedback/FeedbackHeader"
import FeedbackStatistics from "@/components/admin/feedback/FeedbackStatistics"
import FeedbackFilters from "@/components/admin/feedback/FeedbackFilters"
import FeedbackList from "@/components/admin/feedback/FeedbackList"
import SuccessNotification from "@/components/admin/feedback/SuccessNotification"
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
  const [submitting, setSubmitting] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [successNotification, setSuccessNotification] = useState(null)

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

  const handleReply = async (feedbackId, replyData) => {
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
        // Show success notification
        const feedback = feedbacks.find((f) => f.id === feedbackId)
        setSuccessNotification({
          id: Date.now(),
          studentName: feedback?.student?.name || "Student",
          feedbackTitle: feedback?.subject || "Feedback",
        })

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

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setSuccessNotification(null)
        }, 5000)

        // Refresh statistics
        setTimeout(() => {
          fetchFeedbacks()
        }, 1000)

        return true
      }
      return false
    } catch (error) {
      console.error("Error sending reply:", error)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseReply = () => {
    setSelectedFeedback(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
      <div className="max-w-7xl mx-auto p-6">
        <FeedbackHeader router={router} onShowHistory={() => setShowHistoryModal(true)} />

        <FeedbackStatistics statistics={statistics} />

        <FeedbackFilters
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onRefresh={fetchFeedbacks}
        />

        <FeedbackList
          feedbacks={feedbacks}
          loading={loading}
          pagination={pagination}
          setPagination={setPagination}
          selectedFeedback={selectedFeedback}
          setSelectedFeedback={setSelectedFeedback}
          submitting={submitting}
          onReply={handleReply}
          onCloseReply={handleCloseReply}
        />
      </div>

      <SuccessNotification notification={successNotification} onClose={() => setSuccessNotification(null)} />

      <FeedbackHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
    </div>
  )
}
