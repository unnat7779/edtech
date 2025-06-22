"use client"

import { useState } from "react"
import { Search, Filter, RefreshCw, Calendar, X, ChevronDown } from "lucide-react"

const EnhancedSessionFilters = ({ filters, onFiltersChange, onRefresh, isLoading }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const statusOptions = [
    { value: "all", label: "All Status", color: "text-slate-400" },
    { value: "pending", label: "Pending", color: "text-yellow-400" },
    { value: "responded", label: "Responded", color: "text-blue-400" },
    { value: "received", label: "Received", color: "text-purple-400" },
    { value: "completed", label: "Completed", color: "text-green-400" },
  ]

  const subjectOptions = [
    { value: "all", label: "All Subjects" },
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
    { value: "computer-science", label: "Computer Science" },
    { value: "english", label: "English" },
    { value: "other", label: "Other" },
  ]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      status: "all",
      subject: "all",
      dateRange: { start: null, end: null },
      date: null,
      search: "",
    }
    onFiltersChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status !== "all") count++
    if (filters.subject !== "all") count++
    if (filters.search) count++
    if (filters.date) count++
    if (filters.dateRange?.start || filters.dateRange?.end) count++
    return count
  }

  const removeFilter = (filterKey) => {
    if (filterKey === "dateRange") {
      handleFilterChange("dateRange", { start: null, end: null })
    } else {
      handleFilterChange(filterKey, filterKey === "status" || filterKey === "subject" ? "all" : "")
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, topic, or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="appearance-none bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Subject Filter */}
        <div className="relative">
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="appearance-none bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          >
            {subjectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all ${
            showAdvancedFilters
              ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
              : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-600/50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Advanced</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-slate-700/50 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateRange?.start || ""}
                  onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, start: e.target.value })}
                  className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end || ""}
                  onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, end: e.target.value })}
                  className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* Clear All Filters */}
            <div className="flex items-end">
              <button
                onClick={clearAllFilters}
                className="w-full bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="border-t border-slate-700/50 pt-4 mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-slate-300">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.status !== "all" && (
              <div className="flex items-center space-x-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-yellow-400">
                  Status: {statusOptions.find((s) => s.value === filters.status)?.label}
                </span>
                <button onClick={() => removeFilter("status")} className="p-0.5 hover:bg-yellow-500/20 rounded">
                  <X className="w-3 h-3 text-yellow-400" />
                </button>
              </div>
            )}

            {filters.subject !== "all" && (
              <div className="flex items-center space-x-1 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-purple-400">
                  Subject: {subjectOptions.find((s) => s.value === filters.subject)?.label}
                </span>
                <button onClick={() => removeFilter("subject")} className="p-0.5 hover:bg-purple-500/20 rounded">
                  <X className="w-3 h-3 text-purple-400" />
                </button>
              </div>
            )}

            {filters.search && (
              <div className="flex items-center space-x-1 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-blue-400">Search: "{filters.search}"</span>
                <button onClick={() => removeFilter("search")} className="p-0.5 hover:bg-blue-500/20 rounded">
                  <X className="w-3 h-3 text-blue-400" />
                </button>
              </div>
            )}

            {filters.date && (
              <div className="flex items-center space-x-1 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                <Calendar className="w-3 h-3 text-green-400" />
                <span className="text-sm text-green-400">Date: {new Date(filters.date).toLocaleDateString()}</span>
                <button onClick={() => removeFilter("date")} className="p-0.5 hover:bg-green-500/20 rounded">
                  <X className="w-3 h-3 text-green-400" />
                </button>
              </div>
            )}

            {(filters.dateRange?.start || filters.dateRange?.end) && (
              <div className="flex items-center space-x-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-3 py-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span className="text-sm text-indigo-400">
                  Range: {filters.dateRange.start || "Start"} - {filters.dateRange.end || "End"}
                </span>
                <button onClick={() => removeFilter("dateRange")} className="p-0.5 hover:bg-indigo-500/20 rounded">
                  <X className="w-3 h-3 text-indigo-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedSessionFilters
