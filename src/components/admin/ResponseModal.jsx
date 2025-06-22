"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/Button"
import { X, Send, MessageSquare, User, BookOpen, Calendar, Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ResponseModal({ isOpen, onClose, onSubmit, session, isSubmitting, error }) {
  const [response, setResponse] = useState("")
  const [responseType, setResponseType] = useState("detailed")
  const [estimatedTime, setEstimatedTime] = useState("30")
  const [includeResources, setIncludeResources] = useState(false)
  const [resourceLinks, setResourceLinks] = useState("")

  useEffect(() => {
    if (isOpen) {
      setResponse("")
      setResponseType("detailed")
      setEstimatedTime("30")
      setIncludeResources(false)
      setResourceLinks("")
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!response.trim()) return

    const responseData = {
      message: response.trim(),
      type: responseType,
      estimatedTime: estimatedTime,
      resources: includeResources ? resourceLinks.split("\n").filter((link) => link.trim()) : [],
      respondedAt: new Date().toISOString(),
    }

    onSubmit(responseData)
  }

  const getQuickResponses = () => {
    const subject = session?.subject?.toLowerCase() || ""
    const responses = {
      physics: [
        "I'll help you understand this physics concept step by step.",
        "Let's break down this problem using fundamental physics principles.",
        "This is a common physics question. Let me explain the approach.",
      ],
      chemistry: [
        "Let's work through this chemistry problem together.",
        "I'll explain the chemical concepts involved in this question.",
        "This requires understanding of chemical reactions and principles.",
      ],
      mathematics: [
        "Let me guide you through this mathematical solution.",
        "We'll solve this step-by-step using mathematical principles.",
        "This is a good math problem. Let's approach it systematically.",
      ],
      biology: [
        "I'll help you understand this biological concept clearly.",
        "Let's explore this biology topic in detail.",
        "This involves important biological processes. Let me explain.",
      ],
      default: [
        "Thank you for your question. I'll help you understand this concept.",
        "Let me provide a detailed explanation for your doubt.",
        "I'll guide you through this problem step by step.",
      ],
    }

    return responses[subject] || responses.default
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPreferredTime = (timeSlot) => {
    if (!timeSlot) return "Not specified"
    const { date, time } = timeSlot
    if (!date) return "Not specified"

    try {
      const sessionDate = new Date(date)
      const dateStr = sessionDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      return `${dateStr}${time ? ` at ${time}` : ""}`
    } catch (error) {
      return "Invalid date"
    }
  }

  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Respond to Doubt Session</h2>
                <p className="text-sm text-slate-400">Provide a detailed response to the student's question</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Session Details Sidebar */}
          <div className="lg:w-1/3 p-6 border-r border-slate-700 bg-slate-800/30 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-purple-400" />
              Session Details
            </h3>

            <div className="space-y-4">
              {/* Student Info */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {session.studentName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="font-medium text-white">{session.studentName || "Unknown Student"}</div>
                    <div className="text-sm text-slate-400">{session.studentEmail || "No email"}</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subject:</span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      {session.subject || "General"}
                    </Badge>
                  </div>
                  {session.topic && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Topic:</span>
                      <span className="text-slate-300">{session.topic}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-slate-300">{formatDate(session.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Preferred Time:</span>
                    <span className="text-slate-300">{formatPreferredTime(session.preferredTimeSlot)}</span>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-400" />
                  Question
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {session.description || "No description provided"}
                </p>
              </div>

              {/* Question Image */}
              {session.questionImage && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Attached Image</h4>
                  <img
                    src={session.questionImage || "/placeholder.svg"}
                    alt="Question"
                    className="w-full h-auto rounded-lg border border-slate-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Response Form */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quick Response Templates */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Quick Response Templates</label>
                <div className="grid grid-cols-1 gap-2">
                  {getQuickResponses().map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setResponse(template)}
                      className="text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-sm text-slate-300 hover:text-white transition-colors border border-slate-600/30 hover:border-slate-500"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Response Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "quick", label: "Quick Answer", icon: Clock },
                    { value: "detailed", label: "Detailed Explanation", icon: MessageSquare },
                    { value: "scheduled", label: "Schedule Session", icon: Calendar },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setResponseType(value)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        responseType === value
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                          : "bg-slate-700/30 text-slate-400 border-slate-600/30 hover:bg-slate-700/50 hover:text-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4 mx-auto mb-1" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Message */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Response Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your detailed response to help the student understand the concept..."
                  rows={8}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-400">{response.length}/1000 characters</span>
                  {response.length > 1000 && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Too long
                    </span>
                  )}
                </div>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Estimated Session Duration (minutes)
                </label>
                <select
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                </select>
              </div>

              {/* Additional Resources */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="includeResources"
                    checked={includeResources}
                    onChange={(e) => setIncludeResources(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeResources" className="text-sm font-medium text-slate-300">
                    Include Additional Resources
                  </label>
                </div>

                {includeResources && (
                  <textarea
                    value={resourceLinks}
                    onChange={(e) => setResourceLinks(e.target.value)}
                    placeholder="Add helpful links, references, or additional resources (one per line)..."
                    rows={4}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="text-slate-300 border-slate-600 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !response.trim() || response.length > 1000}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Response
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
