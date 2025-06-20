import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import TestAttempt from "@/models/TestAttempt"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    console.log("🔍 Checking activity since:", thirtyDaysAgo)

    // Get total users
    const totalUsers = await User.countDocuments({ role: "student" })
    console.log("👥 Total students:", totalUsers)

    // Get active users - users who have test attempts in the last 30 days
    // First, let's get all test attempts in the last 30 days
    const recentAttempts = await TestAttempt.find({
      createdAt: { $gte: thirtyDaysAgo },
    }).distinct("userId")

    console.log("📊 Recent test attempts by users:", recentAttempts.length)

    // Count active users (students who have recent test attempts)
    const activeCount = await User.countDocuments({
      role: "student",
      _id: { $in: recentAttempts },
    })

    console.log("✅ Active users count:", activeCount)

    const inactiveCount = totalUsers - activeCount

    // Get premium vs free users
    const premiumUsers = await User.countDocuments({
      role: "student",
      isPremium: true,
    })
    const freeUsers = totalUsers - premiumUsers

    console.log("💎 Premium users:", premiumUsers)
    console.log("🆓 Free users:", freeUsers)

    const result = {
      total: totalUsers,
      active: activeCount,
      inactive: inactiveCount,
      premium: premiumUsers,
      free: freeUsers,
      activePercentage: totalUsers > 0 ? Math.round((activeCount / totalUsers) * 100) : 0,
      premiumPercentage: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0,
    }

    console.log("📈 Final engagement data:", result)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("❌ Error fetching engagement overview:", error)
    return NextResponse.json({ error: "Failed to fetch engagement data" }, { status: 500 })
  }
}
