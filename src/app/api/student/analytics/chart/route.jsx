import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request) {
  try {
    console.log("🔍 Student Analytics Chart API called")

    const authResult = await authenticate(request)
    if (authResult.error) {
      console.log("❌ Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    console.log("✅ Authenticated user:", user.id, "Role:", user.role)

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "week"

    // Check if admin is requesting data for a specific student
    const requestedStudentId = searchParams.get("studentId")
    let targetUserId = user.id

    // If admin is requesting another user's data
    if (requestedStudentId && user.role === "admin") {
      targetUserId = requestedStudentId
      console.log("🔑 Admin requesting chart data for student:", targetUserId)
    } else if (requestedStudentId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    console.log("📅 Time range:", timeRange, "for user:", targetUserId)

    await connectDB()

    // Calculate date range based on filter
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setDate(now.getDate() - 30)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    console.log("📅 Date range:", startDate.toISOString(), "to", now.toISOString())

    // Fetch test attempts in the date range
    const testAttempts = await TestAttempt.find({
      $or: [{ student: targetUserId }, { userId: targetUserId }],
      status: { $in: ["completed", "auto-submitted"] },
      createdAt: { $gte: startDate, $lte: now },
    })
      .populate("test", "title subject")
      .sort({ createdAt: 1 })

    console.log(`📊 Found ${testAttempts.length} test attempts`)

    // Process data based on time range
    let chartData = []

    if (timeRange === "week" || timeRange === "month") {
      chartData = generateDailyChartData(testAttempts, startDate, now)
    } else if (timeRange === "year") {
      chartData = generateMonthlyChartData(testAttempts, startDate, now)
    }

    console.log("📊 Generated chart data:", chartData.length, "data points")

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
    console.error("❌ Chart analytics error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch chart data",
        details: error.message,
      },
      { status: 500 },
    )
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
      const subject = attempt.test?.subject || "Physics"
      if (subjectBreakdown.hasOwnProperty(subject)) {
        subjectBreakdown[subject]++
      } else {
        // Handle other subjects by mapping them to closest match
        if (subject.toLowerCase().includes("math")) {
          subjectBreakdown.Mathematics++
        } else if (subject.toLowerCase().includes("chem")) {
          subjectBreakdown.Chemistry++
        } else {
          subjectBreakdown.Physics++
        }
      }
    })

    chartData.push({
      date: dateStr,
      label: current.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      total: dayAttempts.length,
      Physics: subjectBreakdown.Physics,
      Chemistry: subjectBreakdown.Chemistry,
      Mathematics: subjectBreakdown.Mathematics,
      averageScore:
        dayAttempts.length > 0
          ? dayAttempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0) / dayAttempts.length
          : 0,
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
      const subject = attempt.test?.subject || "Physics"
      if (subjectBreakdown.hasOwnProperty(subject)) {
        subjectBreakdown[subject]++
      } else {
        // Handle other subjects
        if (subject.toLowerCase().includes("math")) {
          subjectBreakdown.Mathematics++
        } else if (subject.toLowerCase().includes("chem")) {
          subjectBreakdown.Chemistry++
        } else {
          subjectBreakdown.Physics++
        }
      }
    })

    chartData.push({
      date: monthKey,
      label: current.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      total: monthAttempts.length,
      Physics: subjectBreakdown.Physics,
      Chemistry: subjectBreakdown.Chemistry,
      Mathematics: subjectBreakdown.Mathematics,
      averageScore:
        monthAttempts.length > 0
          ? monthAttempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0) / monthAttempts.length
          : 0,
    })

    current.setMonth(current.getMonth() + 1)
  }

  return chartData
}
