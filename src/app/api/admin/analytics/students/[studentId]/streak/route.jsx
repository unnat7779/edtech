import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await authenticate(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const resolvedParams = await params
    const { studentId } = resolvedParams

    // Import models after DB connection
    const TestAttempt = (await import("@/models/TestAttempt")).default
    const StudentStreak = (await import("@/models/StudentStreak")).default

    // Get student's streak data
    let streakData = await StudentStreak.findOne({ userId: studentId })

    if (!streakData) {
      // Create initial streak data if it doesn't exist
      streakData = new StudentStreak({
        userId: studentId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakHistory: [],
      })
      await streakData.save()
    }

    // Get test attempts for heatmap (last 365 days)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const attempts = await TestAttempt.find({
      userId: studentId,
      status: "completed",
      submittedAt: { $gte: oneYearAgo },
    })
      .sort({ submittedAt: 1 })
      .lean()

    // Process attempts into daily activity
    const dailyActivity = {}
    attempts.forEach((attempt) => {
      const date = attempt.submittedAt.toISOString().split("T")[0]
      if (!dailyActivity[date]) {
        dailyActivity[date] = {
          count: 0,
          totalScore: 0,
          attempts: [],
        }
      }
      dailyActivity[date].count++
      dailyActivity[date].totalScore += attempt.score || 0
      dailyActivity[date].attempts.push({
        testId: attempt.testId,
        score: attempt.score,
        timeSpent: attempt.timeSpent,
      })
    })

    // Calculate average scores for each day
    Object.keys(dailyActivity).forEach((date) => {
      const day = dailyActivity[date]
      day.averageScore = day.count > 0 ? day.totalScore / day.count : 0
    })

    // Generate heatmap data for the last 365 days
    const heatmapData = []
    const today = new Date()

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateString = date.toISOString().split("T")[0]
      const activity = dailyActivity[dateString]

      heatmapData.push({
        date: dateString,
        count: activity?.count || 0,
        averageScore: activity?.averageScore || 0,
        level: activity ? Math.min(Math.floor(activity.count / 2) + 1, 4) : 0,
      })
    }

    // Calculate additional statistics
    const totalDaysActive = Object.keys(dailyActivity).length
    const totalAttempts = attempts.length
    const averageAttemptsPerDay = totalDaysActive > 0 ? totalAttempts / totalDaysActive : 0

    // Calculate monthly activity
    const monthlyActivity = {}
    attempts.forEach((attempt) => {
      const month = attempt.submittedAt.toISOString().substring(0, 7) // YYYY-MM
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: {
        streakData: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastActivityDate: streakData.lastActivityDate,
          streakHistory: streakData.streakHistory,
        },
        heatmapData,
        statistics: {
          totalDaysActive,
          totalAttempts,
          averageAttemptsPerDay: Math.round(averageAttemptsPerDay * 100) / 100,
          monthlyActivity,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching student streak data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch student streak data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
