"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, X, Filter } from "lucide-react"
import Button from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"

export default function SessionCalendar({ onDateSelect, selectedDate, sessions = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState({})

  // Helper function to extract date string from preferredTimeSlot.date
  const extractDateString = (sessionDate) => {
    try {
      if (!sessionDate) return null

      // If it's already a string in YYYY-MM-DD format, use it directly
      if (typeof sessionDate === "string" && sessionDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return sessionDate
      }

      // If it's a Date object or ISO string, extract the date part without timezone conversion
      let dateToProcess = sessionDate

      // If it's an ISO string, extract just the date part before any timezone conversion
      if (typeof sessionDate === "string") {
        // For ISO strings like "2025-06-12T10:00:00.000Z", extract just "2025-06-12"
        if (sessionDate.includes("T")) {
          const datePart = sessionDate.split("T")[0]
          if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
            console.log("Extracting date from ISO string:", sessionDate, "->", datePart)
            return datePart
          }
        }
        dateToProcess = new Date(sessionDate)
      }

      // For Date objects, use getFullYear, getMonth, getDate to avoid timezone issues
      if (dateToProcess instanceof Date && !isNaN(dateToProcess.getTime())) {
        const year = dateToProcess.getFullYear()
        const month = String(dateToProcess.getMonth() + 1).padStart(2, "0")
        const day = String(dateToProcess.getDate()).padStart(2, "0")
        const result = `${year}-${month}-${day}`

        console.log("Extracting date from Date object:", sessionDate, "->", result)
        return result
      }

      console.log("Could not extract date from:", sessionDate)
      return null
    } catch (error) {
      console.log("Error extracting date:", sessionDate, error)
      return null
    }
  }

  // Helper function to get date string from calendar date WITHOUT timezone conversion
  const getCalendarDateString = (date) => {
    // Use getFullYear, getMonth, getDate to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const result = `${year}-${month}-${day}`
    console.log("Calendar date to string:", date.toDateString(), "->", result)
    return result
  }

  useEffect(() => {
    // Process sessions based on preferredTimeSlot.date
    const data = {}
    console.log("Processing sessions for calendar:", sessions.length)

    sessions.forEach((session, index) => {
      const preferredDate = session.preferredTimeSlot?.date

      if (!preferredDate) {
        console.log(`Session ${index}: No preferred date`)
        return
      }

      const dateString = extractDateString(preferredDate)
      if (!dateString) {
        console.log(`Session ${index}: Failed to extract date`)
        return
      }

      console.log(`Session ${index}: Original date: ${preferredDate}, Extracted: ${dateString}`)

      if (!data[dateString]) {
        data[dateString] = {
          total: 0,
          pending: 0,
          responded: 0,
          received: 0,
          completed: 0,
          sessions: [],
        }
      }

      data[dateString].total++
      data[dateString].sessions.push(session)

      const status = session.status?.toLowerCase().trim()

      if (status === "pending") {
        data[dateString].pending++
      } else if (status === "responded") {
        data[dateString].responded++
      } else if (status === "received" || status === "recieved") {
        data[dateString].received++
      } else if (status === "completed") {
        data[dateString].completed++
      }
    })

    console.log("Final calendar data:", data)
    setCalendarData(data)
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
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    if (!selectedDate) return false
    return getCalendarDateString(date) === getCalendarDateString(selectedDate)
  }

  const getDayData = (date) => {
    const dateKey = getCalendarDateString(date)
    const data = calendarData[dateKey] || {
      total: 0,
      pending: 0,
      responded: 0,
      received: 0,
      completed: 0,
      sessions: [],
    }
    return data
  }

  const handleDateClick = (date) => {
    const dayData = getDayData(date)
    const dateKey = getCalendarDateString(date)

    console.log("=== DATE CLICK ===")
    console.log("Clicked date object:", date)
    console.log("Clicked date string:", date.toDateString())
    console.log("Date key for filtering:", dateKey)
    console.log("Sessions for this date:", dayData.sessions.length)

    // Log the sessions to verify they match the clicked date
    dayData.sessions.forEach((session, index) => {
      const sessionDateStr = extractDateString(session.preferredTimeSlot?.date)
      console.log(
        `Session ${index}: Original date: ${session.preferredTimeSlot?.date}, Extracted: ${sessionDateStr}, Matches clicked date: ${sessionDateStr === dateKey}`,
      )
    })

    // Pass the date string instead of the Date object to avoid timezone issues
    onDateSelect(dateKey, dayData.sessions || [])
  }

  const handleClearFilter = () => {
    onDateSelect(null, [])
  }

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return ""

    // If it's a date string, parse it carefully
    if (typeof dateStr === "string") {
      const [year, month, day] = dateStr.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    // If it's a Date object
    return dateStr.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const days = getDaysInMonth(currentDate)
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

  return (
    <div className="bg-slate-800/60 backdrop-blur-xl rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Session Calendar</h3>
          {selectedDate && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Filter className="h-3 w-3 mr-1" />
              Filtered
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(-1)}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-white font-semibold min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(1)}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Showing sessions for:</p>
              <p className="text-white font-semibold">{formatSelectedDate(selectedDate)}</p>
              <p className="text-xs text-slate-400 mt-1">
                {typeof selectedDate === "string"
                  ? calendarData[selectedDate]?.total || 0
                  : getDayData(selectedDate).total}{" "}
                session(s) on this date
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date key: {typeof selectedDate === "string" ? selectedDate : getCalendarDateString(selectedDate)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilter}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filter
            </Button>
          </div>
        </div>
      )}

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-16" />
          }

          const dayData = getDayData(date)
          const hasSessions = dayData.total > 0
          const isCurrentDay = isToday(date)
          const isSelectedDay = isSelected(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`
                relative h-16 p-1 rounded-lg border transition-all duration-200 
                ${
                  isSelectedDay
                    ? "bg-blue-500/30 border-blue-400 shadow-lg shadow-blue-500/20 scale-105"
                    : isCurrentDay
                      ? "bg-slate-700/50 border-slate-500"
                      : hasSessions
                        ? "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:scale-105 cursor-pointer"
                        : "border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
                }
                ${hasSessions && !isSelectedDay ? "hover:shadow-md" : ""}
              `}
            >
              <div className={`text-sm font-medium mb-1 ${isSelectedDay ? "text-blue-200" : "text-white"}`}>
                {date.getDate()}
              </div>

              {hasSessions && (
                <div className="space-y-0.5">
                  {/* Show total sessions count */}
                  <Badge
                    className={`text-[10px] px-1 py-0 ${
                      isSelectedDay
                        ? "bg-blue-400/30 text-blue-200 border-blue-400/40"
                        : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                    }`}
                  >
                    T: {dayData.total}
                  </Badge>

                  {/* Show pending sessions if any */}
                  {dayData.pending > 0 && (
                    <Badge className="text-[10px] px-1 py-0 bg-amber-500/20 text-amber-300 border-amber-500/30">
                      P: {dayData.pending}
                    </Badge>
                  )}

                  {/* Show other status counts */}
                  {dayData.responded > 0 && (
                    <Badge className="text-[10px] px-1 py-0 bg-blue-500/20 text-blue-300 border-blue-500/30">
                      S: {dayData.responded}
                    </Badge>
                  )}
                  {dayData.received > 0 && (
                    <Badge className="text-[10px] px-1 py-0 bg-purple-500/20 text-purple-300 border-purple-500/30">
                      R: {dayData.received}
                    </Badge>
                  )}
                </div>
              )}

              {isCurrentDay && <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />}

              {/* Click indicator for all dates */}
              {!isSelectedDay && (
                <div className="absolute inset-0 rounded-lg border-2 border-transparent hover:border-blue-400/30 transition-colors" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-slate-500/30 rounded border border-slate-500/50" />
          <span className="text-slate-300">Total</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500/30 rounded border border-amber-500/50" />
          <span className="text-slate-300">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500/30 rounded border border-blue-500/50" />
          <span className="text-slate-300">Responded</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500/30 rounded border border-purple-500/50" />
          <span className="text-slate-300">Received</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-500 rounded" />
          <span className="text-slate-300">Today</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-center">
        <p className="text-xs text-slate-400">Click on any date to filter sessions • Dates with sessions show badges</p>
      </div>
    </div>
  )
}
