import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("🚀 Starting test analytics request with real data...")

    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("❌ No token provided")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    console.log("🔐 Verifying token...")
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      console.log("❌ Admin access required")
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("✅ Admin authenticated")

    // Connect to database
    console.log("🔌 Connecting to database...")
    await connectDB()
    console.log("✅ Database connected")

    // Import TestAttempt model
    let TestAttempt
    try {
      TestAttempt = (await import("@/models/TestAttempt")).default
      console.log("✅ TestAttempt model loaded")
    } catch (importError) {
      console.error("❌ Failed to import TestAttempt model:", importError)
      return NextResponse.json(
        {
          error: "Model import failed",
          details: importError.message,
        },
        { status: 500 },
      )
    }

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    console.log("📅 Calculating from:", sevenDaysAgo.toISOString())

    // MongoDB Aggregation Pipeline (Last 7 Days) - exactly as provided
    console.log("📊 Running aggregation pipeline...")

    const aggregationResult = await TestAttempt.aggregate([
      {
        $match: {
          timeSpent: { $exists: true, $ne: null },
          createdAt: {
            $gte: sevenDaysAgo,
          },
        },
      },
      {
        $group: {
          _id: null,
          averageTimeSpent: { $avg: "$timeSpent" },
          totalAttempts: { $sum: 1 },
        },
      },
    ])

    console.log("✅ Aggregation completed:", aggregationResult)

    // Extract results
    let recentAttemptsCount = 0
    let averageTimeMinutes = 0

    if (aggregationResult && aggregationResult.length > 0) {
      const result = aggregationResult[0]
      recentAttemptsCount = result.totalAttempts || 0

      // Convert average time to minutes if needed
      const avgTimeSpent = result.averageTimeSpent || 0

      // Handle different time formats (assuming timeSpent is in minutes based on your result)
      if (avgTimeSpent > 0) {
        if (avgTimeSpent > 10000) {
          // If it's in milliseconds, convert to minutes
          averageTimeMinutes = Math.round(avgTimeSpent / (1000 * 60))
        } else if (avgTimeSpent > 1000) {
          // If it's in seconds, convert to minutes
          averageTimeMinutes = Math.round(avgTimeSpent / 60)
        } else {
          // Already in minutes
          averageTimeMinutes = Math.round(avgTimeSpent)
        }
      }
    }

    console.log("🎯 Final calculated results:", {
      recentAttempts: recentAttemptsCount,
      averageTimeMinutes: averageTimeMinutes,
    })

    return NextResponse.json({
      success: true,
      recentAttempts: recentAttemptsCount,
      averageTime: averageTimeMinutes,
      debug: {
        aggregationResult: aggregationResult,
        rawAverageTime: aggregationResult[0]?.averageTimeSpent || 0,
        processedAverageTime: averageTimeMinutes,
        totalAttempts: recentAttemptsCount,
        dateRange: {
          from: sevenDaysAgo.toISOString(),
          to: new Date().toISOString(),
        },
      },
    })
  } catch (error) {
    console.error("💥 Test overview analytics error:", error)
    console.error("Stack trace:", error.stack)

    // Fallback to basic count if aggregation fails
    try {
      console.log("🔄 Attempting fallback query...")
      const TestAttempt = (await import("@/models/TestAttempt")).default

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const fallbackCount = await TestAttempt.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      })

      console.log("✅ Fallback count:", fallbackCount)

      return NextResponse.json({
        success: true,
        recentAttempts: fallbackCount,
        averageTime: 180, // Default 3 hours
        debug: {
          message: "Used fallback query due to aggregation error",
          fallbackCount: fallbackCount,
          error: error.message,
        },
      })
    } catch (fallbackError) {
      console.error("💥 Fallback also failed:", fallbackError)

      return NextResponse.json(
        {
          error: "Failed to fetch test analytics",
          details: error.message,
          type: error.name,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        { status: 500 },
      )
    }
  }
}
