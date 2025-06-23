"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Search,
  Calendar,
  CreditCard,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import SubscriptionHistoryCard from "@/components/subscriptions/SubscriptionHistoryCard"

export default function SubscriptionHistoryPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId

  const [subscriptions, setSubscriptions] = useState([])
  const [groupedSubscriptions, setGroupedSubscriptions] = useState({})
  const [summary, setSummary] = useState({})
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    fetchSubscriptionHistory()
  }, [userId])

  const fetchSubscriptionHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("=== FRONTEND SUBSCRIPTION FETCH ===")
      console.log("1. Fetching for userId:", userId)

      const token = localStorage.getItem("token")
      console.log("2. Token from localStorage:", token ? "Found" : "Not found")

      if (!token) {
        throw new Error("Authentication required - please login again")
      }

      console.log("3. Making API request to:", `/api/subscriptions/history/${userId}`)

      const response = await fetch(`/api/subscriptions/history/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("4. Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("❌ API Error Response:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch subscription history`)
      }

      const data = await response.json()
      console.log("5. ✅ API Response received:", {
        success: data.success,
        subscriptionsCount: data.subscriptions?.length || 0,
        currentSubscription: data.currentSubscription ? "Yes" : "No",
        historyCount: data.subscriptionHistory?.length || 0,
        summary: data.summary,
        expiringSoonDetails: data.summary?.expiringSoonDetails,
        user: data.user,
      })

      // Update state with fetched data
      setSubscriptions(data.subscriptions || [])
      setGroupedSubscriptions(data.groupedSubscriptions || {})
      setSummary(data.summary || {})
      setUser(data.user || {})

      console.log("6. State updated successfully")
      console.log("7. Expiring soon details:", data.summary?.expiringSoonDetails)
    } catch (error) {
      console.error("❌ Frontend Error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (subscription) => {
    console.log("Viewing details for subscription:", subscription._id)
    // You can add a modal here or navigate to details page
    // For now, we'll just log the action since buttons are removed
  }

  const handleDownloadInvoice = (subscription) => {
    console.log("Downloading invoice for:", subscription.paymentId)
    // Implement invoice download logic
  }

  const getFilteredSubscriptions = () => {
    let filtered = subscriptions

    if (activeTab !== "all") {
      filtered = groupedSubscriptions[activeTab] || []
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          (sub.planName || sub.plan || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sub.paymentId || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate)
        case "oldest":
          return new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate)
        case "amount-high":
          return (b.amount || 0) - (a.amount || 0)
        case "amount-low":
          return (a.amount || 0) - (b.amount || 0)
        case "expiry":
          return new Date(a.endDate) - new Date(b.endDate)
        default:
          return 0
      }
    })

    return filtered
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getExpiringDisplayInfo = () => {
    const expiring = summary.expiringSoonDetails
    if (!expiring || expiring.count === 0) {
      return {
        mainText: "0",
        subText: "No subscriptions expiring",
        color: "text-slate-400",
        bgColor: "bg-slate-500/20",
      }
    }

    if (expiring.daysLeft <= 1) {
      return {
        mainText: expiring.displayText,
        subText: expiring.planName,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
      }
    } else if (expiring.daysLeft <= 7) {
      return {
        mainText: expiring.displayText,
        subText: expiring.planName,
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
      }
    } else {
      return {
        mainText: expiring.displayText,
        subText: expiring.planName,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
      }
    }
  }

  const expiringInfo = getExpiringDisplayInfo()

  const tabs = [
    { id: "all", label: "All", shortLabel: "All", count: subscriptions.length },
    { id: "active", label: "Active", shortLabel: "Active", count: groupedSubscriptions.active?.length || 0 },
    { id: "expired", label: "Expired", shortLabel: "Expired", count: groupedSubscriptions.expired?.length || 0 },
    {
      id: "cancelled",
      label: "Cancelled",
      shortLabel: "Cancelled",
      count: groupedSubscriptions.cancelled?.length || 0,
    },
    { id: "pending", label: "Pending", shortLabel: "Pending", count: groupedSubscriptions.pending?.length || 0 },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-4 sm:mb-6"></div>
          <div className="text-base sm:text-lg font-medium text-slate-300">Loading subscription history...</div>
          <div className="text-xs sm:text-sm text-slate-500 mt-2">Fetching data for user: {userId}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-slate-200 mb-2">Error Loading History</h3>
          <p className="text-sm sm:text-base text-slate-400 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={fetchSubscriptionHistory} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              Try Again
            </Button>
            <p className="text-xs text-slate-500">Check browser console for detailed logs</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="p-2 border-slate-600 hover:bg-slate-700 flex-shrink-0 mt-1 sm:mt-0"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent leading-tight">
                  Subscription History
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 truncate">
                  Manage and track your subscription plans
                  {user.name && <span className="hidden sm:inline ml-2">• {user.name}</span>}
                </p>
                {user.name && <p className="text-xs text-slate-500 sm:hidden mt-1">• {user.name}</p>}
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-teal-600 to-blue-600 flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4 py-2"
              size="sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export All</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-400 text-xs sm:text-sm">Total Spending</p>
                  <p className="text-lg sm:text-2xl font-bold text-teal-400 truncate">
                    {formatCurrency(summary.totalSpending || 0)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-teal-500/20 rounded-lg flex-shrink-0 ml-3">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-400 text-xs sm:text-sm">Active Plan</p>
                  <p className="text-sm sm:text-lg font-bold text-emerald-400 truncate" title={summary.activePlanName}>
                    {summary.activePlanName || "No Active Plan"}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-emerald-500/20 rounded-lg flex-shrink-0 ml-3">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-400 text-xs sm:text-sm">Expiring Soon</p>
                  <p
                    className={`text-sm sm:text-xl font-bold ${expiringInfo.color} truncate`}
                    title={expiringInfo.subText}
                  >
                    {expiringInfo.mainText}
                  </p>
                  {expiringInfo.subText && expiringInfo.subText !== "No subscriptions expiring" && (
                    <p className="text-xs text-slate-500 mt-1 truncate" title={expiringInfo.subText}>
                      {expiringInfo.subText}
                    </p>
                  )}
                </div>
                <div className={`p-2 sm:p-3 ${expiringInfo.bgColor} rounded-lg flex-shrink-0 ml-3`}>
                  {summary.expiringSoonDetails?.count > 0 ? (
                    <Clock className={`h-5 w-5 sm:h-6 sm:w-6 ${expiringInfo.color}`} />
                  ) : (
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4">
            {/* Tabs */}
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-teal-600 text-white"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span> ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm min-w-0 sm:min-w-[180px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
                <option value="expiry">By Expiry Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {getFilteredSubscriptions().map((subscription, index) => (
            <SubscriptionHistoryCard
              key={subscription._id || index}
              subscription={subscription}
              onViewDetails={handleViewDetails}
              onDownloadInvoice={handleDownloadInvoice}
            />
          ))}
        </div>

        {getFilteredSubscriptions().length === 0 && (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-slate-200 mb-2">No Subscriptions Found</h3>
            <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-md mx-auto">
              {searchTerm || activeTab !== "all"
                ? "Try adjusting your search or filter criteria."
                : "You haven't purchased any subscription plans yet."}
            </p>
            <Button
              onClick={() => {
                router.push("/#premium-programs")
                setTimeout(() => {
                  const element = document.getElementById("premium-programs")
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                  }
                }, 100)
              }}
              className="bg-gradient-to-r from-teal-600 to-blue-600 w-full sm:w-auto"
            >
              <Crown className="h-4 w-4 mr-2" />
              Browse Plans
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
