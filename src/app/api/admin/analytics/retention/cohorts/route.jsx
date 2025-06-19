import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { authenticate } from "@/middleware/auth"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request) {
  try {
    console.log("Cohort retention API route called")

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
    const cohortType = searchParams.get("cohortType") || "weekly"
    const periods = Number.parseInt(searchParams.get("periods")) || 12

    const now = new Date()
    const cohortSize = cohortType === "weekly" ? 7 : 30

    // Get all users with their first and subsequent attempts
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
    ])

    console.log(`Found ${usersWithAttempts.length} users with attempts`)

    // Calculate retention for a specific cohort
    const calculateCohortRetention = (cohortUsers, days) => {
      if (cohortUsers.length === 0) return 0

      const retainedUsers = cohortUsers.filter((user) => {
        const firstAttemptDate = new Date(user.firstAttempt)
        const cutoffDate = new Date(firstAttemptDate.getTime() + days * 24 * 60 * 60 * 1000)

        return user.attempts.some(
          (attempt) => new Date(attempt.date) > cutoffDate && new Date(attempt.date) !== firstAttemptDate,
        )
      })

      return Math.round((retainedUsers.length / cohortUsers.length) * 100)
    }

    // Generate cohort data
    const cohortData = []

    for (let i = 0; i < periods; i++) {
      const cohortStart = new Date(now.getTime() - (i + 1) * cohortSize * 24 * 60 * 60 * 1000)
      const cohortEnd = new Date(now.getTime() - i * cohortSize * 24 * 60 * 60 * 1000)

      const cohortUsers = usersWithAttempts.filter((user) => {
        const userDate = new Date(user.firstAttempt)
        return userDate >= cohortStart && userDate < cohortEnd
      })

      const cohortInfo = {
        cohort: `${cohortType === "weekly" ? "Week" : "Month"} ${i + 1}`,
        startDate: cohortStart.toISOString().split("T")[0],
        endDate: cohortEnd.toISOString().split("T")[0],
        size: cohortUsers.length,
        retention1: cohortUsers.length > 0 ? calculateCohortRetention(cohortUsers, 1) : 0,
        retention3: cohortUsers.length > 0 ? calculateCohortRetention(cohortUsers, 3) : 0,
        retention7: cohortUsers.length > 0 ? calculateCohortRetention(cohortUsers, 7) : 0,
        retention14: cohortUsers.length > 0 ? calculateCohortRetention(cohortUsers, 14) : 0,
        retention30: cohortUsers.length > 0 ? calculateCohortRetention(cohortUsers, 30) : 0,
        retention60: cohortUsers.length > 0 ? calculateCohortRetention(cohortUsers, 60) : 0,
        retention90: cohortUsers.length > 0 ? calculateCohortRetention(cohortUsers, 90) : 0,
      }

      // Calculate average session length and frequency
      if (cohortUsers.length > 0) {
        const totalSessions = cohortUsers.reduce((sum, user) => sum + user.totalAttempts, 0)
        const activeUsers = cohortUsers.filter((user) => user.totalAttempts > 1).length

        cohortInfo.avgSessionsPerUser = Math.round((totalSessions / cohortUsers.length) * 10) / 10
        cohortInfo.activeUserRate = Math.round((activeUsers / cohortUsers.length) * 100)

        // Calculate time to second attempt
        const timeToSecond = cohortUsers
          .filter((user) => user.attempts.length > 1)
          .map((user) => {
            const sorted = user.attempts.sort((a, b) => new Date(a.date) - new Date(b.date))
            return Math.floor((new Date(sorted[1].date) - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24))
          })

        cohortInfo.avgTimeToSecondAttempt =
          timeToSecond.length > 0 ? Math.round(timeToSecond.reduce((a, b) => a + b, 0) / timeToSecond.length) : null
      }

      cohortData.push(cohortInfo)
    }

    // Calculate overall statistics
    const totalUsers = cohortData.reduce((sum, cohort) => sum + cohort.size, 0)
    const avgRetention7 =
      totalUsers > 0
        ? Math.round(cohortData.reduce((sum, cohort) => sum + cohort.retention7 * cohort.size, 0) / totalUsers)
        : 0
    const avgRetention30 =
      totalUsers > 0
        ? Math.round(cohortData.reduce((sum, cohort) => sum + cohort.retention30 * cohort.size, 0) / totalUsers)
        : 0

    // Generate heatmap data for visualization
    const heatmapData = cohortData.map((cohort) => ({
      cohort: cohort.cohort,
      day1: cohort.retention1,
      day3: cohort.retention3,
      day7: cohort.retention7,
      day14: cohort.retention14,
      day30: cohort.retention30,
      day60: cohort.retention60,
      day90: cohort.retention90,
      size: cohort.size,
    }))

    const responseData = {
      cohorts: cohortData.reverse(), // Most recent first
      heatmap: heatmapData.reverse(),
      summary: {
        totalCohorts: cohortData.length,
        totalUsers,
        avgRetention7,
        avgRetention30,
        bestPerformingCohort: cohortData.reduce(
          (best, current) => (current.retention30 > best.retention30 ? current : best),
          cohortData[0] || {},
        ),
        worstPerformingCohort: cohortData.reduce(
          (worst, current) => (current.retention30 < worst.retention30 ? current : worst),
          cohortData[0] || {},
        ),
      },
      metadata: {
        cohortType,
        periods,
        generatedAt: now.toISOString(),
        dataPoints: usersWithAttempts.length,
      },
    }

    console.log("Cohort retention data calculated successfully:", {
      totalCohorts: responseData.summary.totalCohorts,
      totalUsers: responseData.summary.totalUsers,
      avgRetention7: responseData.summary.avgRetention7,
      avgRetention30: responseData.summary.avgRetention30,
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error in cohort retention API:", error)
    return NextResponse.json(
      { error: "Failed to fetch cohort retention data", details: error.message },
      { status: 500 },
    )
  }
}
