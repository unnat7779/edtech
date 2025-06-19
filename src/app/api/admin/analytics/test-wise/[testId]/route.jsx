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

    // Verify test exists
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Fetch all attempts for this test
    const allAttempts = await TestAttempt.find({ test: testId })
      .populate("student", "name email class")
      .sort({ createdAt: -1 })

    const completedAttempts = allAttempts.filter((attempt) => attempt.status === "completed")
    const inProgressAttempts = allAttempts.filter((attempt) => attempt.status === "in-progress")

    // Calculate basic analytics
    const totalAttempts = allAttempts.length
    const completedCount = completedAttempts.length
    const completionRate = totalAttempts > 0 ? (completedCount / totalAttempts) * 100 : 0

    // Score analytics
    const scores = completedAttempts.map((attempt) => attempt.score.percentage || 0)
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    const topScore = Math.max(...scores, 0)
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

    // Time analytics
    const times = completedAttempts.map((attempt) => attempt.timeSpent || 0)
    const averageTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0

    // Top performers (sorted by score percentage)
    const topPerformers = completedAttempts
      .sort((a, b) => (b.score.percentage || 0) - (a.score.percentage || 0))
      .slice(0, 5)
      .map((attempt) => ({
        _id: attempt._id,
        student: attempt.student,
        score: attempt.score,
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.endTime || attempt.updatedAt,
      }))

    // Subject-wise performance (if available)
    const subjectPerformance = calculateSubjectPerformance(completedAttempts)

    // Score distribution
    const scoreDistribution = calculateScoreDistribution(completedAttempts)

    // Recent attempts (last 10)
    const recentAttempts = allAttempts.slice(0, 10).map((attempt) => ({
      _id: attempt._id,
      student: attempt.student,
      status: attempt.status,
      score: attempt.score,
      timeSpent: attempt.timeSpent,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      createdAt: attempt.createdAt,
    }))

    return NextResponse.json({
      success: true,
      testInfo: {
        _id: test._id,
        title: test.title,
        description: test.description,
        subject: test.subject,
        type: test.type,
        totalMarks: test.totalMarks,
        duration: test.duration,
        questionsCount: test.questions?.length || 0,
      },
      totalAttempts,
      completedAttempts: completedCount,
      inProgressAttempts: inProgressAttempts.length,
      completionRate,
      averageScore,
      topScore,
      lowestScore,
      averageTime,
      topPerformers,
      subjectPerformance,
      scoreDistribution,
      recentAttempts,
    })
  } catch (error) {
    console.error("Test-wise analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch test analytics" }, { status: 500 })
  }
}

function calculateSubjectPerformance(attempts) {
  const subjectStats = {}

  attempts.forEach((attempt) => {
    if (attempt.analysis && attempt.analysis.subjectWise) {
      attempt.analysis.subjectWise.forEach((subject) => {
        if (!subjectStats[subject.subject]) {
          subjectStats[subject.subject] = {
            subject: subject.subject,
            totalCorrect: 0,
            totalIncorrect: 0,
            totalUnattempted: 0,
            totalScore: 0,
            attemptCount: 0,
          }
        }

        subjectStats[subject.subject].totalCorrect += subject.correct || 0
        subjectStats[subject.subject].totalIncorrect += subject.incorrect || 0
        subjectStats[subject.subject].totalUnattempted += subject.unattempted || 0
        subjectStats[subject.subject].totalScore += subject.score || 0
        subjectStats[subject.subject].attemptCount += 1
      })
    }
  })

  return Object.values(subjectStats).map((subject) => ({
    subject: subject.subject,
    averageScore: subject.attemptCount > 0 ? subject.totalScore / subject.attemptCount : 0,
    accuracy:
      subject.totalCorrect + subject.totalIncorrect > 0
        ? (subject.totalCorrect / (subject.totalCorrect + subject.totalIncorrect)) * 100
        : 0,
    totalQuestions: subject.totalCorrect + subject.totalIncorrect + subject.totalUnattempted,
  }))
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
      (attempt) => (attempt.score.percentage || 0) >= range.min && (attempt.score.percentage || 0) <= range.max,
    ).length

    return {
      range: range.label,
      count,
      percentage: attempts.length > 0 ? (count / attempts.length) * 100 : 0,
    }
  })
}
