"use client"

import { Calendar, BookOpen, Activity } from "lucide-react"

export default function SessionFilters({ filters, onFiltersChange, sessions }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const getUniqueSubjects = () => {
    const subjects = sessions.map((session) => session.subject)
    return [...new Set(subjects)]
  }

  const getStatusCounts = () => {
    const counts = {
      all: sessions.length,
      pending: sessions.filter((s) => s.status === "pending").length,
      responded: sessions.filter((s) => s.status === "responded").length,
      received: sessions.filter((s) => s.status === "received").length,
      completed: sessions.filter((s) => s.status === "completed").length,
    }
    return counts
  }

  const statusCounts = getStatusCounts()
  const uniqueSubjects = getUniqueSubjects()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Status Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          <label className="text-sm font-semibold text-slate-300">Status</label>
        </div>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
        >
          <option value="all">All Status ({statusCounts.all})</option>
          <option value="pending">Pending ({statusCounts.pending})</option>
          <option value="responded">Responded ({statusCounts.responded})</option>
          <option value="received">Received ({statusCounts.received})</option>
          <option value="completed">Completed ({statusCounts.completed})</option>
        </select>
      </div>

      {/* Subject Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-slate-400" />
          <label className="text-sm font-semibold text-slate-300">Subject</label>
        </div>
        <select
          value={filters.subject}
          onChange={(e) => handleFilterChange("subject", e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
        >
          <option value="all">All Subjects</option>
          {uniqueSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <label className="text-sm font-semibold text-slate-300">Date Range</label>
        </div>
        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterChange("dateRange", e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
    </div>
  )
}
