"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Users, Search, Filter, Download, Eye, TrendingUp, Award, Clock } from "lucide-react"

export default function StudentPerformanceMatrix({ testData, analyticsData, filters }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("score")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  if (!analyticsData || !analyticsData.studentPerformance) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  const students = analyticsData.studentPerformance || []
  const topPerformers = students.filter((s) => s.percentage >= 80).length
  const averageAccuracy =
    students.length > 0 ? students.reduce((sum, s) => sum + (s.accuracy || 0), 0) / students.length : 0
  const averageTime =
    students.length > 0 ? students.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / students.length : 0

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentEmail && student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesBatch = selectedBatch === "all" || student.studentClass === selectedBatch
      return matchesSearch && matchesBatch
    })
    .sort((a, b) => {
      const aValue = a[sortBy] || 0
      const bValue = b[sortBy] || 0
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })

  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const totalPages = Math.ceil(filteredStudents.length / pageSize)

  const batches = ["all", ...new Set(students.map((s) => s.studentClass).filter(Boolean))]

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return "text-green-400"
    if (percentage >= 75) return "text-blue-400"
    if (percentage >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  // IMPROVED TIME FORMATTING: Show hours if >60min, seconds if <60sec
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0s"

    if (seconds < 60) {
      // Show seconds if under 60 seconds
      return `${seconds}s`
    } else if (seconds < 3600) {
      // Show minutes if under 1 hour
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    } else {
      // Show hours and minutes if over 1 hour
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  // Handle eye button click - redirect to student analytics
  const handleViewStudentAnalytics = (studentId) => {
    router.push(`/admin/analytics/students/${studentId}`)
  }

  // Handle export functionality
  const handleExportData = () => {
    // Create CSV data
    const csvData = [
      ["Rank", "Student Name", "Email", "Class", "Score", "Percentage", "Accuracy", "Time Spent", "Subjects"],
      ...filteredStudents.map((student) => [
        student.rank,
        student.studentName,
        student.studentEmail,
        student.studentClass,
        student.score,
        `${student.percentage.toFixed(1)}%`,
        `${student.accuracy.toFixed(1)}%`,
        formatTime(student.timeSpent || 0),
        Object.entries(student.subjectScores || {})
          .map(([subject, score]) => `${subject}: ${score}`)
          .join("; "),
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `test-${testData?.title || "analytics"}-performance-matrix.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50">
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-green-400 mx-auto mt-6 mb-2" />
            <div className="text-2xl font-bold text-green-400">{topPerformers}</div>
            <div className="text-sm text-slate-400">Top Performers</div>
            <div className="text-xs text-slate-500 mt-1">Score ≥ 80%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mt-6 mb-2" />
            <div className="text-2xl font-bold text-blue-400">{averageAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-slate-400">Avg Accuracy</div>
            <div className="text-xs text-slate-500 mt-1">Across all students</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/50">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-400 mx-auto mt-6 mb-2" />
            {/* FIXED: Round average time to whole number */}
            <div className="text-2xl font-bold text-yellow-400">{formatTime(Math.round(averageTime))}</div>
            <div className="text-sm text-slate-400">Avg Time</div>
            <div className="text-xs text-slate-500 mt-1">Per attempt</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-400 mx-auto mt-6 mb-2" />
            <div className="text-2xl font-bold text-purple-400">{students.length}</div>
            <div className="text-sm text-slate-400">Unique Students</div>
            <div className="text-xs text-slate-500 mt-1">Latest attempts</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardContent className="p-6 mt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row justify-between flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
                />
              </div>

              {/* <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch === "all" ? "All Classes" : batch}
                  </option>
                ))}
              </select> */}

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-4 py-2  bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            {/* <div className="flex gap-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button
                onClick={handleExportData}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Student Performance Table */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <Users className="h-6 w-6 text-blue-400" />
            Student Performance Matrix ({filteredStudents.length} unique students)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("rank")}
                      className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
                    >
                      Rank
                      {sortBy === "rank" && <span className="text-teal-400">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("studentName")}
                      className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
                    >
                      Student
                      {sortBy === "studentName" && (
                        <span className="text-teal-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("score")}
                      className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
                    >
                      Score
                      {sortBy === "score" && <span className="text-teal-400">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("accuracy")}
                      className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
                    >
                      Accuracy
                      {sortBy === "accuracy" && (
                        <span className="text-teal-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">Subject Marks</th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("timeSpent")}
                      className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
                    >
                      Time
                      {sortBy === "timeSpent" && (
                        <span className="text-teal-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {paginatedStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            student.rank === 1
                              ? "bg-yellow-500 text-yellow-900"
                              : student.rank === 2
                                ? "bg-slate-400 text-slate-900"
                                : student.rank === 3
                                  ? "bg-amber-600 text-amber-900"
                                  : "bg-slate-600 text-slate-200"
                          }`}
                        >
                          {student.rank}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-200">{student.studentName}</div>
                        <div className="text-sm text-slate-400">{student.studentEmail}</div>
                        <div className="text-xs text-slate-500">{student.studentClass}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-lg font-bold ${getPerformanceColor(student.percentage)}`}>
                          {student.score}
                        </div>
                        <div className="text-sm text-slate-400">{student.percentage.toFixed(1)}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${getPerformanceColor(student.accuracy || 0)}`}>
                        {(student.accuracy || 0).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {student.subjectScores && Object.keys(student.subjectScores).length > 0 ? (
                          Object.entries(student.subjectScores).map(([subject, marks]) => (
                            <div key={subject} className="flex justify-between text-xs">
                              <span className="text-slate-400">{subject.charAt(0)}:</span>
                              <span className="text-slate-300 font-mono">{marks}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500">No marks data</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-mono">{formatTime(student.timeSpent || 0)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStudentAnalytics(student.studentId)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                          title="View detailed student analytics"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleExportData}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          title="Export student data"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredStudents.length)}{" "}
              of {filteredStudents.length} unique students
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-teal-600 text-white"
                          : "border-slate-600 text-slate-300 hover:bg-slate-700"
                      }
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-slate-600 text-slate-700 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
