import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import UserInterest from "@/models/UserInterest"
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

    // Await params in Next.js 15
    const { studentId } = await params

    console.log("Fetching data for student ID:", studentId)

    // Fetch student details
    const student = await User.findById(studentId).select("-password")

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Fetch interest data separately if it exists
    let interestData = null
    if (student.interestData) {
      try {
        interestData = await UserInterest.findById(student.interestData)
      } catch (err) {
        console.log("Interest data not found:", err.message)
      }
    }

    // Get student's test attempts - try both userId and student fields
    const testAttempts = await TestAttempt.find({
      $or: [{ userId: studentId }, { student: studentId }, { userId: student._id }, { student: student._id }],
    })
      .populate("test", "title subject duration totalMarks")
      .sort({ createdAt: -1 })

    console.log(`Found ${testAttempts.length} test attempts for student ${studentId}`)

    // Calculate statistics
    const totalAttempts = testAttempts.length
    const completedAttempts = testAttempts.filter(
      (attempt) => attempt.status === "completed" || attempt.status === "submitted",
    )

    console.log(`Completed attempts: ${completedAttempts.length}`)

    // Calculate scores from completed attempts
    const validScores = completedAttempts
      .map((attempt) => {
        if (attempt.score?.percentage !== undefined) {
          return attempt.score.percentage
        }
        if (attempt.score?.obtained !== undefined && attempt.score?.total !== undefined) {
          return (attempt.score.obtained / attempt.score.total) * 100
        }
        return null
      })
      .filter((score) => score !== null && !isNaN(score))

    console.log("Valid scores:", validScores)

    const averageScore =
      validScores.length > 0 ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 : 0

    const bestScore = validScores.length > 0 ? Math.round(Math.max(...validScores) * 10) / 10 : 0

    // Calculate total time spent (convert from seconds to hours)
    const totalTimeSpentSeconds = testAttempts.reduce((total, attempt) => {
      return total + (attempt.timeSpent || 0)
    }, 0)

    const totalTimeSpentHours = Math.round((totalTimeSpentSeconds / 3600) * 10) / 10

    console.log("Calculated stats:", {
      totalAttempts,
      completedAttempts: completedAttempts.length,
      averageScore,
      bestScore,
      totalTimeSpentHours,
    })

    // Get recent attempts for display
    const recentAttempts = testAttempts.slice(0, 10).map((attempt) => ({
      _id: attempt._id,
      test: attempt.test,
      score: attempt.score,
      status: attempt.status,
      createdAt: attempt.createdAt,
      timeSpent: attempt.timeSpent,
      percentage:
        attempt.score?.percentage ||
        (attempt.score?.obtained && attempt.score?.total
          ? Math.round((attempt.score.obtained / attempt.score.total) * 100 * 10) / 10
          : 0),
    }))

    // Subject-wise performance
    const subjectPerformance = {}
    completedAttempts.forEach((attempt) => {
      if (attempt.test?.subject && attempt.score?.percentage !== undefined) {
        const subject = attempt.test.subject
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = {
            attempts: 0,
            totalScore: 0,
            bestScore: 0,
          }
        }
        subjectPerformance[subject].attempts++
        subjectPerformance[subject].totalScore += attempt.score.percentage
        subjectPerformance[subject].bestScore = Math.max(
          subjectPerformance[subject].bestScore,
          attempt.score.percentage,
        )
      }
    })

    // Calculate subject averages
    Object.keys(subjectPerformance).forEach((subject) => {
      const data = subjectPerformance[subject]
      data.averageScore = Math.round((data.totalScore / data.attempts) * 10) / 10
    })

    // Build response with all calculated data
    const studentWithStats = {
      ...student.toObject(),
      interestData,

      // Main statistics
      totalAttempts,
      completedAttempts: completedAttempts.length,
      averageScore,
      bestScore,
      totalTimeSpent: totalTimeSpentSeconds,
      totalTimeSpentHours,

      // Additional data
      lastActivity: testAttempts.length > 0 ? testAttempts[0].createdAt : student.createdAt,
      recentAttempts,
      subjectPerformance,

      // Performance trends (last 30 days)
      recentPerformance: testAttempts.filter((attempt) => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return new Date(attempt.createdAt) >= thirtyDaysAgo
      }).length,
    }

    return NextResponse.json({
      success: true,
      student: studentWithStats,
    })
  } catch (error) {
    console.error("Get student error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch student data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
