"use client"

import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import FeedbackCard from "./FeedbackCard"
import { MessageSquare } from "lucide-react"

export default function FeedbackList({
  feedbacks,
  loading,
  pagination,
  setPagination,
  selectedFeedback,
  setSelectedFeedback,
  submitting,
  onReply,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <Card variant="primary">
        <CardContent className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No feedback found</h3>
          <p className="text-slate-400">No feedback matches your current filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {feedbacks.map((feedback) => (
        <FeedbackCard
          key={feedback.id}
          feedback={feedback}
          isSelected={selectedFeedback?.id === feedback.id}
          onSelect={() => setSelectedFeedback(feedback)}
          onCancel={() => setSelectedFeedback(null)}
          submitting={submitting}
          onReply={onReply}
        />
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
          <span className="text-sm text-slate-400 px-4">
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
  )
}
