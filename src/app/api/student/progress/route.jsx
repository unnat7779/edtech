import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import connectDB from "@/lib/mongodb"
import StudentProgress from "@/models/StudentProgress"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request) {
  try {
    console.log("🔍 Progress API called")

    const authResult = await authenticate(request)
    if (authResult.error) {
      console.error("❌ Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "all"
    const subject = searchParams.get("subject") || "all"

    console.log("✅ User authenticated:", user.id)

    await connectDB()

    // First, get all test attempts for this user directly from TestAttempt collection
    const testAttempts = await TestAttempt.find({
      student: user.id,
      status: { $in: ["completed", "auto-submitted"] },
    })
      .populate("test", "title subject")
      .sort({ createdAt: 1 })

    console.log("📊 Found test attempts:", testAttempts.length)

    if (testAttempts.length === 0) {
      console.log("⚠️ No test attempts found")
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
          rawProgress: null,
        },
      })
    }

    // Process test attempts into progress data
    const progressData = testAttempts.map((attempt, index) => {
      const testTitle = attempt.test?.title || "Unknown Test"
      const subject = attempt.test?.subject || "General"
      const score = attempt.score || { obtained: 0, total: 0, percentage: 0 }

      // Check if this is a retake (same test taken multiple times)
      const previousAttempts = testAttempts
        .slice(0, index)
        .filter((prev) => prev.test?._id?.toString() === attempt.test?._id?.toString())
      const isRetake = previousAttempts.length > 0
      const attemptNumber = previousAttempts.length + 1

      return {
        testId: attempt.test?._id,
        attemptId: attempt._id,
        testTitle,
        subject,
        score: {
          obtained: score.obtained || 0,
          total: score.total || 0,
          percentage: score.percentage || 0,
        },
        timeSpent: attempt.timeSpent || 0,
        completedAt: attempt.createdAt,
        isRetake,
        attemptNumber,
      }
    })

    console.log("📈 Processed progress data:", progressData.length, "entries")

    // Filter data based on time range
    let filteredAttempts = [...progressData]
    const now = new Date()

    switch (timeRange) {
      case "30days":
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filteredAttempts = filteredAttempts.filter((attempt) => new Date(attempt.completedAt) >= thirtyDaysAgo)
        break
      case "90days":
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        filteredAttempts = filteredAttempts.filter((attempt) => new Date(attempt.completedAt) >= ninetyDaysAgo)
        break
      case "1year":
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        filteredAttempts = filteredAttempts.filter((attempt) => new Date(attempt.completedAt) >= oneYearAgo)
        break
    }

    // Filter by subject
    if (subject !== "all") {
      filteredAttempts = filteredAttempts.filter((attempt) => attempt.subject === subject)
    }

    console.log("🔍 Filtered attempts:", filteredAttempts.length)

    // Sort by completion date
    filteredAttempts.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))

    // Prepare trend data for chart
    const trendData = filteredAttempts.map((attempt, index) => ({
      x: index + 1,
      y: attempt.score.percentage || 0,
      date: attempt.completedAt,
      testTitle: attempt.testTitle,
      subject: attempt.subject,
      score: attempt.score,
      timeSpent: attempt.timeSpent || 0,
      isRetake: attempt.isRetake || false,
      attemptNumber: attempt.attemptNumber || 1,
    }))

    // Calculate filtered stats
    const scores = filteredAttempts.map((attempt) => attempt.score.percentage || 0).filter((score) => score >= 0)
    const filteredStats = {
      totalTests: filteredAttempts.length,
      averageScore: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      improvementRate: 0,
    }

    // Calculate improvement rate for filtered data
    if (filteredAttempts.length >= 4) {
      const firstHalf = filteredAttempts.slice(0, Math.floor(filteredAttempts.length / 2))
      const secondHalf = filteredAttempts.slice(Math.floor(filteredAttempts.length / 2))

      const firstHalfScores = firstHalf.map((a) => a.score.percentage || 0).filter((s) => s >= 0)
      const secondHalfScores = secondHalf.map((a) => a.score.percentage || 0).filter((s) => s >= 0)

      if (firstHalfScores.length > 0 && secondHalfScores.length > 0) {
        const firstHalfAvg = firstHalfScores.reduce((sum, score) => sum + score, 0) / firstHalfScores.length
        const secondHalfAvg = secondHalfScores.reduce((sum, score) => sum + score, 0) / secondHalfScores.length

        if (firstHalfAvg > 0) {
          filteredStats.improvementRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
        }
      }
    }

    console.log("📊 Final stats:", filteredStats)
    console.log("📈 Trend data points:", trendData.length)

    return NextResponse.json({
      success: true,
      data: {
        trendData,
        overallStats: filteredStats,
        rawProgress: filteredStats,
      },
    })
  } catch (error) {
    console.error("❌ Student progress error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch student progress",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    const attemptData = await request.json()

    await connectDB()

    // Get or create student progress
    const progress = await StudentProgress.getOrCreateProgress(user.id)

    // Add the new test attempt
    await progress.addTestAttempt(attemptData)

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
    })
  } catch (error) {
    console.error("Update progress error:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
