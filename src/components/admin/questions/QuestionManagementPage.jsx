"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Plus, Rocket, CheckCircle, Home, ChevronRight } from "lucide-react"
import Button from "@/components/ui/Button"
import QuestionsBySubject from "./sections/QuestionsBySubject"
import TestOverviewSidebar from "./sections/TestOverviewSidebar"
import UploadQuestionsModal from "./modals/UploadQuestionsModal"
import QuestionForm from "./forms/QuestionForm"
import { useQuestionManagement } from "@/hooks/questions/useQuestionManagement"

export default function QuestionManagementPage({ params }) {
  const router = useRouter()
  const [testId, setTestId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)

  const {
    test,
    questions,
    loading,
    success,
    editingQuestion,
    uploading,
    fetchTestDetails,
    handleSaveQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleFinalizeTest,
    setEditingQuestion,
  } = useQuestionManagement(testId)

  useEffect(() => {
    const resolvedParams = Promise.resolve(params)
    resolvedParams.then((p) => {
      setTestId(p.id)
      fetchTestDetails(p.id)
    })
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading questions...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center text-sm text-slate-400 mb-2">
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Admin Dashboard</span>
                <ChevronRight className="h-4 w-4 mx-1 hidden sm:inline" />
                <span className="hidden sm:inline">Test Management</span>
                <ChevronRight className="h-4 w-4 mx-1 hidden sm:inline" />
                <span className="text-slate-200">Question Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Question Management
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                {test?.title} • {questions.length} Questions
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={() => router.push(`/admin/tests/${testId}`)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm px-3 py-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setShowUploadForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm px-3 py-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm px-3 py-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
              {questions.length > 0 && (
                <Button
                  onClick={handleFinalizeTest}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-slate-900 text-sm px-3 py-2 font-semibold"
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {success && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 text-green-300 rounded-lg flex items-center shadow-lg">
                <CheckCircle className="mr-3 h-5 w-5" />
                Questions processed successfully!
              </div>
            )}

            <QuestionsBySubject
              questions={questions}
              editingQuestion={editingQuestion}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
              onSave={handleSaveQuestion}
              onCancelEdit={() => setEditingQuestion(null)}
              test={test}
              testId={testId}
              uploading={uploading}
              onShowUpload={() => setShowUploadForm(true)}
              onShowAdd={() => setShowAddForm(true)}
            />
          </div>

          {/* Sidebar */}
          {questions.length > 0 && (
            <div className="lg:col-span-1 order-1 lg:order-2">
              <TestOverviewSidebar test={test} questions={questions} />
            </div>
          )}
        </div>

        {/* Upload Questions Modal */}
        {showUploadForm && (
          <UploadQuestionsModal
            testId={testId}
            onClose={() => setShowUploadForm(false)}
            onQuestionsAdded={() => {
              setShowUploadForm(false)
              fetchTestDetails(testId)
            }}
          />
        )}

        {/* Add Question Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Add New Question</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-200 text-2xl transition-colors duration-200 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                <QuestionForm
                  onSave={(data) => {
                    handleSaveQuestion(data)
                    setShowAddForm(false)
                  }}
                  onCancel={() => setShowAddForm(false)}
                  testSubject={test?.subject}
                  testId={testId}
                  questions={questions}
                  uploading={uploading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
