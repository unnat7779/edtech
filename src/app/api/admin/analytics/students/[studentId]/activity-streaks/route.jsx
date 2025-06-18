import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { authenticate } from "@/middleware/auth"
import mongoose from "mongoose"

export async function GET(request, { params }) {
  try {
    console.log("🔍 ADMIN ACTIVITY STREAKS API CALLED")

    // Verify admin authentication
    const authResult = await authenticate(request)
    if (!authResult.success) {
      console.log("❌ Auth failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    if (authResult.user.role !== "admin") {
      console.log("❌ Not admin:", authResult.user.role)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const resolvedParams = await params
    const { studentId } = resolvedParams

    console.log("🎯 Target Student ID:", studentId)

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      console.log("❌ Invalid ObjectId:", studentId)
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    // Import StudentStreak model
    const StudentStreak = (await import("@/models/StudentStreak")).default

    console.log("📊 Fetching student streak data from studentstreaks collection...")

    // Try multiple field patterns to find the student's streak data
    const studentIdStr = studentId.toString()
    const studentIdObj = new mongoose.Types.ObjectId(studentId)

    const queryPatterns = [
      { student: studentIdObj },
      { student: studentIdStr },
      { userId: studentIdObj },
      { userId: studentIdStr },
    ]

    let studentStreakData = null

    for (let i = 0; i < queryPatterns.length; i++) {
      const query = queryPatterns[i]
      console.log(`  Testing query ${i + 1}: ${JSON.stringify(query)}`)

      try {
        const result = await StudentStreak.findOne(query).lean()
        if (result) {
          studentStreakData = result
          console.log(`    ✅ Found streak data with query: ${JSON.stringify(query)}`)
          break
        } else {
          console.log(`    ❌ No data found with query: ${JSON.stringify(query)}`)
        }
      } catch (error) {
        console.log(`    ❌ Query failed: ${error.message}`)
      }
    }

    if (!studentStreakData) {
      console.log("❌ No streak data found for student:", studentId)
      return NextResponse.json(
        {
          error: "No streak data available for this student",
          studentId: studentId,
        },
        { status: 404 },
      )
    }

    console.log("✅ Student streak data found:", {
      id: studentStreakData._id,
      student: studentStreakData.student,
      dailyStreak: studentStreakData.dailyStreak,
      weeklyStats: studentStreakData.weeklyStats?.length || 0,
      monthlyStats: studentStreakData.monthlyStats?.length || 0,
      activityMapKeys: Object.keys(studentStreakData.activityMap || {}).length,
      totalTests: studentStreakData.totalTests,
      averageScore: studentStreakData.averageScore,
    })

    // Generate heatmap data from activityMap (last 365 days)
    const generateHeatmapData = () => {
      const data = []
      const today = new Date()
      const activityMap = studentStreakData.activityMap || {}

      // Convert Map to Object if needed
      const activityObj = activityMap instanceof Map ? Object.fromEntries(activityMap) : activityMap

      for (let i = 364; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        // Extract activity data for this date
        const dayActivity = activityObj[dateStr] || { tests: 0, totalScore: 0, timeSpent: 0 }
        const testCount = dayActivity.tests || 0
        const averageScore = testCount > 0 ? (dayActivity.totalScore || 0) / testCount : 0

        // Calculate activity level (0-4) based on test count
        let level = 0
        if (testCount > 0) {
          if (testCount === 1) level = 1
          else if (testCount <= 3) level = 2
          else if (testCount <= 5) level = 3
          else level = 4
        }

        data.push({
          date: dateStr,
          count: testCount,
          averageScore: averageScore,
          level: level,
          timeSpent: dayActivity.timeSpent || 0,
          subjects: dayActivity.subjects || {},
        })
      }

      return data
    }

    const heatmapData = generateHeatmapData()

    // Calculate comprehensive statistics
    const calculateStatistics = () => {
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

      // Filter heatmap data for different time periods
      const yearlyData = heatmapData.filter((day) => new Date(day.date) >= oneYearAgo)
      const monthlyData = heatmapData.filter((day) => new Date(day.date) >= oneMonthAgo)

      // Calculate totals
      const totalTestsAllTime = studentStreakData.totalTests || 0
      const totalTestsLastYear = yearlyData.reduce((sum, day) => sum + day.count, 0)
      const totalTestsLastMonth = monthlyData.reduce((sum, day) => sum + day.count, 0)

      // Calculate active days
      const activeDaysAllTime = heatmapData.filter((day) => day.count > 0).length
      const activeDaysLastYear = yearlyData.filter((day) => day.count > 0).length
      const activeDaysLastMonth = monthlyData.filter((day) => day.count > 0).length

      // Calculate consecutive days streaks
      const calculateMaxConsecutiveDays = (data) => {
        let maxStreak = 0
        let currentStreak = 0

        for (const day of data) {
          if (day.count > 0) {
            currentStreak++
            maxStreak = Math.max(maxStreak, currentStreak)
          } else {
            currentStreak = 0
          }
        }

        return maxStreak
      }

      const maxConsecutiveDaysAllTime = studentStreakData.dailyStreak?.longest || 0
      const maxConsecutiveDaysLastYear = calculateMaxConsecutiveDays(yearlyData)
      const maxConsecutiveDaysLastMonth = calculateMaxConsecutiveDays(monthlyData)

      // Calculate current consecutive days for last year and month
      const calculateCurrentConsecutiveDays = (data) => {
        let currentStreak = 0
        // Start from the most recent day and go backwards
        for (let i = data.length - 1; i >= 0; i--) {
          if (data[i].count > 0) {
            currentStreak++
          } else {
            break
          }
        }
        return currentStreak
      }

      const currentConsecutiveDaysLastYear = calculateCurrentConsecutiveDays(yearlyData)
      const currentConsecutiveDaysLastMonth = calculateCurrentConsecutiveDays(monthlyData)

      // Calculate averages
      const averageTestsPerDay = activeDaysAllTime > 0 ? totalTestsAllTime / activeDaysAllTime : 0
      const averageTestsPerDayLastYear = activeDaysLastYear > 0 ? totalTestsLastYear / activeDaysLastYear : 0

      return {
        // All time statistics
        totalTestsAllTime,
        activeDaysAllTime,
        maxConsecutiveDaysAllTime,
        averageTestsPerDay,

        // Last year statistics
        totalTestsLastYear,
        activeDaysLastYear,
        maxConsecutiveDaysLastYear,
        currentConsecutiveDaysLastYear,
        averageTestsPerDayLastYear,

        // Last month statistics
        totalTestsLastMonth,
        activeDaysLastMonth,
        maxConsecutiveDaysLastMonth,
        currentConsecutiveDaysLastMonth,

        // Overall scores
        averageScore: studentStreakData.averageScore || 0,
        bestScore: studentStreakData.bestScore || 0,
        totalTimeSpent: studentStreakData.totalTimeSpent || 0,
      }
    }

    const statistics = calculateStatistics()

    // Create data structure compatible with the frontend component
    const responseData = {
      _id: studentStreakData._id,
      student: studentStreakData.student,

      // Streak data
      dailyStreak: studentStreakData.dailyStreak || { current: 0, longest: 0 },
      weeklyStreak: studentStreakData.weeklyStreak || { current: 0, longest: 0 },

      // Heatmap data
      heatmapData: heatmapData,

      // Overall statistics (for compatibility with frontend)
      overallStats: {
        totalTests: statistics.totalTestsAllTime,
        totalDaysActive: statistics.activeDaysAllTime,
        averageTestsPerDay: statistics.averageTestsPerDay,
      },

      // Yearly statistics
      yearlyStats: {
        testsCompleted: statistics.totalTestsLastYear,
        daysActive: statistics.activeDaysLastYear,
        maxConsecutiveDays: statistics.maxConsecutiveDaysLastYear,
        currentConsecutiveDays: statistics.currentConsecutiveDaysLastYear,
      },

      // Monthly statistics
      monthlyStats: {
        tests: statistics.totalTestsLastMonth,
        daysActive: statistics.activeDaysLastMonth,
        maxConsecutiveDays: statistics.maxConsecutiveDaysLastMonth,
        currentConsecutiveDays: statistics.currentConsecutiveDaysLastMonth,
      },

      // Achievements
      achievements: studentStreakData.achievements || [],

      // Additional data
      activityMap: studentStreakData.activityMap || {},
      weeklyStats: studentStreakData.weeklyStats || [],
      monthlyStatsArray: studentStreakData.monthlyStats || [],
      lastUpdated: studentStreakData.lastUpdated,
      createdAt: studentStreakData.createdAt,
      updatedAt: studentStreakData.updatedAt,

      // Comprehensive statistics
      statistics: statistics,
    }

    console.log("✅ ADMIN ACTIVITY STREAKS DATA READY:")
    console.log("  - Daily Streak Current:", responseData.dailyStreak.current)
    console.log("  - Daily Streak Longest:", responseData.dailyStreak.longest)
    console.log("  - Total Tests All Time:", statistics.totalTestsAllTime)
    console.log("  - Total Tests Last Year:", statistics.totalTestsLastYear)
    console.log("  - Total Tests Last Month:", statistics.totalTestsLastMonth)
    console.log("  - Active Days All Time:", statistics.activeDaysAllTime)
    console.log("  - Max Consecutive Days All Time:", statistics.maxConsecutiveDaysAllTime)
    console.log("  - Max Consecutive Days Last Year:", statistics.maxConsecutiveDaysLastYear)
    console.log("  - Average Score:", statistics.averageScore)
    console.log("  - Heatmap Data Points:", heatmapData.length)
    console.log("  - Activity Map Keys:", Object.keys(studentStreakData.activityMap || {}).length)

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("❌ ADMIN ACTIVITY STREAKS API ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch student activity data",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
