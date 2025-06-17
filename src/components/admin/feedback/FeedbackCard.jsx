"use client"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import FeedbackReplyForm from "./FeedbackReplyForm"
import {
  Bug,
  FileText,
  HelpCircle,
  MessageSquare,
  Eye,
  User,
  Calendar,
  Clock,
  Mail,
  GraduationCap,
  ImageIcon,
} from "lucide-react"

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

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))

  let relativeTime
  if (diffInMinutes < 1) {
    relativeTime = "Just now"
  } else if (diffInMinutes < 60) {
    relativeTime = `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    relativeTime = `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    relativeTime = `${days} day${days > 1 ? "s" : ""} ago`
  }

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
    full: `${formattedDate} at ${formattedTime}`,
    relative: relativeTime,
    date: formattedDate,
    time: formattedTime,
  }
}

export default function FeedbackCard({ feedback, isSelected, onSelect, onCancel, submitting, onReply }) {
  const TypeIcon = getTypeIcon(feedback.type)
  const dateTime = formatDateTime(feedback.createdAt || feedback.submittedAt || new Date())
  const adminResponseDateTime = feedback.adminResponse?.respondedAt
    ? formatDateTime(feedback.adminResponse.respondedAt)
    : null

  return (
    <Card
      variant="primary"
      className={`transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-teal-500 shadow-xl shadow-teal-500/20 scale-[1.01]"
          : "hover:shadow-lg hover:shadow-slate-900/20"
      }`}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-700/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2.5 rounded-lg border ${getTypeColor(feedback.type)} flex-shrink-0`}>
                <TypeIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-slate-200 mb-2 break-words leading-tight text-lg"
                  title={feedback.subject}
                >
                  {feedback.subject}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="capitalize bg-slate-800/50 px-2.5 py-1 rounded-full text-xs font-medium text-slate-300 border border-slate-700/50">
                    {feedback.type.replace("-", " ")}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-xs text-slate-400 bg-slate-800/30 px-2 py-0.5 rounded">
                    ID: {feedback.feedbackId}
                  </span>
                  {feedback.testName && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span
                        className="text-xs text-slate-400 bg-slate-800/30 px-2 py-0.5 rounded truncate max-w-32"
                        title={feedback.testName}
                      >
                        {feedback.testName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getPriorityColor(feedback.priority)}`}
              >
                {feedback.priority}
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(feedback.status)}`}>
                {feedback.status.replace("-", " ")}
              </div>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="px-4 sm:px-6 py-4 bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/50 rounded-full">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">{feedback.student?.name}</span>
              </div>
              <span className="text-slate-500">•</span>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-300">{feedback.student?.email}</span>
              </div>
              {feedback.student?.class && (
                <>
                  <span className="text-slate-500">•</span>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                    <span className="bg-slate-700/50 px-2 py-0.5 rounded text-xs text-slate-300">
                      Class {feedback.student.class}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4">
          <div className="mb-4">
            <p className="text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{feedback.description}</p>
          </div>

          {/* Images */}
          {feedback.images && feedback.images.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400 font-medium">
                  {feedback.images.length} attachment{feedback.images.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {feedback.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Feedback image ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(image.url, "_blank")}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Response */}
          {feedback.adminResponse && (
            <div className="bg-gradient-to-r from-teal-900/20 to-blue-900/20 rounded-lg p-4 mb-4 border border-teal-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-medium text-teal-400">Admin Response</span>
                </div>
                {adminResponseDateTime && <div className="text-xs text-slate-500">{adminResponseDateTime.full}</div>}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                {feedback.adminResponse.message}
              </p>
            </div>
          )}
        </div>

        {/* Reply Section */}
        {isSelected ? (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <FeedbackReplyForm feedbackId={feedback.id} submitting={submitting} onReply={onReply} onCancel={onCancel} />
          </div>
        ) : (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-700/50 bg-slate-800/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{dateTime.date}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{dateTime.time}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="text-slate-500">{dateTime.relative}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onSelect}
                className="hover:bg-teal-500/10 hover:border-teal-500/50 self-end sm:self-auto"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
