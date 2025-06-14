"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Plus, Rocket, CheckCircle, MoreHorizontal } from "lucide-react"
import Button from "@/components/ui/Button"
import QuestionsBySubject from "./sections/QuestionsBySubject"
import TestOverviewSidebar from "./sections/TestOverviewSidebar"
import UploadQuestionsModal from "./modals/UploadQuestionsModal"
import QuestionForm from "./forms/QuestionForm"
import { useQuestionManagement } from "@/hooks/questions/useQuestionManagement"
import Breadcrumb from "@/components/ui/Breadcrumb"

export default function QuestionManagementPage({ params }) {
  const router = useRouter()
  const [testId, setTestId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
      {/* Enhanced Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="py-4">
            <Breadcrumb
              items={[
                { label: "Home", path: "/" },
                { label: "Admin Dashboard", path: "/admin" },
                { label: "Test Management", path: "/admin/tests" },
                { label: "Test Details", path: `/admin/tests/${testId}` },
                { label: "Question Management" },
              ]}
            />
          </div>

          {/* Main Header Content */}
          <div className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Section - Title & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Question Management
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 text-sm sm:text-base">{test?.title}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-teal-400 font-medium text-sm sm:text-base">
                        {questions.length} Question{questions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Action Buttons */}
              <div className="flex-shrink-0">
                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-3">
                  <Button
                    onClick={() => setShowUploadForm(true)}
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Questions
                  </Button>

                  <Button
                    onClick={() => setShowAddForm(true)}
                    variant="primary"
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>

                  {questions.length > 0 && (
                    <Button
                      onClick={handleFinalizeTest}
                      variant="accent"
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Rocket className="mr-2 h-4 w-4" />
                      Publish Test
                    </Button>
                  )}
                </div>

                {/* Mobile Actions */}
                <div className="lg:hidden">
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setShowAddForm(true)} variant="primary" size="sm" className="flex-1">
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>

                    <Button
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile Menu Dropdown */}
                  {showMobileMenu && (
                    <div className="absolute right-4 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowUploadForm(true)
                            setShowMobileMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Questions
                        </button>
                        {questions.length > 0 && (
                          <button
                            onClick={() => {
                              handleFinalizeTest()
                              setShowMobileMenu(false)
                            }}
                            className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center"
                          >
                            <Rocket className="mr-2 h-4 w-4" />
                            Publish Test
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-300">{test?.isActive ? "Active" : "Draft"}</span>
              </div>

              {test?.subject && (
                <div className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium">
                  {test.subject}
                </div>
              )}

              {test?.class && (
                <div className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
                  Class {test.class}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 text-green-300 rounded-lg flex items-center shadow-lg">
            <CheckCircle className="mr-3 h-5 w-5" />
            Questions processed successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 order-2 lg:order-1">
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
            <div className="lg:col-span-1 order-1 lg:order-2 hidden lg:block">
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
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-100">Add New Question</h2>
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

      {/* Click outside to close mobile menu */}
      {showMobileMenu && <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />}
    </div>
  )
}
