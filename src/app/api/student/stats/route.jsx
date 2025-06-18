import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(request) {
  try {
    console.log("🔍 STUDENT STATS API CALLED")

    const authResult = await authenticate(request)
    if (authResult.error) {
      console.log("❌ Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    console.log("✅ Authenticated user:", user.id, "Role:", user.role)

    await connectDB()

    // Import models
    const TestAttempt = (await import("@/models/TestAttempt")).default
    const User = (await import("@/models/User")).default

    // Fetch user profile
    const userProfile = await User.findById(user.id).select("averageScore bestScore totalTimeSpent totalTests").lean()
    console.log("👤 User profile:", userProfile)

    // Fetch test attempts with detailed logging
    console.log("📊 Searching for test attempts...")
    console.log("  User ID:", user.id)
    console.log("  User ID type:", typeof user.id)

    const testAttempts = await TestAttempt.find({
      $or: [
        { userId: user.id },
        { student: user.id },
        { userId: new mongoose.Types.ObjectId(user.id) },
        { student: new mongoose.Types.ObjectId(user.id) },
      ],
    }).lean()

    console.log(`📊 Found ${testAttempts.length} total test attempts`)

    // Filter completed attempts
    const completedAttempts = testAttempts.filter(
      (attempt) =>
        attempt.status === "completed" || attempt.status === "submitted" || attempt.status === "auto-submitted",
    )

    console.log(`✅ Found ${completedAttempts.length} completed attempts`)

    // Debug first few attempts
    if (completedAttempts.length > 0) {
      console.log("📋 Sample completed attempts:")
      completedAttempts.slice(0, 3).forEach((attempt, index) => {
        console.log(`  ${index + 1}. Status: ${attempt.status}`)
        console.log(`     Score: ${JSON.stringify(attempt.score)}`)
        console.log(`     Time: ${attempt.timeSpent}`)
        console.log(`     Date: ${attempt.createdAt}`)
      })
    }

    // Calculate stats
    let stats = {
      totalTests: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      totalTimeSpentHours: 0,
    }

    if (completedAttempts.length > 0) {
      console.log("📊 Calculating stats from attempts...")

      const scores = []
      let totalTimeSpent = 0

      completedAttempts.forEach((attempt, index) => {
        // Calculate percentage score
        let percentage = 0
        if (attempt.score) {
          if (typeof attempt.score.percentage === "number") {
            percentage = attempt.score.percentage
          } else if (attempt.score.obtained && attempt.score.total && attempt.score.total > 0) {
            percentage = (attempt.score.obtained / attempt.score.total) * 100
          }
        }

        if (percentage > 0) {
          scores.push(percentage)
        }

        // Add time spent
        if (attempt.timeSpent && typeof attempt.timeSpent === "number") {
          totalTimeSpent += attempt.timeSpent
        }
      })

      console.log(`📊 Valid scores found: ${scores.length}`)
      console.log(`📊 Scores: [${scores.slice(0, 5).join(", ")}...]`)
      console.log(`⏱️ Total time: ${totalTimeSpent} seconds`)

      stats = {
        totalTests: completedAttempts.length,
        averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        totalTimeSpent: totalTimeSpent,
        totalTimeSpentHours: Math.round((totalTimeSpent / 3600) * 10) / 10,
      }
    } else {
      console.log("⚠️ No completed attempts, using profile data")
      stats = {
        totalTests: userProfile?.totalTests || 0,
        averageScore: userProfile?.averageScore || 0,
        bestScore: userProfile?.bestScore || 0,
        totalTimeSpent: userProfile?.totalTimeSpent || 0,
        totalTimeSpentHours: Math.round(((userProfile?.totalTimeSpent || 0) / 3600) * 10) / 10,
      }
    }

    console.log("📊 FINAL STATS:", stats)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("❌ STUDENT STATS ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
