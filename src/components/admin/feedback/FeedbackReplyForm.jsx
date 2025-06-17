"use client"

import { useState, useRef, useEffect } from "react"
import Button from "@/components/ui/Button"
import { Send, X, RefreshCw, CheckCircle } from "lucide-react"

export default function FeedbackReplyForm({ feedbackId, submitting, onReply, onCancel }) {
  const [formData, setFormData] = useState({
    message: "",
    status: "",
    priority: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const textareaRef = useRef(null)

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !showSuccess) {
      textareaRef.current.focus()
    }
  }, [showSuccess])

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.message.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const success = await onReply(feedbackId, formData)
      if (success) {
        // Show success message
        setShowSuccess(true)

        // Reset form data
        setFormData({
          message: "",
          status: "",
          priority: "",
        })

        // Auto-close after showing success message
        setTimeout(() => {
          setShowSuccess(false)
          onCancel() // This will close the card
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle textarea change with proper cursor management
  const handleMessageChange = (e) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart

    setFormData((prev) => ({
      ...prev,
      message: value,
    }))

    // Restore cursor position after state update
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition)
      }
    })
  }

  // Handle status change
  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value,
    }))
  }

  // Handle priority change
  const handlePriorityChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      priority: e.target.value,
    }))
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      message: "",
      status: "",
      priority: "",
    })
    setShowSuccess(false)
    onCancel()
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (showSuccess) return // Disable shortcuts during success state

    if (e.key === "Escape") {
      handleCancel()
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isDisabled = submitting || isSubmitting || showSuccess

  // Success state display
  if (showSuccess) {
    return (
      <div className="border-t border-slate-700 pt-6 mt-6">
        <div className="text-center py-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-green-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-green-400 mb-3">Reply Sent Successfully!</h3>
          <p className="text-slate-400 mb-2">The student will be notified of your response.</p>
          <p className="text-sm text-slate-500">This card will close automatically...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-slate-700 pt-6 mt-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Reply Message
            <span className="text-xs text-slate-500 ml-2">(Ctrl+Enter to send, Esc to cancel)</span>
          </label>
          <textarea
            ref={textareaRef}
            value={formData.message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-vertical transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Type your response to the student..."
            disabled={isDisabled}
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-500">{formData.message.length}/2000 characters</span>
            {formData.message.length > 1900 && (
              <span className="text-xs text-yellow-400">{2000 - formData.message.length} characters remaining</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Update Status</label>
            <select
              value={formData.status}
              onChange={handleStatusChange}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDisabled}
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
              value={formData.priority}
              onChange={handlePriorityChange}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDisabled}
            >
              <option value="">Keep current priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.message.trim() || isDisabled}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending Reply...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleCancel} className="px-6" disabled={isDisabled}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
