/**
 * CSV Generator Utility
 * Converts doubt session data to CSV format
 */

export function generateCSV(doubtSessions) {
  if (!doubtSessions || doubtSessions.length === 0) {
    return "No data available"
  }

  // CSV Headers
  const headers = [
    "Session ID",
    "Student Name",
    "Student Email",
    "Subject",
    "Topic",
    "Description",
    "Status",
    "Mode",
    "Preferred Date",
    "Preferred Time",
    "Created At",
    "Updated At",
    "Mentor Name",
    "Mentor Email",
    "Meeting Link",
    "Response Description",
    "Scheduled DateTime",
    "Session Duration",
    "Meeting Platform",
    "Special Instructions",
  ]

  // Helper function to escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return ""

    const stringValue = String(value)

    // If the value contains comma, newline, or quotes, wrap in quotes and escape internal quotes
    if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return ""
    try {
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch (error) {
      return String(date)
    }
  }

  // Convert sessions to CSV rows
  const rows = doubtSessions.map((session) => {
    const student = session.student || {}
    const adminResponse = session.adminResponse || {}
    const preferredTimeSlot = session.preferredTimeSlot || {}

    return [
      escapeCSV(session._id),
      escapeCSV(student.name || student.fullName || "N/A"),
      escapeCSV(student.email || "N/A"),
      escapeCSV(session.subject || "N/A"),
      escapeCSV(session.topic || "N/A"),
      escapeCSV(session.description || "N/A"),
      escapeCSV(session.status || "N/A"),
      escapeCSV(session.mode || "N/A"),
      escapeCSV(preferredTimeSlot.date || "N/A"),
      escapeCSV(preferredTimeSlot.time || "N/A"),
      escapeCSV(formatDate(session.createdAt)),
      escapeCSV(formatDate(session.updatedAt)),
      escapeCSV(adminResponse.mentorName || "N/A"),
      escapeCSV(adminResponse.mentorEmail || "N/A"),
      escapeCSV(adminResponse.meetingLink || "N/A"),
      escapeCSV(adminResponse.responseDescription || "N/A"),
      escapeCSV(formatDate(adminResponse.scheduledDateTime)),
      escapeCSV(adminResponse.sessionDuration || "N/A"),
      escapeCSV(adminResponse.meetingPlatform || "N/A"),
      escapeCSV(adminResponse.specialInstructions || "N/A"),
    ].join(",")
  })

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows].join("\n")

  return csvContent
}

/**
 * Generate CSV for specific data format
 */
export function generateCustomCSV(data, customHeaders, customMapper) {
  if (!data || data.length === 0) {
    return "No data available"
  }

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return ""
    const stringValue = String(value)
    if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  const rows = data.map((item) => customMapper(item).map(escapeCSV).join(","))
  const csvContent = [customHeaders.join(","), ...rows].join("\n")

  return csvContent
}

/**
 * Download CSV file in browser
 */
export function downloadCSV(csvContent, filename = "export.csv") {
  if (typeof window === "undefined") {
    console.warn("downloadCSV can only be used in browser environment")
    return
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Convert JSON to CSV
 */
export function jsonToCSV(jsonData, options = {}) {
  if (!jsonData || jsonData.length === 0) {
    return "No data available"
  }

  const { headers = null, delimiter = ",", includeHeaders = true } = options

  const escapeValue = (value) => {
    if (value === null || value === undefined) return ""
    const stringValue = String(value)
    if (stringValue.includes(delimiter) || stringValue.includes("\n") || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(jsonData[0])

  // Generate rows
  const rows = jsonData.map((item) => csvHeaders.map((header) => escapeValue(item[header])).join(delimiter))

  // Combine headers and rows
  const csvLines = []
  if (includeHeaders) {
    csvLines.push(csvHeaders.join(delimiter))
  }
  csvLines.push(...rows)

  return csvLines.join("\n")
}
