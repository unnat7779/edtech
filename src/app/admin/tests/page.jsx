"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, FileText, BookOpen, Clock, Target, Eye, BarChart3, Home, Sparkles } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Breadcrumb from "@/components/ui/Breadcrumb"

export default function TestManagementPage() {
  const router = useRouter()
  const [tests, setTests] = useState([])
  const [filteredTests, setFilteredTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState("")
  const [filterClass, setFilterClass] = useState("")
  const [stats, setStats] = useState({
    totalTests: 0,
    activeTests: 0,
    totalQuestions: 0,
    subjects: 0,
  })

  useEffect(() => {
    fetchTests()
  }, [])

  useEffect(() => {
    filterTests()
  }, [tests, searchTerm, filterSubject, filterClass])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTests(data.tests || [])
        calculateStats(data.tests || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch tests")
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error)
      setError("Failed to fetch tests")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (testsData) => {
    const totalTests = testsData.length
    const activeTests = testsData.filter((test) => test.isActive).length
    const totalQuestions = testsData.reduce((acc, test) => acc + (test.questions?.length || 0), 0)
    const subjects = new Set(testsData.map((test) => test.subject)).size

    setStats({
      totalTests,
      activeTests,
      totalQuestions,
      subjects,
    })
  }

  const filterTests = () => {
    let filtered = tests

    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterSubject) {
      filtered = filtered.filter((test) => test.subject === filterSubject)
    }

    if (filterClass) {
      filtered = filtered.filter((test) => test.class === filterClass)
    }

    setFilteredTests(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case "Physics":
        return "⚛️"
      case "Chemistry":
        return "🧪"
      case "Mathematics":
        return "📐"
      default:
        return "📚"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading tests...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Home", path: "/", icon: Home },
                { label: "Admin Dashboard", path: "/admin" },
                { label: "Test Management" },
              ]}
            />
          </div>

          {/* Title and Button on same level */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Test Management
              </h1>
              <p className="text-slate-400 mt-1">Create, manage, and monitor your tests</p>
            </div>
            <Button
              onClick={() => router.push("/admin/tests/create")}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Test
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:shadow-xl hover:shadow-teal-900/20 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mt-4 text-slate-400">Total Tests</p>
                  <p className="text-3xl font-bold text-teal-400">{stats.totalTests}</p>
                </div>
                <div className="w-12 h-12 mt-4 bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6  text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mt-4 text-slate-400">Active Tests</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.activeTests}</p>
                </div>
                <div className="w-12 h-12 mt-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:shadow-xl hover:shadow-yellow-900/20 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mt-4 text-slate-400">Total Questions</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.totalQuestions}</p>
                </div>
                <div className="w-12 h-12 mt-4 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:shadow-xl hover:shadow-green-900/20 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mt-4 text-slate-400">Subjects</p>
                  <p className="text-3xl font-bold text-green-400">{stats.subjects}</p>
                </div>
                <div className="w-12 h-12 mt-4 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mt-4 mb-4">
              <Filter className="h-5 w-5 text-teal-400 mr-2" />
              <h3 className="text-lg font-semibold text-slate-200">Filter Tests</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Classes</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
                <option value="Dropper">Dropper</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tests Grid */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Card
                key={test._id}
                className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/80 transition-all duration-500 ease-out transform hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer relative overflow-hidden"
                style={{
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(20, 184, 166, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)"
                }}
              >
                {/* Subtle gradient overlay that appears on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500  pointer-events-none" />

                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out blur-sm -z-10" />

                <CardHeader className="border-b border-slate-700/50 group-hover:border-slate-600/50 transition-colors duration-300 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-slate-200 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1 font-semibold text-lg">
                        {test.title}
                      </CardTitle>
                      {/* <div className="flex items-center mt-3 transform group-hover:translate-x-1 transition-transform duration-300 delay-75">
                        <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300">
                          {getSubjectIcon(test.subject)}
                        </span>
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300 font-medium">
                          {test.subject}
                        </span>
                      </div> */}
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 transform group-hover:scale-105 ${
                        test.isActive
                          ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 group-hover:bg-emerald-800/50 group-hover:text-emerald-200 group-hover:border-emerald-600/60"
                          : "bg-amber-900/40 text-amber-300 border border-amber-700/50 group-hover:bg-amber-800/50 group-hover:text-amber-200 group-hover:border-amber-600/60"
                      }`}
                    >
                      {test.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-6 relative z-10">
                  <div className="space-y-5 mt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="group-hover:transform group-hover: transition-transform duration-300">
                        <span className="text-slate-500 group-hover:text-slate-400 transition-colors duration-300 text-xs uppercase tracking-wide font-medium">
                          Type:
                        </span>
                        <div className="font-semibold text-slate-300 group-hover:text-slate-200 capitalize transition-colors duration-300 mt-1">
                          {test.type.replace("-", " ")}
                        </div>
                      </div>
                      <div className="group-hover:transform group-hover: transition-transform duration-300 delay-75">
                        <span className="text-slate-500 group-hover:text-slate-400 transition-colors duration-300 text-xs uppercase tracking-wide font-medium">
                          Class:
                        </span>
                        <div className="font-semibold text-slate-300 group-hover:text-slate-200 transition-colors duration-300 mt-1">
                          {test.class}
                        </div>
                      </div>
                      <div className="group-hover:transform group-hover: transition-transform duration-300 delay-100">
                        <span className="text-slate-500 group-hover:text-slate-400 transition-colors duration-300 text-xs uppercase tracking-wide font-medium">
                          Duration:
                        </span>
                        <div className="font-semibold text-slate-300 group-hover:text-slate-200 flex items-center transition-colors duration-300 mt-1">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                          {test.duration} min
                        </div>
                      </div>
                      <div className="group-hover:transform group-hover: transition-transform duration-300 delay-150">
                        <span className="text-slate-500 group-hover:text-slate-400 transition-colors duration-300 text-xs uppercase tracking-wide font-medium">
                          Questions:
                        </span>
                        <div className="font-semibold text-slate-300 group-hover:text-slate-200 transition-colors duration-300 mt-1">
                          {test.questions?.length || 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 group-hover:border-slate-600/50 transition-colors duration-300">
                      <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300 font-medium">
                        Created: {formatDate(test.createdAt)}
                      </div>
                      <div className="text-xl font-bold text-amber-400 group-hover:text-amber-300 transition-all duration-300 transform group-hover:scale-110">
                        {test.totalMarks} marks
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push(`/admin/tests/${test._id}`)}
                      className="w-full bg-gradient-to-r from-teal-600/90 to-blue-600/90 hover:from-teal-500 hover:to-blue-500 text-white font-semibold py-3 transition-all duration-300 transform group-hover:translate-y-0 group-hover:shadow-lg group-hover:shadow-teal-500/25 border border-teal-500/20 hover:border-teal-400/40 backdrop-blur-sm"
                    >
                      <Eye className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                      Manage Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-3">No tests found</h3>
              <p className="text-slate-400 mb-6">
                {searchTerm || filterSubject || filterClass
                  ? "Try adjusting your filters to see more results."
                  : "Get started by creating your first test."}
              </p>
              <Button
                onClick={() => router.push("/admin/tests/create")}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Your First Test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
