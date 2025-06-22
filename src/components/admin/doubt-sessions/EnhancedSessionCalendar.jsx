"use client"

import { useState, useMemo } from "react"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"

const EnhancedSessionCalendar = ({ sessions = [], selectedDate, onDateSelect, onFilterChange, activeFilters }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showDateModal, setShowDateModal] = useState(false)
  const [modalDate, setModalDate] = useState(null)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped = {}
    sessions.forEach((session) => {
      const date = new Date(session.createdAt).toDateString()
      if (!grouped[date]) {
        grouped[date] = {
          total: 0,
          pending: 0,
          responded: 0,
          received: 0,
          completed: 0,
          sessions: [],
        }
      }
      grouped[date].total++
      grouped[date][session.status.toLowerCase()]++
      grouped[date].sessions.push(session)
    })
    return grouped
  }, [sessions])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const handleDateClick = (date) => {
    if (!date) return

    const dateString = date.toDateString()
    const sessionsForDate = sessionsByDate[dateString]

    if (sessionsForDate && sessionsForDate.total > 0) {
      setModalDate({ date, sessions: sessionsForDate })
      setShowDateModal(true)
    }

    // Set date filter
    const isoDate = date.toISOString().split("T")[0]
    onFilterChange({
      ...activeFilters,
      date: activeFilters.date === isoDate ? null : isoDate,
    })
    onDateSelect(activeFilters.date === isoDate ? null : date)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500"
      case "responded":
        return "bg-blue-500"
      case "received":
        return "bg-purple-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Session Calendar</h2>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>

          <h3 className="text-xl font-semibold text-white min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>

          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-slate-400 font-medium py-2">
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const dateString = date?.toDateString()
          const sessionsForDate = sessionsByDate[dateString]
          const hasSessions = sessionsForDate && sessionsForDate.total > 0

          return (
            <div
              key={index}
              className={`
                min-h-[80px] p-2 rounded-lg border transition-all duration-200 cursor-pointer
                ${
                  date
                    ? `
                    ${isSelected(date) ? "bg-blue-500/20 border-blue-500/50" : "hover:bg-slate-700/30"}
                    ${isToday(date) ? "ring-2 ring-green-500/50" : ""}
                    ${hasSessions ? "border-slate-600/50" : "border-slate-800/50"}
                  `
                    : "border-transparent"
                }
              `}
              onClick={() => handleDateClick(date)}
            >
              {date && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday(date) ? "text-green-400" : isSelected(date) ? "text-blue-400" : "text-slate-300"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday(date) && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  </div>

                  {hasSessions && (
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">T: {sessionsForDate.total}</div>
                      <div className="flex flex-wrap gap-1">
                        {sessionsForDate.pending > 0 && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
                            P: {sessionsForDate.pending}
                          </span>
                        )}
                        {sessionsForDate.responded > 0 && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                            R: {sessionsForDate.responded}
                          </span>
                        )}
                        {sessionsForDate.completed > 0 && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                            C: {sessionsForDate.completed}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
          <span className="text-sm text-slate-400">Total</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Responded</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Received</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-green-500/50"></div>
          <span className="text-sm text-slate-400">Today</span>
        </div>
      </div>

      {/* Active Date Filter Indicator */}
      {activeFilters.date && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">
              Filtered by: {new Date(activeFilters.date).toLocaleDateString()}
            </span>
            <button
              onClick={() => {
                onFilterChange({ ...activeFilters, date: null })
                onDateSelect(null)
              }}
              className="p-1 hover:bg-blue-500/20 rounded"
            >
              <X className="w-3 h-3 text-blue-400" />
            </button>
          </div>
        </div>
      )}

      {/* Date Details Modal */}
      {showDateModal && modalDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {modalDate.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{modalDate.sessions.total}</div>
                  <div className="text-sm text-slate-400">Total Sessions</div>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{modalDate.sessions.pending}</div>
                  <div className="text-sm text-slate-400">Pending</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{modalDate.sessions.responded}</div>
                  <div className="text-sm text-slate-400">Responded</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{modalDate.sessions.completed}</div>
                  <div className="text-sm text-slate-400">Completed</div>
                </div>
              </div>

              <button
                onClick={() => {
                  const isoDate = modalDate.date.toISOString().split("T")[0]
                  onFilterChange({ ...activeFilters, date: isoDate })
                  onDateSelect(modalDate.date)
                  setShowDateModal(false)
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Filter Sessions for This Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedSessionCalendar
