import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request) {
  try {
    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "thisWeek"

    await connectDB()

    // Calculate date range based on filter
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "thisWeek":
        startDate.setDate(now.getDate() - 7)
        break
      case "last4Weeks":
        startDate.setDate(now.getDate() - 28)
        break
      case "12Months":
        startDate.setMonth(now.getMonth() - 12)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Fetch test attempts in the date range
    const testAttempts = await TestAttempt.find({
      student: user.id,
      status: { $in: ["completed", "auto-submitted"] },
      createdAt: { $gte: startDate, $lte: now },
    })
      .populate("test", "title subject")
      .sort({ createdAt: 1 })

    // Process data based on time range
    let chartData = []

    if (timeRange === "thisWeek" || timeRange === "last4Weeks") {
      // Group by day
      chartData = generateDailyChartData(testAttempts, startDate, now)
    } else if (timeRange === "12Months") {
      // Group by month
      chartData = generateMonthlyChartData(testAttempts, startDate, now)
    }

    return NextResponse.json({
      success: true,
      data: {
        chartData,
        totalAttempts: testAttempts.length,
        timeRange,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
      },
    })
  } catch (error) {
    console.error("Chart analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch chart data", details: error.message }, { status: 500 })
  }
}

function generateDailyChartData(attempts, startDate, endDate) {
  const chartData = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0]
    const dayAttempts = attempts.filter((attempt) => {
      const attemptDate = new Date(attempt.createdAt).toISOString().split("T")[0]
      return attemptDate === dateStr
    })

    const subjectBreakdown = {
      Physics: 0,
      Chemistry: 0,
      Mathematics: 0,
    }

    dayAttempts.forEach((attempt) => {
      const subject = attempt.test?.subject || "Physics" // Default to Physics instead of Other
      if (subjectBreakdown.hasOwnProperty(subject)) {
        subjectBreakdown[subject]++
      }
    })

    chartData.push({
      date: dateStr,
      label: current.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      total: dayAttempts.length,
      Physics: subjectBreakdown.Physics,
      Chemistry: subjectBreakdown.Chemistry,
      Mathematics: subjectBreakdown.Mathematics,
      averageScore:
        dayAttempts.length > 0
          ? dayAttempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0) / dayAttempts.length
          : 0,
      totalScore: dayAttempts.reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0),
      maxPossibleScore: dayAttempts.reduce((sum, attempt) => sum + (attempt.score?.total || 0), 0),
      subjectScores: {
        Physics: dayAttempts
          .filter((a) => a.test?.subject === "Physics")
          .reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0),
        Chemistry: dayAttempts
          .filter((a) => a.test?.subject === "Chemistry")
          .reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0),
        Mathematics: dayAttempts
          .filter((a) => a.test?.subject === "Mathematics")
          .reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0),
      },
    })

    current.setDate(current.getDate() + 1)
  }

  return chartData
}

function generateMonthlyChartData(attempts, startDate, endDate) {
  const chartData = []
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

  while (current <= endDate) {
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`
    const monthAttempts = attempts.filter((attempt) => {
      const attemptDate = new Date(attempt.createdAt)
      const attemptMonthKey = `${attemptDate.getFullYear()}-${String(attemptDate.getMonth() + 1).padStart(2, "0")}`
      return attemptMonthKey === monthKey
    })

    const subjectBreakdown = {
      Physics: 0,
      Chemistry: 0,
      Mathematics: 0,
    }

    monthAttempts.forEach((attempt) => {
      const subject = attempt.test?.subject || "Physics" // Default to Physics instead of Other
      if (subjectBreakdown.hasOwnProperty(subject)) {
        subjectBreakdown[subject]++
      }
    })

    chartData.push({
      date: monthKey,
      label: current.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      total: monthAttempts.length,
      Physics: subjectBreakdown.Physics,
      Chemistry: subjectBreakdown.Chemistry,
      Mathematics: subjectBreakdown.Mathematics,
      averageScore:
        monthAttempts.length > 0
          ? monthAttempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0) / monthAttempts.length
          : 0,
      totalScore: monthAttempts.reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0),
      maxPossibleScore: monthAttempts.reduce((sum, attempt) => sum + (attempt.score?.total || 0), 0),
      subjectScores: {
        Physics: monthAttempts
          .filter((a) => a.test?.subject === "Physics")
          .reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0),
        Chemistry: monthAttempts
          .filter((a) => a.test?.subject === "Chemistry")
          .reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0),
        Mathematics: monthAttempts
          .filter((a) => a.test?.subject === "Mathematics")
          .reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0),
      },
    })

    current.setMonth(current.getMonth() + 1)
  }

  return chartData
}
