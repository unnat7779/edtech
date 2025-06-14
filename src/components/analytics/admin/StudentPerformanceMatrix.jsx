"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Users, Search, Filter, Download, Eye, TrendingUp, Award, Clock } from "lucide-react"

export default function StudentPerformanceMatrix({ testData, analyticsData, filters }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("score")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Mock student data - replace with actual data
  const students = [
    {
      id: 1,
      name: "Arjun Sharma",
      email: "arjun.sharma@email.com",
      batch: "JEE 2024",
      score: 285,
      percentage: 95.0,
      rank: 1,
      timeSpent: 165,
      accuracy: 92.3,
      physics: 92,
      chemistry: 88,
      mathematics: 96,
      status: "completed",
      submittedAt: "2024-01-20T14:30:00Z",
      improvement: "+15",
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya.patel@email.com",
      batch: "JEE 2024",
      score: 278,
      percentage: 92.7,
      rank: 2,
      timeSpent: 142,
      accuracy: 89.7,
      physics: 89,
      chemistry: 94,
      mathematics: 91,
      status: "completed",
      submittedAt: "2024-01-20T13:45:00Z",
      improvement: "+8",
    },
    {
      id: 3,
      name: "Rahul Kumar",
      email: "rahul.kumar@email.com",
      batch: "JEE 2025",
      score: 265,
      percentage: 88.3,
      rank: 3,
      timeSpent: 178,
      accuracy: 85.2,
      physics: 85,
      chemistry: 82,
      mathematics: 92,
      status: "completed",
      submittedAt: "2024-01-20T15:20:00Z",
      improvement: "+22",
    },
    // Add more mock students...
  ]

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBatch = selectedBatch === "all" || student.batch === selectedBatch
      return matchesSearch && matchesBatch
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })

  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const totalPages = Math.ceil(filteredStudents.length / pageSize)

  const batches = ["all", "JEE 2024", "JEE 2025", "NEET 2024"]

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return "text-green-400"
    if (percentage >= 75) return "text-blue-400"
    if (percentage >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-900/50 text-green-400 border-green-700/50"
      case "in-progress":
        return "bg-blue-900/50 text-blue-400 border-blue-700/50"
      case "not-started":
        return "bg-slate-900/50 text-slate-400 border-slate-700/50"
      default:
        return "bg-slate-900/50 text-slate-400 border-slate-700/50"
    }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50">
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">156</div>
            <div className="text-sm text-slate-400">Top Performers</div>
            <div className="text-xs text-slate-500 mt-1">Score ≥ 80%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">89.2%</div>
            <div className="text-sm text-slate-400">Avg Accuracy</div>
            <div className="text-xs text-slate-500 mt-1">Across all students</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/50">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">2h 24m</div>
            <div className="text-sm text-slate-400">Avg Time</div>
            <div className="text-xs text-slate-500 mt-1">Per attempt</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">1,089</div>
            <div className="text-sm text-slate-400">Total Students</div>
            <div className="text-xs text-slate-500 mt-1">Completed test</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
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

              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch === "all" ? "All Batches" : batch}
                  </option>
                ))}
              </select>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Performance Table */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <Users className="h-6 w-6 text-blue-400" />
            Student Performance Matrix ({filteredStudents.length} students)
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
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
                    >
                      Student
                      {sortBy === "name" && <span className="text-teal-400">{sortOrder === "asc" ? "↑" : "↓"}</span>}
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
                  <th className="px-6 py-4 text-left">Subject Scores</th>
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
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
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
                        {student.improvement && (
                          <span className="text-xs text-green-400 font-medium">{student.improvement}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-200">{student.name}</div>
                        <div className="text-sm text-slate-400">{student.email}</div>
                        <div className="text-xs text-slate-500">{student.batch}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-lg font-bold ${getPerformanceColor(student.percentage)}`}>
                          {student.score}
                        </div>
                        <div className="text-sm text-slate-400">{student.percentage}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${getPerformanceColor(student.accuracy)}`}>{student.accuracy}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">P:</span>
                          <span className="text-blue-400">{student.physics}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">C:</span>
                          <span className="text-green-400">{student.chemistry}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">M:</span>
                          <span className="text-yellow-400">{student.mathematics}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{formatTime(student.timeSpent)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusBadge(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
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
              of {filteredStudents.length} students
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
                className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
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
