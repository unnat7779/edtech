import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"

export async function GET(request) {
  try {
    console.log("=== Global Analytics API Called ===")

    await connectDB()
    console.log("Database connected successfully")

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "7d"

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "1d":
        startDate.setDate(now.getDate() - 1)
        break
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    console.log("Date range:", { startDate, endDate: now, timeRange })

    // Get global metrics
    const [totalUsers, totalTests, totalAttempts, recentAttempts] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Test.countDocuments(),
      TestAttempt.countDocuments(),
      TestAttempt.find({
        createdAt: { $gte: startDate },
        status: "completed",
      }).populate("student", "name email"),
    ])

    console.log("Basic counts:", { totalUsers, totalTests, totalAttempts, recentAttempts: recentAttempts.length })

    // Calculate average test score
    const completedAttempts = await TestAttempt.find({
      status: "completed",
      "score.percentage": { $exists: true },
    })

    const averageTestScore =
      completedAttempts.length > 0
        ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0) /
          completedAttempts.length
        : 0

    // Calculate average time per test
    const attemptsWithTime = await TestAttempt.find({
      status: "completed",
      timeSpent: { $exists: true, $gt: 0 },
    })

    const averageTimePerTest =
      attemptsWithTime.length > 0
        ? Math.round(
            attemptsWithTime.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0) / attemptsWithTime.length,
          )
        : 0

    // Get active users (users who attempted tests in the time range)
    const activeUsers = await TestAttempt.distinct("student", {
      createdAt: { $gte: startDate },
    })

    // Get new users in the time range
    const newUsers = await User.countDocuments({
      role: "student",
      createdAt: { $gte: startDate },
    })

    // Get top performers
    const topPerformers = await TestAttempt.aggregate([
      {
        $match: {
          status: "completed",
          "score.percentage": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$student",
          averageScore: { $avg: "$score.percentage" },
          totalAttempts: { $sum: 1 },
        },
      },
      { $sort: { averageScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $project: {
          student: { $arrayElemAt: ["$student", 0] },
          averageScore: { $round: ["$averageScore", 1] },
          totalAttempts: 1,
        },
      },
    ])

    const globalMetrics = {
      totalUsers,
      totalTests,
      totalAttempts,
      averageTestScore: Math.round(averageTestScore * 10) / 10,
      averageTimePerTest,
      activeUsers: activeUsers.length,
      newUsersInPeriod: newUsers,
    }

    console.log("Global metrics calculated:", globalMetrics)

    const responseData = {
      success: true,
      data: {
        globalMetrics,
        topPerformers,
        timeRange,
        dateRange: {
          start: startDate,
          end: now,
        },
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("=== Global Analytics API Error ===")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to fetch global analytics",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
