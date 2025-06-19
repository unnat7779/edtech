import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"

export async function GET(request) {
  console.log("🔍 TEST ANALYTICS API CALLED")

  try {
    // Authentication - check multiple sources
    const authResult = await authenticate(request)
    console.log("🔍 Authentication result:", authResult)

    if (authResult.error) {
      console.log("❌ Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    if (!authResult.user || authResult.user.role !== "admin") {
      console.log("❌ User is not an admin:", authResult.user)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("✅ Admin authentication successful for user:", authResult.user.email)

    await connectDB()
    console.log("✅ Database connected")

    // Fetch all tests
    const tests = await Test.find({}).lean()
    console.log(`📊 Found ${tests.length} tests`)

    // Process each test to add analytics data
    const testsWithAnalytics = await Promise.all(
      tests.map(async (test) => {
        try {
          // Get all attempts for this test
          const attempts = await TestAttempt.find({ test: test._id }).lean()
          console.log(`📝 Test ${test.title}: ${attempts.length} attempts found`)

          // Get completed attempts
          const completedAttempts = attempts.filter((attempt) => attempt.status === "completed")
          console.log(`✓ Test ${test.title}: ${completedAttempts.length} completed attempts`)

          // Calculate analytics
          const analytics = {
            totalAttempts: attempts.length,
            completedAttempts: completedAttempts.length,
            avgScore: 0,
            avgTime: 0,
            completionRate: attempts.length > 0 ? Math.round((completedAttempts.length / attempts.length) * 100) : 0,
            topPerformers: [],
          }

          // Calculate average score and time
          if (completedAttempts.length > 0) {
            // Calculate scores
            const totalScore = completedAttempts.reduce((sum, attempt) => {
              const score = attempt.score || 0
              return sum + score
            }, 0)
            analytics.avgScore = Math.round((totalScore / completedAttempts.length / test.totalMarks) * 100)

            // Calculate average time
            const totalTimeInMinutes = completedAttempts.reduce((sum, attempt) => {
              if (attempt.startTime && attempt.endTime) {
                const timeSpentMs = new Date(attempt.endTime) - new Date(attempt.startTime)
                const timeSpentMinutes = Math.round(timeSpentMs / (1000 * 60))
                return sum + timeSpentMinutes
              }
              return sum
            }, 0)
            analytics.avgTime = Math.round(totalTimeInMinutes / completedAttempts.length)

            // Get top performers
            const attemptsWithUsers = await Promise.all(
              completedAttempts.slice(0, 10).map(async (attempt) => {
                try {
                  const user = await User.findById(attempt.student).lean()
                  const percentage = Math.round((attempt.score / test.totalMarks) * 100)
                  return {
                    name: user ? `${user.firstName} ${user.lastName}` : "Unknown Student",
                    percentage,
                    score: attempt.score,
                  }
                } catch (err) {
                  console.error(`❌ Error fetching user for attempt ${attempt._id}:`, err)
                  return {
                    name: "Unknown Student",
                    percentage: Math.round((attempt.score / test.totalMarks) * 100),
                    score: attempt.score,
                  }
                }
              }),
            )

            // Sort by percentage and take top 3
            analytics.topPerformers = attemptsWithUsers.sort((a, b) => b.percentage - a.percentage).slice(0, 3)
          }

          return {
            ...test,
            analytics,
          }
        } catch (testError) {
          console.error(`❌ Error processing analytics for test ${test._id}:`, testError)
          return {
            ...test,
            analytics: {
              totalAttempts: 0,
              completedAttempts: 0,
              avgScore: 0,
              avgTime: 0,
              completionRate: 0,
              topPerformers: [],
              error: "Failed to calculate analytics",
            },
          }
        }
      }),
    )

    console.log("✅ Analytics processing complete")
    return NextResponse.json({
      success: true,
      tests: testsWithAnalytics,
    })
  } catch (error) {
    console.error("❌ Global error in test analytics API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch test analytics",
      },
      { status: 500 },
    )
  }
}
