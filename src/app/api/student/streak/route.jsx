import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import connectDB from "@/lib/mongodb"
import StudentStreak from "@/models/StudentStreak"

export async function GET(request) {
  try {
    console.log("🔍 Fetching streak data...")

    const authResult = await authenticate(request)
    if (authResult.error) {
      console.log("❌ Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    console.log("✅ User authenticated:", user.id)

    await connectDB()

    // Get or create streak data
    let streak = await StudentStreak.findOne({ student: user.id })
    if (!streak) {
      console.log("📝 Creating new streak record for user:", user.id)
      streak = new StudentStreak({
        student: user.id,
        dailyStreak: { current: 0, longest: 0, lastActiveDate: null },
        weeklyStreak: { current: 0, longest: 0, lastActiveWeek: null },
        activityMap: new Map(),
        monthlyStats: [],
        weeklyStats: [],
        totalTests: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        bestScore: 0,
        achievements: [],
      })
      await streak.save()
    }

    console.log("📊 Streak data found/created:", {
      totalTests: streak.totalTests,
      dailyStreak: streak.dailyStreak.current,
      weeklyStreak: streak.weeklyStreak.current,
      activityMapSize: streak.activityMap.size,
    })

    // Convert activity map to array for frontend
    const activityData = Array.from(streak.activityMap.entries()).map(([date, activity]) => ({
      date,
      count: activity.tests || 0,
      totalScore: activity.totalScore || 0,
      timeSpent: activity.timeSpent || 0,
      subjects: activity.subjects || { Physics: 0, Chemistry: 0, Mathematics: 0 },
      testsCompleted: [
        {
          testId: "mock-id",
          testTitle: `Test on ${date}`,
          score: activity.totalScore || 0,
          completedAt: new Date(date),
        },
      ],
    }))

    // Generate heatmap data for last 365 days
    const heatmapData = generateHeatmapData(activityData)

    // Calculate current month and year stats
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const currentYear = now.getFullYear().toString()

    const currentMonthStats = streak.monthlyStats.find((stat) => stat.month === currentMonth) || {
      tests: 0,
      totalScore: 0,
      timeSpent: 0,
    }

    const yearlyStats = streak.monthlyStats
      .filter((stat) => stat.month.startsWith(currentYear))
      .reduce(
        (acc, stat) => ({
          testsCompleted: acc.testsCompleted + (stat.tests || 0),
          totalScore: acc.totalScore + (stat.totalScore || 0),
          timeSpent: acc.timeSpent + (stat.timeSpent || 0),
          daysActive: acc.daysActive + 1,
        }),
        { testsCompleted: 0, totalScore: 0, timeSpent: 0, daysActive: 0 },
      )

    const responseData = {
      dailyStreak: streak.dailyStreak,
      weeklyStreak: streak.weeklyStreak,
      activityData,
      heatmapData,
      monthlyStats: currentMonthStats,
      yearlyStats,
      overallStats: {
        totalTests: streak.totalTests,
        totalDaysActive: streak.activityMap.size,
        averageTestsPerDay: streak.activityMap.size > 0 ? streak.totalTests / streak.activityMap.size : 0,
        averageTestsPerWeek:
          streak.weeklyStats.length > 0
            ? streak.weeklyStats.reduce((sum, week) => sum + (week.tests || 0), 0) / streak.weeklyStats.length
            : 0,
        mostActiveDay: null,
        mostActiveMonth: null,
      },
      achievements: streak.achievements || [],
    }

    console.log("✅ Returning streak data:", {
      activityDataLength: activityData.length,
      heatmapDataLength: heatmapData.length,
      totalTests: responseData.overallStats.totalTests,
    })

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("❌ Streak API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch streak data",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    console.log("📝 Updating streak data...")

    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { user } = authResult
    const testData = await request.json()

    await connectDB()

    // Get or create streak data
    let streak = await StudentStreak.findOne({ student: user.id })
    if (!streak) {
      streak = new StudentStreak({
        student: user.id,
        dailyStreak: { current: 0, longest: 0, lastActiveDate: null },
        weeklyStreak: { current: 0, longest: 0, lastActiveWeek: null },
        activityMap: new Map(),
        monthlyStats: [],
        weeklyStats: [],
        totalTests: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        bestScore: 0,
        achievements: [],
      })
    }

    // Update streak with new test completion
    const newAchievements = await updateStreakOnTestCompletion(streak, testData)
    await streak.save()

    console.log("✅ Streak updated successfully")

    return NextResponse.json({
      success: true,
      message: "Streak updated successfully",
      newAchievements,
      streakData: {
        dailyStreak: streak.dailyStreak,
        weeklyStreak: streak.weeklyStreak,
      },
    })
  } catch (error) {
    console.error("❌ Update streak error:", error)
    return NextResponse.json(
      {
        error: "Failed to update streak",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function generateHeatmapData(activityData) {
  const heatmapData = []
  const today = new Date()

  // Generate data for last 365 days
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const activity = activityData.find((a) => a.date === dateStr)
    const count = activity ? activity.count : 0

    heatmapData.push({
      date: dateStr,
      count,
      level: getActivityLevel(count),
      day: date.getDay(),
      week: Math.floor(i / 7),
    })
  }

  return heatmapData
}

function getActivityLevel(count) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

async function updateStreakOnTestCompletion(streak, testData) {
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  // Update daily streak
  updateDailyStreak(streak, today)

  // Update weekly streak
  updateWeeklyStreak(streak, currentMonth)

  // Update activity map
  updateActivityMap(streak, today, testData)

  // Update monthly stats
  updateMonthlyStats(streak, currentMonth, testData)

  // Update overall stats
  updateOverallStats(streak)

  // Check for achievements
  const newAchievements = checkAchievements(streak)

  streak.lastUpdated = now
  return newAchievements
}

function updateDailyStreak(streak, today) {
  const lastActiveDate = streak.dailyStreak.lastActiveDate

  if (!lastActiveDate) {
    streak.dailyStreak.current = 1
    streak.dailyStreak.longest = 1
  } else if (lastActiveDate === today) {
    // Already tested today, don't increment
    return
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (lastActiveDate === yesterdayStr) {
      // Consecutive day
      streak.dailyStreak.current += 1
      streak.dailyStreak.longest = Math.max(streak.dailyStreak.longest, streak.dailyStreak.current)
    } else {
      // Streak broken
      streak.dailyStreak.current = 1
    }
  }

  streak.dailyStreak.lastActiveDate = today
}

function updateWeeklyStreak(streak, currentMonth) {
  const lastActiveWeek = streak.weeklyStreak.lastActiveWeek

  if (!lastActiveWeek) {
    streak.weeklyStreak.current = 1
    streak.weeklyStreak.longest = 1
  } else if (lastActiveWeek === currentMonth) {
    // Already tested this month, don't increment
    return
  } else {
    // For simplicity, treating months as weeks for now
    // In a real implementation, you'd want proper week calculation
    streak.weeklyStreak.current += 1
    streak.weeklyStreak.longest = Math.max(streak.weeklyStreak.longest, streak.weeklyStreak.current)
  }

  streak.weeklyStreak.lastActiveWeek = currentMonth
}

function updateActivityMap(streak, today, testData) {
  const existingActivity = streak.activityMap.get(today)

  if (existingActivity) {
    existingActivity.tests += 1
    existingActivity.totalScore += testData.score || 0
    existingActivity.timeSpent += testData.timeSpent || 0
    if (testData.subject) {
      existingActivity.subjects[testData.subject] = (existingActivity.subjects[testData.subject] || 0) + 1
    }
  } else {
    streak.activityMap.set(today, {
      tests: 1,
      totalScore: testData.score || 0,
      timeSpent: testData.timeSpent || 0,
      subjects: {
        Physics: testData.subject === "Physics" ? 1 : 0,
        Chemistry: testData.subject === "Chemistry" ? 1 : 0,
        Mathematics: testData.subject === "Mathematics" ? 1 : 0,
      },
    })
  }

  // Keep only last 365 days
  const oneYearAgo = new Date()
  oneYearAgo.setDate(oneYearAgo.getDate() - 365)
  const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0]

  for (const [key] of streak.activityMap) {
    if (key < oneYearAgoStr) {
      streak.activityMap.delete(key)
    }
  }
}

function updateMonthlyStats(streak, currentMonth, testData) {
  let monthStat = streak.monthlyStats.find((stat) => stat.month === currentMonth)
  if (!monthStat) {
    monthStat = {
      month: currentMonth,
      tests: 0,
      totalScore: 0,
      timeSpent: 0,
      subjects: { Physics: 0, Chemistry: 0, Mathematics: 0 },
    }
    streak.monthlyStats.push(monthStat)
  }

  monthStat.tests += 1
  monthStat.totalScore += testData.score || 0
  monthStat.timeSpent += testData.timeSpent || 0
  if (testData.subject) {
    monthStat.subjects[testData.subject] = (monthStat.subjects[testData.subject] || 0) + 1
  }
}

function updateOverallStats(streak) {
  streak.totalTests = Array.from(streak.activityMap.values()).reduce((sum, activity) => sum + activity.tests, 0)

  const totalScore = Array.from(streak.activityMap.values()).reduce((sum, activity) => sum + activity.totalScore, 0)

  streak.averageScore = streak.totalTests > 0 ? totalScore / streak.totalTests : 0
  streak.totalTimeSpent = Array.from(streak.activityMap.values()).reduce((sum, activity) => sum + activity.timeSpent, 0)

  const scores = Array.from(streak.activityMap.values()).map((activity) => activity.totalScore)
  streak.bestScore = scores.length > 0 ? Math.max(...scores) : 0
}

function checkAchievements(streak) {
  const newAchievements = []

  // Daily streak achievements
  if (streak.dailyStreak.current === 7 && !streak.achievements.includes("daily_streak_7")) {
    newAchievements.push("daily_streak_7")
    streak.achievements.push("daily_streak_7")
  }

  if (streak.dailyStreak.current === 30 && !streak.achievements.includes("daily_streak_30")) {
    newAchievements.push("daily_streak_30")
    streak.achievements.push("daily_streak_30")
  }

  // Test count achievements
  if (streak.totalTests === 50 && !streak.achievements.includes("tests_50")) {
    newAchievements.push("tests_50")
    streak.achievements.push("tests_50")
  }

  return newAchievements
}
