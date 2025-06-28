"use client"
import { X, BookOpen, Clock, Target, Users, Star, CheckCircle, AlertCircle, Info } from "lucide-react"
import Button from "@/components/ui/Button"

export default function SyllabusModal({ test, isOpen, onClose }) {
  if (!isOpen || !test) return null

  const formatAttempts = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count?.toString() || "0"
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl my-4">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-600/20 to-blue-600/20 border-b border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10"></div>
          <div className="relative flex items-center justify-between p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{test.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-slate-300">4.8</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                  <span className="text-sm text-slate-400">Test Syllabus & Details</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <X className="h-6 w-6 text-slate-400 hover:text-slate-200" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Test Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/20 rounded-xl p-4 text-center group hover:from-teal-500/15 hover:to-teal-600/10 transition-all duration-300">
              <div className="p-2 bg-teal-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-teal-500/30 transition-colors">
                <Clock className="h-5 w-5 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-teal-400 mb-1">{test.duration || 0}</div>
              <div className="text-xs text-slate-400 font-medium">Minutes</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 text-center group hover:from-blue-500/15 hover:to-blue-600/10 transition-all duration-300">
              <div className="p-2 bg-blue-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-blue-500/30 transition-colors">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">{test.totalMarks || 0}</div>
              <div className="text-xs text-slate-400 font-medium">Total Marks</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 text-center group hover:from-purple-500/15 hover:to-purple-600/10 transition-all duration-300">
              <div className="p-2 bg-purple-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
                <BookOpen className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-1">{test.questions?.length || 0}</div>
              <div className="text-xs text-slate-400 font-medium">Questions</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 text-center group hover:from-green-500/15 hover:to-green-600/10 transition-all duration-300">
              <div className="p-2 bg-green-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-green-500/30 transition-colors">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">{formatAttempts(1200)}</div>
              <div className="text-xs text-slate-400 font-medium">Attempts</div>
            </div>
          </div>

          {/* Test Details */}
          <div className="space-y-8">
            {/* Test Information */}
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-teal-400 to-blue-400 rounded-full"></div>
                Test Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 hover:bg-slate-700/40 transition-colors">
                  <div className="text-sm text-slate-400 mb-2 font-medium">Test Type</div>
                  <div className="text-lg font-semibold text-slate-100">
                    {test.type?.replace("-", " ") || "General Test"}
                  </div>
                </div>
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 hover:bg-slate-700/40 transition-colors">
                  <div className="text-sm text-slate-400 mb-2 font-medium">Subject</div>
                  <div className="text-lg font-semibold text-slate-100">{test.subject}</div>
                </div>
                {test.class && (
                  <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 hover:bg-slate-700/40 transition-colors">
                    <div className="text-sm text-slate-400 mb-2 font-medium">Class</div>
                    <div className="text-lg font-semibold text-slate-100">Class {test.class}</div>
                  </div>
                )}
                {test.chapter && (
                  <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 hover:bg-slate-700/40 transition-colors">
                    <div className="text-sm text-slate-400 mb-2 font-medium">Chapter</div>
                    <div className="text-lg font-semibold text-slate-100">{test.chapter}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Syllabus/Description */}
            {test.description && (
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-teal-400 to-blue-400 rounded-full"></div>
                  Syllabus & Topics Covered
                </h3>
                <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/50 rounded-xl p-6">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-base">{test.description}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-teal-400 to-blue-400 rounded-full"></div>
                Test Instructions
              </h3>
              <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/50 rounded-xl p-6">
                <div className="space-y-4">
                  {[
                    {
                      icon: CheckCircle,
                      text: "Read all questions carefully before attempting",
                      color: "text-green-400",
                    },
                    {
                      icon: Info,
                      text: "You can navigate between questions using the question palette",
                      color: "text-blue-400",
                    },
                    {
                      icon: CheckCircle,
                      text: "Your progress is automatically saved every 30 seconds",
                      color: "text-teal-400",
                    },
                    {
                      icon: AlertCircle,
                      text: "Submit the test before time runs out to save your answers",
                      color: "text-yellow-400",
                    },
                    {
                      icon: AlertCircle,
                      text: "Negative marking may apply - check individual question details",
                      color: "text-red-400",
                    },
                  ].map((instruction, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors border border-slate-700/30"
                    >
                      <instruction.icon className={`h-5 w-5 ${instruction.color} mt-0.5 flex-shrink-0`} />
                      <span className="text-slate-300 text-sm leading-relaxed">{instruction.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Footer Info */}
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span>Ready to start your test</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
              <span className="hidden sm:inline">Good luck!</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 bg-transparent px-8 py-3 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                variant="primary"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-8 py-3 shadow-lg hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                Start Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
