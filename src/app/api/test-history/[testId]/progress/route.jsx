import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { testId } = resolvedParams

    await connectDB()

    console.log("📈 Fetching progress data for test:", testId, "user:", auth.user._id)

    // Get test details
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Get all attempts for this test by the current user
    const attempts = await TestAttempt.find({
      student: auth.user._id,
      test: testId,
      status: { $in: ["completed", "auto-submitted"] },
    })
      .sort({ createdAt: 1 }) // Sort by creation date ascending for proper progression
      .lean()

    console.log("📊 Found attempts:", attempts.length)

    if (attempts.length === 0) {
      return NextResponse.json({
        success: true,
        attempts: [],
        improvement: {
          hasImprovement: false,
          latestImprovement: 0,
          overallImprovement: 0,
          bestScore: 0,
          worstScore: 0,
        },
        stats: {
          totalAttempts: 0,
          averageScore: 0,
          bestAttempt: null,
          mostRecentAttempt: null,
        },
      })
    }

    // Process attempts to create progress data
    const progressData = attempts.map((attempt, index) => {
      const attemptDate = new Date(attempt.createdAt)

      // Calculate improvement from previous attempt
      let improvement = 0
      let improvementType = "none"

      if (index > 0) {
        const previousAttempt = attempts[index - 1]
        improvement = attempt.score.percentage - previousAttempt.score.percentage
        improvementType = improvement > 0 ? "positive" : improvement < 0 ? "negative" : "same"
      }

      // Calculate subject-wise scores
      const subjectScores = calculateSubjectWiseScores(attempt, test)

      return {
        attemptNumber: index + 1,
        attemptId: attempt._id,
        date: attemptDate.toISOString(),
        dateFormatted: attemptDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timeFormatted: attemptDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        score: {
          obtained: attempt.score.obtained,
          total: attempt.score.total,
          percentage: Math.round(attempt.score.percentage * 100) / 100,
        },
        timeSpent: attempt.timeSpent || 0,
        timeSpentFormatted: formatTime(attempt.timeSpent || 0),
        improvement: {
          value: Math.round(improvement * 100) / 100,
          type: improvementType,
          isFirst: index === 0,
        },
        subjectScores,
        analysis: {
          correct: attempt.analysis?.correct || 0,
          incorrect: attempt.analysis?.incorrect || 0,
          unattempted: attempt.analysis?.unattempted || 0,
        },
        createdAt: attempt.createdAt,
        _id: attempt._id,
      }
    })

    // Calculate overall improvement metrics
    const firstAttempt = progressData[0]
    const lastAttempt = progressData[progressData.length - 1]
    const bestScore = Math.max(...progressData.map((p) => p.score.percentage))
    const worstScore = Math.min(...progressData.map((p) => p.score.percentage))

    const overallImprovement = lastAttempt.score.percentage - firstAttempt.score.percentage
    const latestImprovement = progressData.length > 1 ? lastAttempt.improvement.value : 0

    const improvementData = {
      hasImprovement: progressData.length > 1,
      latestImprovement: Math.round(latestImprovement * 100) / 100,
      overallImprovement: Math.round(overallImprovement * 100) / 100,
      bestScore: Math.round(bestScore * 100) / 100,
      worstScore: Math.round(worstScore * 100) / 100,
      trend: overallImprovement > 0 ? "improving" : overallImprovement < 0 ? "declining" : "stable",
    }

    // Calculate statistics
    const averageScore = progressData.reduce((sum, p) => sum + p.score.percentage, 0) / progressData.length
    const bestAttempt = progressData.find((p) => p.score.percentage === bestScore)
    const mostRecentAttempt = lastAttempt

    const stats = {
      totalAttempts: progressData.length,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore: Math.round(bestScore * 100) / 100,
      bestAttempt: {
        attemptNumber: bestAttempt.attemptNumber,
        score: bestAttempt.score,
        date: bestAttempt.dateFormatted,
      },
      mostRecentAttempt: {
        attemptNumber: mostRecentAttempt.attemptNumber,
        score: mostRecentAttempt.score,
        date: mostRecentAttempt.dateFormatted,
        improvement: mostRecentAttempt.improvement,
      },
    }

    console.log("✅ Progress data calculated:", {
      totalAttempts: progressData.length,
      overallImprovement: improvementData.overallImprovement,
      latestImprovement: improvementData.latestImprovement,
      trend: improvementData.trend,
    })

    return NextResponse.json({
      success: true,
      attempts: progressData,
      improvement: improvementData,
      stats,
      test: {
        title: test.title,
        subject: test.subject,
        totalMarks: test.totalMarks,
      },
    })
  } catch (error) {
    console.error("❌ Progress API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch progress data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function calculateSubjectWiseScores(attempt, test) {
  const subjectScores = {}

  if (!attempt.answers || !test.questions) {
    return subjectScores
  }

  // Initialize subject tracking
  const subjects = ["Physics", "Chemistry", "Mathematics"]
  subjects.forEach((subject) => {
    subjectScores[subject] = {
      correct: 0,
      incorrect: 0,
      unattempted: 0,
      score: 0,
      total: 0,
      percentage: 0,
    }
  })

  // Process each question
  test.questions.forEach((question, index) => {
    const subject = question.subject || "Physics"
    const answer = attempt.answers[index]

    if (!subjectScores[subject]) {
      subjectScores[subject] = {
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        score: 0,
        total: 0,
        percentage: 0,
      }
    }

    const questionMarks = question.marks?.positive || 4
    const negativeMark = question.marks?.negative || -1

    subjectScores[subject].total += questionMarks

    if (!answer || (answer.selectedAnswer === null && answer.numericalAnswer === null)) {
      subjectScores[subject].unattempted++
    } else if (answer.isCorrect) {
      subjectScores[subject].correct++
      subjectScores[subject].score += questionMarks
    } else {
      subjectScores[subject].incorrect++
      subjectScores[subject].score += negativeMark
    }
  })

  // Calculate percentages
  Object.keys(subjectScores).forEach((subject) => {
    const data = subjectScores[subject]
    if (data.total > 0) {
      data.percentage = Math.round((data.score / data.total) * 100 * 100) / 100
    }
  })

  return subjectScores
}

function formatTime(seconds) {
  if (!seconds || seconds === 0) return "0m"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
