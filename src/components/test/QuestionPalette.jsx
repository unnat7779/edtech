"use client"

import { useMemo } from "react"
import { BookOpen, Atom, Calculator, Layers, CheckCircle } from "lucide-react"

export default function QuestionPalette({
  test,
  answers,
  currentQuestion,
  onQuestionNavigation,
  isNumericalQuestion,
  activeSubject,
  setActiveSubject,
}) {
  // Define subjects and their icons
  const subjects = [
    { id: "all", name: "All", icon: <Layers className="w-4 h-4" /> },
    { id: "physics", name: "Physics", icon: <Atom className="w-4 h-4" /> },
    { id: "chemistry", name: "Chemistry", icon: <BookOpen className="w-4 h-4" /> },
    { id: "maths", name: "Maths", icon: <Calculator className="w-4 h-4" /> },
  ]

  // Group questions by subject
  const questionsBySubject = useMemo(() => {
    const grouped = {
      all: test.questions.map((_, index) => index),
      physics: [],
      chemistry: [],
      maths: [],
    }

    test.questions.forEach((question, index) => {
      // Check various properties where subject might be stored
      const subject =
        (question.subject && question.subject.toLowerCase()) ||
        (question.tags &&
          question.tags
            .find((tag) => ["physics", "chemistry", "maths", "mathematics"].includes(tag.toLowerCase()))
            ?.toLowerCase()) ||
        (question.topic &&
          ["physics", "chemistry", "maths", "mathematics"].includes(question.topic.toLowerCase()) &&
          question.topic.toLowerCase()) ||
        "other"

      // Map "mathematics" to "maths" for consistency
      const normalizedSubject = subject === "mathematics" ? "maths" : subject

      // Add to appropriate subject array
      if (normalizedSubject === "physics") {
        grouped.physics.push(index)
      } else if (normalizedSubject === "chemistry") {
        grouped.chemistry.push(index)
      } else if (normalizedSubject === "maths") {
        grouped.maths.push(index)
      }
    })

    return grouped
  }, [test.questions])

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const stats = {
      all: { total: test.questions.length, answered: 0 },
      physics: { total: questionsBySubject.physics.length, answered: 0 },
      chemistry: { total: questionsBySubject.chemistry.length, answered: 0 },
      maths: { total: questionsBySubject.maths.length, answered: 0 },
    }

    // Count answered questions for each subject
    Object.entries(answers).forEach(([index, answer]) => {
      const questionIndex = Number.parseInt(index)
      const hasAnswer = answer.selectedAnswer !== undefined || answer.numericalAnswer !== undefined

      if (hasAnswer) {
        stats.all.answered++

        if (questionsBySubject.physics.includes(questionIndex)) {
          stats.physics.answered++
        } else if (questionsBySubject.chemistry.includes(questionIndex)) {
          stats.chemistry.answered++
        } else if (questionsBySubject.maths.includes(questionIndex)) {
          stats.maths.answered++
        }
      }
    })

    return stats
  }, [answers, test.questions.length, questionsBySubject])

  // Get status for a question
  const getQuestionStatus = (index) => {
    const answer = answers[index]
    if (!answer) return "not-visited"

    const hasAnswer = answer.selectedAnswer !== undefined || answer.numericalAnswer !== undefined

    if (hasAnswer && answer.markedForReview) return "answered-marked"
    if (hasAnswer) return "answered"
    if (answer.markedForReview) return "marked"
    return "not-answered"
  }

  // Get questions to display based on active subject
  const displayQuestions = questionsBySubject[activeSubject] || questionsBySubject.all

  // Calculate completion percentage
  const completionPercentage =
    Math.round((progressStats[activeSubject].answered / progressStats[activeSubject].total) * 100) || 0

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
            <div className="text-4xl font-bold text-teal-400 mb-1">{progressStats[activeSubject].total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-green-400 mb-1">{progressStats[activeSubject].answered}</div>
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

      {/* Subject Tabs */}
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setActiveSubject(subject.id)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${
                activeSubject === subject.id
                  ? "bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-400 border border-teal-500/40 shadow-lg shadow-teal-500/10"
                  : "bg-slate-800/40 text-slate-400 border border-slate-700/40 hover:bg-slate-700/40 hover:text-slate-300"
              }
            `}
          >
            {subject.icon}
            {subject.name}
            {subject.id !== "all" && (
              <span className="ml-1 bg-slate-800/80 px-1.5 py-0.5 rounded-full text-xs">
                {questionsBySubject[subject.id]?.length || 0}
              </span>
            )}
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
            {activeSubject === "all"
              ? "All Questions"
              : `${activeSubject.charAt(0).toUpperCase() + activeSubject.slice(1)} Questions`}
          </h3>
        </div>

        {displayQuestions.length > 0 ? (
          <div className="p-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {displayQuestions.map((index) => {
                const status = getQuestionStatus(index)
                const isCurrentQuestion = index === currentQuestion
                const isNumQ = isNumericalQuestion(test.questions[index])

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
                }

                return (
                  <button
                    key={index}
                    onClick={() => onQuestionNavigation(index)}
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
