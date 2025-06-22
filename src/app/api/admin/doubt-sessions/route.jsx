import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  console.log("=== Admin Doubt Sessions API Called ===")

  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("❌ Authentication required")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      console.log("❌ Admin access required")
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("✅ Admin authenticated:", decoded.email)

    await connectDB()
    console.log("✅ Database connected successfully")

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const status = searchParams.get("status")
    const subject = searchParams.get("subject")
    const search = searchParams.get("search")
    const date = searchParams.get("date")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    console.log("📋 Query params:", {
      page,
      limit,
      status,
      subject,
      search,
      date,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    })

    // Build filter object
    const filter = {}
    if (status && status !== "all") {
      // Map frontend status names to database status values
      let dbStatus = status

      // Handle status mapping if needed
      if (status === "responded") {
        // If "responded" maps to "confirmed" in database
        dbStatus = "confirmed"
      } else if (status === "received") {
        // If "received" is stored as "received" in database
        dbStatus = "received"
      }

      filter.status = dbStatus
      console.log("🔍 Filtering by status:", status, "-> DB status:", dbStatus)
    }

    // Subject filter
    if (subject && subject !== "all") {
      filter.subject = subject
      console.log("🔍 Filtering by subject:", subject)
    }

    // Date filters - FIXED TO USE preferredTimeSlot.date
    if (date) {
      // Single date filter - use the exact date provided
      console.log("🔍 Filtering by single date:", date)

      // Parse the date string (should be in YYYY-MM-DD format)
      const filterDate = new Date(date + "T00:00:00.000Z")
      const nextDay = new Date(date + "T23:59:59.999Z")

      console.log("📅 Filter date start:", filterDate.toISOString())
      console.log("📅 Filter date end:", nextDay.toISOString())

      // Filter by preferredTimeSlot.date instead of createdAt
      filter["preferredTimeSlot.date"] = {
        $gte: filterDate,
        $lte: nextDay,
      }

      console.log("🎯 Date filter applied to preferredTimeSlot.date")
    } else if (startDate || endDate) {
      // Date range filter
      filter["preferredTimeSlot.date"] = {}
      if (startDate) {
        const start = new Date(startDate + "T00:00:00.000Z")
        filter["preferredTimeSlot.date"].$gte = start
        console.log("📅 Start date filter:", start.toISOString())
      }
      if (endDate) {
        const end = new Date(endDate + "T23:59:59.999Z")
        filter["preferredTimeSlot.date"].$lte = end
        console.log("📅 End date filter:", end.toISOString())
      }
      console.log("🔍 Date range filter applied to preferredTimeSlot.date")
    }

    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
      console.log("🔍 Search filter applied:", search)
    }

    console.log("🎯 Final filter:", JSON.stringify(filter, null, 2))

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    console.log("Admin doubt sessions query:", { filter, sort, skip, limit })

    // Fetch sessions
    const sessions = await DoubtSession.find(filter).sort(sort).skip(skip).limit(limit).lean()

    const totalSessions = await DoubtSession.countDocuments(filter)

    console.log(`Found ${sessions.length} sessions out of ${totalSessions} total`)

    // Manually populate student data for each session
    const populatedSessions = await Promise.all(
      sessions.map(async (session) => {
        let studentData = null
        let lastUpdatedByData = null

        // Use either student or studentId field
        const studentId = session.student || session.studentId
        if (studentId) {
          try {
            studentData = await User.findById(studentId).select("name email").lean()
          } catch (error) {
            console.log(`Could not fetch student data for ${studentId}:`, error.message)
          }
        }

        if (session.lastUpdatedBy) {
          try {
            lastUpdatedByData = await User.findById(session.lastUpdatedBy).select("name").lean()
          } catch (error) {
            console.log(`Could not fetch lastUpdatedBy data for ${session.lastUpdatedBy}:`, error.message)
          }
        }

        return {
          ...session,
          studentData,
          lastUpdatedByData,
          effectiveStudentId: studentId,
          // Add debug info
          hasStudentField: !!session.student,
          hasStudentIdField: !!session.studentId,
        }
      }),
    )

    const response = {
      success: true,
      sessions: populatedSessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasNextPage: page < Math.ceil(totalSessions / limit),
        hasPrevPage: page > 1,
      },
      debug: {
        filter,
        sort,
        foundSessions: sessions.length,
        totalSessions,
        fieldStats: {
          withStudentField: sessions.filter((s) => s.student).length,
          withStudentIdField: sessions.filter((s) => s.studentId).length,
          withBothFields: sessions.filter((s) => s.student && s.studentId).length,
        },
      },
    }

    console.log("✅ Returning response with", populatedSessions.length, "sessions")

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ API Error:")
    console.error("Message:", error.message)
    console.error("Stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: "Check server logs for more information",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
