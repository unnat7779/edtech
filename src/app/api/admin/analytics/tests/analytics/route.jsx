import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("=== TEST ANALYTICS API CALLED ===")

    // Get token from Authorization header (sent by frontend)
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    console.log("Auth header:", authHeader ? "Present" : "Missing")
    console.log("Token extracted:", token ? "Present" : "Missing")

    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "No authentication token provided" }, { status: 401 })
    }

    let decoded
    try {
      decoded = verifyToken(token)
      console.log("Token decoded successfully:", decoded ? "Yes" : "No")
    } catch (tokenError) {
      console.log("Token verification failed:", tokenError.message)
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    if (!decoded || decoded.role !== "admin") {
      console.log("User role:", decoded?.role || "undefined")
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("Authentication successful, connecting to database...")
    await connectDB()

    console.log("Fetching tests from database...")
    const tests = await Test.find({}).lean()
    console.log(`Found ${tests.length} tests`)

    if (tests.length === 0) {
      return NextResponse.json({
        success: true,
        tests: [],
        message: "No tests found in database",
      })
    }

    // Process each test to get analytics
    const testsWithAnalytics = await Promise.all(
      tests.map(async (test) => {
        try {
          console.log(`Processing test: ${test.title} (ID: ${test._id})`)

          // Get all attempts for this test
          const attempts = await TestAttempt.find({
            testId: test._id.toString(),
          })
            .populate("userId", "name email")
            .lean()

          console.log(`  - Found ${attempts.length} attempts`)

          if (attempts.length === 0) {
            return {
              ...test,
              analytics: {
                totalAttempts: 0,
                avgScore: 0,
                avgTime: 0,
                completionRate: 0,
                topPerformers: [],
              },
            }
          }

          // Calculate analytics
          const completedAttempts = attempts.filter((attempt) => attempt.status === "completed")
          const totalAttempts = attempts.length
          const completedCount = completedAttempts.length
          const completionRate = totalAttempts > 0 ? Math.round((completedCount / totalAttempts) * 100) : 0

          console.log(`  - Total attempts: ${totalAttempts}, Completed: ${completedCount}`)

          // Calculate average score from completed attempts
          let avgScore = 0
          if (completedAttempts.length > 0) {
            const totalScore = completedAttempts.reduce((sum, attempt) => {
              const score = attempt.score || 0
              const maxScore = test.totalMarks || 1
              return sum + (score / maxScore) * 100
            }, 0)
            avgScore = Math.round(totalScore / completedAttempts.length)
          }

          // Calculate average time from completed attempts
          let avgTime = 0
          if (completedAttempts.length > 0) {
            const totalTime = completedAttempts.reduce((sum, attempt) => {
              if (attempt.startTime && attempt.endTime) {
                const timeSpent = Math.floor((new Date(attempt.endTime) - new Date(attempt.startTime)) / (1000 * 60))
                return sum + timeSpent
              }
              return sum
            }, 0)
            avgTime = Math.round(totalTime / completedAttempts.length)
          }

          // Get top performers (top 3 by score percentage)
          const topPerformers = completedAttempts
            .map((attempt) => ({
              name: attempt.userId?.name || "Unknown Student",
              email: attempt.userId?.email || "",
              score: attempt.score || 0,
              percentage: Math.round(((attempt.score || 0) / (test.totalMarks || 1)) * 100),
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 3)

          const analytics = {
            totalAttempts,
            avgScore,
            avgTime,
            completionRate,
            topPerformers,
          }

          console.log(`  - Analytics calculated:`, analytics)

          return {
            ...test,
            analytics,
          }
        } catch (testError) {
          console.error(`Error processing test ${test._id}:`, testError)
          return {
            ...test,
            analytics: {
              totalAttempts: 0,
              avgScore: 0,
              avgTime: 0,
              completionRate: 0,
              topPerformers: [],
            },
          }
        }
      }),
    )

    console.log("=== ANALYTICS PROCESSING COMPLETE ===")
    console.log(`Returning ${testsWithAnalytics.length} tests with analytics`)

    return NextResponse.json({
      success: true,
      tests: testsWithAnalytics,
      message: `Successfully fetched analytics for ${testsWithAnalytics.length} tests`,
    })
  } catch (error) {
    console.error("=== ANALYTICS API ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to fetch test analytics",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
