"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import Button from "@/components/ui/Button"

export default function SessionFilters({ filters, onFiltersChange }) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleQuickFilter = (type) => {
    const today = new Date()

    if (type === "today") {
      const todayStr = new Date().toISOString().split("T")[0]

      // Check if today filter is already active
      const isTodayActive = filters.dateRange.start === todayStr && filters.dateRange.end === todayStr

      if (isTodayActive) {
        // Deselect - clear the date range
        handleFilterChange("dateRange", { start: null, end: null })
      } else {
        // Select - set today's date range
        handleFilterChange("dateRange", { start: todayStr, end: todayStr })
      }
    } else if (type === "week") {
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)

      const weekStartStr = startOfWeek.toISOString().split("T")[0]
      const weekEndStr = endOfWeek.toISOString().split("T")[0]

      // Check if this week filter is already active
      const isWeekActive = filters.dateRange.start === weekStartStr && filters.dateRange.end === weekEndStr

      if (isWeekActive) {
        // Deselect - clear the date range
        handleFilterChange("dateRange", { start: null, end: null })
      } else {
        // Select - set this week's date range
        handleFilterChange("dateRange", {
          start: weekStartStr,
          end: weekEndStr,
        })
      }
    }
  }

  // Helper functions to check if filters are active
  const isTodayActive = () => {
    const todayStr = new Date().toISOString().split("T")[0]
    return filters.dateRange.start === todayStr && filters.dateRange.end === todayStr
  }

  const isThisWeekActive = () => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    const weekStartStr = startOfWeek.toISOString().split("T")[0]
    const weekEndStr = endOfWeek.toISOString().split("T")[0]

    return filters.dateRange.start === weekStartStr && filters.dateRange.end === weekEndStr
  }

  const hasActiveFilters = () => {
    return filters.status !== "all" || filters.subject !== "all" || filters.dateRange.start || filters.dateRange.end
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: "all",
      subject: "all",
      dateRange: { start: null, end: null },
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
      {/* Status Filter */}
      <div className="flex flex-col gap-2 min-w-[120px]">
        {/* <label className="text-sm font-medium text-slate-300">Status</label> */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm appearance-none cursor-pointer hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="responded">Responded</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex flex-col gap-2 min-w-[140px]">
        {/* <label className="text-sm font-medium text-slate-300">Subject</label> */}
        <div className="relative">
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm appearance-none cursor-pointer hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="english">English</option>
            <option value="other">Other</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Date Range Filter */}
      {/* <div className="flex flex-col gap-2 min-w-[140px]">
        <label className="text-sm font-medium text-slate-300">Date Range</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="justify-start text-slate-300 border-slate-600 hover:bg-slate-700/50 h-[42px]"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Select Dates
        </Button>
      </div> */}

      {/* Quick Filters */}
      <div className="flex flex-col gap-2">
        {/* <label className="text-sm font-medium text-slate-300">Quick Filters</label> */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter("today")}
            className={`h-[42px] px-4 transition-all duration-200 ${
              isTodayActive()
                ? "bg-teal-500/20 border-teal-400 text-teal-300 shadow-lg shadow-teal-500/20"
                : "text-teal-400 border-teal-400/50 hover:bg-teal-400/10 hover:border-teal-400"
            }`}
          >
            Today
            {isTodayActive() && <X className="h-3 w-3 ml-1" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter("week")}
            className={`h-[42px] px-4 transition-all duration-200 ${
              isThisWeekActive()
                ? "bg-teal-500/20 border-teal-400 text-teal-300 shadow-lg shadow-teal-500/20"
                : "text-teal-400 border-teal-400/50 hover:bg-teal-400/10 hover:border-teal-400"
            }`}
          >
            This Week
            {isThisWeekActive() && <X className="h-3 w-3 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Clear All Filters */}
      {/* {hasActiveFilters() && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-transparent">Clear</label>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:border-red-400 h-[42px] px-4"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      )} */}
    </div>
  )
}
