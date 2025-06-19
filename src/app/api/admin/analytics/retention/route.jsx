import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { authenticate } from "@/middleware/auth"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request) {
  try {
    console.log("Retention API route called")

    // Authenticate admin user
    const authResult = await authenticate(request)
    if (!authResult.success) {
      console.log("Authentication failed:", authResult.error)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "30" // days
    const cohortType = searchParams.get("cohortType") || "weekly" // weekly, monthly

    // Calculate date ranges
    const now = new Date()
    const startDate = new Date(now.getTime() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000)

    // Get all users who have taken at least one test
    const usersWithAttempts = await TestAttempt.aggregate([
      {
        $group: {
          _id: "$student",
          firstAttempt: { $min: "$createdAt" },
          lastAttempt: { $max: "$createdAt" },
          totalAttempts: { $sum: 1 },
          attempts: { $push: { date: "$createdAt", testId: "$test" } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $match: {
          firstAttempt: { $gte: startDate },
        },
      },
    ])

    console.log(`Found ${usersWithAttempts.length} users with attempts in the last ${timeRange} days`)

    // Calculate retention rates
    const calculateRetention = (users, days) => {
      if (users.length === 0) return 0

      const retainedUsers = users.filter((user) => {
        const firstAttemptDate = new Date(user.firstAttempt)
        const cutoffDate = new Date(firstAttemptDate.getTime() + days * 24 * 60 * 60 * 1000)

        // Check if user has attempts after the cutoff date
        return user.attempts.some(
          (attempt) => new Date(attempt.date) > cutoffDate && new Date(attempt.date) !== firstAttemptDate,
        )
      })

      return Math.round((retainedUsers.length / users.length) * 100)
    }

    // Calculate different retention periods
    const retention7Day = calculateRetention(usersWithAttempts, 7)
    const retention14Day = calculateRetention(usersWithAttempts, 14)
    const retention30Day = calculateRetention(usersWithAttempts, 30)

    // Calculate return intervals
    const returnIntervals = usersWithAttempts
      .filter((user) => user.totalAttempts > 1)
      .map((user) => {
        const sortedAttempts = user.attempts.sort((a, b) => new Date(a.date) - new Date(b.date))
        const intervals = []

        for (let i = 1; i < sortedAttempts.length; i++) {
          const interval = Math.floor(
            (new Date(sortedAttempts[i].date) - new Date(sortedAttempts[i - 1].date)) / (1000 * 60 * 60 * 24),
          )
          intervals.push(interval)
        }

        return {
          userId: user._id,
          intervals,
          averageInterval: intervals.reduce((a, b) => a + b, 0) / intervals.length,
        }
      })

    const averageReturnInterval =
      returnIntervals.length > 0
        ? Math.round(returnIntervals.reduce((sum, user) => sum + user.averageInterval, 0) / returnIntervals.length)
        : 0

    // Calculate engagement metrics
    const averageTestsPerUser =
      usersWithAttempts.length > 0
        ? Math.round(
            (usersWithAttempts.reduce((sum, user) => sum + user.totalAttempts, 0) / usersWithAttempts.length) * 10,
          ) / 10
        : 0

    // Generate trend data for the last 30 days
    const trendData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayUsers = usersWithAttempts.filter((user) => {
        const userDate = new Date(user.firstAttempt)
        return userDate.toDateString() === date.toDateString()
      })

      trendData.push({
        date: date.toISOString().split("T")[0],
        newUsers: dayUsers.length,
        retention7: dayUsers.length > 0 ? calculateRetention(dayUsers, 7) : 0,
        retention14: dayUsers.length > 0 ? calculateRetention(dayUsers, 14) : 0,
        retention30: dayUsers.length > 0 ? calculateRetention(dayUsers, 30) : 0,
      })
    }

    // Calculate cohort data
    const cohortData = []
    const cohortSize = cohortType === "weekly" ? 7 : 30

    for (let i = 0; i < 12; i++) {
      // Last 12 cohorts
      const cohortStart = new Date(now.getTime() - (i + 1) * cohortSize * 24 * 60 * 60 * 1000)
      const cohortEnd = new Date(now.getTime() - i * cohortSize * 24 * 60 * 60 * 1000)

      const cohortUsers = usersWithAttempts.filter((user) => {
        const userDate = new Date(user.firstAttempt)
        return userDate >= cohortStart && userDate < cohortEnd
      })

      if (cohortUsers.length > 0) {
        cohortData.push({
          cohort: `${cohortType === "weekly" ? "Week" : "Month"} ${i + 1}`,
          startDate: cohortStart.toISOString().split("T")[0],
          size: cohortUsers.length,
          retention7: calculateRetention(cohortUsers, 7),
          retention14: calculateRetention(cohortUsers, 14),
          retention30: calculateRetention(cohortUsers, 30),
        })
      }
    }

    const responseData = {
      summary: {
        totalUsers: usersWithAttempts.length,
        retention7Day,
        retention14Day,
        retention30Day,
        averageReturnInterval,
        averageTestsPerUser,
        activeUsers: usersWithAttempts.filter(
          (user) => new Date(user.lastAttempt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        ).length,
      },
      trends: trendData,
      cohorts: cohortData.reverse(), // Most recent first
      returnIntervals: {
        average: averageReturnInterval,
        distribution: returnIntervals.slice(0, 10), // Top 10 for performance
      },
      metadata: {
        timeRange: Number.parseInt(timeRange),
        cohortType,
        generatedAt: now.toISOString(),
        dataPoints: usersWithAttempts.length,
      },
    }

    console.log("Retention data calculated successfully:", {
      totalUsers: responseData.summary.totalUsers,
      retention7Day: responseData.summary.retention7Day,
      retention14Day: responseData.summary.retention14Day,
      retention30Day: responseData.summary.retention30Day,
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error in retention API:", error)
    return NextResponse.json({ error: "Failed to fetch retention data", details: error.message }, { status: 500 })
  }
}
