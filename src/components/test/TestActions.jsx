"use client"

import { Save, Flag, RotateCcw, ChevronLeft, ChevronRight, BookmarkPlus } from "lucide-react"

export default function TestActions({
  onSaveAndNext,
  onMarkForReview,
  onClearResponse,
  onBack,
  onNext,
  currentQuestion,
  totalQuestions,
}) {
  return (
    <div className="space-y-6">
      {/* Primary Action Buttons - Desktop */}
      <div className="hidden md:flex flex-wrap gap-3">
        <button
          onClick={onSaveAndNext}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:shadow-teal-900/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          SAVE & NEXT
        </button>

        <button
          onClick={onMarkForReview}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:shadow-yellow-900/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Flag className="h-4 w-4" />
          SAVE & MARK FOR REVIEW
        </button>

        <button
          onClick={onClearResponse}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          CLEAR RESPONSE
        </button>

        <button
          onClick={onMarkForReview}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:shadow-blue-900/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <BookmarkPlus className="h-4 w-4" />
          MARK FOR REVIEW & NEXT
        </button>
      </div>

      {/* Primary Action Buttons - Mobile (Stacked) */}
      <div className="md:hidden space-y-2">
        <button
          onClick={onSaveAndNext}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium px-4 py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          SAVE & NEXT
        </button>

        <button
          onClick={onMarkForReview}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium px-4 py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
        >
          <Flag className="h-4 w-4" />
          SAVE & MARK FOR REVIEW
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onClearResponse}
            className="bg-slate-700 text-slate-200 font-medium px-3 py-2.5 rounded-lg shadow-md flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            CLEAR
          </button>

          <button
            onClick={onMarkForReview}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-3 py-2.5 rounded-lg shadow-md flex items-center justify-center gap-1.5"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            MARK & NEXT
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
        {/* Previous Button */}
        <button
          onClick={onBack}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300
            ${
              currentQuestion === 0
                ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transform hover:scale-105 shadow-md hover:shadow-lg"
            }
          `}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">PREVIOUS</span>
          <span className="sm:hidden">PREV</span>
        </button>

        {/* Question Counter */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/70 rounded-lg border border-slate-700/50">
          <span className="text-sm text-slate-400">Question</span>
          <span className="text-lg font-bold text-teal-400">{currentQuestion + 1}</span>
          <span className="text-sm text-slate-400">of</span>
          <span className="text-lg font-bold text-slate-300">{totalQuestions}</span>
        </div>

        {/* Mobile Question Counter */}
        <div className="sm:hidden flex items-center justify-center bg-slate-800/70 rounded-lg border border-slate-700/50 px-3 py-1.5">
          <span className="text-base font-bold text-teal-400">{currentQuestion + 1}</span>
          <span className="text-xs text-slate-400 mx-1">of</span>
          <span className="text-base font-bold text-slate-300">{totalQuestions}</span>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300
            ${
              currentQuestion === totalQuestions - 1
                ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transform hover:scale-105 shadow-md hover:shadow-lg"
            }
          `}
          disabled={currentQuestion === totalQuestions - 1}
        >
          <span className="hidden sm:inline">NEXT</span>
          <span className="sm:hidden">NEXT</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
