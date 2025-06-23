"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { ArrowLeft, Home, FileText, Trophy, Users, Clock, Target, BookOpen, TrendingUp, Menu, X } from "lucide-react"
import PerformanceOverview from "@/components/analytics/student/PerformanceOverview"
import SubjectAnalysis from "@/components/analytics/student/SubjectAnalysis"
import TimeManagement from "@/components/analytics/student/TimeManagement"
import ComparativeAnalysis from "@/components/analytics/student/ComparativeAnalysis"
import QuestionReview from "@/components/analytics/student/QuestionReview"
import Recommendations from "@/components/analytics/student/Recommendations"

export default function StudentAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("performance")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await fetch(`/api/analytics/student/${params.attemptId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log("Analytics data received:", result)
        setData(result)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.attemptId) {
      fetchAnalytics()
    }
  }, [params.attemptId, router])

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

  // Mobile Quick Stats Grid Component
  const MobileQuickStats = ({ data }) => {
    const score = data?.attempt?.score || {}
    const analytics = data?.analytics || {}

    const stats = [
      {
        label: "Score",
        value: `${score.obtained || 0}/${score.total || 0}`,
        color: "text-teal-400",
        bgColor: "bg-teal-500/10",
        icon: "📊",
      },
      {
        label: "Percentage",
        value: `${Math.round(score.percentage || 0)}%`,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        icon: "📈",
      },
      {
        label: "Rank",
        value: `#${analytics.rank || "N/A"}`,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        icon: "🏆",
      },
      {
        label: "Percentile",
        value: `${analytics.percentile || 0}%`,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        icon: "🎯",
      },
    ]

    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor} border border-slate-700/50 p-4`}>
            <div className="text-center space-y-2">
              <div className="text-2xl">{stat.icon}</div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

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

  // Mobile Navigation Grid
  const MobileNavGrid = () => (
    <div className="grid grid-cols-2 gap-3 p-4">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setSidebarOpen(false)
            }}
            className={`p-4 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-teal-600/20 to-blue-600/20 border border-teal-500/30"
                : "bg-slate-800/50 border border-slate-700/50"
            }`}
          >
            <div className="text-center space-y-2">
              <Icon className={`h-6 w-6 mx-auto ${activeTab === tab.id ? "text-teal-400" : "text-slate-400"}`} />
              <div className={`text-sm font-medium ${activeTab === tab.id ? "text-teal-400" : "text-slate-300"}`}>
                {tab.label}
              </div>
              <div className="text-xs text-slate-500">{tab.description}</div>
            </div>
          </button>
        )
      })}
    </div>
  )

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-red-400 text-lg font-semibold">Something went wrong</div>
          <div className="text-slate-400">An error occurred while loading this page.</div>
          <div className="text-sm text-slate-500 bg-slate-800/50 p-4 rounded-lg max-w-2xl">
            <strong>Error Details</strong>
            <br />
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile-Optimized Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Mobile menu + Back */}
            <div className="flex items-center gap-2">
              {mounted && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center justify-center w-10 h-10 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              {mounted && (
                <button
                  onClick={() => router.back()}
                  className="hidden lg:flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center lg:text-left lg:ml-4">
              <h1 className="text-lg lg:text-2xl font-bold text-slate-200">Test Analytics</h1>
              <p className="text-xs lg:text-sm text-slate-400 truncate">
                {loading ? "Loading..." : data?.test?.title || "Student Analytics"}
              </p>
            </div>

            {/* Right side - Dashboard button */}
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors text-sm"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mounted && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
          <div className="fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-200">Navigation</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Give Another Test Button */}
            <div className="p-4 border-b border-slate-700/50">
              <button
                onClick={() => {
                  router.push("/tests")
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-200"
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">Give Another Test</span>
              </button>
            </div>

            {/* Analytics Navigation */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Analytics Sections</h3>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-teal-600/20 to-blue-600/20 border border-teal-500/30 text-teal-400"
                          : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className="text-xs opacity-70">{tab.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:max-w-7xl lg:mx-auto">
        {/* Mobile Layout */}
        {mounted && (
          <div className="lg:hidden">
            {/* Mobile Quick Stats Grid */}
            {loading ? (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-slate-800/50 border border-slate-700/50 p-4">
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 bg-slate-700 rounded mx-auto animate-pulse"></div>
                        <div className="w-12 h-6 bg-slate-700 rounded mx-auto animate-pulse"></div>
                        <div className="w-16 h-4 bg-slate-700 rounded mx-auto animate-pulse"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              data && <MobileQuickStats data={data} />
            )}

            {/* Mobile Navigation Grid */}
            <MobileNavGrid />

            {/* Mobile Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto"></div>
                    <div className="text-slate-400">Loading analytics data...</div>
                  </div>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        {mounted && (
          <div className="hidden lg:block px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Desktop Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Desktop Quick Stats */}
                {loading ? (
                  <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-6">Quick Stats</h3>
                    <div className="space-y-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="w-16 h-4 bg-slate-700 rounded animate-pulse"></div>
                          <div className="w-12 h-4 bg-slate-700 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  data && <DesktopQuickStats data={data} />
                )}

                {/* Desktop Navigation */}
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4">
                  <div className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                            activeTab === tab.id
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

              {/* Desktop Main Content */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="flex items-center justify-center min-h-[600px]">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto"></div>
                      <div className="text-slate-400">Loading analytics data...</div>
                    </div>
                  </div>
                ) : (
                  renderContent()
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
