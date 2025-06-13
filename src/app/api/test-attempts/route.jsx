import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"
import { authenticate } from "@/middleware/auth"

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { testId } = await request.json()

    await connectDB()

    // Check if test exists
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

    // Create new attempt
    const attempt = new TestAttempt({
      student: auth.user._id,
      test: testId,
      startTime: new Date(),
      score: {
        total: test.totalMarks,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const attempts = await TestAttempt.find({ student: auth.user._id })
      .populate("test", "title type subject duration totalMarks")
      .sort({ createdAt: -1 })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error("Get test attempts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
