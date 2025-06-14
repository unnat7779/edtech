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

    console.log("🔍 Fetching test history for:", { testId, userId: auth.user._id })

    // Get all attempts for this test by the current user
    const attempts = await TestAttempt.find({
      student: auth.user._id,
      test: testId,
      status: { $in: ["completed", "auto-submitted"] }, // Only completed attempts
    })
      .populate("test", "title subject duration totalMarks questions")
      .sort({ createdAt: 1 }) // Sort by creation date ascending for proper numbering

    console.log("📊 Found attempts:", attempts.length)

    if (attempts.length === 0) {
      // Still get test info even if no attempts
      const test = await Test.findById(testId)
      return NextResponse.json({
        success: true,
        history: [],
        stats: {
          totalAttempts: 0,
          bestScore: 0,
          bestPercentage: 0,
          bestRank: 0,
          averageScore: 0,
          averagePercentage: 0,
          totalTimeSpent: 0,
        },
        test: test
          ? {
              title: test.title,
              subject: test.subject,
              totalMarks: test.totalMarks,
            }
          : null,
      })
    }

    // Process attempts with improvement trends and proper subject-wise data
    const historyWithTrends = attempts.map((attempt, index) => {
      let improvement = {
        scoreChange: 0,
        percentageChange: 0,
        rankChange: 0,
      }

      if (index > 0) {
        const previousAttempt = attempts[index - 1]
        improvement = {
          scoreChange: attempt.score.obtained - previousAttempt.score.obtained,
          percentageChange: attempt.score.percentage - previousAttempt.score.percentage,
          rankChange: 0, // We'll implement ranking later
        }
      }

      // Calculate subject-wise scores from the existing analysis or from answers
      let subjectWiseScores = []

      // First, try to use existing subject-wise analysis from the attempt
      if (attempt.analysis && attempt.analysis.subjectWise && attempt.analysis.subjectWise.length > 0) {
        console.log("Using existing subject-wise analysis for attempt:", attempt._id)
        subjectWiseScores = attempt.analysis.subjectWise.map((subject) => {
          const totalQuestions = subject.correct + subject.incorrect + subject.unattempted
          const accuracy =
            totalQuestions > 0 && subject.correct + subject.incorrect > 0
              ? (subject.correct / (subject.correct + subject.incorrect)) * 100
              : 0

          // Calculate marks based on standard scoring (4 marks correct, -1 incorrect)
          const obtainedMarks = subject.correct * 4 + subject.incorrect * -1
          const totalMarks = totalQuestions * 4

          return {
            subject: subject.subject,
            correct: subject.correct,
            incorrect: subject.incorrect,
            unattempted: subject.unattempted,
            total: totalMarks,
            obtained: Math.max(0, obtainedMarks), // Don't show negative scores
            percentage: accuracy,
            timeSpent: subject.timeSpent || 0, // Will be 0 until time tracking is implemented
          }
        })
      } else if (attempt.test && attempt.test.questions && attempt.answers) {
        // Fallback: calculate from answers if no existing analysis
        console.log("Calculating subject-wise from answers for attempt:", attempt._id)
        const subjects = {}

        attempt.test.questions.forEach((question, qIndex) => {
          const subject = question.subject || "General"
          if (!subjects[subject]) {
            subjects[subject] = { correct: 0, incorrect: 0, unattempted: 0, totalMarks: 0 }
          }

          const questionMarks = question.marks?.positive || 4
          subjects[subject].totalMarks += questionMarks

          const answer = attempt.answers.find((a) => a.questionId?.toString() === question._id?.toString())
          if (!answer || (answer.selectedAnswer === null && answer.numericalAnswer === null)) {
            subjects[subject].unattempted++
          } else if (answer.isCorrect) {
            subjects[subject].correct++
          } else {
            subjects[subject].incorrect++
          }
        })

        subjectWiseScores = Object.entries(subjects).map(([subjectName, data]) => {
          const totalQuestions = data.correct + data.incorrect + data.unattempted
          const accuracy =
            data.correct + data.incorrect > 0 ? (data.correct / (data.correct + data.incorrect)) * 100 : 0
          const obtainedMarks = data.correct * 4 + data.incorrect * -1

          return {
            subject: subjectName,
            correct: data.correct,
            incorrect: data.incorrect,
            unattempted: data.unattempted,
            total: data.totalMarks,
            obtained: Math.max(0, obtainedMarks),
            percentage: accuracy,
            timeSpent: 0, // Will be updated when time tracking is fixed
          }
        })
      }

      return {
        _id: attempt._id,
        attemptNumber: index + 1,
        startTime: attempt.startTime,
        endTime: attempt.endTime || attempt.updatedAt,
        completionStatus: attempt.status,
        score: attempt.score,
        timeSpent: attempt.timeSpent || 0,
        analysis: attempt.analysis,
        subjectWiseScores,
        improvement,
        test: {
          title: attempt.test.title,
          subject: attempt.test.subject,
          totalMarks: attempt.test.totalMarks,
        },
        attempt: attempt._id, // For navigation to analytics
      }
    })

    // Calculate overall statistics
    const stats = {
      totalAttempts: attempts.length,
      bestScore: Math.max(...attempts.map((h) => h.score.obtained), 0),
      bestPercentage: Math.max(...attempts.map((h) => h.score.percentage), 0),
      bestRank: 1, // Placeholder - implement ranking system later
      averageScore: attempts.length > 0 ? attempts.reduce((sum, h) => sum + h.score.obtained, 0) / attempts.length : 0,
      averagePercentage:
        attempts.length > 0 ? attempts.reduce((sum, h) => sum + h.score.percentage, 0) / attempts.length : 0,
      totalTimeSpent: attempts.reduce((sum, h) => sum + (h.timeSpent || 0), 0),
    }

    console.log("✅ Processed history:", {
      totalAttempts: historyWithTrends.length,
      stats,
      sampleSubjectWise: historyWithTrends[0]?.subjectWiseScores,
    })

    return NextResponse.json({
      success: true,
      history: historyWithTrends,
      stats,
    })
  } catch (error) {
    console.error("❌ Test history fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch test history",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
