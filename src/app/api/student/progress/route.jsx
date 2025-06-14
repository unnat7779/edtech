import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import StudentProgress from "@/models/StudentProgress"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function GET(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "all" // all, 30days, 90days, 1year
    const subject = searchParams.get("subject") || "all"

    await connectDB()

    let progress = await StudentProgress.findOne({ student: auth.user._id })

    if (!progress) {
      // Create initial progress record if doesn't exist
      progress = new StudentProgress({
        student: auth.user._id,
        testAttempts: [],
        overallStats: {
          totalTests: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          improvementRate: 0,
        },
      })
      await progress.save()
    }

    // Filter by time range
    let filteredAttempts = progress.testAttempts
    if (timeRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      switch (timeRange) {
        case "30days":
          cutoffDate.setDate(now.getDate() - 30)
          break
        case "90days":
          cutoffDate.setDate(now.getDate() - 90)
          break
        case "1year":
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filteredAttempts = progress.testAttempts.filter((attempt) => new Date(attempt.completedAt) >= cutoffDate)
    }

    // Filter by subject
    if (subject !== "all") {
      filteredAttempts = filteredAttempts.filter((attempt) => attempt.subject === subject)
    }

    // Sort by completion date
    filteredAttempts.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))

    // Calculate trend data for the graph
    const trendData = filteredAttempts.map((attempt, index) => ({
      x: index + 1,
      y: attempt.score.percentage,
      date: attempt.completedAt,
      testTitle: attempt.testTitle,
      score: attempt.score,
      attemptNumber: attempt.attemptNumber,
      isRetake: attempt.isRetake,
      timeSpent: attempt.timeSpent,
      subject: attempt.subject,
    }))

    // Calculate improvement metrics
    const calculateImprovement = (data) => {
      if (data.length < 2) return 0
      const first = data[0].y
      const last = data[data.length - 1].y
      return ((last - first) / first) * 100
    }

    const improvementRate = calculateImprovement(trendData)

    return NextResponse.json({
      success: true,
      data: {
        trendData,
        overallStats: {
          ...progress.overallStats,
          improvementRate,
          filteredCount: filteredAttempts.length,
        },
        subjectWiseProgress: progress.subjectWiseProgress,
        filters: {
          timeRange,
          subject,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching student progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress data" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { attemptId } = await request.json()

    await connectDB()

    // Fetch the test attempt with populated data
    const attempt = await TestAttempt.findById(attemptId).populate("test", "title subject type").lean()

    if (!attempt) {
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }

    // Find or create student progress record
    let progress = await StudentProgress.findOne({ student: auth.user._id })

    if (!progress) {
      progress = new StudentProgress({
        student: auth.user._id,
        testAttempts: [],
        overallStats: {
          totalTests: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
        },
      })
    }

    // Check if this attempt already exists
    const existingAttemptIndex = progress.testAttempts.findIndex(
      (ta) => ta.attemptId.toString() === attemptId.toString(),
    )

    // Calculate attempt number for this test
    const testAttempts = progress.testAttempts.filter((ta) => ta.testId.toString() === attempt.test._id.toString())
    const attemptNumber = testAttempts.length + 1
    const isRetake = attemptNumber > 1

    const newAttemptData = {
      testId: attempt.test._id,
      attemptId: attempt._id,
      testTitle: attempt.test.title,
      score: attempt.score,
      attemptNumber,
      isRetake,
      timeSpent: attempt.timeSpent || 0,
      completedAt: attempt.endTime || new Date(),
      subject: attempt.test.subject,
    }

    if (existingAttemptIndex >= 0) {
      // Update existing attempt
      progress.testAttempts[existingAttemptIndex] = newAttemptData
    } else {
      // Add new attempt
      progress.testAttempts.push(newAttemptData)
    }

    // Recalculate overall stats
    const allAttempts = progress.testAttempts
    progress.overallStats.totalTests = allAttempts.length
    progress.overallStats.averageScore =
      allAttempts.reduce((sum, att) => sum + att.score.percentage, 0) / allAttempts.length
    progress.overallStats.bestScore = Math.max(...allAttempts.map((att) => att.score.percentage))
    progress.overallStats.totalTimeSpent = allAttempts.reduce((sum, att) => sum + att.timeSpent, 0)
    progress.overallStats.lastUpdated = new Date()

    // Update subject-wise progress
    const subjects = ["Physics", "Chemistry", "Mathematics"]
    subjects.forEach((subject) => {
      const subjectAttempts = allAttempts.filter((att) => att.subject === subject)
      if (subjectAttempts.length > 0) {
        progress.subjectWiseProgress[subject].totalAttempts = subjectAttempts.length
        progress.subjectWiseProgress[subject].averageScore =
          subjectAttempts.reduce((sum, att) => sum + att.score.percentage, 0) / subjectAttempts.length
        progress.subjectWiseProgress[subject].bestScore = Math.max(
          ...subjectAttempts.map((att) => att.score.percentage),
        )

        // Calculate improvement trend
        if (subjectAttempts.length >= 3) {
          const recent = subjectAttempts.slice(-3)
          const older = subjectAttempts.slice(-6, -3)
          if (older.length > 0) {
            const recentAvg = recent.reduce((sum, att) => sum + att.score.percentage, 0) / recent.length
            const olderAvg = older.reduce((sum, att) => sum + att.score.percentage, 0) / older.length
            const improvement = ((recentAvg - olderAvg) / olderAvg) * 100

            if (improvement > 5) {
              progress.subjectWiseProgress[subject].improvementTrend = "improving"
            } else if (improvement < -5) {
              progress.subjectWiseProgress[subject].improvementTrend = "declining"
            } else {
              progress.subjectWiseProgress[subject].improvementTrend = "stable"
            }
          }
        }
      }
    })

    await progress.save()

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
      data: progress,
    })
  } catch (error) {
    console.error("Error updating student progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
