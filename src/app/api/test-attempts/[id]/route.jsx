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

    await connectDB()

    // Find the test attempt
    const attempt = await TestAttempt.findOne({
      _id: resolvedParams.id,
      student: auth.user._id,
    })

    if (!attempt) {
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }

    // Get the test details
    const test = await Test.findById(attempt.test)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({
      attempt,
      test: {
        title: test.title,
        description: test.description,
        type: test.type,
        subject: test.subject,
        duration: test.duration,
        totalMarks: test.totalMarks,
        questions: test.questions.map((q) => ({
          _id: q._id,
          questionText: q.questionText,
          questionImage: q.questionImage,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          subject: q.subject,
          chapter: q.chapter,
          difficulty: q.difficulty,
          marks: q.marks,
        })),
      },
    })
  } catch (error) {
    console.error("Get test attempt error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
