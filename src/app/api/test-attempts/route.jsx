import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"
import { authenticate } from "@/middleware/auth"

export async function POST(request) {
  try {
    // Authenticate user
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { testId } = await request.json()

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 })
    }

    await connectDB()

    // Check if test exists and populate questions
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if user already has an active attempt
    const existingAttempt = await TestAttempt.findOne({
      student: auth.user._id,
      test: testId,
      status: "in-progress",
    })

    if (existingAttempt) {
      return NextResponse.json({
        message: "Resuming existing attempt",
        attempt: existingAttempt,
      })
    }

    // Initialize answers array with question IDs from the test
    const initialAnswers = test.questions.map((question, index) => ({
      questionId: question._id,
      selectedAnswer: null,
      numericalAnswer: null,
      isCorrect: false,
      timeTaken: 0,
      marksAwarded: 0,
      questionState: "not-visited",
      timeTracking: {
        firstViewed: null,
        lastViewed: null,
        totalViewTime: 0,
        viewSessions: [],
        answerTime: null,
      },
    }))

    // Create new attempt
    const attempt = new TestAttempt({
      student: auth.user._id,
      test: testId,
      startTime: new Date(),
      status: "in-progress",
      score: {
        total: test.totalMarks || 0,
        obtained: 0,
        percentage: 0,
      },
      answers: initialAnswers,
      analysis: {
        correct: 0,
        incorrect: 0,
        unattempted: test.questions.length,
        subjectWise: [],
      },
      autoSaveData: {},
      sessionData: {
        questionNavigationLog: [],
        totalActiveTime: 0,
      },
    })

    await attempt.save()

    return NextResponse.json(
      {
        message: "Test attempt started",
        attempt,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Start test attempt error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const testId = searchParams.get("testId")

    await connectDB()

    // Build query
    const query = { student: auth.user._id }
    if (testId) {
      query.test = testId
    }

    const attempts = await TestAttempt.find(query)
      .populate("test", "title type subject duration totalMarks")
      .sort({ createdAt: -1 })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error("Get test attempts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
