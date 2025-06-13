import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
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

    const test = await Test.findById(resolvedParams.id)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Remove correct answers and explanations for security
    const testForStudent = {
      ...test.toObject(),
      questions: test.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionImage: q.questionImage,
        options: q.options,
        subject: q.subject,
        chapter: q.chapter,
        marks: q.marks,
      })),
    }

    return NextResponse.json({ test: testForStudent })
  } catch (error) {
    console.error("Get test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
