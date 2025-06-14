import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"
import { verifyToken } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Await params to get testId
    const resolvedParams = await params
    const { testId } = resolvedParams

    console.log("Fetching analytics for test ID:", testId)

    // Fetch the test
    const test = await Test.findById(testId)
    if (!test) {
      console.log("Test not found for ID:", testId)
      // Return mock data for development
      const mockTest = {
        _id: testId,
        title: "Sample Test",
        subject: "Physics",
        totalMarks: 100,
        duration: 180,
        questions: Array(25).fill({}),
      }

      const mockAnalytics = {
        totalAttempts: 1250,
        completedAttempts: 1063,
        averageScore: 72.5,
        medianScore: 75.0,
        topScore: 98,
        lowestScore: 12,
        completionRate: 85.2,
        averageTime: 145,
      }

      return NextResponse.json({
        success: true,
        test: mockTest,
        analytics: mockAnalytics,
        attempts: mockAnalytics.totalAttempts,
        isMockData: true,
      })
    }

    // Fetch all attempts for this test
    const attempts = await TestAttempt.find({
      testId: testId,
      status: "completed",
    }).populate("userId", "name email")

    console.log(`Found ${attempts.length} completed attempts for test ${testId}`)

    // Calculate analytics
    const analytics = calculateTestAnalytics(attempts, test)

    return NextResponse.json({
      success: true,
      test,
      analytics,
      attempts: attempts.length,
    })
  } catch (error) {
    console.error("Test Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch test analytics",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function calculateTestAnalytics(attempts, test) {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      medianScore: 0,
      topScore: 0,
      lowestScore: 0,
      completionRate: 0,
      averageTime: 0,
    }
  }

  const scores = attempts.map((attempt) => attempt.score?.obtained || 0)
  const times = attempts.map((attempt) => attempt.timeSpent || 0)

  // Sort scores for median calculation
  const sortedScores = [...scores].sort((a, b) => a - b)

  const totalAttempts = attempts.length
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts
  const medianScore =
    sortedScores.length % 2 === 0
      ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
      : sortedScores[Math.floor(sortedScores.length / 2)]

  const topScore = Math.max(...scores)
  const lowestScore = Math.min(...scores)
  const averageTime = times.reduce((sum, time) => sum + time, 0) / totalAttempts

  // Calculate completion rate (assuming all fetched attempts are completed)
  const completionRate = 100 // Since we only fetch completed attempts

  return {
    totalAttempts,
    completedAttempts: totalAttempts,
    averageScore: Math.round(averageScore * 100) / 100,
    medianScore: Math.round(medianScore * 100) / 100,
    topScore,
    lowestScore,
    completionRate,
    averageTime: Math.round(averageTime),
  }
}
