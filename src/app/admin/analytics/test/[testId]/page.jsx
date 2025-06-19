"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Users, FileText, TrendingUp, Download, Filter, Home } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Breadcrumb from "@/components/ui/Breadcrumb"
import TestOverviewDashboard from "@/components/analytics/admin/TestOverviewDashboard"
import StudentPerformanceMatrix from "@/components/analytics/admin/StudentPerformanceMatrix"
import QuestionAnalyticsPanel from "@/components/analytics/admin/QuestionAnalyticsPanel"
import SubjectTopicIntelligence from "@/components/analytics/admin/SubjectTopicIntelligence"
import AdvancedAnalyticsSuite from "@/components/analytics/admin/AdvancedAnalyticsSuite"
import ReportingExportCenter from "@/components/analytics/admin/ReportingExportCenter"

export default function AdminTestAnalyticsPage({ params }) {
  const router = useRouter()
  const [testData, setTestData] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("overview") // Set default to subjects
  const [testId, setTestId] = useState(null)
  const [filters, setFilters] = useState({
    dateRange: "all",
    studentGroup: "all",
    completionStatus: "all",
  })

  useEffect(() => {
    const initializePage = async () => {
      try {
        const resolvedParams = await params
        console.log("Resolved params:", resolvedParams)
        console.log("Test ID from params:", resolvedParams.testId)

        setTestId(resolvedParams.testId)
        await fetchTestAnalytics(resolvedParams.testId)
      } catch (error) {
        console.error("Error resolving params:", error)
        router.push("/admin/tests")
      }
    }

    initializePage()
  }, [params, router])

  const fetchTestAnalytics = async (id) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // Fetch test data and analytics data
      const [testResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/admin/tests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/analytics/test/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (testResponse.ok && analyticsResponse.ok) {
        const testResult = await testResponse.json()
        const analyticsResult = await analyticsResponse.json()

        setTestData(testResult.test)
        setAnalyticsData(analyticsResult.analytics)
      } else {
        throw new Error("Failed to fetch test analytics")
      }
    } catch (error) {
      console.error("Error fetching test analytics:", error)
      // Don't redirect on error, just show error state
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
    { label: "Admin Dashboard", path: "/admin" },
    { label: "Tests", path: "/admin/tests" },
    {
      label: "Test Analytics",
      path: `/admin/analytics/test/${testId}`,
      subtitle: testData?.title,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <Breadcrumb customItems={breadcrumbItems} />
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                    Test Analytics Dashboard
                  </h1>
                  <p className="text-slate-400">{testData?.title || `Test ID: ${testId}`}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-2">
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
              </div>
              <Button
                onClick={() => handleExportReport("pdf")}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
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
            {/* {activeSection === "advanced" && (
              <AdvancedAnalyticsSuite testData={testData} analyticsData={analyticsData} filters={filters} />
            )}
            {activeSection === "reports" && (
              <ReportingExportCenter
                testData={testData}
                analyticsData={analyticsData}
                filters={filters}
                onExport={handleExportReport}
              />
            )} */}
          </div>
        </div>
      </div>
    </div>
  )
}
