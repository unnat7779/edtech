import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Check if user is admin
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const { testId } = params

    // Fetch test details
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Calculate comprehensive analytics
    const analytics = await calculateTestAnalytics(testId)

    return NextResponse.json({
      success: true,
      test,
      analytics,
    })
  } catch (error) {
    console.error("Admin analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

async function calculateTestAnalytics(testId) {
  try {
    // Get all attempts for this test
    const allAttempts = await TestAttempt.find({ test: testId })
      .populate("student", "name email class")
      .sort({ createdAt: -1 })

    const completedAttempts = allAttempts.filter((attempt) => attempt.status === "completed")
    const inProgressAttempts = allAttempts.filter((attempt) => attempt.status === "in-progress")

    // Basic KPIs
    const totalAttempts = allAttempts.length
    const completedCount = completedAttempts.length
    const completionRate = totalAttempts > 0 ? (completedCount / totalAttempts) * 100 : 0

    // Score analytics
    const scores = completedAttempts.map((attempt) => attempt.score.obtained)
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    const topScore = Math.max(...scores, 0)
    const lowestScore = Math.min(...scores, 0)

    // Time analytics
    const times = completedAttempts.map((attempt) => attempt.timeSpent || 0)
    const averageTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0

    // Score distribution
    const scoreDistribution = calculateScoreDistribution(completedAttempts)

    // Subject-wise performance
    const subjectPerformance = await calculateSubjectPerformance(completedAttempts, testId)

    // Question analytics
    const questionAnalytics = await calculateQuestionAnalytics(completedAttempts, testId)

    // Time-based analytics
    const timeAnalytics = calculateTimeAnalytics(completedAttempts)

    // Student performance matrix
    const studentPerformance = calculateStudentPerformanceMatrix(completedAttempts)

    // Difficulty analysis
    const difficultyAnalysis = await calculateDifficultyAnalysis(completedAttempts, testId)

    // Daily trends
    const dailyTrends = calculateDailyTrends(allAttempts)

    // Comparative analytics
    const comparativeAnalytics = await calculateComparativeAnalytics(testId)

    return {
      // Basic KPIs
      totalAttempts,
      completedAttempts: completedCount,
      inProgressAttempts: inProgressAttempts.length,
      completionRate,
      averageScore,
      topScore,
      lowestScore,
      averageTime,

      // Detailed analytics
      scoreDistribution,
      subjectPerformance,
      questionAnalytics,
      timeAnalytics,
      studentPerformance,
      difficultyAnalysis,
      dailyTrends,
      comparativeAnalytics,

      // Additional insights
      insights: generateInsights(completedAttempts, averageScore, completionRate),
    }
  } catch (error) {
    console.error("Error calculating test analytics:", error)
    return {
      totalAttempts: 0,
      completedAttempts: 0,
      completionRate: 0,
      averageScore: 0,
      error: "Failed to calculate analytics",
    }
  }
}

function calculateScoreDistribution(attempts) {
  const ranges = [
    { min: 0, max: 20, label: "0-20%" },
    { min: 21, max: 40, label: "21-40%" },
    { min: 41, max: 60, label: "41-60%" },
    { min: 61, max: 80, label: "61-80%" },
    { min: 81, max: 100, label: "81-100%" },
  ]

  return ranges.map((range) => {
    const count = attempts.filter(
      (attempt) => attempt.score.percentage >= range.min && attempt.score.percentage <= range.max,
    ).length
    return {
      range: range.label,
      count,
      percentage: attempts.length > 0 ? (count / attempts.length) * 100 : 0,
    }
  })
}

async function calculateSubjectPerformance(attempts, testId) {
  try {
    const test = await Test.findById(testId)
    if (!test || !test.questions) return []

    const subjectStats = {}

    attempts.forEach((attempt) => {
      attempt.answers.forEach((answer, index) => {
        const question = test.questions[index]
        if (!question) return

        const subject = question.subject || "Other"
        if (!subjectStats[subject]) {
          subjectStats[subject] = {
            subject,
            totalQuestions: 0,
            totalCorrect: 0,
            totalAttempted: 0,
            totalTime: 0,
            scores: [],
          }
        }

        subjectStats[subject].totalQuestions++
        if (answer.selectedAnswer !== null && answer.selectedAnswer !== undefined) {
          subjectStats[subject].totalAttempted++
        }
        if (answer.isCorrect) {
          subjectStats[subject].totalCorrect++
        }
        subjectStats[subject].totalTime += answer.timeTaken || 0
        subjectStats[subject].scores.push(answer.marksAwarded || 0)
      })
    })

    return Object.values(subjectStats).map((subject) => ({
      subject: subject.subject,
      averageScore:
        subject.scores.length > 0 ? subject.scores.reduce((sum, score) => sum + score, 0) / subject.scores.length : 0,
      accuracy: subject.totalAttempted > 0 ? (subject.totalCorrect / subject.totalAttempted) * 100 : 0,
      attemptRate: subject.totalQuestions > 0 ? (subject.totalAttempted / subject.totalQuestions) * 100 : 0,
      averageTime: subject.totalAttempted > 0 ? subject.totalTime / subject.totalAttempted : 0,
      totalQuestions: subject.totalQuestions,
    }))
  } catch (error) {
    console.error("Error calculating subject performance:", error)
    return []
  }
}

async function calculateQuestionAnalytics(attempts, testId) {
  try {
    const test = await Test.findById(testId)
    if (!test || !test.questions) return []

    const questionStats = test.questions.map((question, index) => {
      const questionAttempts = attempts.map((attempt) => attempt.answers[index]).filter(Boolean)

      const totalAttempts = questionAttempts.length
      const correctAnswers = questionAttempts.filter((answer) => answer.isCorrect).length
      const totalTime = questionAttempts.reduce((sum, answer) => sum + (answer.timeTaken || 0), 0)

      return {
        questionIndex: index + 1,
        questionText: question.questionText.substring(0, 100) + "...",
        subject: question.subject,
        difficulty: question.difficulty,
        totalAttempts,
        correctAnswers,
        accuracy: totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0,
        averageTime: totalAttempts > 0 ? totalTime / totalAttempts : 0,
        discriminationIndex: calculateDiscriminationIndex(questionAttempts, attempts),
      }
    })

    return questionStats
  } catch (error) {
    console.error("Error calculating question analytics:", error)
    return []
  }
}

function calculateDiscriminationIndex(questionAttempts, allAttempts) {
  // Simple discrimination index calculation
  // Higher performing students should have higher success rate on good questions
  const sortedAttempts = allAttempts.sort((a, b) => b.score.obtained - a.score.obtained)
  const topThird = Math.floor(sortedAttempts.length / 3)

  const topPerformers = sortedAttempts.slice(0, topThird)
  const bottomPerformers = sortedAttempts.slice(-topThird)

  const topCorrect = topPerformers.filter((attempt, index) => {
    const questionAnswer = attempt.answers[questionAttempts[0]?.questionId]
    return questionAnswer?.isCorrect
  }).length

  const bottomCorrect = bottomPerformers.filter((attempt, index) => {
    const questionAnswer = attempt.answers[questionAttempts[0]?.questionId]
    return questionAnswer?.isCorrect
  }).length

  return topThird > 0 ? (topCorrect - bottomCorrect) / topThird : 0
}

function calculateTimeAnalytics(attempts) {
  const timeRanges = [
    { min: 0, max: 60, label: "0-60 min" },
    { min: 61, max: 120, label: "61-120 min" },
    { min: 121, max: 180, label: "121-180 min" },
    { min: 181, max: 240, label: "181-240 min" },
    { min: 241, max: 999, label: "240+ min" },
  ]

  return timeRanges.map((range) => {
    const attemptsInRange = attempts.filter((attempt) => {
      const timeInMinutes = (attempt.timeSpent || 0) / 60
      return timeInMinutes >= range.min && timeInMinutes <= range.max
    })

    const averageScore =
      attemptsInRange.length > 0
        ? attemptsInRange.reduce((sum, attempt) => sum + attempt.score.obtained, 0) / attemptsInRange.length
        : 0

    return {
      timeRange: range.label,
      count: attemptsInRange.length,
      averageScore,
      percentage: attempts.length > 0 ? (attemptsInRange.length / attempts.length) * 100 : 0,
    }
  })
}

function calculateStudentPerformanceMatrix(attempts) {
  return attempts
    .map((attempt) => ({
      studentId: attempt.student._id,
      studentName: attempt.student.name,
      studentEmail: attempt.student.email,
      studentClass: attempt.student.class,
      score: attempt.score.obtained,
      percentage: attempt.score.percentage,
      timeSpent: attempt.timeSpent,
      accuracy: calculateAccuracy(attempt.answers),
      subjectScores: calculateSubjectScores(attempt.answers),
      submittedAt: attempt.endTime || attempt.updatedAt,
    }))
    .sort((a, b) => b.score - a.score)
    .map((student, index) => ({ ...student, rank: index + 1 }))
}

function calculateAccuracy(answers) {
  const attempted = answers.filter((answer) => answer.selectedAnswer !== null && answer.selectedAnswer !== undefined)
  const correct = answers.filter((answer) => answer.isCorrect)
  return attempted.length > 0 ? (correct.length / attempted.length) * 100 : 0
}

function calculateSubjectScores(answers) {
  // This would need to be implemented based on your question structure
  // For now, returning mock data
  return {
    Physics: Math.floor(Math.random() * 40) + 60,
    Chemistry: Math.floor(Math.random() * 40) + 60,
    Mathematics: Math.floor(Math.random() * 40) + 60,
  }
}

async function calculateDifficultyAnalysis(attempts, testId) {
  try {
    const test = await Test.findById(testId)
    if (!test || !test.questions) return []

    const difficultyStats = {}

    test.questions.forEach((question, index) => {
      const difficulty = question.difficulty || "Medium"
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = {
          difficulty,
          totalQuestions: 0,
          totalAttempts: 0,
          correctAnswers: 0,
          totalTime: 0,
        }
      }

      difficultyStats[difficulty].totalQuestions++

      attempts.forEach((attempt) => {
        const answer = attempt.answers[index]
        if (answer && answer.selectedAnswer !== null && answer.selectedAnswer !== undefined) {
          difficultyStats[difficulty].totalAttempts++
          if (answer.isCorrect) {
            difficultyStats[difficulty].correctAnswers++
          }
          difficultyStats[difficulty].totalTime += answer.timeTaken || 0
        }
      })
    })

    return Object.values(difficultyStats).map((stat) => ({
      difficulty: stat.difficulty,
      totalQuestions: stat.totalQuestions,
      accuracy: stat.totalAttempts > 0 ? (stat.correctAnswers / stat.totalAttempts) * 100 : 0,
      averageTime: stat.totalAttempts > 0 ? stat.totalTime / stat.totalAttempts : 0,
      attemptRate: (stat.totalAttempts / (stat.totalQuestions * attempts.length)) * 100,
    }))
  } catch (error) {
    console.error("Error calculating difficulty analysis:", error)
    return []
  }
}

function calculateDailyTrends(attempts) {
  const dailyStats = {}

  attempts.forEach((attempt) => {
    const date = new Date(attempt.createdAt).toISOString().split("T")[0]
    if (!dailyStats[date]) {
      dailyStats[date] = {
        date,
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        scores: [],
      }
    }

    dailyStats[date].totalAttempts++
    if (attempt.status === "completed") {
      dailyStats[date].completedAttempts++
      dailyStats[date].scores.push(attempt.score.obtained)
    }
  })

  return Object.values(dailyStats)
    .map((day) => ({
      ...day,
      averageScore: day.scores.length > 0 ? day.scores.reduce((sum, score) => sum + score, 0) / day.scores.length : 0,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

async function calculateComparativeAnalytics(testId) {
  try {
    // Get similar tests for comparison
    const currentTest = await Test.findById(testId)
    const similarTests = await Test.find({
      subject: currentTest.subject,
      class: currentTest.class,
      _id: { $ne: testId },
    }).limit(5)

    const comparisons = await Promise.all(
      similarTests.map(async (test) => {
        const attempts = await TestAttempt.find({ test: test._id, status: "completed" })
        const averageScore =
          attempts.length > 0 ? attempts.reduce((sum, attempt) => sum + attempt.score.obtained, 0) / attempts.length : 0

        return {
          testId: test._id,
          testTitle: test.title,
          averageScore,
          totalAttempts: attempts.length,
        }
      }),
    )

    return {
      similarTests: comparisons,
      benchmarkScore:
        comparisons.length > 0 ? comparisons.reduce((sum, test) => sum + test.averageScore, 0) / comparisons.length : 0,
    }
  } catch (error) {
    console.error("Error calculating comparative analytics:", error)
    return { similarTests: [], benchmarkScore: 0 }
  }
}

function generateInsights(attempts, averageScore, completionRate) {
  const insights = []

  if (completionRate < 70) {
    insights.push({
      type: "warning",
      title: "Low Completion Rate",
      description: `Only ${completionRate.toFixed(1)}% of students completed the test. Consider reviewing test difficulty or duration.`,
    })
  }

  if (averageScore < 50) {
    insights.push({
      type: "alert",
      title: "Low Average Score",
      description: `Average score is ${averageScore.toFixed(1)}%. This may indicate the test is too difficult or requires curriculum review.`,
    })
  }

  if (averageScore > 85) {
    insights.push({
      type: "success",
      title: "High Performance",
      description: `Excellent average score of ${averageScore.toFixed(1)}%. Students are performing well on this material.`,
    })
  }

  const timeVariance = calculateTimeVariance(attempts)
  if (timeVariance > 60) {
    insights.push({
      type: "info",
      title: "High Time Variance",
      description:
        "Students show significant variation in completion times. Consider providing time management guidance.",
    })
  }

  return insights
}

function calculateTimeVariance(attempts) {
  if (attempts.length === 0) return 0

  const times = attempts.map((attempt) => attempt.timeSpent || 0)
  const mean = times.reduce((sum, time) => sum + time, 0) / times.length
  const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length

  return Math.sqrt(variance) / 60 // Return standard deviation in minutes
}
