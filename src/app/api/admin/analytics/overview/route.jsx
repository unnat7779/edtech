import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import { connectDB } from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"
import User from "@/models/User"

export async function GET(request) {
  try {
    const authResult = await authenticate(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Get overview statistics
    const totalTests = await Test.countDocuments()
    const totalStudents = await User.countDocuments({ role: "student" })
    const totalAttempts = await TestAttempt.countDocuments()

    // Get average performance
    const performanceStats = await TestAttempt.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score.percentage" },
          totalScore: { $sum: "$score.obtained" },
          totalPossible: { $sum: "$score.total" },
        },
      },
    ])

    const avgPerformance = performanceStats.length > 0 ? performanceStats[0].avgScore : 0

    // Get recent activity
    const recentTests = await Test.find().sort({ createdAt: -1 }).limit(5).select("title subject createdAt")

    const recentAttempts = await TestAttempt.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("testId", "title")
      .populate("userId", "name")

    return NextResponse.json({
      overview: {
        totalTests,
        totalStudents,
        totalAttempts,
        avgPerformance: Math.round(avgPerformance * 100) / 100,
      },
      recentActivity: {
        recentTests,
        recentAttempts,
      },
      insights: {
        topPerformingTest: "JEE Advanced Mock #12",
        mostChallengingTopic: "Organic Chemistry",
        bestImprovement: "Physics Mechanics",
      },
    })
  } catch (error) {
    console.error("Analytics overview error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics overview" }, { status: 500 })
  }
}
