import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("=== CALENDAR API ROUTE ===")

    // Verify admin authentication
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("❌ No token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      console.log("❌ Invalid token or not admin:", decoded)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("✅ Admin authenticated:", decoded.userId)

    // Connect to database
    await connectDB()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get("date")

    console.log("📅 Date filter received:", dateFilter)

    let filter = {}

    if (dateFilter) {
      // Parse the date filter (should be in YYYY-MM-DD format)
      const filterDate = new Date(dateFilter)

      if (isNaN(filterDate.getTime())) {
        console.log("❌ Invalid date format:", dateFilter)
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
      }

      console.log("🔍 Filtering by date:", dateFilter)
      console.log("📅 Parsed filter date:", filterDate.toISOString())

      // Create date range for the specific day
      // Use the exact date provided without any timezone adjustments
      const startOfDay = new Date(dateFilter + "T00:00:00.000Z")
      const endOfDay = new Date(dateFilter + "T23:59:59.999Z")

      console.log("🌅 Start of day:", startOfDay.toISOString())
      console.log("🌇 End of day:", endOfDay.toISOString())

      // Filter by preferredTimeSlot.date instead of createdAt
      filter = {
        "preferredTimeSlot.date": {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }

      console.log("🎯 Final filter:", JSON.stringify(filter, null, 2))
    }

    // Fetch sessions with the filter
    const sessions = await DoubtSession.find(filter)
      .populate("studentId", "name email phone class")
      .sort({ createdAt: -1 })
      .lean()

    console.log("📊 Total matching documents:", sessions.length)

    // Process sessions to ensure consistent date format
    const processedSessions = sessions.map((session) => {
      // Ensure preferredTimeSlot.date is properly formatted
      if (session.preferredTimeSlot && session.preferredTimeSlot.date) {
        const sessionDate = new Date(session.preferredTimeSlot.date)
        if (!isNaN(sessionDate.getTime())) {
          // Keep the original date without timezone conversion
          session.preferredTimeSlot.date = sessionDate.toISOString()
        }
      }
      return session
    })

    console.log("📋 Sessions found:", processedSessions.length)

    // Log first few sessions for debugging
    processedSessions.slice(0, 3).forEach((session, index) => {
      console.log(`Session ${index + 1}:`, {
        id: session._id,
        studentName: session.studentId?.name,
        preferredDate: session.preferredTimeSlot?.date,
        status: session.status,
      })
    })

    console.log("✅ Returning response with", processedSessions.length, "sessions")

    return NextResponse.json({
      success: true,
      sessions: processedSessions,
      total: processedSessions.length,
      filter: dateFilter || "all",
    })
  } catch (error) {
    console.error("❌ Calendar API Error:", error)
    return NextResponse.json({ error: "Failed to fetch calendar sessions", details: error.message }, { status: 500 })
  }
}
