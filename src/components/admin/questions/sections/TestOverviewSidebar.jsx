"use client"

import { BarChart3, BookOpen, TrendingUp, Settings, Clock, Atom, Beaker, Calculator, Target, Award } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { groupQuestionsBySubject } from "@/utils/questions/questionHelpers"

export default function TestOverviewSidebar({ test, questions }) {
  const groupedQuestions = groupQuestionsBySubject(questions)
  const availableSubjects = Object.keys(groupedQuestions).filter((subject) => groupedQuestions[subject].length > 0)

  const totalQuestions = questions.length
  const mcqCount = questions.filter((q) => q.questionType === "mcq" || !q.questionType).length
  const numericalCount = questions.filter((q) => q.questionType === "numerical").length
  const totalMarks = questions.reduce((acc, q) => acc + (q.marks?.positive || 4), 0)

  const difficultyBreakdown = questions.reduce((acc, q) => {
    const difficulty = q.difficulty || "Medium"
    acc[difficulty] = (acc[difficulty] || 0) + 1
    return acc
  }, {})

  const subjectIcons = {
    Physics: Atom,
    Chemistry: Beaker,
    Mathematics: Calculator,
    Other: BookOpen,
  }

  return (
    <div className="space-y-6">
      {/* Test Overview */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-4 sm:p-6">
          <CardTitle className="text-lg flex items-center text-slate-200">
            <BarChart3 className="h-5 w-5 mr-2 text-teal-400" />
            Test Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-teal-900/30 to-teal-800/30 rounded-lg border border-teal-700/50">
              <div className="text-xl sm:text-2xl font-bold text-teal-400">{totalQuestions}</div>
              <div className="text-xs text-slate-400">Total Questions</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700/50">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{mcqCount}</div>
              <div className="text-xs text-slate-400">MCQ</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700/50">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">{numericalCount}</div>
              <div className="text-xs text-slate-400">Numerical</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg border border-yellow-700/50">
              <div className="text-xl sm:text-2xl font-bold text-yellow-400">{totalMarks}</div>
              <div className="text-xs text-slate-400">Total Marks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Breakdown */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-4 sm:p-6">
          <CardTitle className="text-lg flex items-center text-slate-200">
            <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
            Subject Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3">
          {availableSubjects.map((subject) => {
            const count = groupedQuestions[subject].length
            const percentage = ((count / totalQuestions) * 100).toFixed(1)
            const SubjectIcon = subjectIcons[subject] || BookOpen

            return (
              <div
                key={subject}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <SubjectIcon className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-300 truncate">{subject}:</span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-200">{count}</span>
                  <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-4 sm:p-6">
          <CardTitle className="text-lg flex items-center text-slate-200">
            <TrendingUp className="h-5 w-5 mr-2 text-yellow-400" />
            Difficulty Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3">
          {Object.entries(difficultyBreakdown).map(([difficulty, count]) => {
            const percentage = ((count / totalQuestions) * 100).toFixed(1)
            const colors = {
              Easy: "text-green-400 bg-green-900/30 border-green-700/50",
              Medium: "text-yellow-400 bg-yellow-900/30 border-yellow-700/50",
              Hard: "text-red-400 bg-red-900/30 border-red-700/50",
            }

            return (
              <div
                key={difficulty}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      difficulty === "Easy" ? "bg-green-500" : difficulty === "Medium" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-slate-300 truncate">{difficulty}:</span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`text-sm font-bold ${colors[difficulty]?.split(" ")[0] || "text-slate-400"}`}>
                    {count}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Test Details */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-4 sm:p-6">
          <CardTitle className="text-lg flex items-center text-slate-200">
            <Settings className="h-5 w-5 mr-2 text-green-400" />
            Test Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className="text-sm text-slate-400 flex items-center min-w-0">
              <Clock className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
              <span className="truncate">Duration:</span>
            </span>
            <span className="font-medium text-slate-200 flex-shrink-0">{test?.duration || 180} min</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className="text-sm text-slate-400 flex items-center min-w-0">
              <Target className="h-4 w-4 mr-2 text-teal-400 flex-shrink-0" />
              <span className="truncate">Created:</span>
            </span>
            <span className="font-medium text-slate-200 flex-shrink-0">
              {test?.createdAt ? new Date(test.createdAt).toLocaleDateString() : "Today"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className="text-sm text-slate-400 flex items-center min-w-0">
              <Award className="h-4 w-4 mr-2 text-yellow-400 flex-shrink-0" />
              <span className="truncate">Status:</span>
            </span>
            <span
              className={`font-medium px-3 py-1 rounded-full text-xs flex-shrink-0 ${
                test?.isActive
                  ? "bg-green-900/50 text-green-400 border border-green-700/50"
                  : "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50"
              }`}
            >
              {test?.isActive ? "Published" : "Draft"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
