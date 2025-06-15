"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Brain,
  Download,
  Eye,
  Calendar,
  Target,
  Zap,
  BookOpen,
  Clock,
  Award,
  Home,
  ChevronRight,
} from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"

export default function AdminAnalyticsOverview() {
  const router = useRouter()
  const [analyticsOverview, setAnalyticsOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalyticsOverview()
  }, [])

  const fetchAnalyticsOverview = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/overview", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsOverview(data)
      } else {
        throw new Error("Failed to fetch analytics overview")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const analyticsModules = [
    {
      id: "test-analytics",
      title: "Test Analytics",
      description: "Comprehensive test performance analysis with question-level insights",
      icon: FileText,
      color: "from-teal-600 to-blue-600",
      features: ["Question Performance", "Difficulty Analysis", "Time Tracking", "Success Rates"],
      route: "/admin/analytics/tests",
    },
    {
      id: "student-performance",
      title: "Student Performance Matrix",
      description: "Individual and cohort performance tracking with detailed breakdowns",
      icon: Users,
      color: "from-blue-600 to-purple-600",
      features: ["Individual Tracking", "Cohort Analysis", "Performance Trends", "Risk Assessment"],
      route: "/admin/analytics/students",
    },
    {
      id: "subject-intelligence",
      title: "Subject Intelligence",
      description: "Subject and topic-wise performance insights with learning gap analysis",
      icon: BookOpen,
      color: "from-purple-600 to-pink-600",
      features: ["Subject Breakdown", "Topic Analysis", "Learning Gaps", "Competency Mapping"],
      route: "/admin/analytics/subjects",
    },
    {
      id: "advanced-suite",
      title: "Advanced Analytics Suite",
      description: "AI-powered insights, predictions, and behavioral pattern analysis",
      icon: Brain,
      color: "from-pink-600 to-red-600",
      features: ["Predictive Analytics", "Behavior Patterns", "Cognitive Load", "ML Insights"],
      route: "/admin/analytics/advanced",
    },
    {
      id: "reporting-center",
      title: "Reporting & Export Center",
      description: "Generate comprehensive reports and export data in multiple formats",
      icon: Download,
      color: "from-green-600 to-teal-600",
      features: ["Custom Reports", "Multiple Formats", "Scheduled Exports", "Email Delivery"],
      route: "/admin/analytics/reports",
    },
    {
      id: "real-time-dashboard",
      title: "Real-time Dashboard",
      description: "Live analytics dashboard with real-time updates and monitoring",
      icon: Zap,
      color: "from-yellow-600 to-orange-600",
      features: ["Live Updates", "Real-time Monitoring", "Alert System", "Performance Metrics"],
      route: "/admin/analytics/realtime",
    },
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
          <Breadcrumb
            items={[
              { label: "Home", path: "/", icon: Home },
              { label: "Admin Dashboard", path: "/admin" },
              { label: "Analytics Overview" },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Analytics Command Center
              </h1>
              <p className="text-slate-400 mt-1">Comprehensive insights and data-driven decision making</p>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Tests Analyzed</p>
                  <p className="text-3xl font-bold text-teal-400">247</p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% this month
                  </p>
                </div>
                <div className="p-3 bg-teal-500/20 rounded-xl">
                  <FileText className="h-8 w-8 text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Students Tracked</p>
                  <p className="text-3xl font-bold text-blue-400">1,847</p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% this month
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Average Performance</p>
                  <p className="text-3xl font-bold text-yellow-400">73.2%</p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.3% improvement
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Award className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">AI Insights Generated</p>
                  <p className="text-3xl font-bold text-purple-400">1,234</p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +23% this week
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Brain className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-teal-400" />
            Analytics Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsModules.map((module) => {
              const Icon = module.icon
              return (
                <Card
                  key={module.id}
                  className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-2xl"
                  onClick={() => router.push(module.route)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${module.color} bg-opacity-20`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-300 transition-colors">
                      {module.description}
                    </p>
                    <div className="space-y-2">
                      {module.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                          <span className="text-slate-400 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <Button
                        className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90 text-white`}
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(module.route)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-300 font-medium">Top Performing Test</p>
                  <p className="text-green-400 text-sm">JEE Advanced Mock #12 (89.3% avg)</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-300 font-medium">Most Challenging Topic</p>
                  <p className="text-red-400 text-sm">Organic Chemistry (34.2% avg)</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-300 font-medium">Best Improvement</p>
                  <p className="text-blue-400 text-sm">Physics Mechanics (+15.7%)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-slate-300 text-sm">New test analysis completed</p>
                    <p className="text-slate-500 text-xs">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <p className="text-slate-300 text-sm">Weekly report generated</p>
                    <p className="text-slate-500 text-xs">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div>
                    <p className="text-slate-300 text-sm">AI insights updated</p>
                    <p className="text-slate-500 text-xs">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Download className="h-5 w-5 text-teal-400" />
                Quick Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => router.push("/admin/analytics/reports")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => router.push("/admin/analytics/reports")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
