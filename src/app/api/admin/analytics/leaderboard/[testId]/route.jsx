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

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const resolvedParams = await params
    const { testId } = resolvedParams
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 100
    const includeUserId = searchParams.get("includeUser")

    console.log("🏆 Fetching admin leaderboard for test:", testId)
    console.log("🎯 Highlighting user:", includeUserId)

    // Get test details
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Get all completed attempts for this test
    const allAttempts = await TestAttempt.find({
      test: testId,
      status: { $in: ["completed", "auto-submitted"] },
    })
      .populate("student", "name email class batch")
      .sort({ createdAt: -1 })

    console.log("📊 Total attempts found:", allAttempts.length)

    // Group by student and keep only the latest attempt for each student
    const studentLatestAttempts = new Map()

    allAttempts.forEach((attempt) => {
      const studentId = attempt.student._id.toString()
      const existingAttempt = studentLatestAttempts.get(studentId)

      if (!existingAttempt || new Date(attempt.createdAt) > new Date(existingAttempt.createdAt)) {
        studentLatestAttempts.set(studentId, attempt)
      }
    })

    console.log("👥 Unique students:", studentLatestAttempts.size)

    // Convert to array and calculate additional metrics
    const uniqueAttempts = Array.from(studentLatestAttempts.values())

    // Calculate subject-wise scores for each attempt
    const leaderboardData = await Promise.all(
      uniqueAttempts.map(async (attempt) => {
        // Calculate subject-wise performance
        const subjectScores = calculateSubjectWiseScores(attempt, test)

        // Calculate total time spent
        const totalTime = attempt.timeSpent || 0

        // Calculate PCM scores
        const pcmScores = {
          physics: subjectScores.Physics || { score: 0, total: 0, percentage: 0 },
          chemistry: subjectScores.Chemistry || { score: 0, total: 0, percentage: 0 },
          mathematics: subjectScores.Mathematics || { score: 0, total: 0, percentage: 0 },
        }

        return {
          _id: attempt._id,
          student: {
            _id: attempt.student._id,
            name: attempt.student.name,
            email: attempt.student.email,
            class: attempt.student.class,
            batch: attempt.student.batch,
          },
          score: {
            obtained: attempt.score.obtained,
            total: attempt.score.total,
            percentage: attempt.score.percentage,
          },
          pcmScores,
          totalTime,
          submittedAt: attempt.endTime || attempt.updatedAt,
          createdAt: attempt.createdAt,
          isTargetUser: includeUserId && attempt.student._id.toString() === includeUserId.toString(),
        }
      }),
    )

    // Sort by score (descending) and then by time (ascending for tie-breaking)
    leaderboardData.sort((a, b) => {
      if (b.score.obtained !== a.score.obtained) {
        return b.score.obtained - a.score.obtained
      }
      // If scores are equal, prefer faster completion
      return a.totalTime - b.totalTime
    })

    // Calculate ranks and percentiles
    const rankedLeaderboard = leaderboardData.map((entry, index) => {
      const rank = index + 1
      const totalStudents = leaderboardData.length

      // Calculate JEE percentile correctly
      // Percentile = [(Number of candidates with score ≤ your score) / Total candidates] × 100
      const studentsWithLowerOrEqualScore = leaderboardData.filter(
        (other) => other.score.obtained <= entry.score.obtained,
      ).length

      const percentile = totalStudents > 0 ? (studentsWithLowerOrEqualScore / totalStudents) * 100 : 0

      return {
        ...entry,
        rank,
        percentile: Math.round(percentile * 100) / 100, // Round to 2 decimal places
        totalStudents,
      }
    })

    // Apply limit if specified
    const limitedLeaderboard = limit > 0 ? rankedLeaderboard.slice(0, limit) : rankedLeaderboard

    // Find target user's position if specified
    let targetUserEntry = null
    if (includeUserId) {
      targetUserEntry = rankedLeaderboard.find((entry) => entry.isTargetUser)
      if (targetUserEntry && !limitedLeaderboard.find((entry) => entry.isTargetUser)) {
        // Target user is not in top results, add them separately
        limitedLeaderboard.push(targetUserEntry)
      }
    }

    // Calculate statistics
    const stats = {
      totalStudents: rankedLeaderboard.length,
      averageScore:
        rankedLeaderboard.length > 0
          ? rankedLeaderboard.reduce((sum, entry) => sum + entry.score.obtained, 0) / rankedLeaderboard.length
          : 0,
      topScore: rankedLeaderboard.length > 0 ? rankedLeaderboard[0].score.obtained : 0,
      averageTime:
        rankedLeaderboard.length > 0
          ? rankedLeaderboard.reduce((sum, entry) => sum + entry.totalTime, 0) / rankedLeaderboard.length
          : 0,
    }

    console.log("✅ Admin leaderboard calculated:", {
      totalEntries: rankedLeaderboard.length,
      limitedEntries: limitedLeaderboard.length,
      targetUserRank: targetUserEntry?.rank,
      targetUserPercentile: targetUserEntry?.percentile,
      stats,
    })

    return NextResponse.json({
      success: true,
      leaderboard: limitedLeaderboard,
      stats,
      test: {
        _id: test._id,
        title: test.title,
        subject: test.subject,
        totalMarks: test.totalMarks,
        duration: test.duration,
      },
      targetUser: targetUserEntry
        ? {
            rank: targetUserEntry.rank,
            percentile: targetUserEntry.percentile,
            score: targetUserEntry.score,
          }
        : null,
    })
  } catch (error) {
    console.error("❌ Admin leaderboard API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch admin leaderboard",
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
    const subject = question.subject || "Physics" // Default to Physics
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
      // Unattempted
      subjectScores[subject].unattempted++
    } else if (answer.isCorrect) {
      // Correct
      subjectScores[subject].correct++
      subjectScores[subject].score += questionMarks
    } else {
      // Incorrect
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
