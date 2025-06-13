import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const test = await Test.findById(resolvedParams.id)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Get all completed attempts for this test
    const attempts = await TestAttempt.find({
      test: resolvedParams.id,
      status: { $in: ["completed", "auto-submitted"] },
    })
      .populate("student", "name email class")
      .sort({ "score.percentage": -1, timeSpent: 1 })

    // Calculate statistics
    const totalAttempts = attempts.length
    const averageScore =
      totalAttempts > 0 ? attempts.reduce((sum, attempt) => sum + attempt.score.percentage, 0) / totalAttempts : 0
    const highestScore = totalAttempts > 0 ? Math.max(...attempts.map((attempt) => attempt.score.percentage)) : 0

    // Get total registered users for completion rate
    const totalUsers = await User.countDocuments({ role: "student" })
    const completionRate = totalUsers > 0 ? (totalAttempts / totalUsers) * 100 : 0

    const stats = {
      totalAttempts,
      averageScore,
      highestScore,
      completionRate,
    }

    return NextResponse.json({
      test: {
        title: test.title,
        description: test.description,
      },
      leaderboard: attempts,
      stats,
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
