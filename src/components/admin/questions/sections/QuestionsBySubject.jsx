"use client"

import { useState } from "react"
import { FileText, Upload, Plus, BookOpen, Lightbulb, HelpCircle } from "lucide-react"
import Button from "@/components/ui/Button"
import QuestionCard from "../cards/QuestionCard"
import QuestionForm from "../forms/QuestionForm"
import { groupQuestionsBySubject, getSubjectIcon } from "@/utils/questions/questionHelpers"

export default function QuestionsBySubject({
  questions,
  editingQuestion,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  test,
  testId,
  uploading,
  onShowUpload,
  onShowAdd,
}) {
  const [collapsedSections, setCollapsedSections] = useState({})

  const groupedQuestions = groupQuestionsBySubject(questions)
  const availableSubjects = Object.keys(groupedQuestions).filter((subject) => groupedQuestions[subject].length > 0)

  const toggleSection = (subject) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [subject]: !prev[subject],
    }))
  }

  if (availableSubjects.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl p-6 sm:p-8 max-w-4xl mx-auto my-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>

          <h3 className="text-xl sm:text-2xl font-semibold text-slate-200 mb-3">No Questions Yet</h3>
          <p className="text-slate-400 mb-8 max-w-lg text-sm sm:text-base">
            Start building your test by adding questions manually or uploading them from a file.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 w-full sm:w-auto">
            <Button
              onClick={onShowUpload}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 text-base flex items-center justify-center min-w-[200px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Questions
            </Button>
            <Button
              onClick={onShowAdd}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 text-base flex items-center justify-center min-w-[200px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Manually
            </Button>
          </div>

          {/* Quick Tips */}
          <div className="w-full">
            <h4 className="text-lg font-medium text-slate-200 mb-4 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
              Quick Tips
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-4 rounded-lg border border-blue-800/50">
                <h5 className="font-medium text-blue-300 mb-2 flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </h5>
                <p className="text-sm text-slate-400">
                  Upload questions in bulk using our text format for faster test creation.
                </p>
              </div>

              <div className="bg-gradient-to-br from-teal-900/30 to-teal-800/30 p-4 rounded-lg border border-teal-800/50">
                <h5 className="font-medium text-teal-300 mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Subject Organization
                </h5>
                <p className="text-sm text-slate-400">
                  Questions are automatically organized by subject for better management.
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 p-4 rounded-lg border border-yellow-800/50">
                <h5 className="font-medium text-yellow-300 mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Need Help?
                </h5>
                <p className="text-sm text-slate-400">
                  Check our sample formats or contact support for assistance with question creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subject Tabs */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="border-b border-slate-700">
          <div className="flex flex-wrap sm:flex-nowrap overflow-x-auto">
            {availableSubjects.map((subject) => {
              const SubjectIcon = getSubjectIcon(subject)
              const subjectQuestions = groupedQuestions[subject]
              const isActive = !collapsedSections[subject]

              return (
                <button
                  key={subject}
                  onClick={() => toggleSection(subject)}
                  className={`flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 border-b-2 transition-all duration-300 whitespace-nowrap min-w-0 flex-shrink-0 ${
                    isActive
                      ? "border-teal-500 bg-gradient-to-r from-teal-900/30 to-teal-800/30 text-teal-300"
                      : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <SubjectIcon
                    className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isActive ? "text-teal-400" : "text-slate-500"}`}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 min-w-0">
                    <span
                      className={`text-sm sm:text-lg font-semibold truncate ${isActive ? "text-teal-300" : "text-slate-400"}`}
                    >
                      {subject}
                    </span>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          isActive
                            ? "bg-teal-900/50 text-teal-300 border-teal-700/50"
                            : "bg-slate-700 text-slate-400 border-slate-600"
                        }`}
                      >
                        {subjectQuestions.length}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border hidden sm:inline ${
                          isActive
                            ? "bg-blue-900/50 text-blue-300 border-blue-700/50"
                            : "bg-slate-700 text-slate-400 border-slate-600"
                        }`}
                      >
                        {subjectQuestions.reduce((acc, q) => acc + (q.marks?.positive || 4), 0)} marks
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {availableSubjects.map((subject) => {
          const isCollapsed = collapsedSections[subject]
          if (isCollapsed) return null

          const subjectQuestions = groupedQuestions[subject]
          const SubjectIcon = getSubjectIcon(subject)

          return (
            <div key={`content-${subject}`} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-200 flex items-center">
                  <SubjectIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-teal-400" />
                  {subject} Questions
                </h3>
                <div className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 self-start sm:self-auto">
                  Showing {subjectQuestions.length} questions
                </div>
              </div>

              <div className="space-y-4">
                {subjectQuestions.map((question, listIndex) => {
                  const originalIndex = question.originalIndex
                  return (
                    <div key={originalIndex}>
                      {editingQuestion === originalIndex ? (
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg p-4 sm:p-6 border border-slate-700">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-lg font-semibold text-slate-200">Edit Question {originalIndex + 1}</h4>
                            <button
                              onClick={onCancelEdit}
                              className="text-slate-400 hover:text-slate-200 text-2xl transition-colors duration-200 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                          <QuestionForm
                            question={question}
                            onSave={(data) => onSave(data, originalIndex)}
                            onCancel={onCancelEdit}
                            testSubject={test?.subject}
                            testId={testId}
                            questions={questions}
                            index={originalIndex}
                            uploading={uploading}
                          />
                        </div>
                      ) : (
                        <QuestionCard
                          question={question}
                          index={originalIndex}
                          onEdit={() => onEdit(originalIndex)}
                          onDelete={() => onDelete(originalIndex)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
