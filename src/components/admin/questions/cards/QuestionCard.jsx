"use client"

import { useState } from "react"
import { Edit, Trash2, Calculator, CheckCircle, Award, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

export default function QuestionCard({ question, index, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-900/50 text-green-400 border-green-700/50"
      case "medium":
        return "bg-yellow-900/50 text-yellow-400 border-yellow-700/50"
      case "hard":
        return "bg-red-900/50 text-red-400 border-red-700/50"
      default:
        return "bg-slate-700 text-slate-400 border-slate-600"
    }
  }

  const getTypeColor = (type) => {
    return type === "numerical"
      ? "bg-purple-900/50 text-purple-400 border-purple-700/50"
      : "bg-blue-900/50 text-blue-400 border-blue-700/50"
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg hover:shadow-xl hover:shadow-teal-900/20 transition-all duration-300 transform hover:-translate-y-1 group">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm shadow-lg flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(question.questionType)} flex items-center`}
                >
                  {question.questionType === "numerical" ? (
                    <>
                      <Calculator className="h-3 w-3 mr-1" />
                      Numerical
                    </>
                  ) : (
                    "MCQ"
                  )}
                </span>
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}
                >
                  {question.difficulty}
                </span>
                <span className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 text-yellow-400 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border border-yellow-700/50 flex items-center">
                  <Award className="h-3 w-3 mr-1" />+{question.marks?.positive || 4} / {question.marks?.negative || -1}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-4 break-words">
              {question.questionText.length > 120 && !isExpanded
                ? `${question.questionText.substring(0, 120)}...`
                : question.questionText}
            </p>

            {isExpanded && (
              <>
                {question.questionImage && (
                  <div className="mb-4">
                    <img
                      src={question.questionImage || "/placeholder.svg"}
                      alt="Question"
                      className="max-w-full sm:max-w-xs rounded-lg border border-slate-600 shadow-md"
                    />
                  </div>
                )}

                {question.questionType === "numerical" ? (
                  <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-3 sm:p-4 rounded-lg border border-green-700/50 mb-4">
                    <span className="text-sm font-medium text-green-300 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Answer: {question.numericalAnswer}
                    </span>
                  </div>
                ) : (
                  question.options && (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                            question.correctAnswer === optIndex
                              ? "border-green-600/50 bg-gradient-to-r from-green-900/30 to-green-800/30 text-green-300"
                              : "border-slate-600 bg-slate-800/50 text-slate-400"
                          }`}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)})</span>
                          <span className="break-words">{option.text}</span>
                          {question.correctAnswer === optIndex && (
                            <CheckCircle className="h-4 w-4 text-green-400 inline ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {question.explanation && (
                  <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-3 sm:p-4 rounded-lg border border-blue-700/50 mb-4">
                    <div className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Explanation:
                    </div>
                    <div className="text-sm text-blue-200 break-words">{question.explanation}</div>
                  </div>
                )}
              </>
            )}

            {question.chapter && (
              <div className="text-xs text-slate-500 mb-2 bg-slate-800/50 px-2 py-1 rounded border border-slate-700 inline-block">
                Chapter: {question.chapter}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2 flex-shrink-0">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 flex items-center transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Expand</span>
                </>
              )}
            </Button>
            <Button
              onClick={onEdit}
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 flex items-center transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
