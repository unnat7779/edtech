"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  FileText,
  ArrowLeft,
  BookOpen,
  BarChart3,
  Search,
  SortAsc,
  SortDesc,
  ChevronDown,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function AllTestHistoryPage() {
  const router = useRouter()
  const [testHistory, setTestHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterSubject, setFilterSubject] = useState("")

  useEffect(() => {
    fetchAllTestHistory()
  }, [])

  const fetchAllTestHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("/api/test-attempts?groupByTest=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch test history")
      }

      const data = await response.json()
      setTestHistory(data.testHistory || [])
    } catch (error) {
      console.error("Error fetching test history:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return "text-emerald-400"
    if (percentage >= 60) return "text-blue-400"
    if (percentage >= 40) return "text-amber-400"
    return "text-red-400"
  }

  const handleTestClick = (testId) => {
    router.push(`/test-history/${testId}`)
  }

  const filteredAndSortedHistory = testHistory
    .filter((test) => {
      const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSubject = !filterSubject || test.subject === filterSubject
      return matchesSearch && matchesSubject
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.lastAttempt)
        const dateB = new Date(b.lastAttempt)
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB
      } else if (sortBy === "performance") {
        return sortOrder === "desc" ? b.bestPercentage - a.bestPercentage : a.bestPercentage - b.bestPercentage
      } else if (sortBy === "attempts") {
        return sortOrder === "desc" ? b.totalAttempts - a.totalAttempts : a.totalAttempts - b.totalAttempts
      }
      return 0
    })

  const subjects = [...new Set(testHistory.map((test) => test.subject).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => router.back()} variant="outline" className="p-2 border-slate-600 hover:bg-slate-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Test History
              </h1>
              <p className="text-slate-400">Complete overview of all your test attempts</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="relative">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer"
              >
                <option value="date">Sort by Date</option>
                <option value="performance">Sort by Performance</option>
                <option value="attempts">Sort by Attempts</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <Button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              {sortOrder === "desc" ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
              {sortOrder === "desc" ? "Descending" : "Ascending"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-300">Loading test history...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Error Loading History</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchAllTestHistory}>Try Again</Button>
          </div>
        ) : filteredAndSortedHistory.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">No Tests Found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || filterSubject
                ? "Try adjusting your search or filter criteria."
                : "You haven't taken any tests yet."}
            </p>
            <Button onClick={() => router.push("/tests")} className="bg-gradient-to-r from-teal-600 to-blue-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Tests
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedHistory.map((test) => (
              <Card
                key={test._id}
                onClick={() => handleTestClick(test._id)}
                className="group cursor-pointer bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-teal-500/50 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-900/10"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-slate-200 group-hover:text-teal-400 transition-colors truncate">
                        {test.title}
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-1">
                        {test.type?.replace("-", " ")} • {test.subject}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-xl font-bold ${getPerformanceColor(test.bestPercentage)}`}>
                        {test.bestPercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">Best Score</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-lg font-bold text-teal-400">{test.totalAttempts}</div>
                      <div className="text-xs text-slate-400">Attempts</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-400">{test.averagePercentage.toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">Average</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-400">{test.bestScore}</div>
                      <div className="text-xs text-slate-400">Best</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Last: {formatDate(test.lastAttempt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>View Analytics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
