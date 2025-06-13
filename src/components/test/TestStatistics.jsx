"use client"

import { Target } from "lucide-react"

export default function TestStatistics({ test, answers }) {
  const totalQuestions = test?.questions?.length || 0
  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key]?.selectedAnswer !== undefined || answers[key]?.numericalAnswer !== undefined,
  ).length

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Target className="h-5 w-5 text-teal-400" />
        <h3 className="font-semibold text-slate-200">Progress Overview</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="text-2xl font-bold text-teal-400">{totalQuestions}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{answeredCount}</div>
          <div className="text-xs text-slate-400">Answered</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
        <div
          className="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-400 text-center">
        {totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}% Complete
      </p>
    </div>
  )
}
