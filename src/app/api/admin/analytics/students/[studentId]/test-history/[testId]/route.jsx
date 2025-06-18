import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { studentId, testId } = params
    console.log("🔍 Admin fetching test history for student:", studentId, "test:", testId)

    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Verify student exists
    const student = await User.findById(studentId)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Verify test exists
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Fetch all attempts for this student and test with ALL fields
    const attempts = await TestAttempt.find({
      userId: studentId,
      testId: testId,
    })
      .populate({
        path: "test",
        select: "title description duration totalMarks questions",
        populate: {
          path: "questions",
          select: "subject category correctAnswer type questionText options",
        },
      })
      .sort({ createdAt: -1 })
      .lean()

    console.log(`📊 Found ${attempts.length} attempts for student ${studentId} on test ${testId}`)

    // COMPREHENSIVE DEBUG LOGGING
    if (attempts.length > 0) {
      const firstAttempt = attempts[0]
      console.log("🔍 COMPLETE FIRST ATTEMPT DATA:")
      console.log("- ID:", firstAttempt._id)
      console.log("- Score:", firstAttempt.score)
      console.log("- Analysis:", firstAttempt.analysis)
      console.log("- SubjectWiseScores:", firstAttempt.subjectWiseScores)
      console.log("- Answers count:", firstAttempt.answers ? Object.keys(firstAttempt.answers).length : 0)
      console.log("- Test questions count:", firstAttempt.test?.questions?.length || 0)
      console.log("- TimeSpent:", firstAttempt.timeSpent)
      console.log("- StartTime:", firstAttempt.startTime)
      console.log("- EndTime:", firstAttempt.endTime)
      console.log("- CompletionStatus:", firstAttempt.completionStatus)

      // Log sample question structure
      if (firstAttempt.test?.questions?.length > 0) {
        console.log("- Sample question:", {
          subject: firstAttempt.test.questions[0].subject,
          category: firstAttempt.test.questions[0].category,
          hasCorrectAnswer: !!firstAttempt.test.questions[0].correctAnswer,
        })
      }

      // Log sample answer structure
      if (firstAttempt.answers) {
        const answerKeys = Object.keys(firstAttempt.answers)
        if (answerKeys.length > 0) {
          console.log("- Sample answer:", firstAttempt.answers[answerKeys[0]])
        }
      }
    }

    if (attempts.length === 0) {
      return NextResponse.json({
        history: [],
        stats: {
          totalAttempts: 0,
          bestScore: 0,
          bestPercentage: 0,
          averagePercentage: 0,
          totalTimeSpent: 0,
        },
      })
    }

    // Process attempts
    const processedHistory = attempts.map((attempt, index) => {
      const attemptNumber = attempts.length - index

      // Calculate improvement from previous attempt
      let improvement = null
      if (index < attempts.length - 1) {
        const previousAttempt = attempts[index + 1]
        const currentPercentage = attempt.score?.percentage || 0
        const previousPercentage = previousAttempt.score?.percentage || 0
        const scoreChange = currentPercentage - previousPercentage
        improvement = {
          scoreChange,
          timeChange: (attempt.timeSpent || 0) - (previousAttempt.timeSpent || 0),
        }
      }

      return {
        ...attempt,
        attemptNumber,
        improvement,
      }
    })

    // Calculate statistics
    const scores = attempts.map((a) => a.score?.obtained || 0)
    const percentages = attempts.map((a) => a.score?.percentage || 0)
    const timeSpents = attempts.map((a) => a.timeSpent || 0)

    const stats = {
      totalAttempts: attempts.length,
      bestScore: Math.max(...scores),
      bestPercentage: Math.max(...percentages),
      averagePercentage: percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
      totalTimeSpent: timeSpents.reduce((sum, t) => sum + t, 0),
    }

    console.log("✅ Returning test history data with comprehensive debugging")

    return NextResponse.json({
      history: processedHistory,
      stats,
      student: {
        name: student.name,
        email: student.email,
      },
      test: {
        title: test.title,
        description: test.description,
      },
    })
  } catch (error) {
    console.error("❌ Error in admin test history API:", error)
    return NextResponse.json({ error: "Failed to fetch test history" }, { status: 500 })
  }
}
