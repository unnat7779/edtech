"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import ProgressChart from "@/components/dashboard/student/ProgressChart"
import Logo from "@/components/ui/Logo"
import { getStoredUser, clearAuthData } from "@/lib/auth-utils"
import {
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  User,
  LogOut,
  FileText,
  Calendar,
  Menu,
  X,
  Home,
  BookIcon,
  Settings,
  BarChart3,
  PenTool,
  History,
  MessageSquare,
  Bell,
} from "lucide-react"

import ActivityHeatmap from "@/components/dashboard/student/ActivityHeatmap"
import TestAttemptsChart from "@/components/dashboard/student/TestAttemptsChart"
import RecentTestModal from "@/components/test/RecentTestModal"
import NotificationBell from "@/components/notifications/NotificationBell"
// import AdminReplyBell from "@/components/notifications/AdminReplyBell"
import FloatingFeedbackButton from "@/components/feedback/FloatingFeedbackButton"

export default function Dashboard({ user: propUser, isAdminViewing = false }) {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id || propUser?._id // Get user ID from route params or prop

  const [user, setUser] = useState(propUser)
  const [recentAttempts, setRecentAttempts] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showRecentTestModal, setShowRecentTestModal] = useState(false)

  // Use prop user if provided (for admin viewing), otherwise get from localStorage
  useEffect(() => {
    if (propUser) {
      setUser(propUser)
    } else {
      const userData = getStoredUser()
      if (userData) {
        setUser(userData)
      } else {
        router.push("/login")
      }
    }
  }, [propUser])

  useEffect(() => {
    if (userId && userId !== "undefined") {
      console.log("Dashboard loading data for user ID:", userId)
      fetchDashboardData()
    }
  }, [userId])

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log("Fetching dashboard data for user ID:", userId)

      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      // Fetch recent test attempts for specific user
      const attemptsResponse = await fetch(`/api/test-attempts?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (attemptsResponse.ok) {
        const attemptsData = await attemptsResponse.json()
        const attempts = attemptsData.attempts || []
        console.log(`Found ${attempts.length} attempts for user ${userId}`)
        setRecentAttempts(attempts.slice(0, 5))

        // Calculate statistics from user's specific attempts
        if (attempts.length > 0) {
          const completedAttempts = attempts.filter((attempt) => attempt.status === "completed")
          const totalMarksObtained = completedAttempts.reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0)
          const bestMarksObtained = Math.max(...completedAttempts.map((attempt) => attempt.score?.obtained || 0))
          const averageMarks = completedAttempts.length > 0 ? totalMarksObtained / completedAttempts.length : 0

          // Calculate total time spent on tests (in seconds)
          const totalTestTime = completedAttempts.reduce((sum, attempt) => {
            const timeSpent = attempt.timeSpent || 0
            return sum + (typeof timeSpent === "number" ? timeSpent : 0)
          }, 0)

          // Update user stats with calculated values
          setUser((prevUser) => ({
            ...prevUser,
            testStats: {
              totalTests: completedAttempts.length,
              averageScore: averageMarks,
              bestScore: bestMarksObtained,
              totalTimeSpent: totalTestTime,
            },
          }))
        } else {
          // No attempts found, set default stats
          setUser((prevUser) => ({
            ...prevUser,
            testStats: {
              totalTests: 0,
              averageScore: 0,
              bestScore: 0,
              totalTimeSpent: 0,
            },
          }))
        }
      }

      // Fetch upcoming doubt sessions for specific user
      const sessionsResponse = await fetch(`/api/doubt-sessions?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setUpcomingSessions(sessionsData.sessions?.slice(0, 3) || [])
      }
    } catch (error) {
      console.error("Dashboard data fetch error for user", userId, ":", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (isAdminViewing) {
      // If admin is viewing, return to admin panel
      localStorage.removeItem("adminViewingStudent")
      localStorage.removeItem("adminViewMode")
      router.push("/admin/analytics/students")
    } else {
      // Normal logout
      try {
        await fetch("/api/auth/logout", { method: "POST" })
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        clearAuthData()
        router.push("/")
      }
    }
  }

  // Mobile sidebar
  const MobileSidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-lg transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <Logo size="sm" variant="gradient" onClick={() => router.push("/")} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-teal-500 to-blue-500">
            {user?.profile?.avatar ? (
              <img
                src={user.profile.avatar || "/placeholder.svg"}
                alt="Profile"
                className="h-full w-full object-cover rounded-full border-2 border-slate-700"
              />
            ) : (
              <span className="text-lg font-medium text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            )}
            <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-teal-400 rounded-full border-2 border-slate-800"></span>
          </div>
          <div>
            <div className="text-lg font-medium text-teal-400">{user?.name || "User"}</div>
            <div className="text-sm text-slate-400 flex items-center gap-1">
              <User className="h-3 w-3" />
              Class {user?.class || "N/A"}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => {
              router.push(userId ? `/dashboard/${userId}` : "/dashboard")
              setMobileMenuOpen(false)
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-800/50 text-teal-400"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              router.push("/tests")
              setMobileMenuOpen(false)
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800/50 text-slate-300"
          >
            <FileText className="h-5 w-5" />
            <span>Tests</span>
          </button>

          <button
            onClick={() => {
              router.push("/book-session")
              setMobileMenuOpen(false)
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800/50 text-slate-300"
          >
            <BookIcon className="h-5 w-5" />
            <span>Book Session</span>
          </button>

          <button
            onClick={() => {
              router.push("/feedback")
              setMobileMenuOpen(false)
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800/50 text-slate-300"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Submit Feedback</span>
          </button>

          <button
            onClick={() => {
              router.push("/notifications")
              setMobileMenuOpen(false)
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800/50 text-slate-300"
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => {
              router.push("/profile")
              setMobileMenuOpen(false)
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800/50 text-slate-300"
          >
            <Settings className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-slate-800/50 text-slate-400"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )

  // Overlay for mobile sidebar
  const MobileOverlay = () => (
    <div
      className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={() => setMobileMenuOpen(false)}
    />
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
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

  if (!user || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
        <div className="text-lg text-slate-300">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
      {/* Admin Viewing Banner */}
      {/* {isAdminViewing && (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="font-medium">
              👁️ Admin View: Viewing {user.name}'s Dashboard (ID: {userId})
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("adminViewingStudent")
                localStorage.removeItem("adminViewMode")
                router.push("/admin/analytics/students")
              }}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Return to Admin Panel
            </button>
          </div>
        </div>
      )} */}

      {/* Mobile Sidebar */}
      <MobileSidebar />
      <MobileOverlay />

      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-700/50"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-slate-300" />
              </button>

              {/* Logo - hidden on smallest screens, visible on sm and up */}
              <div className="hidden sm:block">
                <Logo
                  size="md"
                  variant="gradient"
                  onClick={() => router.push("/")}
                  className="sm:scale-75 md:scale-90 lg:scale-100"
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent truncate max-w-[180px] sm:max-w-[220px] md:max-w-[300px] lg:max-w-none">
                  Welcome back, {user?.name || "User"}!
                </h1>
                {/* <p className="text-slate-400 flex items-center gap-2 mt-1 text-xs sm:text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  Class {user?.class || "N/A"}
                  {isAdminViewing && <span className="text-orange-400 ml-2">• Admin Viewing</span>}
                </p> */}
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Notification Bell - only show for actual students, not admin viewing */}
              {!isAdminViewing && (
                <>
                  <NotificationBell />
                  {/* <AdminReplyBell /> */}
                </>
              )}

              {/* Give Test Button */}
              <Button
                onClick={() => router.push("/tests")}
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg text-xs md:text-sm"
              >
                <PenTool className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Give Test</span>
                <span className="sm:hidden">Test</span>
              </Button>

              {/* Book Session Button */}
              <Button
                onClick={() => router.push("/book-session")}
                variant="secondary"
                size="sm"
                className="text-xs md:text-sm"
              >
                <BookIcon className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Book Doubt Session</span>
                <span className="sm:inline md:hidden">Book Session</span>
              </Button>

              {/* Profile Icon */}
              <button
                onClick={() => router.push("/profile")}
                className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-teal-500/20"
                aria-label="My Profile"
              >
                {user?.profile?.avatar ? (
                  <img
                    src={user.profile.avatar || "/placeholder.svg"}
                    alt="Profile"
                    className="h-full w-full object-cover rounded-full border-2 border-slate-700"
                  />
                ) : (
                  <span className="text-xs sm:text-sm font-medium text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-teal-400 rounded-full border-2 border-slate-800"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <Card variant="primary" className="transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-teal-900/50 to-teal-800/50 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-teal-400" />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-teal-400">
                {user?.testStats?.totalTests || 0}
              </div>
              <div className="text-xs md:text-sm text-slate-400">Tests Taken</div>
            </CardContent>
          </Card>

          <Card variant="secondary" className="transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-400" />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                {Math.round(user?.testStats?.averageScore || 0)}
              </div>
              <div className="text-xs md:text-sm text-slate-400">Average Marks</div>
            </CardContent>
          </Card>

          <Card variant="accent" className="transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-400" />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400">
                {user?.testStats?.bestScore || 0}
              </div>
              <div className="text-xs md:text-sm text-slate-400">Best Marks</div>
            </CardContent>
          </Card>

          <Card variant="primary" className="transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-teal-900/50 to-teal-800/50 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-teal-400" />
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-teal-400">
                {(() => {
                  const totalSeconds = user?.testStats?.totalTimeSpent || 0
                  const hours = Math.floor(totalSeconds / 3600)
                  const minutes = Math.floor((totalSeconds % 3600) / 60)

                  if (hours > 0) {
                    return `${hours}h ${minutes}m`
                  } else if (minutes > 0) {
                    return `${minutes}m`
                  } else {
                    return `${totalSeconds}s`
                  }
                })()}
              </div>
              <div className="text-xs md:text-sm text-slate-400">Test Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart Section - Pass user ID */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            <h2 className="text-lg md:text-xl font-semibold text-slate-200">Your Progress Analytics</h2>
          </div>
          <ProgressChart studentId={userId} isAdminView={isAdminViewing} />
        </div>

        {/* Test Attempts Chart - Pass user ID */}
        <div id="analytics" className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            <h2 className="text-lg md:text-xl font-semibold text-slate-200">Test Attempts Analytics</h2>
          </div>
          <TestAttemptsChart studentId={userId} isAdminView={isAdminViewing} />
        </div>

        {/* Activity Heatmap - Pass user ID */}
        <div id="activity" className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-teal-400" />
            <h2 className="text-lg md:text-xl font-semibold text-slate-200">Activity & Streaks</h2>
          </div>
          <ActivityHeatmap studentId={userId} isAdminView={isAdminViewing} />
        </div>

        {/* Recent Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Recent Test Attempts */}
          <div className="md:col-span-2">
            <Card variant="primary">
              <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-teal-400" />
                    Recent Test Attempts
                  </CardTitle>
                  <Button
                    onClick={() => setShowRecentTestModal(true)}
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 text-xs sm:text-sm"
                  >
                    <History className="h-3 w-3 mr-1" />
                    View History
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                {recentAttempts.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {recentAttempts.map((attempt) => (
                      <div
                        key={attempt._id}
                        className="flex justify-between items-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700 hover:border-teal-800 hover:shadow-md transition-all duration-200"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-slate-200 text-xs sm:text-sm md:text-base truncate">
                            {attempt.test?.title || "Untitled Test"}
                          </h4>
                          <p className="text-xs md:text-sm text-slate-400 truncate">
                            {attempt.test?.type || "Test"} • {attempt.test?.subject || "General"}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {attempt.createdAt
                              ? new Date(attempt.createdAt).toLocaleDateString()
                              : "Date not available"}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm sm:text-base md:text-lg font-semibold text-teal-400">
                            {attempt.score?.percentage?.toFixed(1) || 0}%
                          </div>
                          <div className="text-xs md:text-sm text-slate-400">
                            {attempt.score?.obtained || 0}/{attempt.score?.total || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8 text-slate-400">
                    <FileText className="h-10 w-10 md:h-12 md:w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm md:text-base">No test attempts yet. Start with your first test!</p>
                    <Button onClick={() => router.push("/tests")} variant="primary" size="sm" className="mt-3">
                      Take a Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <Card variant="secondary" className="h-full">
              <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session._id}
                        className="p-2 sm:p-3 md:p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700 hover:border-blue-800 transition-all duration-200"
                      >
                        <div className="font-medium text-slate-200 text-xs sm:text-sm md:text-base truncate">
                          {session.subject || "Subject not specified"}
                        </div>
                        <div className="text-xs md:text-sm text-slate-400 truncate">
                          {session.topic || "Topic not specified"}
                        </div>
                        <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {session.preferredTimeSlot?.date
                            ? new Date(session.preferredTimeSlot.date).toLocaleDateString()
                            : "Date not specified"}
                          {session.preferredTimeSlot?.time && <span> at {session.preferredTimeSlot.time}</span>}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                            session.status === "confirmed"
                              ? "bg-green-900/50 text-green-400"
                              : session.status === "pending"
                                ? "bg-yellow-900/50 text-yellow-400"
                                : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {session.status || "pending"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8 text-slate-400">
                    <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm md:text-base">No upcoming sessions.</p>
                    <Button onClick={() => router.push("/book-session")} variant="secondary" size="sm" className="mt-3">
                      Book Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Test Modal */}
      <RecentTestModal isOpen={showRecentTestModal} onClose={() => setShowRecentTestModal(false)} />

      {/* Floating Feedback Button - only show for actual students, not admin viewing */}
      {!isAdminViewing && <FloatingFeedbackButton />}
    </div>
  )
}
