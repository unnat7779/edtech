"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/components/ui/Logo"
import AnnouncementForm from "./AnnouncementForm"
import {
  Users,
  FileText,
  BookOpen,
  ArrowRight,
  Calendar,
  Clock,
  ChevronRight,
  Home,
  LogOut,
  Settings,
  FileQuestion,
  BookCheck,
  Layers,
  Sparkles,
  MessageSquare,
  Megaphone,
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Eye,
} from "lucide-react"
import { getStoredUser, clearAuthData } from "@/lib/auth-utils"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalTests: 0,
    totalStudents: 0,
    totalAttempts: 0,
    recentTests: [],
  })
  const [analyticsStats, setAnalyticsStats] = useState({
    averageScore: 0,
    activeUsers: 0,
    newUsers: 0,
    topPerformers: [],
  })
  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    open: 0,
    urgent: 0,
    bugs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeCard, setActiveCard] = useState(null)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)

  useEffect(() => {
    const userData = getStoredUser()
    if (userData && userData.role === "admin") {
      setUser(userData)
      fetchAdminStats()
      fetchFeedbackStats()
      fetchAnalyticsOverview()
    } else {
      router.push("/login")
    }
  }, [])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        console.error("No token found for admin stats request")
        setError("Authentication required")
        return
      }

      console.log("Making admin stats request with token")

      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Admin stats response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        const errorData = await response.json()
        console.error("Admin stats request failed:", response.status, errorData)
        setError(errorData.error || "Failed to fetch admin stats")
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
      setError("Failed to fetch admin stats")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalyticsOverview = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        console.error("No token found for analytics request")
        return
      }

      console.log("Making analytics request with token:", token ? "Present" : "Missing")

      const response = await fetch("/api/admin/analytics/global?timeRange=7d", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Analytics response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        setAnalyticsStats({
          averageScore: Math.round(
            data.data?.globalMetrics?.averageTestScore || data.globalAnalytics?.averageScore || 0,
          ),
          activeUsers: data.data?.globalMetrics?.activeUsers || data.globalAnalytics?.recentUsers || 0,
          newUsers: data.data?.globalMetrics?.newUsersInPeriod || data.globalAnalytics?.recentUsers || 0,
          topPerformers: data.data?.topPerformers?.slice(0, 3) || [],
        })
      } else {
        console.error("Analytics request failed:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch analytics overview:", error)
    }
  }

  const fetchFeedbackStats = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        console.error("No token found for feedback stats request")
        return
      }

      const response = await fetch("/api/admin/feedbacks?limit=1", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFeedbackStats(data.statistics || {})
      } else {
        console.error("Feedback stats request failed:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch feedback stats:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      clearAuthData()
      router.push("/")
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleAnnouncementSuccess = (announcement) => {
    console.log("Announcement created:", announcement)
    // Optionally refresh stats or show success message
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 opacity-20 animate-pulse"></div>
          </div>
          <div className="text-lg font-medium text-slate-300">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with gradient background */}
      <header className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-md shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-8">
              <Logo size="lg" variant="gradient" onClick={() => router.push("/")} />
              <div>
                <h1 className="text-2xl font-bold text-slate-100 drop-shadow-sm">Admin Dashboard</h1>
                <p className="text-teal-300 text-sm font-medium">Welcome back, {user?.name || "Admin"}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="group inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/25"
              >
                <Megaphone className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                New Announcement
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="group inline-flex items-center px-5 py-2.5 border border-slate-600 text-sm font-medium rounded-lg text-slate-200 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/25"
              >
                <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Student View
              </button>
              <button
                onClick={handleLogout}
                className="group inline-flex items-center px-5 py-2.5 border border-slate-600 text-sm font-medium rounded-lg text-slate-200 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/25"
              >
                <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 text-red-300 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Navigation breadcrumbs */}
        <div className="flex items-center text-sm text-slate-400 mb-8 bg-slate-800/60 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-slate-700">
          <Home className="h-4 w-4 mr-2 text-teal-400" />
          <span className="mx-1">Home</span>
          <ChevronRight className="h-4 w-4 mx-1 text-slate-600" />
          <span className="font-semibold text-slate-200">Admin Dashboard</span>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/20 hover:border-teal-800/50 transform hover:-translate-y-2 cursor-pointer"
            onMouseEnter={() => setActiveCard("tests")}
            onMouseLeave={() => setActiveCard(null)}
            onClick={() => router.push("/admin/tests")}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl transition-all duration-300 ${
                  activeCard === "tests"
                    ? "bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg shadow-teal-900/30"
                    : "bg-gradient-to-r from-slate-700 to-slate-800"
                }`}
              >
                <FileText
                  className={`h-6 w-6 transition-all duration-300 ${
                    activeCard === "tests" ? "text-white scale-110" : "text-teal-400"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">Total</span>
            </div>
            <div className="text-3xl font-bold text-slate-100 mb-1 group-hover:text-teal-300 transition-colors duration-300">
              {stats.totalTests}
            </div>
            <div className="text-sm text-slate-400 flex items-center group-hover:text-teal-400 transition-colors duration-300">
              <span>Total Tests</span>
              <ArrowRight className="h-3 w-3 ml-2 opacity-70 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          <div
            className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:border-blue-800/50 transform hover:-translate-y-2 cursor-pointer"
            onMouseEnter={() => setActiveCard("students")}
            onMouseLeave={() => setActiveCard(null)}
            onClick={() => router.push("/admin/analytics/students")}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl transition-all duration-300 ${
                  activeCard === "students"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-900/30"
                    : "bg-gradient-to-r from-slate-700 to-slate-800"
                }`}
              >
                <Users
                  className={`h-6 w-6 transition-all duration-300 ${
                    activeCard === "students" ? "text-white scale-110" : "text-blue-400"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-100 mb-1 group-hover:text-blue-300 transition-colors duration-300">
              {stats.totalStudents}
            </div>
            <div className="text-sm text-slate-400 flex items-center group-hover:text-blue-400 transition-colors duration-300">
              <span>Total Students</span>
              <ArrowRight className="h-3 w-3 ml-2 opacity-70 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          <div
            className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-900/20 hover:border-yellow-800/50 transform hover:-translate-y-2 cursor-pointer"
            onMouseEnter={() => setActiveCard("performance")}
            onMouseLeave={() => setActiveCard(null)}
            onClick={() => router.push("/admin/analytics/global")}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl transition-all duration-300 ${
                  activeCard === "performance"
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-700 shadow-lg shadow-yellow-900/30"
                    : "bg-gradient-to-r from-slate-700 to-slate-800"
                }`}
              >
                <Award
                  className={`h-6 w-6 transition-all duration-300 ${
                    activeCard === "performance" ? "text-white scale-110" : "text-yellow-400"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">Avg</span>
            </div>
            <div className="text-3xl font-bold text-slate-100 mb-1 group-hover:text-yellow-300 transition-colors duration-300">
              {analyticsStats.averageScore}%
            </div>
            <div className="text-sm text-slate-400 flex items-center group-hover:text-yellow-400 transition-colors duration-300">
              <span>Average Score</span>
              <ArrowRight className="h-3 w-3 ml-2 opacity-70 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          <div
            className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20 hover:border-red-800/50 transform hover:-translate-y-2 cursor-pointer"
            onMouseEnter={() => setActiveCard("feedback")}
            onMouseLeave={() => setActiveCard(null)}
            onClick={() => router.push("/admin/feedbacks")}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl transition-all duration-300 ${
                  activeCard === "feedback"
                    ? "bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-900/30"
                    : "bg-gradient-to-r from-slate-700 to-slate-800"
                }`}
              >
                <MessageSquare
                  className={`h-6 w-6 transition-all duration-300 ${
                    activeCard === "feedback" ? "text-white scale-110" : "text-red-400"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
                {feedbackStats.urgent > 0 ? "Urgent" : "Total"}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-100 mb-1 group-hover:text-red-300 transition-colors duration-300">
              {feedbackStats.total}
            </div>
            <div className="text-sm text-slate-400 flex items-center group-hover:text-red-400 transition-colors duration-300">
              <span>Feedback Items</span>
              <ArrowRight className="h-3 w-3 ml-2 opacity-70 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Analytics Overview Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-teal-400" />
              Analytics Overview
            </h2>
            <button
              onClick={() => router.push("/admin/analytics")}
              className="text-sm text-slate-300 hover:text-teal-400 flex items-center transition-colors duration-200 hover:bg-slate-700/50 px-3 py-1 rounded-lg"
            >
              View Full Analytics
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Analytics Cards */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
                  7 Days
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-1">{analyticsStats.activeUsers}</div>
              <div className="text-sm text-slate-400">Active Users</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">New</span>
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-1">{analyticsStats.newUsers}</div>
              <div className="text-sm text-slate-400">New Signups</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FileQuestion className="h-6 w-6 text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
                  Total
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-1">{stats.totalAttempts}</div>
              <div className="text-sm text-slate-400">Test Attempts</div>
            </div>
          </div>
        </div>

        {/* Quick Actions with enhanced styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/20">
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-teal-900/50 to-teal-800/50">
              <div className="flex items-center">
                <BookCheck className="h-6 w-6 text-teal-400 mr-3 drop-shadow-sm" />
                <h3 className="text-lg font-semibold text-slate-100 drop-shadow-sm">Test Management</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => router.push("/admin/tests/create")}
                className="group w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-teal-900/30 transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Create New Test
              </button>
              <button
                onClick={() => router.push("/admin/tests")}
                className="w-full flex items-center justify-center px-4 py-3 border border-teal-800/50 text-sm font-medium rounded-lg text-teal-400 bg-slate-800/50 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5"
              >
                View All Tests
              </button>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20">
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/50 to-blue-800/50">
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 text-blue-400 mr-3 drop-shadow-sm" />
                <h3 className="text-lg font-semibold text-slate-100 drop-shadow-sm">Analytics Hub</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => router.push("/admin/analytics/global")}
                className="group w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-900/30 transform hover:-translate-y-0.5"
              >
                <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Global Analytics
              </button>
              <button
                onClick={() => router.push("/admin/analytics/students")}
                className="w-full flex items-center justify-center px-4 py-3 border border-blue-800/50 text-sm font-medium rounded-lg text-blue-400 bg-slate-800/50 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5"
              >
                Student Analytics
              </button>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20">
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-red-900/50 to-red-800/50">
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-red-400 mr-3 drop-shadow-sm" />
                <h3 className="text-lg font-semibold text-slate-100 drop-shadow-sm">Feedback Management</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => router.push("/admin/feedbacks")}
                className="group w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-900/30 transform hover:-translate-y-0.5"
              >
                <MessageSquare className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Manage Feedback
                {feedbackStats.urgent > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {feedbackStats.urgent}
                  </span>
                )}
              </button>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <div className="text-yellow-400 font-semibold">{feedbackStats.open}</div>
                  <div className="text-slate-400">Open</div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <div className="text-red-400 font-semibold">{feedbackStats.bugs}</div>
                  <div className="text-slate-400">Bugs</div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <div className="text-orange-400 font-semibold">{feedbackStats.urgent}</div>
                  <div className="text-slate-400">Urgent</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tests with enhanced styling */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-700/50 to-slate-800/50 flex justify-between items-center">
            <div className="flex items-center">
              <Layers className="h-6 w-6 text-teal-400 mr-3 drop-shadow-sm" />
              <h3 className="text-lg font-semibold text-slate-100 drop-shadow-sm">Recent Tests</h3>
            </div>
            <button
              onClick={() => router.push("/admin/tests")}
              className="text-sm text-slate-300 hover:text-teal-400 flex items-center transition-colors duration-200 hover:bg-slate-700/50 px-3 py-1 rounded-lg"
            >
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="divide-y divide-slate-700/50">
            {stats.recentTests && stats.recentTests.length > 0 ? (
              stats.recentTests.map((test) => (
                <div
                  key={test._id}
                  className="p-6 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-900/50 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-teal-300 transition-colors duration-300">
                        {test.title}
                      </h4>
                      <div className="flex items-center mt-2 space-x-6">
                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="h-4 w-4 mr-2 text-teal-500" />
                          {formatDate(test.createdAt)}
                        </div>
                        {test.duration && (
                          <div className="flex items-center text-sm text-slate-400">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            {test.duration} min
                          </div>
                        )}
                        {test.subject && (
                          <div className="flex items-center text-sm text-slate-400">
                            <BookOpen className="h-4 w-4 mr-2 text-yellow-500" />
                            {test.subject}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/tests/${test._id}`)}
                      className="px-5 py-2.5 border border-slate-600/50 text-sm font-medium rounded-lg text-slate-300 bg-slate-800/50 hover:bg-gradient-to-r hover:from-teal-600 hover:to-blue-600 hover:text-white hover:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-teal-900/50 to-blue-900/50 mb-6">
                  <FileText className="h-10 w-10 text-teal-400" />
                </div>
                <p className="text-slate-400 mb-6 text-lg">No tests have been created yet.</p>
                <button
                  onClick={() => router.push("/admin/tests/create")}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Your First Test
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer with enhanced styling */}
        <div className="mt-12 pt-8 border-t border-slate-700/50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-400">© {new Date().getFullYear()} JEEElevate. All rights reserved.</p>
            <div className="flex space-x-6">
              <button
                onClick={() => router.push("/admin/settings")}
                className="text-sm text-slate-400 hover:text-teal-400 flex items-center transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </button>
              <button
                onClick={() => router.push("/admin/debug")}
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200"
              >
                Debug
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Form Modal */}
      {showAnnouncementForm && (
        <AnnouncementForm onClose={() => setShowAnnouncementForm(false)} onSuccess={handleAnnouncementSuccess} />
      )}
    </div>
  )
}
