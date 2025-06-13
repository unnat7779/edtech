"use client"

import { Send, Clock, Menu } from "lucide-react"

export default function TestHeader({
  test,
  currentQuestion,
  totalQuestions,
  onSubmit,
  isSubmitting,
  timeLeft,
  toggleMobileSidebar,
}) {
  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="glass border-b border-slate-700/50 shadow-xl">
      <div className="container mx-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-200">{test.title}</h1>
                <p className="text-sm text-slate-400">
                  Question {currentQuestion + 1} of {totalQuestions}
                </p>
              </div>
            </div>
          </div>

          {/* Timer Section - Desktop */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/70 rounded-xl border border-slate-700/50 mr-4">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Time Remaining</span>
              <span
                className={`text-lg font-mono font-bold ${timeLeft < 300 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Submit Button - Desktop */}
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform
              ${
                isSubmitting
                  ? "bg-slate-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 hover:scale-105 hover:shadow-lg"
              }
            `}
            type="button"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                SUBMIT TEST
              </>
            )}
          </button>
        </div>

        {/* Mobile Header - Redesigned for better spacing */}
        <div className="md:hidden">
          {/* Top Row with Test Info and Menu */}
          <div className="flex items-center justify-between p-3 border-b border-slate-700/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-200">{test.title}</h1>
                <p className="text-xs text-slate-400">
                  Question {currentQuestion + 1} of {totalQuestions}
                </p>
              </div>
            </div>

            <button
              onClick={toggleMobileSidebar}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700/50"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          {/* Bottom Row with Timer and Submit */}
          <div className="flex items-center justify-between p-3">
            {/* Timer - Mobile */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/70 rounded-lg border border-slate-700/50">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span
                className={`text-base font-mono font-bold ${timeLeft < 300 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Submit Button - Mobile */}
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`
                flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-300
                ${
                  isSubmitting
                    ? "bg-slate-600 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                }
              `}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  SUBMIT TEST
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
