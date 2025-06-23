"use client"

import { useMemo, useEffect } from "react"
import { BookOpen, Atom, Calculator, CheckCircle } from "lucide-react"

export default function QuestionPalette({
  test,
  answers,
  currentQuestion,
  onQuestionNavigation,
  isNumericalQuestion,
  activeSubject,
  setActiveSubject,
}) {
  // Define only Physics, Chemistry, and Mathematics subjects (removed "all")
  const subjects = [
    { id: "physics", name: "Physics", icon: <Atom className="w-4 h-4" /> },
    { id: "chemistry", name: "Chemistry", icon: <BookOpen className="w-4 h-4" /> },
    { id: "mathematics", name: "Mathematics", icon: <Calculator className="w-4 h-4" /> },
  ]

  // Set default active subject if not set or invalid
  useEffect(() => {
    if (!activeSubject || !subjects.find((s) => s.id === activeSubject)) {
      setActiveSubject("physics")
    }
  }, [activeSubject, setActiveSubject])

  // Group questions by subject with enhanced logic
  const questionsBySubject = useMemo(() => {
    if (!test?.questions) {
      return {
        physics: [],
        chemistry: [],
        mathematics: [],
      }
    }

    const grouped = {
      physics: [],
      chemistry: [],
      mathematics: [],
    }

    test.questions.forEach((question, index) => {
      // Enhanced subject detection logic
      let subject = null

      // Check various properties where subject might be stored
      if (question.subject) {
        subject = question.subject.toLowerCase()
      } else if (question.tags && Array.isArray(question.tags)) {
        const subjectTag = question.tags.find((tag) =>
          ["physics", "chemistry", "mathematics", "maths"].includes(tag.toLowerCase()),
        )
        if (subjectTag) {
          subject = subjectTag.toLowerCase()
        }
      } else if (question.topic) {
        const topicLower = question.topic.toLowerCase()
        if (["physics", "chemistry", "mathematics", "maths"].includes(topicLower)) {
          subject = topicLower
        }
      }

      // Map "maths" to "mathematics" for consistency
      if (subject === "maths") {
        subject = "mathematics"
      }

      // Add to appropriate subject array
      if (subject === "physics") {
        grouped.physics.push(index)
      } else if (subject === "chemistry") {
        grouped.chemistry.push(index)
      } else if (subject === "mathematics") {
        grouped.mathematics.push(index)
      } else {
        // If no subject detected, try to distribute evenly or assign to mathematics as default
        // For now, assign to mathematics as fallback
        grouped.mathematics.push(index)
      }
    })

    return grouped
  }, [test?.questions])

  // Calculate progress stats for each subject
  const progressStats = useMemo(() => {
    const stats = {
      physics: { total: questionsBySubject.physics.length, answered: 0 },
      chemistry: { total: questionsBySubject.chemistry.length, answered: 0 },
      mathematics: { total: questionsBySubject.mathematics.length, answered: 0 },
    }

    if (!answers) {
      return stats
    }

    // Count answered questions for each subject
    Object.entries(answers).forEach(([index, answer]) => {
      const questionIndex = Number.parseInt(index)
      const hasAnswer = answer.selectedAnswer !== undefined || answer.numericalAnswer !== undefined

      if (hasAnswer) {
        if (questionsBySubject.physics.includes(questionIndex)) {
          stats.physics.answered++
        } else if (questionsBySubject.chemistry.includes(questionIndex)) {
          stats.chemistry.answered++
        } else if (questionsBySubject.mathematics.includes(questionIndex)) {
          stats.mathematics.answered++
        }
      }
    })

    return stats
  }, [answers, questionsBySubject])

  // Get status for a question
  const getQuestionStatus = (index) => {
    if (!answers) return "not-visited"

    const answer = answers[index]
    if (!answer) return "not-visited"

    const hasAnswer = answer.selectedAnswer !== undefined || answer.numericalAnswer !== undefined

    if (hasAnswer && answer.markedForReview) return "answered-marked"
    if (hasAnswer) return "answered"
    if (answer.markedForReview) return "marked"
    return "not-answered"
  }

  // Ensure activeSubject is valid before using it
  const validActiveSubject = activeSubject && subjects.find((s) => s.id === activeSubject) ? activeSubject : "physics"

  // Get questions to display based on active subject
  const displayQuestions = questionsBySubject[validActiveSubject] || []

  // Calculate completion percentage with safety check
  const currentStats = progressStats[validActiveSubject] || { total: 0, answered: 0 }
  const completionPercentage =
    currentStats.total > 0 ? Math.round((currentStats.answered / currentStats.total) * 100) : 0

  // Early return if no test data
  if (!test?.questions) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
          <div className="text-center text-slate-400">Loading questions...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview Card */}
      <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-slate-200">Progress Overview</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800/80 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-teal-400 mb-1">{currentStats.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-green-400 mb-1">{currentStats.answered}</div>
            <div className="text-sm text-slate-400">Answered</div>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{completionPercentage}% Complete</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Subject Tabs - Only Physics, Chemistry, Mathematics */}
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => {
              console.log(`🎯 Subject tab clicked: ${subject.id}`)
              setActiveSubject(subject.id)
            }}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${
                validActiveSubject === subject.id
                  ? "bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-400 border border-teal-500/40 shadow-lg shadow-teal-500/10"
                  : "bg-slate-800/40 text-slate-400 border border-slate-700/40 hover:bg-slate-700/40 hover:text-slate-300"
              }
            `}
          >
            {subject.icon}
            {subject.name}
            <span className="ml-1 bg-slate-800/80 px-1.5 py-0.5 rounded-full text-xs">
              {questionsBySubject[subject.id]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Status Legend - Compact Inline Version */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-slate-500"></span>
          <span className="text-slate-400">Not Visited</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-slate-400">Not Answered</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-slate-400">Answered</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="text-slate-400">Marked</span>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/50">
        <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/50">
          <h3 className="font-medium text-slate-200">
            {validActiveSubject.charAt(0).toUpperCase() + validActiveSubject.slice(1)} Questions
          </h3>
        </div>

        {displayQuestions.length > 0 ? (
          <div className="p-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {displayQuestions.map((index) => {
                const status = getQuestionStatus(index)
                const isCurrentQuestion = index === currentQuestion
                const question = test.questions[index]
                const isNumQ = question ? isNumericalQuestion(question) : false

                // Define styles based on status
                let bgColor, textColor, borderStyle

                switch (status) {
                  case "not-visited":
                    bgColor = "bg-slate-700/50"
                    textColor = "text-slate-300"
                    borderStyle = "border-slate-600"
                    break
                  case "not-answered":
                    bgColor = "bg-red-500/20"
                    textColor = "text-red-300"
                    borderStyle = "border-red-500/50"
                    break
                  case "answered":
                    bgColor = "bg-green-500/20"
                    textColor = "text-green-300"
                    borderStyle = "border-green-500/50"
                    break
                  case "marked":
                    bgColor = "bg-yellow-500/20"
                    textColor = "text-yellow-300"
                    borderStyle = "border-yellow-500/50"
                    break
                  case "answered-marked":
                    bgColor = "bg-blue-500/20"
                    textColor = "text-blue-300"
                    borderStyle = "border-blue-500/50"
                    break
                  default:
                    bgColor = "bg-slate-700/50"
                    textColor = "text-slate-300"
                    borderStyle = "border-slate-600"
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      console.log(`🎯 Question clicked: ${index + 1}`)
                      if (onQuestionNavigation && typeof onQuestionNavigation === "function") {
                        onQuestionNavigation(index)
                      } else {
                        console.error("onQuestionNavigation is not a function:", onQuestionNavigation)
                      }
                    }}
                    className={`
                      relative h-12 rounded-lg font-medium transition-all duration-300
                      ${bgColor} ${textColor} border ${borderStyle}
                      ${
                        isCurrentQuestion
                          ? "transform scale-105 shadow-lg shadow-teal-500/20 border-2 border-teal-400"
                          : "hover:scale-105 hover:shadow-md"
                      }
                      flex items-center justify-center
                    `}
                  >
                    <span className="text-base">{index + 1}</span>
                    {isNumQ && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-slate-800"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">No questions in this category</div>
        )}
      </div>
    </div>
  )
}
