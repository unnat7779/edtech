import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import User from "@/models/User"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function GET(request) {
  try {
    console.log("=== ADMIN DASHBOARD API CALLED ===")

    const auth = await authenticate(request)
    if (auth.error) {
      console.log("❌ Authentication failed:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Check if user is admin
    if (auth.user.role !== "admin") {
      console.log("❌ User is not admin:", auth.user.role)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("✅ Admin authenticated:", auth.user.userId)
    await connectDB()

    // Get the admin user's personal statistics
    const adminUser = await User.findById(auth.user.userId).select("testStats")
    console.log("Admin user found:", adminUser ? "Yes" : "No")
    console.log("Admin testStats:", adminUser?.testStats)

    let personalStats = {
      totalTests: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
    }

    // Use admin's personal testStats if available
    if (adminUser?.testStats) {
      personalStats = {
        totalTests: adminUser.testStats.totalTests || 0,
        averageScore: Math.round(adminUser.testStats.averageScore || 0),
        bestScore: Math.round(adminUser.testStats.bestScore || 0),
        totalTimeSpent: adminUser.testStats.totalTimeSpent || 0,
      }
      console.log("✅ Using admin's personal testStats:", personalStats)
    } else {
      // Fallback: Calculate from test attempts
      console.log("📊 Calculating stats from test attempts...")
      const adminAttempts = await TestAttempt.find({
        $or: [{ student: auth.user.userId }, { userId: auth.user.userId }],
      }).select("score percentage obtainedMarks totalMarks timeSpent")

      if (adminAttempts.length > 0) {
        const scores = adminAttempts
          .map((attempt) => {
            if (attempt.percentage) return attempt.percentage
            if (attempt.score) return attempt.score
            if (attempt.obtainedMarks && attempt.totalMarks) {
              return (attempt.obtainedMarks / attempt.totalMarks) * 100
            }
            return 0
          })
          .filter((score) => score > 0)

        personalStats = {
          totalTests: adminAttempts.length,
          averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          bestScore: scores.length > 0 ? Math.round(Math.max(...scores)) : 0,
          totalTimeSpent: adminAttempts.reduce((total, attempt) => total + (attempt.timeSpent || 0), 0),
        }
        console.log("✅ Calculated personal stats:", personalStats)
      }
    }

    // Get global statistics for admin overview
    const [totalTests, totalStudents, totalAttempts, recentTests] = await Promise.all([
      Test.countDocuments(),
      User.countDocuments({ role: "student" }),
      TestAttempt.countDocuments(),
      Test.find().sort({ createdAt: -1 }).limit(5).select("title createdAt duration subject"),
    ])

    console.log("Global stats:", { totalTests, totalStudents, totalAttempts })

    const stats = {
      // Admin's personal statistics
      adminPersonalStats: personalStats,

      // Global platform statistics
      totalTests,
      totalStudents,
      totalAttempts,
      recentTests,

      // For backward compatibility
      ...personalStats,
    }

    console.log("✅ Final stats being returned:", stats)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("❌ Get admin dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
