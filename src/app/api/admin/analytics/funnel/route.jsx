import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function GET(request) {
  try {
    console.log("🎯 Funnel API route called")

    // Use the authenticate middleware
    const authResult = await authenticate(request)
    console.log("🔐 Auth result:", authResult)

    if (authResult.error) {
      console.log("❌ Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    if (authResult.user.role !== "admin") {
      console.log("❌ Admin access required, user role:", authResult.user.role)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("✅ Admin authenticated:", authResult.user.email)

    await connectDB()
    console.log("📊 Database connected, fetching funnel data...")

    // 1. Get total registered users (students only)
    const totalUsers = await User.countDocuments({ role: "student" })
    console.log("👥 Total users:", totalUsers)

    // 2. Get users who have taken at least one test
    const usersWithAttempts = await TestAttempt.aggregate([
      {
        $group: {
          _id: "$student",
          attemptCount: { $sum: 1 },
        },
      },
    ])
    console.log("📝 Users with attempts:", usersWithAttempts.length)

    // 3. Count users with exactly 1 test attempt (first test takers)
    const firstTestTakers = usersWithAttempts.filter((user) => user.attemptCount === 1).length

    // 4. Count users with 2 or more test attempts (returning users)
    const returningUsers = usersWithAttempts.filter((user) => user.attemptCount >= 2).length

    console.log("🎯 First test takers:", firstTestTakers)
    console.log("🔄 Returning users:", returningUsers)

    // 5. Get detailed breakdown for additional insights
    const attemptDistribution = await TestAttempt.aggregate([
      {
        $group: {
          _id: "$student",
          attemptCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$attemptCount",
          userCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // 6. Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await TestAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: "$student",
          recentAttempts: { $sum: 1 },
        },
      },
    ])

    const funnelData = {
      registered: totalUsers,
      firstTest: firstTestTakers,
      nextTest: returningUsers,
      totalWithAttempts: usersWithAttempts.length,
      // Additional metrics for insights
      metrics: {
        conversionToFirstTest: totalUsers > 0 ? ((usersWithAttempts.length / totalUsers) * 100).toFixed(1) : 0,
        retentionRate:
          usersWithAttempts.length > 0 ? ((returningUsers / usersWithAttempts.length) * 100).toFixed(1) : 0,
        averageAttemptsPerUser:
          usersWithAttempts.length > 0
            ? (usersWithAttempts.reduce((sum, user) => sum + user.attemptCount, 0) / usersWithAttempts.length).toFixed(
                1,
              )
            : 0,
      },
      distribution: attemptDistribution,
      recentActiveUsers: recentActivity.length,
      timestamp: new Date().toISOString(),
    }

    console.log("✅ Funnel data prepared successfully")
    return NextResponse.json(funnelData)
  } catch (error) {
    console.error("❌ Funnel analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch funnel data", details: error.message }, { status: 500 })
  }
}
