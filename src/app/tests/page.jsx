"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Clock,
  BookOpen,
  Target,
  Users,
  TrendingUp,
  ChevronDown,
  Play,
  Star,
  Award,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function TestsPage() {
  const router = useRouter()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: "",
    subject: "",
    class: "",
  })

  useEffect(() => {
    fetchTests()
  }, [filters])

  const fetchTests = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.subject) params.append("subject", filters.subject)
      if (filters.class) params.append("class", filters.class)

      console.log(`Fetching tests with params: ${params.toString()}`)

      const response = await fetch(`/api/tests?${params}`)
      console.log(`Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error response: ${errorText}`)
        throw new Error(`Failed to fetch tests: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Received ${data.tests?.length || 0} tests`)

      if (response.ok) {
        setTests(data.tests || [])
      }
    } catch (error) {
      console.error("Fetch tests error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: "",
      subject: "",
      class: "",
    })
  }

  const startTest = (testId) => {
    router.push(`/test/${testId}`)
  }

  const formatAttempts = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Available Tests
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl">
                Challenge yourself with our comprehensive test series designed to boost your performance
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="flex items-center gap-2 group border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ChevronDown className="h-4 w-4 rotate-90 group-hover:translate-x-1 transition-transform" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Minimalist Filter Section */}
        <Card className="mb-8 bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filter Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Test Type</label>
                <div className="relative">
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="full-syllabus">Full Syllabus</option>
                    <option value="chapter-wise">Chapter Wise</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Subject</label>
                <div className="relative">
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange("subject", e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Subjects</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="All">All Subjects</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Class</label>
                <div className="relative">
                  <select
                    value={filters.class}
                    onChange={(e) => handleFilterChange("class", e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Classes</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                    <option value="Dropper">Dropper</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={fetchTests}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-teal-900/25 transition-all duration-300"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-medium">Error: {error}</p>
            <p className="text-slate-300 text-sm mt-1">Please try again or contact support if the issue persists.</p>
          </div>
        )}

        {/* Minimalist Tests Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-teal-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin animation-delay-150"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card
                key={test._id}
                className="group hover:scale-[1.02] transition-all duration-300 bg-slate-800/50 backdrop-blur-md border-slate-700/50 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-900/10"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-100 group-hover:text-teal-400 transition-colors mb-2">
                        {test.title}
                      </CardTitle>
                      <p className="text-sm text-slate-400 line-clamp-2">{test.description}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-slate-300">
                        {test.ratings?.average ? test.ratings.average.toFixed(1) : "4.8"}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Clean Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      {/* <Target className="h-4 w-4 text-teal-400" /> */}
                      <div>
                        <p className="text-xs text-slate-500">Type</p>
                        <p className="text-sm font-medium text-slate-200 capitalize">{test.type?.replace("-", " ")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* <BookOpen className="h-4 w-4 text-blue-400" /> */}
                      <div>
                        <p className="text-xs text-slate-500">Subject</p>
                        <p className="text-sm font-medium text-slate-200">{test.subject}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* <Clock className="h-4 w-4 text-yellow-400" /> */}
                      <div>
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="text-sm font-medium text-slate-200">{test.duration} min</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* <Award className="h-4 w-4 text-purple-400" /> */}
                      <div>
                        <p className="text-xs text-slate-500">Marks</p>
                        <p className="text-sm font-medium text-slate-200">{test.totalMarks}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{test.questions?.length || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-slate-400">
                        {formatAttempts(test.statistics?.totalAttempts || 1200)} attempts
                      </span>
                    </div>
                  </div>

                  {/* Start Test Button */}
                  <Button
                    onClick={() => startTest(test._id)}
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-teal-900/25 transition-all duration-300 group"
                  >
                    <Play className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && tests.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-200 mb-2">No tests found</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Try adjusting your filters or check back later for new tests. We're constantly adding new content!
            </p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
