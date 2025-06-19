import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET(request) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No authentication token" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all"

    const now = new Date()
    let startDate = null

    // Set start date based on period
    if (period !== "all") {
      startDate = new Date()
      switch (period) {
        case "7d":
          startDate.setDate(startDate.getDate() - 7)
          break
        case "30d":
          startDate.setDate(startDate.getDate() - 30)
          break
        case "1y":
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }
      startDate.setHours(0, 0, 0, 0)
    }

    console.log(`Fetching score distribution for period: ${period}`)

    // Build query - just get test attempts with scores
    const query = {
      score: { $exists: true },
    }

    if (startDate) {
      query.createdAt = { $gte: startDate, $lte: now }
    }

    // Get all test attempts with scores
    const testAttempts = await TestAttempt.find(query).select("score userId createdAt")

    console.log(`Found ${testAttempts.length} test attempts with scores`)

    if (testAttempts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          scoreRanges: [],
          totalStudents: 0,
          averageScore: 0,
          totalAttempts: 0,
        },
      })
    }

    // Define score ranges based on marks out of 300
    const scoreRanges = {
      "0-90": { label: "Poor", min: 0, max: 90, color: "#ef4444", count: 0 },
      "91-150": { label: "Below Average", min: 91, max: 150, color: "#f97316", count: 0 },
      "151-210": { label: "Average", min: 151, max: 210, color: "#eab308", count: 0 },
      "211-270": { label: "Good", min: 211, max: 270, color: "#22c55e", count: 0 },
      "271-300": { label: "Excellent", min: 271, max: 300, color: "#3b82f6", count: 0 },
    }

    let totalScore = 0
    let validScoreCount = 0

    // Process ALL test attempts - convert to marks out of 300
    testAttempts.forEach((attempt, index) => {
      let actualMarks = 0

      // Handle different score formats
      if (attempt.score) {
        if (typeof attempt.score === "object") {
          // If score has obtained/total, use that directly
          if (attempt.score.obtained !== undefined && attempt.score.total !== undefined) {
            // Convert to marks out of 300
            actualMarks = Math.round((attempt.score.obtained / attempt.score.total) * 300)
          }
          // If score has percentage, convert to marks
          else if (attempt.score.percentage !== undefined) {
            actualMarks = Math.round((attempt.score.percentage / 100) * 300)
          }
        } else if (typeof attempt.score === "number") {
          // If score is a number, check if it's likely a percentage (0-100) or marks (0-300)
          if (attempt.score <= 100) {
            // Likely a percentage, convert to marks
            actualMarks = Math.round((attempt.score / 100) * 300)
          } else {
            // Likely already marks out of 300
            actualMarks = Math.round(attempt.score)
          }
        }
      }

      // Ensure marks are within valid range
      actualMarks = Math.max(0, Math.min(300, actualMarks))

      console.log(`Attempt ${index + 1}: Score object:`, attempt.score, `-> Marks: ${actualMarks}/300`)

      totalScore += actualMarks
      validScoreCount++

      // Find the appropriate score range
      for (const [range, config] of Object.entries(scoreRanges)) {
        if (actualMarks >= config.min && actualMarks <= config.max) {
          config.count++
          break
        }
      }
    })

    // Convert to array format for pie chart, only include ranges with data
    const chartData = Object.entries(scoreRanges)
      .map(([range, config]) => ({
        range,
        label: config.label,
        students: config.count,
        minMarks: config.min,
        maxMarks: config.max,
        percentage: validScoreCount > 0 ? ((config.count / validScoreCount) * 100).toFixed(1) : "0",
        color: config.color,
      }))
      .filter((item) => item.students > 0)

    const averageScore = validScoreCount > 0 ? Math.round(totalScore / validScoreCount) : 0

    console.log(`Score distribution summary:`, {
      totalAttempts: testAttempts.length,
      validScoreCount,
      averageScore,
      ranges: chartData.length,
      scoreBreakdown: Object.entries(scoreRanges).map(([range, config]) => `${range}: ${config.count}`),
    })

    return NextResponse.json({
      success: true,
      data: {
        scoreRanges: chartData,
        totalStudents: testAttempts.length,
        averageScore,
        totalAttempts: testAttempts.length,
      },
    })
  } catch (error) {
    console.error("Error fetching score distribution:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch score distribution",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
