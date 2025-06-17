"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import AnnouncementForm from "@/components/admin/AnnouncementForm"

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [activeDropdown, setActiveDropdown] = useState(null)

  const getAuthToken = () => {
    let token = localStorage.getItem("token")
    if (token) return token

    token = sessionStorage.getItem("token")
    if (token) return token

    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "token") return value
    }

    return null
  }

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      console.log("Token found:", token ? "Yes" : "No")

      if (!token) {
        setError("No authentication token found. Please login again.")
        return
      }

      const response = await fetch("/api/admin/announcements", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        setAnnouncements(data.announcements || [])
      } else {
        throw new Error(data.error || "Failed to fetch announcements")
      }
    } catch (error) {
      console.error("Fetch announcements error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    try {
      const token = getAuthToken()
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setAnnouncements(announcements.filter((a) => a._id !== id))
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete announcement")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete announcement")
    }
  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    setShowForm(true)
    setActiveDropdown(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAnnouncement(null)
    fetchAnnouncements()
  }

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "urgent":
        return {
          color: "bg-red-500 text-white",
          icon: AlertCircle,
        }
      case "high":
        return {
          color: "bg-orange-500 text-white",
          icon: AlertCircle,
        }
      case "medium":
        return {
          color: "bg-yellow-500 text-black",
          icon: Clock,
        }
      case "low":
        return {
          color: "bg-green-500 text-white",
          icon: CheckCircle2,
        }
      default:
        return {
          color: "bg-slate-500 text-white",
          icon: Clock,
        }
    }
  }

  const getReadRateConfig = (percentage) => {
    if (percentage >= 80)
      return {
        color: "text-emerald-400",
        icon: CheckCircle2,
        status: "Excellent",
      }
    if (percentage >= 60)
      return {
        color: "text-blue-400",
        icon: TrendingUp,
        status: "Good",
      }
    if (percentage >= 30)
      return {
        color: "text-amber-400",
        icon: Clock,
        status: "Fair",
      }
    return {
      color: "text-red-400",
      icon: XCircle,
      status: "Low",
    }
  }

  const getAudienceConfig = (audience) => {
    switch (audience) {
      case "all":
        return { label: "All Users", icon: Users, color: "text-blue-400" }
      case "premium":
        return { label: "Premium", icon: TrendingUp, color: "text-purple-400" }
      case "registered":
        return { label: "Registered", icon: Eye, color: "text-green-400" }
      default:
        return { label: "All Users", icon: Users, color: "text-blue-400" }
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <span className="text-lg text-white">Loading announcements...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading Announcements</h3>
              <p className="text-red-200 mb-6">{error}</p>
              <Button onClick={fetchAnnouncements} className="bg-red-600 hover:bg-red-700 text-white">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Announcements</h1>
              <p className="text-slate-300 mt-1">Manage system-wide announcements and notifications</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {filteredAnnouncements.length === 0 ? (
            <Card className="bg-slate-800/60 border-slate-600">
              <CardContent className="p-12 text-center">
                <div className="text-slate-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-300">No announcements found</h3>
                  <p className="text-sm">
                    {searchTerm ? "Try adjusting your search terms" : "Create your first announcement to get started"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAnnouncements.map((announcement) => {
              const priorityConfig = getPriorityConfig(announcement.priority)
              const readRateConfig = getReadRateConfig(announcement.readPercentage || 0)
              const audienceConfig = getAudienceConfig(announcement.targetAudience)
              const PriorityIcon = priorityConfig.icon
              const ReadIcon = readRateConfig.icon
              const AudienceIcon = audienceConfig.icon

              return (
                <Card
                  key={announcement._id}
                  className="bg-slate-800/60 border-slate-600 hover:bg-slate-700/60 transition-all duration-200 hover:shadow-xl overflow-hidden backdrop-blur-sm"
                >
                  <CardContent className="p-0">
                    {/* Header Section */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-semibold text-white truncate">{announcement.title}</h3>
                            <div className="flex items-center gap-1">
                              <PriorityIcon className="w-3 h-3" />
                              <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig.color}`}>
                                {announcement.priority.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-slate-300 text-base leading-relaxed mb-4">{announcement.message}</p>
                        </div>

                        {/* Actions Dropdown */}
                        {/* <div className="relative ml-4">
                          <Button
                            onClick={() =>
                              setActiveDropdown(activeDropdown === announcement._id ? null : announcement._id)
                            }
                            variant="outline"
                            size="sm"
                            className="text-slate-400 hover:text-white border-slate-600 hover:bg-slate-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {activeDropdown === announcement._id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEdit(announcement)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Announcement
                                </button>
                                <button
                                  onClick={() => handleDelete(announcement._id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Announcement
                                </button>
                              </div>
                            </div>
                          )}
                        </div> */}
                      </div>

                      {/* Description */}
                      {announcement.description && (
                        <div className="mb-4 p-4 bg-slate-900/40 rounded-lg border-l-4 border-teal-500">
                          <p className="text-sm text-slate-300 leading-relaxed">{announcement.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Stats Section */}
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Engagement */}
                        <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <ReadIcon className={`w-4 h-4 ${readRateConfig.color}`} />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                              Engagement
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-bold ${readRateConfig.color}`}>
                              {announcement.readCount || 0}
                            </span>
                            <span className="text-sm text-slate-500">/ {announcement.totalRecipients || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs font-medium ${readRateConfig.color}`}>
                              {announcement.readPercentage || 0}%
                            </span>
                            <span className="text-xs text-slate-500">• {readRateConfig.status}</span>
                          </div>
                        </div>

                        {/* Audience */}
                        <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <AudienceIcon className={`w-4 h-4 ${audienceConfig.color}`} />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Audience</span>
                          </div>
                          <span className={`text-sm font-semibold ${audienceConfig.color}`}>
                            {audienceConfig.label}
                          </span>
                          <div className="text-xs text-slate-500 mt-1">
                            {announcement.totalRecipients || 0} recipients
                          </div>
                        </div>

                        {/* Created Date */}
                        <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Created</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-300">
                            {formatDate(announcement.createdAt)}
                          </span>
                        </div>

                        {/* Expiry */}
                        <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Expires</span>
                          </div>
                          <span
                            className={`text-sm font-semibold ${announcement.expiresAt ? "text-amber-400" : "text-slate-400"}`}
                          >
                            {announcement.expiresAt ? formatDate(announcement.expiresAt) : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Images Section */}
                    {announcement.images && announcement.images.length > 0 && (
                      <div className="px-6 pb-6">
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                          Attachments
                        </div>
                        <div className="flex gap-3">
                          {announcement.images.slice(0, 4).map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.url || "/placeholder.svg"}
                                alt={`Announcement image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border border-slate-600 group-hover:shadow-lg transition-shadow"
                              />
                            </div>
                          ))}
                          {announcement.images.length > 4 && (
                            <div className="w-16 h-16 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-slate-400">
                                +{announcement.images.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <AnnouncementForm
            announcement={editingAnnouncement}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormClose()
              fetchAnnouncements()
            }}
          />
        )}
      </div>

      {/* Click outside to close dropdown */}
      {activeDropdown && <div className="fixed inset-0 z-5" onClick={() => setActiveDropdown(null)} />}
    </div>
  )
}
