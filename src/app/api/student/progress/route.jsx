import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"

export async function GET(request) {
  try {
    console.log("🔍 Student Progress API called")

    const authResult = await authenticate(request)
    if (authResult.error) {
      console.log("❌ Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    console.log("✅ Authenticated user:", user.id, "Role:", user.role)

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "all"
    const subject = searchParams.get("subject") || "all"

    // Check if admin is requesting data for a specific student
    const requestedStudentId = searchParams.get("studentId")
    let targetUserId = user.id

    // If admin is requesting another user's data
    if (requestedStudentId && user.role === "admin") {
      targetUserId = requestedStudentId
      console.log("🔑 Admin requesting data for student:", targetUserId)
    } else if (requestedStudentId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    console.log("📊 Fetching progress for user:", targetUserId)

    await connectDB()

    // Calculate date range based on filter
    const now = new Date()
    let startDate = null

    if (timeRange !== "all") {
      startDate = new Date()
      switch (timeRange) {
        case "30days":
          startDate.setDate(now.getDate() - 30)
          break
        case "90days":
          startDate.setDate(now.getDate() - 90)
          break
        case "1year":
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate = null
      }
    }

    // Build query for test attempts
    const query = {
      $or: [{ userId: targetUserId }, { student: targetUserId }],
      status: { $in: ["completed", "submitted", "auto-submitted"] },
    }

    if (startDate) {
      query.createdAt = { $gte: startDate }
    }

    console.log("🔍 Query:", JSON.stringify(query, null, 2))

    // Fetch test attempts
    const testAttempts = await TestAttempt.find(query)
      .populate({
        path: "test",
        model: Test,
        select: "title subject type duration totalMarks",
      })
      .sort({ createdAt: 1 })
      .lean()

    console.log(`📊 Found ${testAttempts.length} test attempts`)

    // Filter by subject if specified
    let filteredAttempts = testAttempts
    if (subject !== "all") {
      filteredAttempts = testAttempts.filter((attempt) => attempt.test?.subject === subject)
      console.log(`📊 After subject filter (${subject}): ${filteredAttempts.length} attempts`)
    }

    if (filteredAttempts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          trendData: [],
          overallStats: {
            totalTests: 0,
            averageScore: 0,
            bestScore: 0,
            improvementRate: 0,
          },
        },
      })
    }

    // Process attempts for trend data
    const trendData = []
    const testTracker = new Map()

    filteredAttempts.forEach((attempt, index) => {
      const testId = attempt.test?._id?.toString()

      // Calculate score percentage
      let percentage = 0
      if (attempt.score?.percentage !== undefined) {
        percentage = attempt.score.percentage
      } else if (
        attempt.score?.obtained !== undefined &&
        attempt.score?.total !== undefined &&
        attempt.score.total > 0
      ) {
        percentage = (attempt.score.obtained / attempt.score.total) * 100
      }

      // Track retakes
      const previousAttempts = testTracker.get(testId) || []
      const isRetake = previousAttempts.length > 0
      const attemptNumber = previousAttempts.length + 1

      trendData.push({
        x: index + 1,
        y: percentage,
        date: attempt.createdAt,
        testTitle: attempt.test?.title || "Unknown Test",
        subject: attempt.test?.subject || "General",
        score: {
          obtained: attempt.score?.obtained || 0,
          total: attempt.score?.total || 0,
          percentage: percentage,
        },
        timeSpent: attempt.timeSpent || 0,
        isRetake: isRetake,
        attemptNumber: attemptNumber,
      })

      // Update tracker
      previousAttempts.push(attempt._id)
      testTracker.set(testId, previousAttempts)
    })

    // Calculate overall statistics
    const scores = trendData.map((d) => d.y).filter((score) => score > 0)
    const totalTests = filteredAttempts.length
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0

    // Calculate improvement rate (last 5 vs first 5 attempts)
    let improvementRate = 0
    if (scores.length >= 2) {
      const firstFive = scores.slice(0, Math.min(5, Math.floor(scores.length / 2)))
      const lastFive = scores.slice(-Math.min(5, Math.floor(scores.length / 2)))

      const firstAvg = firstFive.reduce((a, b) => a + b, 0) / firstFive.length
      const lastAvg = lastFive.reduce((a, b) => a + b, 0) / lastFive.length

      improvementRate = lastAvg - firstAvg
    }

    const overallStats = {
      totalTests,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore: Math.round(bestScore * 10) / 10,
      improvementRate: Math.round(improvementRate * 10) / 10,
    }

    console.log("📊 Progress stats calculated:", overallStats)

    return NextResponse.json({
      success: true,
      data: {
        trendData,
        overallStats,
      },
    })
  } catch (error) {
    console.error("❌ Progress API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch progress data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
