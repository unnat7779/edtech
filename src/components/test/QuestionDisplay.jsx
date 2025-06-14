"use client"

import { useCallback, useState } from "react"

export default function QuestionDisplay({
  currentQuestion,
  question,
  answers,
  onAnswerSelect,
  onNumericalAnswer,
  isNumerical,
}) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const handleAnswerSelect = useCallback(
    (answerIndex) => {
      onAnswerSelect(currentQuestion, answerIndex)
    },
    [currentQuestion, onAnswerSelect],
  )

  const handleNumericalAnswer = useCallback(
    (value) => {
      onNumericalAnswer(currentQuestion, value)
    },
    [currentQuestion, onNumericalAnswer],
  )

  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc)
    setImageModalOpen(true)
  }

  const closeImageModal = () => {
    setImageModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <div className="space-y-6">
      {/* Question Header with Enhanced Styling */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient-primary">Question {currentQuestion + 1}</span>
            <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Enhanced Question Type and Tags */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`
            px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase
            ${
              isNumerical
                ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30"
            }
            glow-subtle
          `}
          >
            {isNumerical ? "Numerical" : "Multiple Choice"}
          </span>

          {/* Enhanced Subject/Topic Tags */}
          {question.level && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 border border-teal-500/30 text-xs font-medium rounded-full glow-subtle">
              {question.level}
            </span>
          )}

          {question.topic && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30 text-xs font-medium rounded-full glow-subtle">
              {question.topic}
            </span>
          )}

          {question.chapter && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium rounded-full glow-subtle">
              {question.chapter}
            </span>
          )}
        </div>
      </div>

      {/* Question Content with Enhanced Styling */}
      <div className="glass-card rounded-xl p-6 border border-slate-700/30 hover:border-teal-500/30 transition-all duration-300">
        <div className="text-lg leading-relaxed text-slate-200 mb-6">{question.questionText}</div>

        {/* Enhanced Question Image Display */}
        {question.questionImage && (
          <div className="mt-6">
            <div className="relative group max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-xl border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm">
                <img
                  src={question.questionImage || "/placeholder.svg"}
                  alt="Question illustration"
                  className="w-full h-auto max-h-96 object-contain cursor-pointer transition-all duration-300 group-hover:scale-105"
                  onClick={() => openImageModal(question.questionImage)}
                  loading="lazy"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {/* Zoom Indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                    <span className="text-xs text-slate-300 font-medium">Click to expand</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Answer Options with Enhanced Styling */}
      {!isNumerical ? (
        // Enhanced MCQ Questions
        question.options && question.options.length > 0 ? (
          <div className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = answers[currentQuestion]?.selectedAnswer === index
              const optionLetter = String.fromCharCode(65 + index)

              return (
                <label
                  key={index}
                  className={`
                    group relative flex items-start p-5 rounded-xl cursor-pointer transition-all duration-300
                    ${
                      isSelected
                        ? "glass-card-selected border-teal-500/50 shadow-lg shadow-teal-500/20 glow-accent"
                        : "glass-card border-slate-700/30 hover:border-slate-600/50 hover:shadow-lg"
                    }
                    hover:scale-[1.02] transform
                  `}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {/* Custom Radio Button */}
                  <div className="flex-shrink-0 mt-1 mr-4">
                    <div
                      className={`
                      relative w-5 h-5 rounded-full border-2 transition-all duration-300
                      ${
                        isSelected
                          ? "border-teal-500 bg-gradient-to-r from-teal-500 to-blue-500"
                          : "border-slate-500 group-hover:border-slate-400"
                      }
                    `}
                    >
                      {isSelected && <div className="absolute inset-1 bg-white rounded-full animate-scale-in"></div>}
                    </div>
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(index)}
                      className="sr-only"
                    />
                  </div>

                  {/* Option Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <span
                        className={`
                        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300
                        ${
                          isSelected
                            ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg"
                            : "bg-slate-700/50 text-slate-300 group-hover:bg-slate-600/50"
                        }
                      `}
                      >
                        {optionLetter}
                      </span>
                      <div className="flex-1">
                        <span
                          className={`
                          text-base leading-relaxed transition-colors duration-300
                          ${isSelected ? "text-slate-100" : "text-slate-300 group-hover:text-slate-200"}
                        `}
                        >
                          {option.text}
                        </span>

                        {/* Enhanced Option Image Display */}
                        {option.image && (
                          <div className="mt-4">
                            <div className="relative group/option-img max-w-sm">
                              <div className="relative overflow-hidden rounded-lg border border-slate-600/50 bg-slate-800/30">
                                <img
                                  src={option.image || "/placeholder.svg"}
                                  alt={`Option ${optionLetter} illustration`}
                                  className="w-full h-auto max-h-48 object-contain cursor-pointer transition-all duration-300 group-hover/option-img:scale-105"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openImageModal(option.image)
                                  }}
                                  loading="lazy"
                                />

                                {/* Option Image Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover/option-img:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                                {/* Option Zoom Indicator */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover/option-img:opacity-100 transition-opacity duration-300">
                                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-md px-2 py-1">
                                    <svg
                                      className="w-3 h-3 text-slate-300"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center animate-scale-in">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </label>
              )
            })}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-6 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-1">No Options Available</h4>
                <p className="text-yellow-300/80 text-sm">
                  This appears to be an MCQ question but no options are provided.
                </p>
              </div>
            </div>
          </div>
        )
      ) : (
        // Enhanced Numerical Question Input
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-8 border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 glow-accent">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gradient-primary mb-2">Enter Your Numerical Answer</h3>
              <p className="text-slate-400">Provide your answer as a number (integer or decimal)</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="Enter your answer (e.g., 120, 3.14, -5.2)"
                  value={answers[currentQuestion]?.numericalAnswer || ""}
                  onChange={(e) => handleNumericalAnswer(e.target.value)}
                  className="w-full px-6 py-4 text-lg bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 backdrop-blur-sm"
                  autoFocus
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {answers[currentQuestion]?.numericalAnswer && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl animate-slide-up">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-400 font-medium">Answer Recorded</p>
                      <p className="text-green-300/80 text-sm">
                        Your answer: <strong>{answers[currentQuestion].numericalAnswer}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Instructions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card rounded-lg p-4 border border-slate-700/30">
                <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Format Guidelines
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Integers: 42, -15, 0</li>
                  <li>• Decimals: 3.14, -2.5</li>
                  <li>• Scientific: 1.5e-3</li>
                </ul>
              </div>

              <div className="glass-card rounded-lg p-4 border border-slate-700/30">
                <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  Important Notes
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• No units or symbols</li>
                  <li>• Use decimal point (.)</li>
                  <li>• Negative sign if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div className="relative max-w-7xl max-h-[90vh] mx-4">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-800/80 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-sm">Click outside to close • ESC to exit</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
