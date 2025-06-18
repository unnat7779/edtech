import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { authenticate } from "@/middleware/auth"
import mongoose from "mongoose"

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await authenticate(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const resolvedParams = await params
    const { studentId } = resolvedParams

    console.log("🔍 Fetching progress data for student:", studentId)

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    // Import models
    const TestAttempt = (await import("@/models/TestAttempt")).default
    const User = (await import("@/models/User")).default

    // Verify student exists
    const student = await User.findById(studentId).select("name email").lean()
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    console.log("✅ Student found:", student.name)

    // Fetch test attempts for the specific student (same logic as student progress API)
    const testAttempts = await TestAttempt.find({
      $or: [
        { student: studentId },
        { userId: studentId },
        { student: mongoose.Types.ObjectId.createFromHexString(studentId) },
        { userId: mongoose.Types.ObjectId.createFromHexString(studentId) },
      ],
      status: { $in: ["completed", "auto-submitted", "submitted"] },
    })
      .populate("test", "title subject")
      .sort({ createdAt: 1 })
      .lean()

    console.log(`✅ Found ${testAttempts.length} completed test attempts`)

    if (testAttempts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          progressData: [],
          trendData: [],
          subjectData: {},
          summary: {
            totalTests: 0,
            averageScore: 0,
            bestScore: 0,
            improvementTrend: 0,
            totalTimeSpent: 0,
          },
        },
      })
    }

    // Process test attempts into progress data (same logic as student progress API)
    const progressData = []
    const testTracker = new Map()

    testAttempts.forEach((attempt) => {
      const testId = attempt.test?._id?.toString()
      if (!testId) return

      // Track attempts per test
      if (!testTracker.has(testId)) {
        testTracker.set(testId, [])
      }
      const previousAttempts = testTracker.get(testId)

      // Calculate score
      const score = { obtained: 0, total: 0, percentage: 0 }
      if (attempt.score) {
        if (typeof attempt.score.percentage === "number") {
          score.percentage = attempt.score.percentage
          score.obtained = attempt.score.obtained || 0
          score.total = attempt.score.total || 0
        } else if (attempt.score.obtained && attempt.score.total) {
          score.obtained = attempt.score.obtained
          score.total = attempt.score.total
          score.percentage = (score.obtained / score.total) * 100
        }
      }

      const progressEntry = {
        testId: testId,
        attemptId: attempt._id,
        testTitle: attempt.test?.title || "Unknown Test",
        subject: attempt.test?.subject || "General",
        score: score,
        timeSpent: attempt.timeSpent || 0,
        completedAt: attempt.createdAt,
        isRetake: previousAttempts.length > 0,
        attemptNumber: previousAttempts.length + 1,
      }

      progressData.push(progressEntry)
      previousAttempts.push(progressEntry)
    })

    console.log(`📊 Processed ${progressData.length} progress entries`)

    // Create trend data for chart
    const trendData = progressData.map((attempt, index) => ({
      x: index + 1,
      y: attempt.score.percentage || 0,
      date: attempt.completedAt,
      testTitle: attempt.testTitle,
      subject: attempt.subject,
      score: attempt.score,
      timeSpent: attempt.timeSpent || 0,
      isRetake: attempt.isRetake || false,
      attemptNumber: attempt.attemptNumber || 1,
    }))

    // Group by subject
    const subjectData = {}
    progressData.forEach((attempt) => {
      const subject = attempt.subject
      if (!subjectData[subject]) {
        subjectData[subject] = {
          attempts: [],
          averageScore: 0,
          bestScore: 0,
          totalAttempts: 0,
        }
      }
      subjectData[subject].attempts.push(attempt)
      subjectData[subject].totalAttempts++
    })

    // Calculate subject statistics
    Object.keys(subjectData).forEach((subject) => {
      const data = subjectData[subject]
      const scores = data.attempts.map((a) => a.score.percentage).filter((s) => s > 0)
      data.averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      data.bestScore = scores.length > 0 ? Math.max(...scores) : 0
    })

    // Calculate summary statistics
    const validScores = progressData.map((a) => a.score.percentage).filter((s) => s > 0)
    const totalTimeSpent = progressData.reduce((total, attempt) => total + (attempt.timeSpent || 0), 0)

    const summary = {
      totalTests: progressData.length,
      averageScore: validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0,
      bestScore: validScores.length > 0 ? Math.max(...validScores) : 0,
      improvementTrend: validScores.length >= 2 ? validScores[validScores.length - 1] - validScores[0] : 0,
      totalTimeSpent: totalTimeSpent,
    }

    console.log("✅ Progress data summary:", summary)

    return NextResponse.json({
      success: true,
      data: {
        progressData,
        trendData,
        subjectData,
        summary,
        studentInfo: {
          id: studentId,
          name: student.name,
          email: student.email,
        },
      },
    })
  } catch (error) {
    console.error("❌ Error fetching student progress data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch progress data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
