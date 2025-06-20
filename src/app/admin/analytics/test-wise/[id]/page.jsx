"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { BarChart3, Users, FileText, TrendingUp, Download, Filter, Home } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Breadcrumb from "@/components/ui/Breadcrumb"
import TestOverviewDashboard from "@/components/analytics/admin/TestOverviewDashboard"
import StudentPerformanceMatrix from "@/components/analytics/admin/StudentPerformanceMatrix"
import QuestionAnalyticsPanel from "@/components/analytics/admin/QuestionAnalyticsPanel"
import SubjectTopicIntelligence from "@/components/analytics/admin/SubjectTopicIntelligence"

export default function AdminTestAnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const [testData, setTestData] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("overview")
  const [testId, setTestId] = useState(null)
  const [filters, setFilters] = useState({
    dateRange: "all",
    studentGroup: "all",
    completionStatus: "all",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token || !user) {
      router.push("/login")
      return
    }

    // Parse user data to check if admin
    try {
      const userData = JSON.parse(user)
      if (userData.role !== "admin") {
        router.push("/dashboard")
        return
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
      return
    }

    // Get test ID from params
    const id = params.id
    console.log("Test ID from params:", id)

    if (id && id !== "undefined") {
      setTestId(id)
      fetchTestAnalytics(id)
    } else {
      console.error("No valid test ID found in params")
      setError("Invalid test ID")
      setLoading(false)
    }
  }, [params, router])

  const fetchTestAnalytics = async (id) => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      console.log("Fetching analytics for test ID:", id)

      // Validate the ID format
      if (!id || id === "undefined" || id.length !== 24) {
        throw new Error("Invalid test ID format")
      }

      // Fetch test data first
      const testResponse = await fetch(`/api/admin/tests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Test response status:", testResponse.status)

      if (testResponse.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
        return
      }

      if (!testResponse.ok) {
        const errorData = await testResponse.json().catch(() => ({}))
        console.error("Test fetch error:", errorData)
        throw new Error(errorData.error || `Failed to fetch test data: ${testResponse.status}`)
      }

      const testResult = await testResponse.json()
      console.log("Test data:", testResult)
      setTestData(testResult.test || testResult)

      // Try to fetch analytics data - use the test-wise endpoint that exists
      try {
        const analyticsResponse = await fetch(`/api/admin/analytics/test-wise/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Analytics response status:", analyticsResponse.status)

        if (analyticsResponse.ok) {
          const analyticsResult = await analyticsResponse.json()
          console.log("Analytics data:", analyticsResult)
          setAnalyticsData(analyticsResult)
        } else {
          console.warn("Analytics not available, using empty state")
          setAnalyticsData(null)
        }
      } catch (analyticsError) {
        console.warn("Analytics fetch failed:", analyticsError)
        setAnalyticsData(null)
      }
    } catch (error) {
      console.error("Error fetching test analytics:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async (format) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/test/${testId}/export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format, filters }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `test-analytics-${testId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  // Create custom breadcrumb items for this specific page
  const breadcrumbItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Admin", path: "/admin" },

    { label: "Test Wise Analysis", path: "/admin/analytics/test-wise" },
    {
      label: testData?.title || "Test Analytics",
    },
  ]

  const sections = [
    { id: "overview", label: "Test Overview", icon: BarChart3 },
    { id: "students", label: "Student Performance", icon: Users },
    { id: "questions", label: "Question Analytics", icon: FileText },
    { id: "subjects", label: "Subject Intelligence", icon: TrendingUp },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Button onClick={() => router.push("/admin/analytics/test-wise")} className="bg-teal-600 hover:bg-teal-700">
            Back to Test List
          </Button>
        </div>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 text-lg mb-4">Test not found</div>
          <Button onClick={() => router.push("/admin/analytics/test-wise")} className="bg-teal-600 hover:bg-teal-700">
            Back to Test List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                    Test Analytics Dashboard
                  </h1>
                  <p className="text-slate-400">{testData?.title || `Test ID: ${testId}`}</p>
                </div>
              </div>
            </div>
            <div className="flex scale-75 items-center space-x-3">
              {/* <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-slate-300 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div> */}
              {/* <Button
                onClick={() => handleExportReport("pdf")}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button> */}
              {/* <Button
                onClick={() => router.push("/admin/analytics/test-wise")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back to List
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-200 text-lg">Analytics Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 ${
                          activeSection === section.id
                            ? "bg-gradient-to-r from-teal-600/20 to-blue-600/20 border-r-2 border-teal-400 text-teal-400"
                            : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {section.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === "overview" && (
              <TestOverviewDashboard testData={testData} analyticsData={analyticsData} filters={filters} />
            )}
            {activeSection === "students" && (
              <StudentPerformanceMatrix testData={testData} analyticsData={analyticsData} filters={filters} />
            )}
            {activeSection === "questions" && (
              <QuestionAnalyticsPanel testData={testData} analyticsData={analyticsData} filters={filters} />
            )}
            {activeSection === "subjects" && (
              <SubjectTopicIntelligence
                testId={testId}
                testData={testData}
                analyticsData={analyticsData}
                filters={filters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
