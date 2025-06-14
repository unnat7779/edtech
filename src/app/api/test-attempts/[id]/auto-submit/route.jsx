import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import TestHistory from "@/models/TestHistory"
import { authenticate } from "@/middleware/auth"

export async function POST(request, { params }) {
  try {
    // Handle both authenticated and beacon requests
    let userId = null
    let token = null

    // Try to get authentication from headers
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
      const auth = await authenticate(request)
      if (!auth.error) {
        userId = auth.user._id
      }
    }

    // If no auth header, try to extract from request body or URL
    if (!userId) {
      console.log("⚠️ No authentication found - this might be a beacon request")
      // For beacon requests, we might need to handle differently
      // For now, we'll try to proceed with the attempt ID validation
    }

    const { id: attemptId } = params
    const body = await request.json().catch(() => ({}))
    const { reason = "auto-submit", answers = {}, timeSpent = 0, questionTimeTracking = {} } = body

    console.log("🚨 Auto-submit triggered:", { attemptId, reason, answersCount: Object.keys(answers).length })

    await connectDB()

    // Get the test attempt
    const attempt = await TestAttempt.findById(attemptId).populate("test")
    if (!attempt) {
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }

    // If we have userId, verify ownership
    if (userId && attempt.student.toString() !== userId.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // If already completed, return existing data
    if (attempt.status !== "in-progress") {
      console.log("⚠️ Attempt already completed:", attempt.status)
      return NextResponse.json({
        success: true,
        message: "Test already completed",
        attempt,
      })
    }

    // Calculate scores and analysis
    const test = attempt.test
    const finalAnswers = { ...attempt.answers, ...answers }

    let totalCorrect = 0
    let totalIncorrect = 0
    let totalUnattempted = 0
    let totalScore = 0

    const subjectWiseAnalysis = {}

    // Initialize subject-wise analysis
    test.questions.forEach((question) => {
      const subject = question.subject || "Unknown"
      if (!subjectWiseAnalysis[subject]) {
        subjectWiseAnalysis[subject] = {
          correct: 0,
          incorrect: 0,
          unattempted: 0,
          totalQuestions: 0,
          totalMarks: 0,
          obtainedMarks: 0,
        }
      }
      subjectWiseAnalysis[subject].totalQuestions++
      subjectWiseAnalysis[subject].totalMarks += question.marks || 4
    })

    // Process answers
    test.questions.forEach((question, index) => {
      const subject = question.subject || "Unknown"
      const questionMarks = question.marks || 4
      const userAnswer = finalAnswers[index]

      let isCorrect = false
      let marksAwarded = 0

      if (userAnswer) {
        // Check if question was attempted
        const hasAnswer =
          (userAnswer.selectedAnswer !== null && userAnswer.selectedAnswer !== undefined) ||
          (userAnswer.numericalAnswer !== null && userAnswer.numericalAnswer !== undefined)

        if (hasAnswer) {
          // Check correctness
          if (question.questionType === "numerical" || question.type === "NUMERICAL") {
            isCorrect =
              Math.abs((userAnswer.numericalAnswer || 0) - (question.numericalAnswer || question.correctAnswer || 0)) <
              0.01
          } else {
            isCorrect = userAnswer.selectedAnswer === question.correctAnswer
          }

          if (isCorrect) {
            totalCorrect++
            marksAwarded = questionMarks
            totalScore += questionMarks
            subjectWiseAnalysis[subject].correct++
            subjectWiseAnalysis[subject].obtainedMarks += questionMarks
          } else {
            totalIncorrect++
            subjectWiseAnalysis[subject].incorrect++
          }
        } else {
          totalUnattempted++
          subjectWiseAnalysis[subject].unattempted++
        }

        // Update answer with marks
        userAnswer.isCorrect = isCorrect
        userAnswer.marksAwarded = marksAwarded
      } else {
        totalUnattempted++
        subjectWiseAnalysis[subject].unattempted++
      }
    })

    const percentage = test.totalMarks > 0 ? (totalScore / test.totalMarks) * 100 : 0

    // Update test attempt
    attempt.status = reason.includes("time") ? "auto-submitted" : "completed"
    attempt.endTime = new Date()
    attempt.timeSpent = timeSpent || Math.floor((attempt.endTime - attempt.startTime) / 1000)
    attempt.answers = finalAnswers
    attempt.score = {
      obtained: totalScore,
      total: test.totalMarks,
      percentage: Math.round(percentage * 100) / 100,
    }
    attempt.analysis = {
      correct: totalCorrect,
      incorrect: totalIncorrect,
      unattempted: totalUnattempted,
      subjectWise: Object.entries(subjectWiseAnalysis).map(([subject, data]) => ({
        subject,
        correct: data.correct,
        incorrect: data.incorrect,
        unattempted: data.unattempted,
        score: data.obtainedMarks,
        percentage: data.totalMarks > 0 ? Math.round((data.obtainedMarks / data.totalMarks) * 100 * 100) / 100 : 0,
      })),
    }

    // Add auto-submit metadata
    attempt.autoSubmitReason = reason
    attempt.autoSubmitTime = new Date()

    await attempt.save()

    // Create test history entry
    const attemptCount = await TestHistory.countDocuments({
      student: attempt.student,
      test: test._id,
    })

    const historyEntry = new TestHistory({
      student: attempt.student,
      test: test._id,
      attempt: attempt._id,
      attemptNumber: attemptCount + 1,
      score: attempt.score,
      subjectWiseScores: attempt.analysis.subjectWise,
      timeSpent: attempt.timeSpent,
      completionStatus: attempt.status,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
    })

    await historyEntry.save()

    console.log("✅ Auto-submit completed successfully")

    return NextResponse.json({
      success: true,
      message: "Test auto-submitted successfully",
      attempt: {
        _id: attempt._id,
        status: attempt.status,
        score: attempt.score,
        timeSpent: attempt.timeSpent,
      },
      historyEntry: {
        _id: historyEntry._id,
        attemptNumber: historyEntry.attemptNumber,
      },
    })
  } catch (error) {
    console.error("❌ Auto-submit error:", error)
    return NextResponse.json(
      {
        error: "Failed to auto-submit test",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
