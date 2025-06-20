"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  RefreshCw,
  X,
} from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"
import StudentInterestModal from "@/components/admin/analytics/StudentInterestModal"
import StudentSubscriptionModal from "@/components/admin/analytics/StudentSubscriptionModal"
import StudentInterestDetailsModal from "@/components/admin/analytics/StudentInterestDetailsModal"
import StudentSubscriptionDetailsModal from "@/components/admin/analytics/StudentSubscriptionDetailsModal"
import AdvancedStudentFilters from "@/components/admin/analytics/AdvancedStudentFilters"
import EngagementOverviewCharts from "@/components/admin/analytics/students/EngagementOverviewCharts"
import PremiumDistributionChart from "@/components/admin/analytics/students/PremiumDistributionChart"
import ConversionFunnelChart from "@/components/admin/analytics/students/ConversionFunnelChart"
import InterestMatrixChart from "@/components/admin/analytics/students/InterestMatrixChart"
import GrowthTrendsChart from "@/components/admin/analytics/students/GrowthTrendsChart"
import InterestConversionChart from "@/components/admin/analytics/students/InterestConversionChart"

export default function StudentAnalyticsPage() {
  const router = useRouter()
  const [allStudents, setAllStudents] = useState([]) // Store all students
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState("")
  const [authError, setAuthError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showInterestDetailsModal, setShowInterestDetailsModal] = useState(false)
  const [showSubscriptionDetailsModal, setShowSubscriptionDetailsModal] = useState(false)
  const [studentCounts, setStudentCounts] = useState({})
  const [filters, setFilters] = useState({
    activity: "all",
    subscription: "all",
    subscriptionPlan: "all",
    interest: "all",
  })

  const ITEMS_PER_PAGE = 20

  // Check authentication and admin role
  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!token) {
      setAuthError("No authentication token found. Please log in.")
      return
    }

    if (user.role !== "admin") {
      setAuthError(`Access denied. This page requires admin privileges. Your current role: ${user.role}`)
      return
    }

    setAuthError("")
  }, [])

  // Initial data fetch
  useEffect(() => {
    if (!authError) {
      fetchAllStudents()
      fetchStudentCounts()
    }
  }, [authError])

  // Fetch student counts when filters change
  useEffect(() => {
    if (!authError && allStudents.length > 0) {
      fetchStudentCounts()
    }
  }, [filters, authError, allStudents.length])

  const fetchStudentCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/users/counts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStudentCounts(data.counts)
      }
    } catch (error) {
      console.error("Error fetching student counts:", error)
    }
  }, [])

  const fetchAllStudents = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "1000", // Fetch more students for client-side filtering
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        activity: "all",
        subscription: "all",
        subscriptionPlan: "all",
        interest: "all",
      })

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAllStudents(data.users)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch students")
      }
    } catch (error) {
      console.error("❌ Error fetching students:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Client-side filtering and sorting
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...allStudents]

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchLower) ||
          student.email?.toLowerCase().includes(searchLower) ||
          student.whatsappNo?.includes(searchTerm.trim()),
      )
    }

    // Apply activity filter
    if (filters.activity !== "all") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      if (filters.activity === "active") {
        filtered = filtered.filter((student) => {
          const lastActivity = student.lastActivity ? new Date(student.lastActivity) : new Date(student.createdAt)
          return lastActivity >= thirtyDaysAgo
        })
      } else if (filters.activity === "inactive") {
        filtered = filtered.filter((student) => {
          const lastActivity = student.lastActivity ? new Date(student.lastActivity) : new Date(student.createdAt)
          return lastActivity < thirtyDaysAgo
        })
      }
    }

    // Apply subscription filter
    if (filters.subscription !== "all") {
      if (filters.subscription === "premium") {
        filtered = filtered.filter((student) => student.isPremium)
      } else if (filters.subscription === "free") {
        filtered = filtered.filter((student) => !student.isPremium)
      }
    }

    // Apply interest filter
    if (filters.interest !== "all") {
      if (filters.interest === "interested") {
        filtered = filtered.filter((student) => student.interestData?.interestedInPaidSubscription === true)
      } else if (filters.interest === "not-interested") {
        filtered = filtered.filter((student) => student.interestData?.interestedInPaidSubscription === false)
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      // Handle different data types
      if (sortBy === "createdAt" || sortBy === "lastActivity") {
        aValue = new Date(aValue || 0)
        bValue = new Date(bValue || 0)
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase() || ""
      } else if (typeof aValue === "number") {
        aValue = aValue || 0
        bValue = bValue || 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [allStudents, searchTerm, filters, sortBy, sortOrder])

  // Pagination
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAndSortedStudents, currentPage])

  const totalPages = Math.ceil(filteredAndSortedStudents.length / ITEMS_PER_PAGE)

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("")
    setCurrentPage(1)
  }, [])

  // Handle filters change
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  // Handle sorting
  const handleSort = useCallback(
    (field) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
      } else {
        setSortBy(field)
        setSortOrder("desc")
      }
      setCurrentPage(1)
    },
    [sortBy, sortOrder],
  )

  const handleInterestUpdate = useCallback((student) => {
    setSelectedStudent(student)
    setShowInterestModal(true)
  }, [])

  const handleInterestUpdateSuccess = useCallback(() => {
    setShowInterestModal(false)
    fetchAllStudents()
    fetchStudentCounts()
  }, [fetchAllStudents, fetchStudentCounts])

  const handleSubscriptionUpdate = useCallback((student) => {
    setSelectedStudent(student)
    setShowSubscriptionModal(true)
  }, [])

  const handleViewStudentDetails = useCallback(
    (student) => {
      router.push(`/admin/analytics/students/${student._id}`)
    },
    [router],
  )

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }, [])

  const getEngagementColor = useCallback((score) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }, [])

  const handleViewInterestDetails = useCallback((student) => {
    setSelectedStudent(student)
    setShowInterestDetailsModal(true)
  }, [])

  const handleViewSubscriptionDetails = useCallback((student) => {
    setSelectedStudent(student)
    setShowSubscriptionDetailsModal(true)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }, [router])

  const handleLoginAsAdmin = useCallback(() => {
    router.push("/login?message=Please log in with admin credentials")
  }, [router])

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
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: "Home", path: "/", icon: Home },
              { label: "Admin Dashboard", path: "/admin" },

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
                onClick={fetchAllStudents}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
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

        {/* Enhanced Filters and Search */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 mb-6">
          <CardContent className="p-6 mt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search students by name, email, or phone..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* {searchTerm && (
                  <div className="mt-2 text-sm text-slate-400">
                    Found {filteredAndSortedStudents.length} student{filteredAndSortedStudents.length !== 1 ? "s" : ""}{" "}
                    matching "{searchTerm}"
                  </div>
                )} */}
              </div>

              {/* Advanced Filters */}
              <div className="flex items-center gap-3">
                <AdvancedStudentFilters
                  onFiltersChange={handleFiltersChange}
                  currentFilters={filters}
                  studentCounts={studentCounts}
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {Object.values(filters).some((filter) => filter !== "all") && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-400">Active filters:</span>
                  {Object.entries(filters).map(([key, value]) => {
                    if (value === "all") return null
                    return (
                      <div
                        key={key}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm border border-teal-500/30"
                      >
                        <span className="capitalize">
                          {key}: {value}
                        </span>
                        <button
                          onClick={() => handleFiltersChange({ ...filters, [key]: "all" })}
                          className="hover:text-teal-200"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                  <Button
                    onClick={() =>
                      handleFiltersChange({
                        activity: "all",
                        subscription: "all",
                        subscriptionPlan: "all",
                        interest: "all",
                      })
                    }
                    size="sm"
                    className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Analytics Charts */}
        {/* <div className="space-y-6 mb-6">
          <EngagementOverviewCharts />
          <PremiumDistributionChart />
          <ConversionFunnelChart />
          <InterestMatrixChart />
          <GrowthTrendsChart />
          <InterestConversionChart />
        </div> */}

        {/* Students Table */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Student Performance Overview
              <span className="ml-auto text-sm font-normal text-slate-400">
                {filteredAndSortedStudents.length} of {allStudents.length} students
              </span>
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
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                      >
                        Student
                        {sortBy === "name" &&
                          (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      <button
                        onClick={() => handleSort("totalAttempts")}
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                      >
                        Tests
                        {sortBy === "totalAttempts" &&
                          (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      <button
                        onClick={() => handleSort("averageScore")}
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors"
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
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors"
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
                  {paginatedStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                    >
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
                            <button
                              onClick={() => handleViewSubscriptionDetails(student)}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors cursor-pointer"
                            >
                              Premium
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                              Free
                            </span>
                          )}

                          {student.interestData && (
                            <>
                              {student.interestData.interestedInPaidSubscription === true && (
                                <button
                                  onClick={() => handleViewInterestDetails(student)}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors cursor-pointer"
                                >
                                  Interested
                                </button>
                              )}
                              {student.interestData.interestedInPaidSubscription === false && (
                                <button
                                  onClick={() => handleViewInterestDetails(student)}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                                >
                                  Not Interested
                                </button>
                              )}
                            </>
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

            {/* No Results Message */}
            {filteredAndSortedStudents.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No students found</h3>
                <p className="text-slate-500">
                  {searchTerm || Object.values(filters).some((f) => f !== "all")
                    ? "Try adjusting your search or filters"
                    : "No students have been registered yet"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedStudents.length)} of{" "}
                  {filteredAndSortedStudents.length} students
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
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
          onSuccess={handleInterestUpdateSuccess}
        />
      )}

      {showSubscriptionModal && (
        <StudentSubscriptionModal
          student={selectedStudent}
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={() => {
            setShowSubscriptionModal(false)
            fetchAllStudents()
            fetchStudentCounts()
          }}
        />
      )}

      {showInterestDetailsModal && (
        <StudentInterestDetailsModal
          student={selectedStudent}
          onClose={() => setShowInterestDetailsModal(false)}
          onEdit={(student) => {
            setShowInterestDetailsModal(false)
            handleInterestUpdate(student)
          }}
        />
      )}

      {showSubscriptionDetailsModal && (
        <StudentSubscriptionDetailsModal
          student={selectedStudent}
          onClose={() => setShowSubscriptionDetailsModal(false)}
          onEdit={(student) => {
            setShowSubscriptionDetailsModal(false)
            handleSubscriptionUpdate(student)
          }}
        />
      )}
    </div>
  )
}
