import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"

export async function GET() {
  console.log("=== Stats API Called ===")

  try {
    await connectDB()
    console.log("✅ Database connected for stats")

    // Get all sessions with their status
    const allSessions = await DoubtSession.find({}, { status: 1, _id: 1, studentName: 1 })
    console.log("📋 All sessions from DB:", allSessions)

    // Get total count
    const totalCount = allSessions.length
    console.log("📊 Total sessions count:", totalCount)

    // Function to normalize status
    const normalizeStatus = (status) => {
      if (!status) return "pending"

      const normalized = status.toString().toLowerCase().trim()

      // Handle common misspellings and variations
      switch (normalized) {
        case "pending":
          return "pending"
        case "recieved":
        case "received":
          return "received"
        case "responded":
        case "confirmed":
          return "responded"
        case "completed":
          return "completed"
        case "cancelled":
        case "canceled":
          return "cancelled"
        default:
          console.log(`⚠️ Unknown status found: "${status}" - treating as pending`)
          return "pending"
      }
    }

    // Count sessions by normalized status
    const statusCounts = {
      pending: 0,
      received: 0,
      responded: 0,
      completed: 0,
      cancelled: 0,
    }

    // Process each session
    allSessions.forEach((session) => {
      const normalizedStatus = normalizeStatus(session.status)
      statusCounts[normalizedStatus]++
      console.log(`📝 Session ${session._id}: "${session.status}" → "${normalizedStatus}"`)
    })

    console.log("📊 Status counts after normalization:", statusCounts)

    // Get today's sessions
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const todayCount = await DoubtSession.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })

    // Calculate percentages
    const calculatePercentage = (count, total) => {
      return total > 0 ? Math.round((count / total) * 100) : 0
    }

    const finalStats = {
      total: totalCount,
      pending: statusCounts.pending,
      received: statusCounts.received,
      responded: statusCounts.responded,
      completed: statusCounts.completed,
      cancelled: statusCounts.cancelled,
      today: todayCount,
      percentages: {
        pending: calculatePercentage(statusCounts.pending, totalCount),
        received: calculatePercentage(statusCounts.received, totalCount),
        responded: calculatePercentage(statusCounts.responded, totalCount),
        completed: calculatePercentage(statusCounts.completed, totalCount),
        cancelled: calculatePercentage(statusCounts.cancelled, totalCount),
      },
    }

    console.log("📊 Final stats object:", finalStats)

    return NextResponse.json({
      success: true,
      stats: finalStats,
      debug: {
        totalFound: totalCount,
        rawStatusCounts: statusCounts,
        sampleSessions: allSessions.slice(0, 3),
        statusMapping: {
          pending: "New sessions waiting for admin response",
          received: "Sessions received by admin but not yet responded",
          responded: "Sessions with admin response sent",
          completed: "Finished sessions",
          cancelled: "Cancelled sessions",
        },
      },
    })
  } catch (error) {
    console.error("❌ Stats API Error:")
    console.error("Message:", error.message)
    console.error("Stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
