"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Filter, BookOpen, ChevronDown, Play, BarChart3, RotateCcw, Eye, Star } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import SyllabusModal from "@/components/test/SyllabusModal"

export default function TestsPage() {
  const router = useRouter()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [testAttempts, setTestAttempts] = useState({})
  const [selectedTest, setSelectedTest] = useState(null)
  const [showSyllabusModal, setShowSyllabusModal] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    subject: "",
    class: "",
  })

  useEffect(() => {
    fetchTests()
    fetchTestAttempts()
  }, [filters])

  const fetchTests = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.subject) params.append("subject", filters.subject)
      if (filters.class) params.append("class", filters.class)

      const response = await fetch(`/api/tests?${params}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch tests: ${response.status}`)
      }

      const data = await response.json()
      setTests(data.tests || [])
    } catch (error) {
      console.error("Fetch tests error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTestAttempts = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/test-attempts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const attemptsByTest = {}

        data.attempts.forEach((attempt) => {
          let testId = null

          if (attempt.test) {
            if (typeof attempt.test === "object" && attempt.test._id) {
              testId = attempt.test._id
            } else if (typeof attempt.test === "string") {
              testId = attempt.test
            }
          } else if (attempt.testId) {
            testId = attempt.testId
          }

          if (testId) {
            if (!attemptsByTest[testId]) {
              attemptsByTest[testId] = []
            }
            attemptsByTest[testId].push(attempt)
          }
        })

        setTestAttempts(attemptsByTest)
      }
    } catch (error) {
      console.error("Error fetching test attempts:", error)
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

  const viewTestHistory = (testId) => {
    router.push(`/test-history/${testId}`)
  }

  const openSyllabusModal = (test) => {
    setSelectedTest(test)
    setShowSyllabusModal(true)
  }

  const closeSyllabusModal = () => {
    setShowSyllabusModal(false)
    setSelectedTest(null)
  }

  const getTestAttemptCount = (testId) => {
    return testAttempts[testId]?.length || 0
  }

  const getButtonText = (testId) => {
    const attemptCount = getTestAttemptCount(testId)
    return attemptCount === 0 ? "Start Test" : "Reattempt"
  }

  const getButtonIcon = (testId) => {
    const attemptCount = getTestAttemptCount(testId)
    return attemptCount === 0 ? Play : RotateCcw
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
        {/* Filter Section */}
        <Card className="mb-8 mt-6 bg-slate-800/50 backdrop-blur-md border-slate-700/50">
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
                    <option value="Biology">Biology</option>
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
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300">Loading tests...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Error Loading Tests</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchTests}>Try Again</Button>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">No Tests Found</h3>
            <p className="text-slate-400 mb-6">
              {Object.values(filters).some((filter) => filter)
                ? "Try adjusting your filters to see more tests."
                : "No tests are available at the moment."}
            </p>
            {Object.values(filters).some((filter) => filter) && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const attemptCount = getTestAttemptCount(test._id)
              const ButtonIcon = getButtonIcon(test._id)

              return (
                <Card
                  key={test._id}
                  className="group bg-slate-800/50 backdrop-blur-md border-slate-700/50 hover:border-teal-500/50 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-900/10"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-slate-200 group-hover:text-teal-400 transition-colors truncate">
                          {test.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-400">4.8</span>
                          <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                            {test.type?.replace("-", " ") || "Test"}
                          </span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {test.subject}
                          </span>
                        </div>
                      </div>
                      {attemptCount > 0 && (
                        <div className="ml-4 text-right">
                          <div className="text-sm font-medium text-teal-400">{formatAttempts(attemptCount)}</div>
                          <div className="text-xs text-slate-400">attempts</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <div className="text-lg font-bold text-teal-400">{test.questions?.length || 0}</div>
                        <div className="text-xs text-slate-400">Questions</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-400">{test.duration || 0}</div>
                        <div className="text-xs text-slate-400">Minutes</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <div className="text-lg font-bold text-purple-400">{test.totalMarks || 0}</div>
                        <div className="text-xs text-slate-400">Marks</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => startTest(test._id)}
                          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg group-hover:shadow-teal-500/20"
                        >
                          <ButtonIcon className="h-4 w-4 mr-2" />
                          {getButtonText(test._id)}
                        </Button>

                        <Button
                          onClick={() => openSyllabusModal(test)}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-teal-500"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Syllabus
                        </Button>
                      </div>

                      {attemptCount > 0 && (
                        <Button
                          onClick={() => viewTestHistory(test._id)}
                          variant="outline"
                          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-teal-500"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Syllabus Modal */}
      <SyllabusModal test={selectedTest} isOpen={showSyllabusModal} onClose={closeSyllabusModal} />
    </div>
  )
}
