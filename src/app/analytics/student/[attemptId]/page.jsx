"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { ArrowLeft, Home, FileText, Trophy, Users, Clock, Target, BookOpen, TrendingUp } from "lucide-react"
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
    {
      id: "recommendations",
      label: "Recommendations",
      description: "Personalized suggestions",
      icon: TrendingUp,
    },
  ]

  // Loading Animation Component for Quick Stats
  const LoadingStats = () => (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-6">Quick Stats</h3>
      <div className="space-y-6">
        {[
          { label: "Score", color: "bg-teal-400" },
          { label: "Percentage", color: "bg-blue-400" },
          { label: "Rank", color: "bg-yellow-400" },
          { label: "Percentile", color: "bg-purple-400" },
        ].map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-slate-400">{stat.label}</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${stat.color} rounded-full animate-pulse`}></div>
              <div className="flex space-x-1">
                <div
                  className={`w-2 h-2 ${stat.color} rounded-full animate-bounce`}
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className={`w-2 h-2 ${stat.color} rounded-full animate-bounce`}
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className={`w-2 h-2 ${stat.color} rounded-full animate-bounce`}
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )

  // Quick Stats Component with Real Data
  const QuickStats = ({ data }) => {
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
      case "recommendations":
        return <Recommendations attemptData={data.attempt} testData={data.test} analyticsData={data.analytics} />
      default:
        return <PerformanceOverview attemptData={data.attempt} testData={data.test} analyticsData={data.analytics} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-200">Test Analytics Dashboard</h1>
                <p className="text-slate-400">{loading ? "Loading..." : data?.test?.title || "Student Analytics"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={() => router.push("/tests")}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Another Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            {loading ? <LoadingStats /> : <QuickStats data={data} />}

            {/* Navigation */}
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

          {/* Main Content */}
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
    </div>
  )
}
