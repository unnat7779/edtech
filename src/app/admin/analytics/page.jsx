"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  BarChart3,
  Users,
  TrendingUp,
  Globe,
  FileText,
  UserCheck,
  Clock,
  Award,
  Home,
  ChevronRight,
} from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"

export default function AnalyticsMainPage() {
  const router = useRouter()
  const [quickStats, setQuickStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuickStats()
  }, [])

  const fetchQuickStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/global?timeRange=7d", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setQuickStats(data.data.globalMetrics)
      }
    } catch (error) {
      console.error("Error fetching quick stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const analyticsCards = [
    {
      title: "Global Analytics",
      description: "Platform-wide performance metrics and user insights",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
      path: "/admin/analytics/global",
      stats: [
        { label: "Total Users", value: quickStats?.totalUsers || 0 },
        { label: "Active Users", value: quickStats?.activeUsers || 0 },
      ],
    },
    {
      title: "Test Analytics",
      description: "Comprehensive test performance and scoring insights",
      icon: FileText,
      color: "from-emerald-500 to-teal-500",
      path: "/admin/analytics/tests",
      stats: [
        { label: "Total Attempts", value: quickStats?.totalAttempts || 0 },
        { label: "Avg Score", value: `${Math.round(quickStats?.averageTestScore || 0)}%` },
      ],
    },
    {
      title: "Student Analytics",
      description: "Individual student performance and progress tracking",
      icon: UserCheck,
      color: "from-purple-500 to-pink-500",
      path: "/admin/analytics/students",
      stats: [
        { label: "Active Students", value: quickStats?.activeUsers || 0 },
        { label: "New Students", value: quickStats?.newUsersInPeriod || 0 },
      ],
    },
    {
      title: "Retention Analytics",
      description: "User retention patterns and engagement metrics",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      path: "/admin/analytics/retention",
      stats: [
        { label: "Avg Time", value: quickStats?.averageTimePerTest ? `${quickStats.averageTimePerTest}m` : "N/A" },
        { label: "Retention", value: "85%" },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading analytics...</div>
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
              { label: "Analytics" },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-slate-400 mt-1">Comprehensive insights and performance metrics</p>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Back to Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{quickStats?.totalUsers || 0}</div>
              <div className="text-sm text-blue-300">Total Users</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border border-emerald-700/30">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{quickStats?.totalAttempts || 0}</div>
              <div className="text-sm text-emerald-300">Test Attempts</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/30">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{Math.round(quickStats?.averageTestScore || 0)}%</div>
              <div className="text-sm text-purple-300">Average Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border border-amber-700/30">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {quickStats?.averageTimePerTest ? `${quickStats.averageTimePerTest}m` : "N/A"}
              </div>
              <div className="text-sm text-amber-300">Avg Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {analyticsCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card
                key={index}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(card.path)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} bg-opacity-20`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-slate-200 group-hover:text-white transition-colors">
                          {card.title}
                        </CardTitle>
                        <p className="text-sm text-slate-400 mt-1">{card.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {card.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="text-center">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 mt-8">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push("/admin/analytics/global")}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                View Global Metrics
              </Button>
              <Button
                onClick={() => router.push("/admin/analytics/tests")}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                Analyze Test Performance
              </Button>
              <Button
                onClick={() => router.push("/admin/analytics/students")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Student Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
