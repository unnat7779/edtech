"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import {
  Eye,
  Calendar,
  Users,
  BarChart3,
  Home,
  Clock,
  Award,
  Target,
  Search,
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"

export default function AdminTestWiseAnalyticsPage() {
  const router = useRouter()
  const [tests, setTests] = useState([])
  const [testAnalytics, setTestAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filters, setFilters] = useState({
    totalAttempts: { min: "", max: "" },
    averageScore: { min: "", max: "" },
    averageTime: { min: "", max: "" },
    completionRate: { min: "", max: "" },
    subject: "",
    type: "",
  })

  const [expandedPerformers, setExpandedPerformers] = useState({})

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token || !user) {
      router.push("/login")
      return
    }

    // Parse user data to check if admin
    try {
      const userData = JSON.parse(user)
      if (userData.role !== "admin") {
        router.push("/dashboard")
        return
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
      return
    }

    fetchTestsWithAnalytics()
  }, [router])

  const fetchTestsWithAnalytics = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      // Fetch all tests
      const testsResponse = await fetch("/api/admin/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (testsResponse.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
        return
      }

      if (!testsResponse.ok) {
        const errorData = await testsResponse.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch tests")
      }

      const testsData = await testsResponse.json()
      const testsList = testsData.tests || []
      setTests(testsList)

      // Fetch analytics for each test
      const analyticsPromises = testsList.map(async (test) => {
        try {
          const analyticsResponse = await fetch(`/api/admin/analytics/test-wise/${test._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (analyticsResponse.status === 401) {
            return { testId: test._id, analytics: null }
          }

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            return { testId: test._id, analytics: analyticsData }
          }
          return { testId: test._id, analytics: null }
        } catch (error) {
          console.error(`Error fetching analytics for test ${test._id}:`, error)
          return { testId: test._id, analytics: null }
        }
      })

      const analyticsResults = await Promise.all(analyticsPromises)
      const analyticsMap = {}
      analyticsResults.forEach(({ testId, analytics }) => {
        analyticsMap[testId] = analytics
      })

      setTestAnalytics(analyticsMap)
    } catch (error) {
      console.error("Error fetching tests with analytics:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort logic
  const filteredAndSortedTests = useMemo(() => {
    const filtered = tests.filter((test) => {
      const analytics = testAnalytics[test._id]

      // Search filter
      const matchesSearch =
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.subject?.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      // Analytics filters
      if (analytics) {
        const { totalAttempts, averageScore, averageTime, completionRate } = analytics

        // Total attempts filter
        if (filters.totalAttempts.min && totalAttempts < Number.parseInt(filters.totalAttempts.min)) return false
        if (filters.totalAttempts.max && totalAttempts > Number.parseInt(filters.totalAttempts.max)) return false

        // Average score filter
        if (filters.averageScore.min && averageScore < Number.parseFloat(filters.averageScore.min)) return false
        if (filters.averageScore.max && averageScore > Number.parseFloat(filters.averageScore.max)) return false

        // Average time filter (in minutes)
        const avgTimeMinutes = averageTime / 60
        if (filters.averageTime.min && avgTimeMinutes < Number.parseFloat(filters.averageTime.min)) return false
        if (filters.averageTime.max && avgTimeMinutes > Number.parseFloat(filters.averageTime.max)) return false

        // Completion rate filter
        if (filters.completionRate.min && completionRate < Number.parseFloat(filters.completionRate.min)) return false
        if (filters.completionRate.max && completionRate > Number.parseFloat(filters.completionRate.max)) return false
      }

      // Subject and type filters
      if (filters.subject && test.subject !== filters.subject) return false
      if (filters.type && test.type !== filters.type) return false

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "totalAttempts":
          aValue = testAnalytics[a._id]?.totalAttempts || 0
          bValue = testAnalytics[b._id]?.totalAttempts || 0
          break
        case "averageScore":
          aValue = testAnalytics[a._id]?.averageScore || 0
          bValue = testAnalytics[b._id]?.averageScore || 0
          break
        case "averageTime":
          aValue = testAnalytics[a._id]?.averageTime || 0
          bValue = testAnalytics[b._id]?.averageTime || 0
          break
        case "completionRate":
          aValue = testAnalytics[a._id]?.completionRate || 0
          bValue = testAnalytics[b._id]?.completionRate || 0
          break
        default:
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [tests, testAnalytics, searchQuery, filters, sortBy, sortOrder])

  const formatTime = (seconds) => {
    if (!seconds) return "0m"
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const clearFilters = () => {
    setFilters({
      totalAttempts: { min: "", max: "" },
      averageScore: { min: "", max: "" },
      averageTime: { min: "", max: "" },
      completionRate: { min: "", max: "" },
      subject: "",
      type: "",
    })
    setSearchQuery("")
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-800 border-t-teal-400 mx-auto mb-4"></div>
          <div className="text-sm font-medium text-slate-300">Loading test analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumb
            items={[
              { label: "Home", path: "/", icon: Home },
              { label: "Admin", path: "/admin" },

              { label: "Test Wise Analysis" },
            ]}
          />
          <div className="flex items-center justify-between mt-3">
            <div>
              <h1 className="text-2xl font-semibold text-white">Test Wise Analysis</h1>
              <p className="text-slate-400 text-sm mt-1">Individual test performance analysis</p>
            </div>
            <Button
              onClick={() => router.push("/admin/analytics/tests")}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Back to Analytics
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-700/30 text-red-300 rounded-lg text-sm">{error}</div>
        )}

        {/* Search and Filter Section */}
        <Card className="mb-6 bg-slate-800/40 border-slate-700/50">
          <CardContent className="p-4 mt-6">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-slate-700/50 border-slate-600 text-slate-200 text-sm"
                  />
                </div>
              </div>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-")
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="bg-slate-700/50 border border-slate-600 text-slate-200 rounded-md px-3 py-2 text-sm h-9"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="totalAttempts-desc">Most Attempts</option>
                <option value="averageScore-desc">Highest Score</option>
                <option value="completionRate-desc">Best Completion</option>
              </select>

              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? "primary" : "outline"}
                size="sm"
                className={showFilters ? "bg-teal-600 hover:bg-teal-700" : "border-slate-600 text-slate-300"}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filters
              </Button>

              {/* Clear */}
              {(searchQuery || Object.values(filters).some((f) => (typeof f === "string" ? f : f.min || f.max))) && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Total Attempts */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Total Attempts</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.totalAttempts.min}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            totalAttempts: { ...prev.totalAttempts, min: e.target.value },
                          }))
                        }
                        className="h-8 bg-slate-700/50 border-slate-600 text-slate-200 text-xs"
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.totalAttempts.max}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            totalAttempts: { ...prev.totalAttempts, max: e.target.value },
                          }))
                        }
                        className="h-8 bg-slate-700/50 border-slate-600 text-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  {/* Average Score */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Average Score (%)</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Min"
                        type="number"
                        min="0"
                        max="100"
                        value={filters.averageScore.min}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            averageScore: { ...prev.averageScore, min: e.target.value },
                          }))
                        }
                        className="h-8 bg-slate-700/50 border-slate-600 text-slate-200 text-xs"
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        min="0"
                        max="100"
                        value={filters.averageScore.max}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            averageScore: { ...prev.averageScore, max: e.target.value },
                          }))
                        }
                        className="h-8 bg-slate-700/50 border-slate-600 text-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  {/* Average Time */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Average Time (min)</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.averageTime.min}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            averageTime: { ...prev.averageTime, min: e.target.value },
                          }))
                        }
                        className="h-8 bg-slate-700/50 border-slate-600 text-slate-200 text-xs"
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.averageTime.max}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            averageTime: { ...prev.averageTime, max: e.target.value },
                          }))
                        }
                        className="h-8 bg-slate-700/50 border-slate-600 text-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Completion Rate (%)</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Min"
                        type="number"
                        min="0"
                        max="100"
                        value={filters.completionRate.min}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            completionRate: { ...prev.completionRate, min: e.target.value },
                          }))
                        }
                        className="h-8 bg-slate-700/50 border-slate-600 text-slate-200 text-xs"
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        min="0"
                        max="100"
                        value={filters.completionRate.max}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            completionRate: { ...prev.completionRate, max: e.target.value },
                          }))
                        }
                        className="h-8 bg-slate-700/50 border-slate-600 text-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-slate-400">
          Showing {filteredAndSortedTests.length} of {tests.length} tests
        </div>

        {/* Tests List */}
        <div className="space-y-4">
          {filteredAndSortedTests.length > 0 ? (
            filteredAndSortedTests.map((test) => {
              const analytics = testAnalytics[test._id]

              return (
                <Card
                  key={test._id}
                  className="bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
                >
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mt-6 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-white">{test.title}</h3>
                          {test.type && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded uppercase">
                              {test.type}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{test.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(test.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {test.subject}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {test.questions?.length || 0} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {test.totalMarks} marks
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/admin/analytics/test-wise/${test._id}`)}
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detailed Analytics
                      </Button>
                    </div>

                    {/* Analytics Grid */}
                    {analytics ? (
                      <>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          {/* Total Attempts */}
                          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                            <Users className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                            <div className="text-xl font-semibold text-white">{analytics.totalAttempts || 0}</div>
                            <div className="text-xs text-blue-300">Total Attempts</div>
                            <div className="text-xs text-slate-400">{analytics.completedAttempts || 0} completed</div>
                          </div>

                          {/* Average Score */}
                          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                            <Award className={`h-5 w-5 mx-auto mb-1 ${getScoreColor(analytics.averageScore || 0)}`} />
                            <div className={`text-xl font-semibold ${getScoreColor(analytics.averageScore || 0)}`}>
                              {analytics.averageScore ? `${Math.round(analytics.averageScore)}%` : "0%"}
                            </div>
                            <div className={`text-xs ${getScoreColor(analytics.averageScore || 0)}`}>Average Score</div>
                            <div className="text-xs text-slate-400">Top: {analytics.topScore || 0}%</div>
                          </div>

                          {/* Average Time */}
                          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                            <Clock className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                            <div className="text-xl font-semibold text-white">{formatTime(analytics.averageTime)}</div>
                            <div className="text-xs text-amber-300">Average Time</div>
                            <div className="text-xs text-slate-400">Per attempt</div>
                          </div>

                          {/* Completion Rate */}
                          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                            <Target className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                            <div className="text-xl font-semibold text-white">
                              {analytics.completionRate ? `${Math.round(analytics.completionRate)}%` : "0%"}
                            </div>
                            <div className="text-xs text-purple-300">Completion Rate</div>
                            <div className="text-xs text-slate-400">
                              {analytics.completedAttempts || 0}/{analytics.totalAttempts || 0}
                            </div>
                          </div>
                        </div>

                        {/* Top Performers */}
                        {analytics.topPerformers && analytics.topPerformers.length > 0 && (
                          <div className="pt-4 border-t border-slate-700/50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-amber-400" />
                                <h4 className="text-sm font-medium text-slate-200">Top Performers</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">
                                  {(() => {
                                    // Get unique users based on latest attempt
                                    const uniqueUsers = new Map()
                                    analytics.topPerformers.forEach((performer) => {
                                      const userId = performer.student?._id || performer.student?.id || "unknown"
                                      const existingUser = uniqueUsers.get(userId)

                                      if (
                                        !existingUser ||
                                        new Date(performer.completedAt) > new Date(existingUser.completedAt)
                                      ) {
                                        uniqueUsers.set(userId, performer)
                                      }
                                    })
                                    return uniqueUsers.size
                                  })()} unique students
                                </span>
                                <Button
                                  onClick={() =>
                                    setExpandedPerformers((prev) => ({
                                      ...prev,
                                      [test._id]: !prev[test._id],
                                    }))
                                  }
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-teal-400 hover:text-teal-300 h-6 px-2"
                                >
                                  {expandedPerformers[test._id] ? "Hide" : "Show"}
                                </Button>
                              </div>
                            </div>

                            {expandedPerformers[test._id] && (
                              <div className="space-y-2">
                                {(() => {
                                  // Get unique users based on latest attempt
                                  const uniqueUsers = new Map()
                                  analytics.topPerformers.forEach((performer) => {
                                    const userId = performer.student?._id || performer.student?.id || "unknown"
                                    const existingUser = uniqueUsers.get(userId)

                                    if (
                                      !existingUser ||
                                      new Date(performer.completedAt) > new Date(existingUser.completedAt)
                                    ) {
                                      uniqueUsers.set(userId, performer)
                                    }
                                  })

                                  // Convert to array and sort by score
                                  const uniquePerformersArray = Array.from(uniqueUsers.values()).sort(
                                    (a, b) => (b.score?.percentage || 0) - (a.score?.percentage || 0),
                                  )

                                  return uniquePerformersArray.map((performer, index) => {
                                    const score = Math.round(performer.score?.percentage || 0)
                                    const isTopThree = index < 3

                                    return (
                                      <div
                                        key={`${performer.student?._id || performer.student?.id || "unknown"}-${performer._id}`}
                                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                          isTopThree
                                            ? "bg-gradient-to-r from-slate-700/60 to-slate-800/60 border border-slate-600/40"
                                            : "bg-slate-700/30 hover:bg-slate-700/40"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          {/* Rank Badge */}
                                          <div
                                            className={`
                                        flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold
                                        ${
                                          index === 0
                                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900"
                                            : index === 1
                                              ? "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900"
                                              : index === 2
                                                ? "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-900"
                                                : "bg-slate-600 text-slate-200"
                                        }
                                      `}
                                          >
                                            {index + 1}
                                          </div>

                                          {/* Student Info */}
                                          <div>
                                            <div className="text-sm font-medium text-slate-200">
                                              {performer.student?.name || "Unknown Student"}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                              Latest attempt:{" "}
                                              {performer.completedAt
                                                ? new Date(performer.completedAt).toLocaleDateString()
                                                : "Invalid Date"}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Score and Performance Indicator */}
                                        <div className="flex items-center gap-3">
                                          {/* Score */}
                                          <div className="text-right">
                                            <div className={`text-sm font-semibold ${getScoreColor(score)}`}>
                                              {score}%
                                            </div>
                                            <div className="text-xs text-slate-400">
                                              {performer.score?.obtained || 0}/{performer.score?.total || 0}
                                            </div>
                                          </div>

                                          {/* Performance Bar */}
                                          <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full transition-all duration-300 ${
                                                score >= 90
                                                  ? "bg-emerald-500"
                                                  : score >= 80
                                                    ? "bg-green-500"
                                                    : score >= 70
                                                      ? "bg-yellow-500"
                                                      : score >= 60
                                                        ? "bg-orange-500"
                                                        : "bg-red-500"
                                              }`}
                                              style={{ width: `${Math.min(score, 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                })()}
                              </div>
                            )}

                            {/* View All Link */}
                            {expandedPerformers[test._id] && analytics.totalAttempts > 5 && (
                              <div className="mt-3 text-center">
                                <button
                                  onClick={() => router.push(`/admin/analytics/test/${test._id}?tab=leaderboard`)}
                                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                                >
                                  View all {analytics.totalAttempts} attempts →
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-slate-700/20 rounded-lg p-6 text-center">
                        <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
                        <p className="text-slate-400 text-sm">No attempts yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8 text-center">
                {tests.length === 0 ? (
                  <>
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No Tests Available</h3>
                    <p className="text-slate-400 text-sm mb-4">Create some tests to view their analytics</p>
                    <Button
                      onClick={() => router.push("/admin/tests/create")}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Create Your First Test
                    </Button>
                  </>
                ) : (
                  <>
                    <Filter className="h-12 w-12 text-slate-400 mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No Tests Match Your Filters</h3>
                    <p className="text-slate-400 text-sm mb-4">Try adjusting your search criteria</p>
                    <Button onClick={clearFilters} className="bg-teal-600 hover:bg-teal-700 text-white">
                      Clear All Filters
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
