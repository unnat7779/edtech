"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  Megaphone,
  ArrowLeft,
  Calendar,
  Users,
  Crown,
  UserCheck,
  Globe,
  Clock,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Sparkles,
  Star,
  Zap,
} from "lucide-react"

export default function AnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [audienceFilter, setAudienceFilter] = useState("all")

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/system-notifications?type=announcement", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.notifications || [])
      } else {
        console.error("Failed to fetch announcements")
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (announcementId) => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/system-notifications/mark-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds: [announcementId] }),
      })

      setAnnouncements((prev) => prev.map((ann) => (ann.id === announcementId ? { ...ann, isRead: true } : ann)))
    } catch (error) {
      console.error("Error marking announcement as read:", error)
    }
  }

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case "all":
        return <Globe className="h-4 w-4 text-blue-400" />
      case "registered":
        return <UserCheck className="h-4 w-4 text-green-400" />
      case "premium":
        return <Crown className="h-4 w-4 text-yellow-400" />
      case "non-premium":
        return <Users className="h-4 w-4 text-slate-400" />
      default:
        return <Users className="h-4 w-4 text-slate-400" />
    }
  }

  const getAudienceLabel = (audience) => {
    switch (audience) {
      case "all":
        return "All Students"
      case "registered":
        return "Registered"
      case "premium":
        return "Premium"
      case "non-premium":
        return "Non-Premium"
      default:
        return "Unknown"
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return <Zap className="h-5 w-5 text-red-400" />
      case "high":
        return <Star className="h-5 w-5 text-orange-400" />
      default:
        return <Megaphone className="h-5 w-5 text-blue-400" />
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
    return "Just now"
  }

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      !searchQuery ||
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = priorityFilter === "all" || announcement.priority === priorityFilter
    const matchesAudience = audienceFilter === "all" || announcement.targetAudience === audienceFilter

    return matchesSearch && matchesPriority && matchesAudience
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
                <Megaphone className="h-8 w-8 text-blue-400" />
                All Announcements
              </h1>
              <p className="text-slate-400 mt-1">
                {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card variant="secondary" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Audiences</option>
                  <option value="all">All Students</option>
                  <option value="registered">Registered</option>
                  <option value="premium">Premium</option>
                  <option value="non-premium">Non-Premium</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
            <span className="ml-3 text-slate-400">Loading announcements...</span>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="space-y-6">
            {filteredAnnouncements.map((announcement) => {
              const expired = isExpired(announcement.expiresAt)
              return (
                <div
                  key={announcement.id}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    announcement.isRead
                      ? "bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/50 opacity-70"
                      : "bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-teal-900/30 border border-blue-500/30 shadow-2xl shadow-blue-900/20 hover:shadow-blue-900/30"
                  } ${expired ? "opacity-50" : ""}`}
                >
                  {/* NEW Badge for unread */}
                  {!announcement.isRead && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                        <Sparkles className="h-3 w-3" />
                        NEW
                      </div>
                    </div>
                  )}

                  {/* Animated background for unread */}
                  {!announcement.isRead && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 animate-pulse" />
                  )}

                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      {/* Priority Icon */}
                      <div
                        className={`p-3 rounded-full flex-shrink-0 ${
                          announcement.isRead
                            ? "bg-slate-700/50"
                            : announcement.priority === "urgent"
                              ? "bg-red-500/20 border border-red-500/30"
                              : announcement.priority === "high"
                                ? "bg-orange-500/20 border border-orange-500/30"
                                : "bg-blue-500/20 border border-blue-500/30"
                        }`}
                      >
                        {getPriorityIcon(announcement.priority)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3
                              className={`text-2xl font-bold mb-2 transition-colors ${
                                announcement.isRead ? "text-slate-400" : "text-white"
                              }`}
                            >
                              {announcement.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              <div
                                className={`flex items-center gap-1 ${
                                  announcement.isRead ? "text-slate-500" : "text-slate-300"
                                }`}
                              >
                                <Calendar className="h-3 w-3" />
                                {formatTimeAgo(announcement.createdAt)}
                              </div>
                              <div
                                className={`flex items-center gap-1 ${
                                  announcement.isRead ? "text-slate-500" : "text-slate-300"
                                }`}
                              >
                                {getAudienceIcon(announcement.targetAudience)}
                                {getAudienceLabel(announcement.targetAudience)}
                              </div>
                              {announcement.priority && (
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    announcement.priority === "urgent"
                                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                      : announcement.priority === "high"
                                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  }`}
                                >
                                  {announcement.priority.toUpperCase()}
                                </span>
                              )}
                              {expired && (
                                <span className="px-2 py-1 text-xs bg-red-900/20 text-red-400 border border-red-700/50 rounded">
                                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                                  Expired
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p
                            className={`text-lg leading-relaxed transition-colors ${
                              announcement.isRead ? "text-slate-400" : "text-slate-100"
                            }`}
                          >
                            {announcement.message}
                          </p>

                          {announcement.description && (
                            <p
                              className={`text-base leading-relaxed transition-colors ${
                                announcement.isRead ? "text-slate-500" : "text-slate-300"
                              }`}
                            >
                              {announcement.description}
                            </p>
                          )}

                          {/* Images */}
                          {announcement.images && announcement.images.length > 0 && (
                            <div className="flex gap-3">
                              {announcement.images.slice(0, 4).map((image, index) => (
                                <img
                                  key={index}
                                  src={image.url || "/placeholder.svg"}
                                  alt={`Announcement image ${index + 1}`}
                                  className="w-24 h-24 object-cover rounded-lg border border-slate-600 hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => window.open(image.url, "_blank")}
                                />
                              ))}
                              {announcement.images.length > 4 && (
                                <div className="w-24 h-24 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center text-xs text-slate-400">
                                  +{announcement.images.length - 4}
                                </div>
                              )}
                            </div>
                          )}

                          {announcement.expiresAt && !expired && (
                            <div className="flex items-center gap-1 text-sm text-yellow-400">
                              <Clock className="h-4 w-4" />
                              Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="flex items-center justify-end pt-4">
                            {!announcement.isRead && (
                              <Button
                                onClick={() => markAsRead(announcement.id)}
                                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Read
                              </Button>
                            )}
                            {announcement.isRead && (
                              <div className="flex items-center gap-2 text-green-400">
                                <Eye className="h-4 w-4" />
                                <span className="font-medium">Read</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Card variant="primary">
            <CardContent className="p-12 text-center">
              <Megaphone className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No announcements found</h3>
              <p className="text-slate-400">
                {searchQuery || priorityFilter !== "all" || audienceFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No announcements have been posted yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
