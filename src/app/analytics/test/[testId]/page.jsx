"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Users,
  TrendingUp,
  Download,
  Share2,
  ChevronLeft,
  Home,
  Award,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Breadcrumb from "@/components/ui/Breadcrumb"

export default function TestAnalyticsPage({ params }) {
  const router = useRouter()
  const [testData, setTestData] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testId, setTestId] = useState(null)
  const [isMockData, setIsMockData] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Handle both async and sync params
        let resolvedParams
        if (typeof params === "object" && params.then) {
          resolvedParams = await params
        } else {
          resolvedParams = params
        }

        console.log("Resolved params:", resolvedParams)
        setTestId(resolvedParams.testId)
        await fetchTestAnalytics(resolvedParams.testId)
      } catch (error) {
        console.error("Error resolving params:", error)
        setError("Failed to load test analytics")
        setLoading(false)
      }
    }

    if (params) {
      initializePage()
    }
  }, [params])

  const fetchTestAnalytics = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      console.log("Fetching analytics for test:", id)

      const response = await fetch(`/api/analytics/test/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Analytics data received:", data)
        setTestData(data.test)
        setAnalyticsData(data.analytics)
        setIsMockData(data.isMockData || false)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching test analytics:", error)
      setError(error.message)

      // Fallback to mock data
      setTestData({
        _id: id,
        title: "Sample Test Analytics",
        subject: "Physics",
        totalMarks: 100,
        duration: 180,
        questions: Array(25).fill({}),
      })
      setAnalyticsData({
        totalAttempts: 1250,
        completedAttempts: 1063,
        averageScore: 72.5,
        medianScore: 75.0,
        topScore: 98,
        lowestScore: 12,
        completionRate: 85.2,
        averageTime: 145,
      })
      setIsMockData(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading test analytics...</div>
          <div className="text-sm text-slate-500 mt-2">Test ID: {testId}</div>
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
            <div>
              <Breadcrumb
                items={[
                  { label: "Home", path: "/", icon: Home },
                  { label: "Tests", path: "/tests" },
                  { label: "Test Analytics" },
                ]}
              />
              <div className="flex items-center gap-4 mt-2">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                    Test Analytics Dashboard
                  </h1>
                  <p className="text-slate-400">{testData?.title}</p>
                  {testId && <p className="text-xs text-slate-500">ID: {testId}</p>}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mock Data Warning */}
        {(isMockData || error) && (
          <Card className="bg-yellow-900/20 border-yellow-700/50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-yellow-400 font-medium">{error ? "Error Loading Data" : "Demo Data"}</div>
                  <div className="text-yellow-300/80 text-sm">
                    {error
                      ? `Failed to load analytics: ${error}. Showing sample data instead.`
                      : "Showing sample analytics data for demonstration purposes."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">{analyticsData?.totalAttempts || 0}</div>
              <div className="text-sm text-slate-400">Total Attempts</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{analyticsData?.averageScore || 0}</div>
              <div className="text-sm text-slate-400">Average Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{analyticsData?.completionRate || 0}%</div>
              <div className="text-sm text-slate-400">Completion Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">{analyticsData?.topScore || 0}</div>
              <div className="text-sm text-slate-400">Highest Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-200">{analyticsData?.medianScore || 0}</div>
                  <div className="text-sm text-slate-400">Median Score</div>
                </div>
                <div className="text-teal-400">
                  <BarChart3 className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-200">{analyticsData?.averageTime || 0}m</div>
                  <div className="text-sm text-slate-400">Average Time</div>
                </div>
                <div className="text-blue-400">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-200">{analyticsData?.lowestScore || 0}</div>
                  <div className="text-sm text-slate-400">Lowest Score</div>
                </div>
                <div className="text-red-400">
                  <Award className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Message */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <BarChart3 className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-200 mb-4">Detailed Analytics Coming Soon</h3>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              We're building comprehensive test analytics including performance trends, question-wise analysis, student
              insights, and detailed reporting features. Stay tuned for the full analytics dashboard!
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => router.push("/tests")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back to Tests
              </Button>
              {testId && (
                <Button
                  onClick={() => router.push(`/test/${testId}`)}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                >
                  Take This Test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
