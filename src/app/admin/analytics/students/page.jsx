"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import {
  Users,
  Search,
  Eye,
  MessageCircle,
  CreditCard,
  Home,
  SortAsc,
  SortDesc,
  AlertTriangle,
  LogOut,
} from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"
import StudentInterestModal from "@/components/admin/analytics/StudentInterestModal"
import StudentSubscriptionModal from "@/components/admin/analytics/StudentSubscriptionModal"
import AuthDebug from "@/components/debug/AuthDebug"

export default function StudentAnalyticsPage() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authError, setAuthError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filter, setFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  // Check authentication and admin role
  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    console.log("Current user:", user)
    console.log("User role:", user.role)

    if (!token) {
      setAuthError("No authentication token found. Please log in.")
      return
    }

    if (user.role !== "admin") {
      setAuthError(`Access denied. This page requires admin privileges. Your current role: ${user.role}`)
      return
    }

    setAuthError("") // Clear any previous auth errors
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleLoginAsAdmin = () => {
    router.push("/login?message=Please log in with admin credentials")
  }

  useEffect(() => {
    if (!authError) {
      fetchStudents()
    }
  }, [searchTerm, sortBy, sortOrder, filter, currentPage, authError])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        sortBy,
        sortOrder,
        filter,
      })

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data.users)
        setPagination(data.pagination)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setError(error.message)
    } finally {
      setLoading(false)
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

  const handleInterestUpdate = (student) => {
    setSelectedStudent(student)
    setShowInterestModal(true)
  }

  const handleSubscriptionUpdate = (student) => {
    setSelectedStudent(student)
    setShowSubscriptionModal(true)
  }

  const handleViewStudentDetails = (student) => {
    console.log("🔍 Viewing student details for:", student.name, "ID:", student._id)
    // Navigate to student detail page
    router.push(`/admin/analytics/students/${student._id}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getEngagementColor = (score) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const filterOptions = [
    { value: "all", label: "All Students" },
    { value: "active", label: "Active (Last 7 Days)" },
    { value: "premium", label: "Premium Users" },
    { value: "new", label: "New Users" },
  ]

  // Show authentication error screen
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-xl border border-red-700/50">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-red-300 mb-4">Access Denied</h1>
              <p className="text-red-200 mb-6 leading-relaxed">{authError}</p>

              <div className="space-y-3">
                <Button onClick={handleLoginAsAdmin} className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Login as Admin
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-600 text-red-300 hover:bg-red-700/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout Current User
                </Button>
              </div>

              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-sm">
                  <strong>Note:</strong> This page requires admin privileges. Please contact your administrator if you
                  believe you should have access.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading student analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AuthDebug />

      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: "Home", path: "/", icon: Home },
              { label: "Admin Dashboard", path: "/admin" },
              { label: "Analytics", path: "/admin/analytics" },
              { label: "Student Analytics" },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Student Analytics
              </h1>
              <p className="text-slate-400 mt-1">Comprehensive student performance and engagement tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/admin/analytics")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back to Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Student Performance Overview
              <span className="ml-auto text-sm font-normal text-slate-400">{pagination.totalItems} total students</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:text-slate-200"
                      >
                        Student
                        {sortBy === "name" &&
                          (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      <button
                        onClick={() => handleSort("totalAttempts")}
                        className="flex items-center gap-1 hover:text-slate-200"
                      >
                        Tests
                        {sortBy === "totalAttempts" &&
                          (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      <button
                        onClick={() => handleSort("averageScore")}
                        className="flex items-center gap-1 hover:text-slate-200"
                      >
                        Avg Score
                        {sortBy === "averageScore" &&
                          (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center gap-1 hover:text-slate-200"
                      >
                        Joined
                        {sortBy === "createdAt" &&
                          (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-slate-200 font-medium">{student.name}</p>
                          <p className="text-slate-400 text-sm">{student.email}</p>
                          {student.whatsappNo && <p className="text-slate-500 text-xs">+{student.whatsappNo}</p>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-center">
                          <p className="text-slate-200 font-semibold">{student.totalAttempts}</p>
                          <p className="text-slate-400 text-xs">{student.completedAttempts} completed</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-center">
                          <p className={`font-semibold ${getEngagementColor(student.averageScore)}`}>
                            {student.averageScore}%
                          </p>
                          <p className="text-slate-400 text-xs">Best: {student.bestScore}%</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          {student.isPremium ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              Premium
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                              Free
                            </span>
                          )}
                          {student.interestData?.interestedInPaidSubscription === true && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              Interested
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-300 text-sm">{formatDate(student.createdAt)}</p>
                        {student.lastActivity && (
                          <p className="text-slate-500 text-xs">Last: {formatDate(student.lastActivity)}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => handleInterestUpdate(student)}
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            title="Update Interest"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleSubscriptionUpdate(student)}
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            title="Update Subscription"
                          >
                            <CreditCard className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleViewStudentDetails(student)}
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            title={`View ${student.name}'s Details`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm">
                  Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, pagination.totalItems)} of{" "}
                  {pagination.totalItems} students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <span className="text-slate-300 text-sm">
                    Page {currentPage} of {pagination.total}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.total}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showInterestModal && (
        <StudentInterestModal
          student={selectedStudent}
          onClose={() => setShowInterestModal(false)}
          onSuccess={() => {
            setShowInterestModal(false)
            fetchStudents()
          }}
        />
      )}

      {showSubscriptionModal && (
        <StudentSubscriptionModal
          student={selectedStudent}
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={() => {
            setShowSubscriptionModal(false)
            fetchStudents()
          }}
        />
      )}
    </div>
  )
}
