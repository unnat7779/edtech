"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  ArrowLeft,
  Home,
  RefreshCw,
  LogIn,
  Trophy,
  BookOpen,
  Clock,
  Users,
  Target,
  Menu,
  X
} from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"
import PerformanceOverview from "@/components/analytics/student/PerformanceOverview"
import SubjectAnalysis from "@/components/analytics/student/SubjectAnalysis"
import TimeManagement from "@/components/analytics/student/TimeManagement"
import ComparativeAnalysis from "@/components/analytics/student/ComparativeAnalysis"
import QuestionReview from "@/components/analytics/student/QuestionReview"

export default function AdminStudentTestAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { studentId, testId } = params
  const attemptIdParam = searchParams.get("attemptId")

  const [activeTab, setActiveTab] = useState("performance")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authError, setAuthError] = useState(false)

  // Determine which attempt ID to use
  const [currentAttemptId, setCurrentAttemptId] = useState(attemptIdParam)

  useEffect(() => {
    if (studentId && testId) {
      if (currentAttemptId) {
        checkAuthAndFetchData(currentAttemptId)
      } else {
        // Fallback: try to find the latest attempt if none provided
        fetchLatestAttempt()
      }
    }
  }, [studentId, testId, currentAttemptId])

  const fetchLatestAttempt = async () => {
    try {
      const token = localStorage.getItem("token")
      // Use the admin route to get test history, then pick the latest one
      const response = await fetch(`/api/admin/analytics/students/${studentId}/test-history/${testId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.history && result.history.length > 0) {
          // Sort by most recent just in case, though API usually does it
          const latest = result.history[0]
          setCurrentAttemptId(latest._id)
        } else {
          setError("No attempts found for this student on this test.")
          setLoading(false)
        }
      } else {
        throw new Error("Failed to fetch test history")
      }
    } catch (err) {
      console.error("Error finding latest attempt:", err)
      setError("Could not find attempt details.")
      setLoading(false)
    }
  }

  const checkAuthentication = async () => {
    try {
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
      return { success: false, error: `Authentication check failed: ${error.message}` }
    }
  }

  const checkAuthAndFetchData = async (attId) => {
    try {
      setLoading(true)
      setError("")
      setAuthError(false)

      const authCheck = await checkAuthentication()
      if (!authCheck.success) {
        setAuthError(true)
        setError(authCheck.error)
        setLoading(false)
        return
      }

      await fetchAnalytics(attId)
    } catch (error) {
      console.error("❌ Error in checkAuthAndFetchData:", error)
      setAuthError(true)
      setError(`Failed to load data: ${error.message}`)
      setLoading(false)
    }
  }

  const fetchAnalytics = async (attId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/analytics/student/${attId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError(error.message)
      setLoading(false)
    }
  }

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(window.location.pathname)
    router.push(`/login?returnUrl=${returnUrl}&role=admin`)
  }

  const tabs = [
    {
      id: "performance",
      label: "Performance Overview",
      description: "Overall performance metrics",
      icon: Trophy,
    },
    {
      id: "subject",
      label: "Subject Analysis",
      description: "Subject-wise breakdown",
      icon: BookOpen,
    },
    {
      id: "time",
      label: "Time Management",
      description: "Time allocation analysis",
      icon: Clock,
    },
    {
      id: "comparison",
      label: "Peer Comparison",
      description: "Compare with others",
      icon: Users,
    },
    {
      id: "questions",
      label: "Question Review",
      description: "Detailed question analysis",
      icon: Target,
    },
  ]

  // Desktop Quick Stats Component
  const DesktopQuickStats = ({ data }) => {
    const score = data?.attempt?.score || {}
    const analytics = data?.analytics || {}

    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Quick Stats</h3>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Score</span>
            <span className="text-teal-400 font-bold">
              {score.obtained || 0}/{score.total || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Percentage</span>
            <span className="text-blue-400 font-bold">{Math.round(score.percentage || 0)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Rank</span>
            <span className="text-yellow-400 font-bold">#{analytics.rank || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Percentile</span>
            <span className="text-purple-400 font-bold">{analytics.percentile || 0}%</span>
          </div>
        </div>
      </Card>
    )
  }

  const renderContent = () => {
    if (!data) return null

    switch (activeTab) {
      case "performance":
        return <PerformanceOverview attemptData={data.attempt} testData={data.test} analyticsData={data.analytics} />
      case "subject":
        return <SubjectAnalysis attemptData={data.attempt} testData={data.test} analyticsData={data.analytics} />
      case "time":
        return <TimeManagement attemptData={data.attempt} testData={data.test} analyticsData={data.analytics} />
      case "comparison":
        return <ComparativeAnalysis attemptData={data.attempt} testData={data.test} analyticsData={data.analytics} />
      case "questions":
        return <QuestionReview attemptData={data.attempt} testData={data.test} analyticsData={data.analytics} />
      default:
        return <PerformanceOverview attemptData={data.attempt} testData={data.test} analyticsData={data.analytics} />
    }
  }

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
          <div className="text-lg font-medium text-slate-300">Loading analysis...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-lg mb-4">Error loading data</div>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700">
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
              { label: data?.attempt?.student?.name || "Student", path: `/admin/analytics/students/${studentId}` },
              { label: data?.test?.title || "Test Analysis" },
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
                  {data?.test?.title || "Test Analysis"}
                </h1>
                <p className="text-slate-400 mt-1">
                  Attempt #{data?.attempt?.attemptNumber} • {data?.attempt?.student?.name}
                </p>
              </div>
            </div>
            <Button
              onClick={() => checkAuthAndFetchData(currentAttemptId)}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <DesktopQuickStats data={data} />

            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${activeTab === tab.id
                          ? "bg-gradient-to-r from-teal-600/20 to-blue-600/20 border border-teal-500/30 text-teal-400"
                          : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-xs opacity-70">{tab.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
