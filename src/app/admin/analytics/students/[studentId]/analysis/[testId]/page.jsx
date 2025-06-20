"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  ArrowLeft,
  User,
  BookOpen,
  Calendar,
  Clock,
  Target,
  BarChart3,
  RefreshCw,
  LogIn,
  Home,
  Users,
} from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"
import TestHistoryDashboard from "@/components/test/TestHistoryDashboard"

export default function AdminStudentTestAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const { studentId, testId } = params

  const [studentData, setStudentData] = useState(null)
  const [testData, setTestData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    if (studentId && testId) {
      checkAuthAndFetchData()
    }
  }, [studentId, testId])

  const checkAuthentication = async () => {
    try {
      console.log("🔍 Checking admin authentication...")

      let token = localStorage.getItem("token")
      if (!token) {
        const cookies = document.cookie.split(";")
        const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("token="))
        if (tokenCookie) {
          token = tokenCookie.split("=")[1]
        }
      }

      if (!token) {
        return { success: false, error: "No authentication token found. Please log in." }
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        if (userData.user?.role !== "admin") {
          return { success: false, error: "Admin access required" }
        }
        return { success: true, user: userData.user }
      } else {
        if (response.status === 401) {
          return { success: false, error: "Authentication token expired. Please log in again." }
        }
        return { success: false, error: "Authentication failed" }
      }
    } catch (error) {
      console.error("❌ Auth check error:", error)
      return { success: false, error: `Authentication check failed: ${error.message}` }
    }
  }

  const checkAuthAndFetchData = async () => {
    try {
      setLoading(true)
      setError("")
      setAuthError(false)

      // Check authentication first
      const authCheck = await checkAuthentication()
      if (!authCheck.success) {
        setAuthError(true)
        setError(authCheck.error)
        setLoading(false)
        return
      }

      // Fetch student and test data
      await Promise.all([fetchStudentData(), fetchTestData()])
    } catch (error) {
      console.error("❌ Error in checkAuthAndFetchData:", error)
      setAuthError(true)
      setError(`Failed to load data: ${error.message}`)
      setLoading(false)
    }
  }

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        setStudentData(result.data)
      } else {
        throw new Error("Failed to fetch student data")
      }
    } catch (error) {
      console.error("❌ Error fetching student data:", error)
      throw error
    }
  }

  const fetchTestData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tests/${testId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        setTestData(result.test)
        setLoading(false)
      } else {
        throw new Error("Failed to fetch test data")
      }
    } catch (error) {
      console.error("❌ Error fetching test data:", error)
      setLoading(false)
      throw error
    }
  }

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(window.location.pathname)
    router.push(`/login?returnUrl=${returnUrl}&role=admin`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Authentication Error Screen
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <LogIn className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Authentication Required</h2>
            <p className="text-slate-400 mb-6">{error}</p>
          </div>
          <div className="space-y-4">
            <Button onClick={handleLogin} className="bg-teal-600 hover:bg-teal-700 w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Login as Admin
            </Button>
            <Button onClick={() => router.push("/admin")} variant="outline" className="w-full">
              Go to Admin Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading test analysis...</div>
          <div className="text-sm text-slate-400 mt-2">Fetching student and test data...</div>
        </div>
      </div>
    )
  }

  if (error && !authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-lg mb-4">Error loading analysis</div>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={checkAuthAndFetchData} className="bg-teal-600 hover:bg-teal-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!studentData || !testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 text-lg">Data not found</div>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: "Home", path: "/", icon: Home },
              { label: "Admin Dashboard", path: "/admin" },
              { label: "Students", path: "/admin/analytics/students" },
              { label: studentData.profile?.name || "Student", path: `/admin/analytics/students/${studentId}` },
              { label: testData.title || "Test Analysis" },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  {testData.title}
                </h1>
                <p className="text-slate-400 mt-1">Analysis for {studentData.profile?.name || "Student"}</p>
              </div>
            </div>
            <Button
              onClick={checkAuthAndFetchData}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student & Test Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Student Info Card */}
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <User className="h-5 w-5 text-teal-400" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                  {studentData.profile?.avatar ? (
                    <img
                      src={studentData.profile.avatar || "/placeholder.svg"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    {studentData.profile?.name || "Unknown Student"}
                  </h3>
                  <p className="text-slate-400 text-sm">{studentData.profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                <div className="text-center">
                  <div className="text-lg font-bold text-teal-400">{studentData.quickStats?.totalTests || 0}</div>
                  <div className="text-xs text-slate-400">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {Math.round((studentData.quickStats?.averageScore || 0) * 10) / 10}%
                  </div>
                  <div className="text-xs text-slate-400">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Info Card */}
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">{testData.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{testData.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{testData.duration} min</div>
                    <div className="text-xs text-slate-400">Duration</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{testData.totalMarks}</div>
                    <div className="text-xs text-slate-400">Total Marks</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{testData.questions?.length || 0}</div>
                    <div className="text-xs text-slate-400">Questions</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{formatDate(testData.createdAt)}</div>
                    <div className="text-xs text-slate-400">Created</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test History Dashboard - Same as Student View */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-200">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Detailed Test History & Analytics
            </CardTitle>
            <p className="text-slate-400 text-sm mt-2">
              Complete analysis of {studentData.profile?.name || "student"}'s performance on this test
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {/* Embed the TestHistoryDashboard component with admin context */}
            <div className="relative">
              <TestHistoryDashboard
                testId={testId}
                onClose={() => router.back()}
                isAdminView={true}
                studentId={studentId}
                studentName={studentData.profile?.name}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
