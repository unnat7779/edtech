"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  Clock,
  BookOpen,
  FileText,
  Target,
  Award,
  Calendar,
  Home,
  Eye,
  AlertTriangle,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Breadcrumb from "@/components/ui/Breadcrumb"

export default function TestDetailsPage({ params }) {
  const router = useRouter()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [testId, setTestId] = useState(null)

  useEffect(() => {
    const resolvedParams = Promise.resolve(params)
    resolvedParams.then((p) => {
      setTestId(p.id)
      fetchTestDetails(p.id)
    })
  }, [params])

  const fetchTestDetails = async (id) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTest(data.test)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch test details")
      }
    } catch (error) {
      console.error("Failed to fetch test details:", error)
      setError("Failed to fetch test details")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTest = async () => {
    if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push("/admin/tests")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to delete test")
      }
    } catch (error) {
      console.error("Failed to delete test:", error)
      setError("Failed to delete test")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading test details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-slate-300 mb-2">Error Loading Test</div>
          <div className="text-slate-400 mb-4">{error}</div>
          <Button onClick={() => router.push("/admin/tests")} variant="outline">
            Back to Tests
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {" "}
              {/* Add min-w-0 for text truncation */}
              <Breadcrumb
                items={[
                  { label: "Home", path: "/", icon: Home },
                  { label: "Admin Dashboard", path: "/admin" },
                  { label: "Test Management", path: "/admin/tests" },
                  { label: "Test Details" },
                ]}
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {test?.title}
              </h1>
              {test?.description && (
                <div className="max-w-4xl">
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-200 cursor-pointer">
                    {test.description}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col mt-3 sm:flex-row gap-3 shrink-0">
              <Button
                onClick={() => router.push("/admin/tests")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tests
              </Button>
              <Button
                onClick={() => router.push(`/admin/tests/${testId}/edit`)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Test
              </Button>
              <Button
                onClick={handleDeleteTest}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Information */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
              <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50">
                <CardTitle className="flex items-center text-slate-200">
                  <Settings className="h-6 w-6 mr-3 text-teal-400" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-slate-500 text-sm">Type</span>
                      <div className="font-medium text-slate-200 capitalize">{test?.type?.replace("-", " ")}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Class</span>
                      <div className="font-medium text-slate-200">{test?.class}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Total Marks</span>
                      <div className="font-medium text-slate-200">{test?.totalMarks}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Status</span>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            test?.isActive
                              ? "bg-green-900/50 text-green-400 border border-green-700/50"
                              : "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50"
                          }`}
                        >
                          {test?.isActive ? "Active" : "Draft"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-slate-500 text-sm">Subject</span>
                      <div className="font-medium text-slate-200">{test?.subject}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Duration
                      </span>
                      <div className="font-medium text-slate-200">{test?.duration} minutes</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">Questions</span>
                      <div className="font-medium text-slate-200">{test?.questions?.length || 0}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created
                      </span>
                      <div className="font-medium text-slate-200">
                        {test?.createdAt ? formatDate(test.createdAt) : "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
              <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50">
                <CardTitle className="flex items-center text-slate-200">
                  <FileText className="h-6 w-6 mr-3 text-blue-400" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {test?.instructions && test.instructions.length > 0 ? (
                  <ul className="space-y-2">
                    {test.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start text-slate-300">
                        <span className="text-teal-400 mr-2">•</span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No instructions provided</p>
                )}
              </CardContent>
            </Card>

            {/* Questions */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
              <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-slate-200">
                    <BookOpen className="h-6 w-6 mr-3 text-yellow-400" />
                    Questions ({test?.questions?.length || 0})
                  </CardTitle>
                  <Button
                    onClick={() => router.push(`/admin/tests/${testId}/questions`)}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
                  >
                    Manage Questions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {test?.questions && test.questions.length > 0 ? (
                  <div className="space-y-3">
                    {test.questions.slice(0, 5).map((question, index) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  question.questionType === "numerical"
                                    ? "bg-purple-900/50 text-purple-400"
                                    : "bg-blue-900/50 text-blue-400"
                                }`}
                              >
                                {question.questionType === "numerical" ? "Numerical" : "MCQ"}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {question.questionText.length > 100
                                ? `${question.questionText.substring(0, 100)}...`
                                : question.questionText}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {test.questions.length > 5 && (
                      <div className="text-center py-4">
                        <Button
                          onClick={() => router.push(`/admin/tests/${testId}/questions`)}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          View All {test.questions.length} Questions
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-4">No questions added yet</p>
                    <Button
                      onClick={() => router.push(`/admin/tests/${testId}/questions`)}
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                    >
                      Add Questions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
              <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50">
                <CardTitle className="flex items-center text-slate-200">
                  <Target className="h-5 w-5 mr-2 text-green-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={() => router.push(`/admin/tests/${testId}/questions`)}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Questions
                </Button>
                <Button
                  onClick={() => router.push(`/admin/tests/${testId}/edit`)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Test Details
                </Button>
                <Button
                  onClick={() => router.push(`/admin/tests/${testId}/preview`)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Test
                </Button>
                <Button
                  onClick={handleDeleteTest}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Test
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
              <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50">
                <CardTitle className="flex items-center text-slate-200">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Questions:</span>
                  <span className="font-semibold text-slate-200">{test?.questions?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Marks:</span>
                  <span className="font-semibold text-slate-200">{test?.totalMarks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-semibold text-slate-200">{test?.duration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Created:</span>
                  <span className="font-semibold text-slate-200">
                    {test?.createdAt ? new Date(test.createdAt).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Subject Breakdown */}
            {test?.questions && test.questions.length > 0 && (
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
                <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-700/50 to-slate-800/50">
                  <CardTitle className="flex items-center text-slate-200">
                    <Award className="h-5 w-5 mr-2 text-yellow-400" />
                    Subject Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {(() => {
                    const subjectCounts = test.questions.reduce((acc, question) => {
                      const subject = question.subject || "Other"
                      acc[subject] = (acc[subject] || 0) + 1
                      return acc
                    }, {})

                    return (
                      <div className="space-y-3">
                        {Object.entries(subjectCounts).map(([subject, count]) => (
                          <div key={subject} className="flex justify-between items-center">
                            <span className="text-slate-400">{subject}:</span>
                            <span className="font-semibold text-slate-200">{count}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
