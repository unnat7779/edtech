"use client"

import { Card, CardContent } from "@/components/ui/Card"
import {
  Bug,
  FileText,
  HelpCircle,
  MessageSquare,
  User,
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"

export default function FeedbackCard({ feedback, isHistoryView = false, onClick }) {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return Clock
      case "in-progress":
        return AlertCircle
      case "resolved":
        return CheckCircle
      case "closed":
        return XCircle
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

  const TypeIcon = getTypeIcon(feedback.type)
  const StatusIcon = getStatusIcon(feedback.status)

  return (
    <Card
      variant="primary"
      className={`transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/10 ${
        onClick ? "cursor-pointer hover:border-teal-500/50" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${getTypeColor(feedback.type)}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 text-sm mb-1">{feedback.subject}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
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
            <div
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(feedback.status)}`}
            >
              <StatusIcon className="h-3 w-3" />
              {feedback.status.replace("-", " ")}
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
          <User className="h-3 w-3" />
          <span>{feedback.student?.name || "Unknown Student"}</span>
          <span>•</span>
          <span>{feedback.student?.email || "No email"}</span>
          {feedback.student?.class && (
            <>
              <span>•</span>
              <span>Class {feedback.student.class}</span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm mb-3 line-clamp-2">{feedback.description}</p>

        {/* Images */}
        {feedback.images && feedback.images.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">{feedback.images.length} image(s)</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {feedback.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image.url || "/placeholder.svg"}
                  alt={`Feedback image ${index + 1}`}
                  className="w-full h-12 object-cover rounded border border-slate-700 cursor-pointer hover:opacity-80"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(image.url, "_blank")
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Admin Response */}
        {feedback.adminResponse && (
          <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-3 w-3 text-teal-400" />
              <span className="text-xs font-medium text-teal-400">Admin Response</span>
              <span className="text-xs text-slate-500">
                {new Date(feedback.adminResponse.respondedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">{feedback.adminResponse.message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>{feedback.formattedDate || new Date(feedback.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{feedback.timeAgo || "Recently"}</span>
          </div>
          {!feedback.adminResponse && !isHistoryView && (
            <div className="text-xs text-yellow-400 font-medium">Needs Response</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
