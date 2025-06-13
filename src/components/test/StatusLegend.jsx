"use client"

import { CheckCircle, Circle, Flag, AlertTriangle } from "lucide-react"

export default function StatusLegend({ test, answers }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "answered":
        return <CheckCircle className="h-3 w-3" />
      case "marked":
        return <Flag className="h-3 w-3" />
      case "answered-marked":
        return <CheckCircle className="h-3 w-3" />
      case "not-answered":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Circle className="h-3 w-3" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "not-visited":
        return "bg-slate-500"
      case "not-answered":
        return "bg-red-500"
      case "answered":
        return "bg-green-500"
      case "marked":
        return "bg-yellow-500"
      case "answered-marked":
        return "bg-blue-500"
      default:
        return "bg-slate-500"
    }
  }

  // Calculate statistics
  const totalQuestions = test?.questions?.length || 0
  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key]?.selectedAnswer !== undefined || answers[key]?.numericalAnswer !== undefined,
  ).length
  const notAnsweredCount = totalQuestions - answeredCount
  const notVisitedCount = test?.questions?.filter((_, index) => !answers[index]).length || 0
  const markedForReviewCount = Object.keys(answers).filter((key) => answers[key]?.markedForReview).length
  const answeredAndMarkedCount = Object.keys(answers).filter(
    (key) =>
      (answers[key]?.selectedAnswer !== undefined || answers[key]?.numericalAnswer !== undefined) &&
      answers[key]?.markedForReview,
  ).length

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <h3 className="font-semibold text-slate-200 mb-3">Status Legend</h3>
      <div className="space-y-2">
        {[
          { status: "not-visited", label: "Not Visited", count: notVisitedCount },
          { status: "not-answered", label: "Not Answered", count: notAnsweredCount },
          { status: "answered", label: "Answered", count: answeredCount },
          { status: "marked", label: "Marked for Review", count: markedForReviewCount },
          { status: "answered-marked", label: "Answered & Marked", count: answeredAndMarkedCount },
        ].map(({ status, label, count }) => (
          <div key={status} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full ${getStatusColor(status)} flex items-center justify-center text-white`}
              >
                {getStatusIcon(status)}
              </div>
              <span className="text-slate-300">{label}</span>
            </div>
            <span className="text-slate-400 font-medium">({count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
