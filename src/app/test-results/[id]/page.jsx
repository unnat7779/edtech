"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import PerformanceOverview from "@/components/analytics/student/PerformanceOverview"
import SubjectAnalysis from "@/components/analytics/student/SubjectAnalysis"
import TimeManagement from "@/components/analytics/student/TimeManagement"
import ComparativeAnalysis from "@/components/analytics/student/ComparativeAnalysis"
import QuestionReview from "@/components/analytics/student/QuestionReview"
import Recommendations from "@/components/analytics/student/Recommendations"
import {
  ArrowLeft,
  Home,
  Menu,
  X,
  PenTool,
  Trophy,
  BookOpen,
  Clock,
  Users,
  Target,
  BarChart3,
  FileText,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react"

export default function TestResultsPage() {
  const router = useRouter()
  const params = useParams()
  const [attemptData, setAttemptData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAttemptData()
    }
  }, [params.id])

  const fetchAttemptData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/test-attempts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAttemptData(data.attempt)
      } else {
        console.error("Failed to fetch attempt data")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching attempt data:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { id: "overview", label: "Performance Overview", icon: Trophy, description: "Overall performance metrics" },
    { id: "subjects", label: "Subject Analysis", icon: BookOpen, description: "Subject-wise breakdown" },
    { id: "time", label: "Time Management", icon: Clock, description: "Time allocation analysis" },
    { id: "comparison", label: "Peer Comparison", icon: Users, description: "Compare with others" },
    { id: "questions", label: "Question Review", icon: Target, description: "Detailed question analysis" },
    { id: "recommendations", label: "Recommendations", icon: TrendingUp, description: "Improvement suggestions" },
  ]

  const sidebarOptions = [
    { id: "dashboard", label: "Dashboard", icon: Home, action: () => router.push("/dashboard") },
    { id: "give-test", label: "Give Another Test", icon: PenTool, action: () => router.push("/tests") },
    { id: "test-history", label: "Test History", icon: FileText, action: () => router.push("/test-history") },
    { id: "analytics", label: "My Analytics", icon: BarChart3, action: () => router.push("/analytics") },
    { id: "feedback", label: "Submit Feedback", icon: MessageSquare, action: () => router.push("/feedback") },
    { id: "profile", label: "Profile Settings", icon: Settings, action: () => router.push("/profile") },
  ]

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Navigation</h2>
              <p className="text-sm text-slate-400">Quick access menu</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Main Menu</h3>
              {sidebarOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      option.action()
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      option.id === "give-test"
                        ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Analytics Sections */}
            <div className="mt-8 space-y-2">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Analytics Sections</h3>
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-teal-600/20 to-blue-600/20 border border-teal-400/30 text-teal-400"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="text-left">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{section.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={() => {
                // Handle logout
                localStorage.clear()
                router.push("/")
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading results...</div>
        </div>
      </div>
    )
  }

  if (!attemptData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-300">Test results not found</div>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Menu and Back */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors md:hidden"
              >
                <Menu className="h-5 w-5 text-slate-300" />
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center mx-4">
              <h1 className="text-sm sm:text-base font-semibold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Test Analytics Dashboard
              </h1>
              <p className="text-xs text-slate-400 truncate mt-0.5">{attemptData?.test?.title || "Test Results"}</p>
            </div>

            {/* Right side - Dashboard button */}
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block mb-6">
          <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            <div className="flex space-x-2 min-w-max">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-teal-600/20 to-blue-600/20 text-teal-400 border border-teal-400/30"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile Section Selector */}
        <div className="block md:hidden mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">Current Section</h3>
                <button onClick={() => setSidebarOpen(true)} className="text-xs text-teal-400 hover:text-teal-300">
                  Change Section
                </button>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const currentSection = sections.find((s) => s.id === activeSection)
                  const Icon = currentSection?.icon || Trophy
                  return (
                    <>
                      <div className="p-2 bg-gradient-to-r from-teal-600/20 to-blue-600/20 rounded-lg">
                        <Icon className="h-5 w-5 text-teal-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{currentSection?.label}</div>
                        <div className="text-xs text-slate-400">{currentSection?.description}</div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        {attemptData && (
          <div className="mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-200">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-400">
                      {attemptData.score?.obtained || 0}/{attemptData.score?.total || 0}
                    </div>
                    <div className="text-sm text-slate-400">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {attemptData.score?.percentage?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-slate-400">Percentage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{attemptData.rank || "N/A"}</div>
                    <div className="text-sm text-slate-400">Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{attemptData.percentile || "N/A"}</div>
                    <div className="text-sm text-slate-400">Percentile</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-6">
          {activeSection === "overview" && <PerformanceOverview attemptData={attemptData} />}
          {activeSection === "subjects" && <SubjectAnalysis attemptData={attemptData} />}
          {activeSection === "time" && <TimeManagement attemptData={attemptData} />}
          {activeSection === "comparison" && <ComparativeAnalysis attemptData={attemptData} />}
          {activeSection === "questions" && <QuestionReview attemptData={attemptData} />}
          {activeSection === "recommendations" && <Recommendations attemptData={attemptData} />}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/tests")}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
          >
            <PenTool className="h-4 w-4 mr-2" />
            Give Another Test
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
