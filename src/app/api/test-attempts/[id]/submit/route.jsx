import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"
import User from "@/models/User"
import StudentStreak from "@/models/StudentStreak"
import { authenticate } from "@/middleware/auth"

export async function POST(request, { params }) {
  try {
    console.log("🚀 Submit API called")
    const resolvedParams = await params
    console.log("📝 Attempt ID:", resolvedParams.id)

    const auth = await authenticate(request)
    if (auth.error) {
      console.error("❌ Authentication failed:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    console.log("✅ User authenticated:", auth.user._id)

    const requestBody = await request.json()
    console.log("📊 Request body:", requestBody)
    const { answers, timeSpent, isAutoSubmit = false, questionTimeTracking, subjectTimeTracking } = requestBody

    await connectDB()
    console.log("✅ Database connected")

    const attempt = await TestAttempt.findOne({
      _id: resolvedParams.id,
      student: auth.user._id,
    })

    if (!attempt) {
      console.error("❌ Test attempt not found")
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }
    console.log("✅ Test attempt found:", attempt._id)

    const test = await Test.findById(attempt.test)
    if (!test) {
      console.error("❌ Test not found")
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }
    console.log("✅ Test found:", test._id)

    // Calculate actual time spent based on start time and current time
    const startTime = new Date(attempt.startTime)
    const endTime = new Date()
    const actualTimeSpent = Math.floor((endTime - startTime) / 1000) // in seconds

    // Use the provided timeSpent if it's valid, otherwise use calculated time
    let finalTimeSpent = timeSpent
    if (!timeSpent || timeSpent <= 0 || isNaN(timeSpent)) {
      finalTimeSpent = actualTimeSpent
      console.log("⚠️ Using calculated time instead of provided time:", {
        providedTime: timeSpent,
        calculatedTime: actualTimeSpent,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
    }

    console.log("⏱️ Time calculation:", {
      providedTimeSpent: timeSpent,
      calculatedTimeSpent: actualTimeSpent,
      finalTimeSpent: finalTimeSpent,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationInMinutes: (finalTimeSpent / 60).toFixed(2),
    })

    // Calculate score and analysis with proper negative marking
    let totalScore = 0
    let correct = 0
    let incorrect = 0
    let unattempted = 0
    const subjectWiseAnalysis = {
      Physics: { subject: "Physics", correct: 0, incorrect: 0, unattempted: 0, score: 0, totalQuestions: 0 },
      Chemistry: { subject: "Chemistry", correct: 0, incorrect: 0, unattempted: 0, score: 0, totalQuestions: 0 },
      Mathematics: { subject: "Mathematics", correct: 0, incorrect: 0, unattempted: 0, score: 0, totalQuestions: 0 },
    }

    console.log("📊 Processing answers with JEE scoring (+4 correct, -1 incorrect)...")
    const processedAnswers = test.questions.map((question, index) => {
      const userAnswer = answers[index]
      let isCorrect = false
      let marksAwarded = 0

      // Determine subject (default to Physics if not specified)
      let subject = question.subject || "Physics"
      if (!["Physics", "Chemistry", "Mathematics"].includes(subject)) {
        subject = "Physics" // Default fallback
      }

      // Initialize subject if not exists
      if (!subjectWiseAnalysis[subject]) {
        subjectWiseAnalysis[subject] = {
          subject,
          correct: 0,
          incorrect: 0,
          unattempted: 0,
          score: 0,
          totalQuestions: 0,
        }
      }

      subjectWiseAnalysis[subject].totalQuestions++

      // Handle MCQ questions
      if (userAnswer?.selectedAnswer !== undefined && userAnswer?.selectedAnswer !== null) {
        isCorrect = userAnswer.selectedAnswer === question.correctAnswer
        if (isCorrect) {
          correct++
          subjectWiseAnalysis[subject].correct++
          marksAwarded = 4 // +4 for correct answer
          console.log(`✅ Question ${index + 1} (${subject}): Correct (+4 marks)`)
        } else {
          incorrect++
          subjectWiseAnalysis[subject].incorrect++
          marksAwarded = -1 // -1 for incorrect answer
          console.log(`❌ Question ${index + 1} (${subject}): Incorrect (-1 mark)`)
        }
      }
      // Handle numerical questions
      else if (userAnswer?.numericalAnswer !== undefined && userAnswer?.numericalAnswer !== null) {
        // For numerical questions, compare with tolerance if available
        const userNum = Number.parseFloat(userAnswer.numericalAnswer)
        const correctNum = Number.parseFloat(question.numericalAnswer || question.correctAnswer)
        const tolerance = question.tolerance || 0.01

        isCorrect = Math.abs(userNum - correctNum) <= tolerance
        if (isCorrect) {
          correct++
          subjectWiseAnalysis[subject].correct++
          marksAwarded = 4 // +4 for correct answer
          console.log(`✅ Question ${index + 1} (${subject}): Numerical Correct (+4 marks)`)
        } else {
          incorrect++
          subjectWiseAnalysis[subject].incorrect++
          marksAwarded = -1 // -1 for incorrect answer
          console.log(`❌ Question ${index + 1} (${subject}): Numerical Incorrect (-1 mark)`)
        }
      }
      // Unattempted
      else {
        unattempted++
        subjectWiseAnalysis[subject].unattempted++
        marksAwarded = 0 // 0 for unattempted
        console.log(`⚪ Question ${index + 1} (${subject}): Unattempted (0 marks)`)
      }

      totalScore += marksAwarded
      subjectWiseAnalysis[subject].score += marksAwarded

      return {
        questionId: question._id,
        selectedAnswer: userAnswer?.selectedAnswer,
        numericalAnswer: userAnswer?.numericalAnswer,
        isCorrect,
        timeTaken: userAnswer?.timeTaken || 0,
        marksAwarded,
        subject,
      }
    })

    const totalMarks = test.totalMarks || test.questions.length * 4 // Total possible marks
    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0

    console.log("📊 Final calculated results:", {
      totalScore, // This can now be negative
      totalMarks,
      percentage,
      correct,
      incorrect,
      unattempted,
      finalTimeSpent,
      subjectWiseAnalysis,
    })

    // Update attempt
    attempt.answers = processedAnswers
    attempt.endTime = endTime
    attempt.timeSpent = finalTimeSpent
    attempt.status = isAutoSubmit ? "auto-submitted" : "completed"
    attempt.score = {
      obtained: totalScore, // Allow negative scores
      total: totalMarks,
      percentage: Math.round(percentage * 100) / 100,
    }
    attempt.analysis = {
      correct,
      incorrect,
      unattempted,
      subjectWise: Object.values(subjectWiseAnalysis).filter((subject) => subject.totalQuestions > 0),
    }
    attempt.questionTimeTracking = questionTimeTracking || {}
    attempt.subjectTimeTracking = subjectTimeTracking || {}

    await attempt.save()
    console.log("✅ Test attempt saved with score:", totalScore)

    // Update student streak data
    try {
      console.log("🔥 Updating student streak data...")
      let streak = await StudentStreak.findOne({ student: auth.user._id })

      if (!streak) {
        console.log("📝 Creating new streak record for user:", auth.user._id)
        streak = new StudentStreak({
          student: auth.user._id,
          dailyStreak: { current: 0, longest: 0, lastActiveDate: null },
          weeklyStreak: { current: 0, longest: 0, lastActiveWeek: null },
          monthlyStats: [],
          weeklyStats: [],
          activityMap: new Map(),
          achievements: [],
          totalTests: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          bestScore: 0,
        })
      }

      // Update streak with test completion
      const today = new Date()
      const dateKey = today.toISOString().split("T")[0] // YYYY-MM-DD format
      const weekKey = getWeekKey(today)
      const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

      console.log("📅 Date keys:", { dateKey, weekKey, monthKey })

      // Update activity map for heatmap
      const currentActivity = streak.activityMap.get(dateKey) || {
        tests: 0,
        totalScore: 0,
        subjects: { Physics: 0, Chemistry: 0, Mathematics: 0 },
        timeSpent: 0,
      }

      currentActivity.tests += 1
      currentActivity.totalScore += percentage
      currentActivity.timeSpent += finalTimeSpent

      // Update subject-wise activity
      Object.values(subjectWiseAnalysis).forEach((subject) => {
        if (subject.totalQuestions > 0) {
          currentActivity.subjects[subject.subject] =
            (currentActivity.subjects[subject.subject] || 0) + subject.totalQuestions
        }
      })

      streak.activityMap.set(dateKey, currentActivity)
      console.log("✅ Activity map updated for date:", dateKey)

      // Update daily streak
      const lastActiveDate = streak.dailyStreak.lastActiveDate
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayKey = yesterday.toISOString().split("T")[0]

      if (!lastActiveDate) {
        // First test ever
        streak.dailyStreak.current = 1
        streak.dailyStreak.longest = 1
        console.log("🔥 Started first daily streak")
      } else if (lastActiveDate === yesterdayKey) {
        // Continue streak
        streak.dailyStreak.current += 1
        streak.dailyStreak.longest = Math.max(streak.dailyStreak.longest, streak.dailyStreak.current)
        console.log("🔥 Daily streak continued:", streak.dailyStreak.current)
      } else if (lastActiveDate !== dateKey) {
        // Streak broken, reset
        streak.dailyStreak.current = 1
        console.log("💔 Daily streak broken, reset to 1")
      }
      streak.dailyStreak.lastActiveDate = dateKey

      // Update weekly streak
      const lastActiveWeek = streak.weeklyStreak.lastActiveWeek
      const lastWeek = getWeekKey(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000))

      if (!lastActiveWeek) {
        // First test ever
        streak.weeklyStreak.current = 1
        streak.weeklyStreak.longest = 1
        console.log("📅 Started first weekly streak")
      } else if (lastActiveWeek === lastWeek && lastActiveWeek !== weekKey) {
        // Continue streak
        streak.weeklyStreak.current += 1
        streak.weeklyStreak.longest = Math.max(streak.weeklyStreak.longest, streak.weeklyStreak.current)
        console.log("📅 Weekly streak continued:", streak.weeklyStreak.current)
      } else if (lastActiveWeek !== weekKey && lastActiveWeek !== lastWeek) {
        // Streak broken, reset
        streak.weeklyStreak.current = 1
        console.log("💔 Weekly streak broken, reset to 1")
      }
      streak.weeklyStreak.lastActiveWeek = weekKey

      // Update monthly stats (using array instead of Map)
      let monthlyData = streak.monthlyStats.find((stat) => stat.month === monthKey)
      if (!monthlyData) {
        monthlyData = {
          month: monthKey,
          tests: 0,
          totalScore: 0,
          timeSpent: 0,
          subjects: { Physics: 0, Chemistry: 0, Mathematics: 0 },
        }
        streak.monthlyStats.push(monthlyData)
        console.log("📊 Created new monthly stat for:", monthKey)
      }

      monthlyData.tests += 1
      monthlyData.totalScore += percentage
      monthlyData.timeSpent += finalTimeSpent
      Object.values(subjectWiseAnalysis).forEach((subject) => {
        if (subject.totalQuestions > 0) {
          monthlyData.subjects[subject.subject] = (monthlyData.subjects[subject.subject] || 0) + subject.totalQuestions
        }
      })
      console.log("✅ Monthly stats updated for:", monthKey)

      // Update weekly stats (using array instead of Map)
      let weeklyData = streak.weeklyStats.find((stat) => stat.week === weekKey)
      if (!weeklyData) {
        weeklyData = {
          week: weekKey,
          tests: 0,
          totalScore: 0,
          timeSpent: 0,
          subjects: { Physics: 0, Chemistry: 0, Mathematics: 0 },
        }
        streak.weeklyStats.push(weeklyData)
        console.log("📊 Created new weekly stat for:", weekKey)
      }

      weeklyData.tests += 1
      weeklyData.totalScore += percentage
      weeklyData.timeSpent += finalTimeSpent
      Object.values(subjectWiseAnalysis).forEach((subject) => {
        if (subject.totalQuestions > 0) {
          weeklyData.subjects[subject.subject] = (weeklyData.subjects[subject.subject] || 0) + subject.totalQuestions
        }
      })
      console.log("✅ Weekly stats updated for:", weekKey)

      // Update overall stats
      streak.totalTests += 1
      streak.totalTimeSpent += finalTimeSpent
      streak.bestScore = Math.max(streak.bestScore, percentage)
      streak.averageScore = (streak.averageScore * (streak.totalTests - 1) + percentage) / streak.totalTests

      // Check for achievements
      const newAchievements = []

      // Daily streak achievements
      if (streak.dailyStreak.current === 7 && !streak.achievements.includes("week_warrior")) {
        newAchievements.push("week_warrior")
      }
      if (streak.dailyStreak.current === 30 && !streak.achievements.includes("month_master")) {
        newAchievements.push("month_master")
      }
      if (streak.dailyStreak.current === 100 && !streak.achievements.includes("century_champion")) {
        newAchievements.push("century_champion")
      }

      // Score achievements
      if (percentage >= 90 && !streak.achievements.includes("excellence_expert")) {
        newAchievements.push("excellence_expert")
      }
      if (streak.totalTests >= 50 && !streak.achievements.includes("test_veteran")) {
        newAchievements.push("test_veteran")
      }

      if (newAchievements.length > 0) {
        streak.achievements.push(...newAchievements)
        console.log("🏆 New achievements unlocked:", newAchievements)
      }

      await streak.save()
      console.log("✅ Student streak updated successfully:", {
        dailyStreak: streak.dailyStreak.current,
        weeklyStreak: streak.weeklyStreak.current,
        totalTests: streak.totalTests,
        newAchievements,
      })
    } catch (streakError) {
      console.error("❌ Error updating streak:", streakError)
      // Don't fail the submission if streak update fails
    }

    // Update test statistics
    await updateTestStatistics(test._id, attempt)
    console.log("✅ Test statistics updated")

    // Update user stats
    await User.findByIdAndUpdate(auth.user._id, {
      $inc: {
        "testStats.totalTests": 1,
        "testStats.totalTimeSpent": finalTimeSpent,
      },
      $max: { "testStats.bestScore": percentage },
      $set: {
        "testStats.averageScore": await calculateAverageScore(auth.user._id),
      },
    })
    console.log("✅ User stats updated")

    console.log("🎉 Test submission completed successfully")
    return NextResponse.json({
      success: true,
      message: "Test submitted successfully",
      result: {
        score: attempt.score,
        analysis: attempt.analysis,
        timeSpent: attempt.timeSpent,
      },
    })
  } catch (error) {
    console.error("❌ Submit test error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Helper function to get week key (YYYY-WW format)
function getWeekKey(date) {
  const year = date.getFullYear()
  const firstDayOfYear = new Date(year, 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  return `${year}-${String(weekNumber).padStart(2, "0")}`
}

async function updateTestStatistics(testId, attempt) {
  try {
    console.log("📊 Updating test statistics for:", testId)

    // Get all completed attempts for this test
    const allAttempts = await TestAttempt.find({
      test: testId,
      status: { $in: ["completed", "auto-submitted"] },
    })

    const totalAttempts = allAttempts.length
    const completedAttempts = allAttempts.filter((a) => a.status === "completed").length

    // Calculate averages
    const totalScore = allAttempts.reduce((sum, a) => sum + (a.score?.percentage || 0), 0)
    const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0

    const totalTime = allAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
    const averageTime = totalAttempts > 0 ? totalTime / totalAttempts : 0

    // Update test statistics
    await Test.findByIdAndUpdate(testId, {
      $set: {
        "statistics.totalAttempts": totalAttempts,
        "statistics.completedAttempts": completedAttempts,
        "statistics.averageScore": Math.round(averageScore * 10) / 10,
        "statistics.averageTime": Math.round(averageTime),
      },
    })

    console.log("✅ Test statistics updated:", {
      totalAttempts,
      completedAttempts,
      averageScore: Math.round(averageScore * 10) / 10,
      averageTime: Math.round(averageTime),
    })
  } catch (error) {
    console.error("❌ Error updating test statistics:", error)
  }
}

async function calculateAverageScore(userId) {
  try {
    const attempts = await TestAttempt.find({
      student: userId,
      status: { $in: ["completed", "auto-submitted"] },
    })

    if (attempts.length === 0) return 0

    const totalPercentage = attempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0)
    return Math.round((totalPercentage / attempts.length) * 100) / 100
  } catch (error) {
    console.error("❌ Error calculating average score:", error)
    return 0
  }
}
