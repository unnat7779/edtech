import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    console.log(`Fetching test with ID: ${params.id}`)
    const resolvedParams = await params
    const auth = await authenticate(request)

    if (auth.error) {
      console.error("Authentication error:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()
    console.log("Database connected, fetching test...")

    // Optimize query to only fetch necessary fields
    const test = await Test.findById(resolvedParams.id).lean()

    if (!test) {
      console.error(`Test not found with ID: ${resolvedParams.id}`)
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    console.log(`Test found: ${test.title}, Questions: ${test.questions?.length || 0}`)

    // Remove correct answers and explanations for security
    // Use structured approach to avoid undefined errors
    const testForStudent = {
      ...test,
      questions: Array.isArray(test.questions)
        ? test.questions.map((q) => ({
            _id: q._id,
            questionText: q.questionText || "",
            questionImage: q.questionImage || "",
            questionType: q.questionType || "mcq",
            options: Array.isArray(q.options) ? q.options : [],
            subject: q.subject || "",
            chapter: q.chapter || "",
            marks: q.marks || { positive: 4, negative: -1 },
          }))
        : [],
    }

    return NextResponse.json({ test: testForStudent })
  } catch (error) {
    console.error("Get test error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
