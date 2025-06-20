"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity,
  Home,
  RefreshCw,
  History,
  LogIn,
} from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"
import TestHistoryDashboard from "@/components/test/TestHistoryDashboard"
import AdminProgressChart from "@/components/admin/analytics/AdminProgressChart"
import AdminQuickStats from "@/components/admin/analytics/AdminQuickStats"
import AdminTestHistoryList from "@/components/admin/analytics/AdminTestHistoryList"
// import AdminTestHistoryDebug from "@/components/admin/analytics/AdminTestHistoryDebug"
import AdminActivityHeatmap from "@/components/admin/analytics/AdminActivityHeatmap"

export default function AdminStudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.studentId

  const [comprehensiveData, setComprehensiveData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("progress")
  const [showTestHistory, setShowTestHistory] = useState(false)
  const [selectedTestId, setSelectedTestId] = useState(null)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    if (studentId) {
      checkAuthAndFetchData()
    }
  }, [studentId])

  const checkAuthentication = async () => {
    try {
      console.log("🔍 Checking authentication...")

      // Try to get token from multiple sources
      let token = localStorage.getItem("token")
      console.log("Token from localStorage:", token ? "Found" : "Not found")

      // If no token in localStorage, try cookies
      if (!token) {
        const cookies = document.cookie.split(";")
        const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("token="))
        if (tokenCookie) {
          token = tokenCookie.split("=")[1]
          console.log("Token from cookies:", "Found")
        }
      }

      if (!token) {
        console.log("❌ No token found anywhere")
        return { success: false, error: "No authentication token found. Please log in." }
      }

      console.log("✅ Token found, verifying...")

      // Verify the token by calling the auth endpoint
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Auth API response status:", response.status)

      if (response.ok) {
        const userData = await response.json()
        console.log("✅ User data received:", { role: userData.user?.role, email: userData.user?.email })

        if (userData.user?.role !== "admin") {
          console.log("❌ User is not admin, role:", userData.user?.role)
          return { success: false, error: "Admin access required" }
        }

        console.log("✅ Admin authentication successful")
        return { success: true, user: userData.user }
      } else {
        console.log("❌ Auth API failed with status:", response.status)
        const errorData = await response.json().catch(() => ({}))
        console.log("Error data:", errorData)

        // If unauthorized, token might be expired
        if (response.status === 401) {
          return { success: false, error: "Authentication token expired. Please log in again." }
        }

        return { success: false, error: errorData.error || "Authentication failed" }
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

      console.log("🚀 Starting auth check and data fetch...")

      // First check if we're authenticated
      const authCheck = await checkAuthentication()
      console.log("Auth check result:", authCheck)

      if (!authCheck.success) {
        console.log("❌ Auth check failed:", authCheck.error)
        setAuthError(true)
        setError(authCheck.error)
        setLoading(false)
        return
      }

      console.log("✅ Auth check passed, fetching data...")
      // If authenticated, fetch the data
      await fetchComprehensiveData()
    } catch (error) {
      console.error("❌ Auth check and fetch failed:", error)
      setAuthError(true)
      setError(`Authentication failed: ${error.message}`)
      setLoading(false)
    }
  }

  const fetchComprehensiveData = async () => {
    try {
      setError("")

      const token = localStorage.getItem("token")
      console.log("🔍 Fetching comprehensive data for student:", studentId)

      const response = await fetch(`/api/admin/analytics/students/${studentId}/comprehensive`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Comprehensive API response status:", response.status)

      if (response.status === 401 || response.status === 403) {
        throw new Error("Session expired. Please refresh the page.")
      }

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Comprehensive data loaded successfully")
        console.log("Progress data:", result.data.progressData)
        setComprehensiveData(result.data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch student data`)
      }
    } catch (error) {
      console.error("❌ Error fetching comprehensive data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    // Redirect to admin login with return URL
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

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0h"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const handleTestHistoryClick = (testId) => {
    setSelectedTestId(testId)
    setShowTestHistory(true)
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
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Go to Home
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
          <div className="text-lg font-medium text-slate-300">Loading student analytics...</div>
          <div className="text-sm text-slate-400 mt-2">Authenticating and fetching data...</div>
        </div>
      </div>
    )
  }

  if (error && !authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-lg mb-4">Error loading student data</div>
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

  if (!comprehensiveData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 text-lg">Student data not found</div>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const { profile, quickStats, testHistory, progressData, streakData, heatmapData, debug } = comprehensiveData

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
              { label: profile.name },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              {/* <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button> */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  {profile.name}
                </h1>
                <p className="text-slate-400 mt-1">Student Analytics Dashboard</p>
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
        {/* Debug Info (Development Only) */}
        {/* {debug && process.env.NODE_ENV === "development" && (
          <Card className="bg-yellow-900/20 border-yellow-600/50 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-400">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-yellow-200 space-y-2">
                <p>
                  <strong>Working Query:</strong> {JSON.stringify(debug.workingQuery)}
                </p>
                <p>
                  <strong>Total Attempts Found:</strong> {debug.totalAttempts}
                </p>
                <p>
                  <strong>Completed Attempts:</strong> {debug.completedAttempts}
                </p>
                <p>
                  <strong>Sample Fields:</strong> {debug.sampleAttemptFields?.join(", ")}
                </p>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Enhanced Professional Student Info Card */}
        <div className="relative overflow-hidden mb-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-purple-900/60 backdrop-blur-xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.1),transparent_50%)]"></div>

          <Card className="relative border border-slate-700/50 shadow-2xl shadow-slate-900/50 ">
            <CardContent className="">
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-teal-600/20 via-blue-600/20 to-purple-600/20 p-6 border-b border-slate-700/50 -mr-6 -ml-6">
                <div className="flex items-center gap-4 ">
                  <div className="relative ">
                    {/* Avatar with Ring */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                        {profile.profile?.avatar ? (
                          <img
                            src={profile.profile.avatar || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-10 w-10 text-slate-300" />
                        )}
                      </div>
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-1">
                      {profile.name}
                    </h2>
                    <p className="text-slate-400 text-sm mb-2">Student ID: {studentId.slice(-8).toUpperCase()}</p>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2">
                      {profile.isPremium ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-full">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-yellow-400 text-xs font-medium">Premium Member</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-full">
                          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                          <span className="text-slate-400 text-xs font-medium">Free Tier</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                        <Activity className="h-3 w-3 text-green-400" />
                        <span className="text-green-400 text-xs font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Email Card */}
                  <div className="group relative">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <div className="relative bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 group-hover:border-blue-500/30 transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-blue-500/20 flex-shrink-0">
        <Mail className="h-5 w-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-slate-200 font-medium text-sm truncate"
          title={profile.email}
        >
          {profile.email}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-xs text-green-400">Verified</span>
    </div>
  </div>
</div>


                  {/* Phone Card */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 group-hover:border-green-500/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/20">
                          <Phone className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          {/* <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Phone Number</p> */}
                          <p className="text-slate-200 font-medium text-sm">
                            {profile.whatsappNo ? `+${profile.whatsappNo}` : "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${profile.whatsappNo ? "bg-green-400 animate-pulse" : "bg-slate-500"}`}
                        ></div>
                        <span className={`text-xs ${profile.whatsappNo ? "text-green-400" : "text-slate-500"}`}>
                          {profile.whatsappNo ? "Available" : "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Date Card */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 group-hover:border-purple-500/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/20">
                          <Calendar className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Member Since</p>
                          <p className="text-slate-200 font-medium text-sm">{formatDate(profile.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-xs text-purple-400">
                          {Math.floor((new Date() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Status Card */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 group-hover:border-teal-500/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-teal-500/20">
                          <Activity className="h-5 w-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Account Status</p>
                          <p className="text-slate-200 font-medium text-sm">
                            {profile.isPremium ? "Premium" : "Free Tier"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${profile.isPremium ? "bg-yellow-400 animate-pulse" : "bg-slate-400"}`}
                        ></div>
                        <span className={`text-xs ${profile.isPremium ? "text-yellow-400" : "text-slate-400"}`}>
                          {profile.isPremium ? "Active subscription" : "Basic access"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats Row */}
                {/* <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-400">{quickStats?.totalTests || 0}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Tests Taken</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.round((quickStats?.averageScore || 0) * 10) / 10}%
                      </div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Avg Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round((quickStats?.bestScore || 0) * 10) / 10}%
                      </div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Best Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {formatTime(quickStats?.totalTimeSpent || 0)}
                      </div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Study Time</div>
                    </div>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Quick Stats Cards */}
        <AdminQuickStats
          userId={studentId}
          studentId={studentId}
          isAdminView={true}
          comprehensiveData={comprehensiveData}
        />

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {/* <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-teal-500 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Overview
              </button> */}
              <button
                onClick={() => setActiveTab("progress")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "progress"
                    ? "border-teal-500 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
                }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Progress Analytics
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-teal-500 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                Test History
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "activity"
                    ? "border-teal-500 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
                }`}
              >
                <Activity className="h-4 w-4 inline mr-2" />
                Activity & Streaks
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-200">Student Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-slate-200 mb-4">Performance Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tests Completed:</span>
                        <span className="text-slate-200 font-medium">{quickStats?.totalTests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Average Score:</span>
                        <span className="text-slate-200 font-medium">
                          {Math.round((quickStats?.averageScore || 0) * 10) / 10}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Best Performance:</span>
                        <span className="text-slate-200 font-medium">
                          {Math.round((quickStats?.bestScore || 0) * 10) / 10}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Study Time:</span>
                        <span className="text-slate-200 font-medium">
                          {formatTime(quickStats?.totalTimeSpent || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-slate-200 mb-4">Recent Activity</h4>
                    <div className="text-slate-400">
                      {testHistory && testHistory.length > 0 ? (
                        <div className="space-y-2">
                          <p>Last test: {testHistory[0]?.test?.title || "Unknown"}</p>
                          <p>Date: {formatDate(testHistory[0]?.createdAt || new Date())}</p>
                        </div>
                      ) : (
                        <p>No recent test activity</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
              <CardHeader>
                {/* <CardTitle className="text-slate-200">Progress Analytics</CardTitle> */}
              </CardHeader>
              <CardContent>
                {progressData?.trendData && progressData.trendData.length > 0 ? (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-slate-200">{progressData.summary?.totalTests || 0}</div>
                        <div className="text-xs text-slate-400">Total Tests</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-slate-200">
                          {Math.round((progressData.summary?.averageScore || 0) * 10) / 10}%
                        </div>
                        <div className="text-xs text-slate-400">Average Score</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-slate-200">
                          {Math.round((progressData.summary?.bestScore || 0) * 10) / 10}%
                        </div>
                        <div className="text-xs text-slate-400">Best Score</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-400">{progressData.trendData.length}</div>
                        <div className="text-xs text-slate-400">Data Points</div>
                      </div>
                    </div> */}

                    {/* Admin Progress Chart */}
                    <Card className="bg-slate-700/20 border-slate-600/50">
                      <CardHeader>
                        {/* <CardTitle className="text-slate-200 text-lg">Performance Trend</CardTitle> */}
                      </CardHeader>
                      <CardContent>
                        <AdminProgressChart progressData={progressData} />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No Progress Data</h3>
                    <p className="text-slate-400">This student hasn't completed any tests yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
              <CardHeader>
                {/* <CardTitle className="text-slate-200">Test History</CardTitle> */}
              </CardHeader>
              <CardContent>
                {/* Debug info */}
                {/* <AdminTestHistoryDebug testHistory={testHistory} /> */}

                {/* Debug info */}
                {/* {process.env.NODE_ENV === "development" && (
                  <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                    <p>
                      <strong>Debug:</strong> StudentId: {studentId}
                    </p>
                    <p>
                      <strong>Test History Length:</strong> {testHistory?.length || 0}
                    </p>
                    <p>
                      <strong>Sample Test ID:</strong>{" "}
                      {testHistory?.[0]?.test?._id || testHistory?.[0]?.testId || "None"}
                    </p>
                  </div>
                )} */}

                {/* Use the list view that matches your screenshot */}
                <AdminTestHistoryList testHistory={testHistory} studentId={studentId} studentName={profile.name} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-6">
            <AdminActivityHeatmap studentId={studentId} />
          </div>
        )}
      </div>

      {/* Test History Modal */}
      {showTestHistory && selectedTestId && (
        <TestHistoryDashboard
          testId={selectedTestId}
          onClose={() => {
            setShowTestHistory(false)
            setSelectedTestId(null)
          }}
        />
      )}
    </div>
  )
}
