import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import Test from "@/models/Test"
import { connectToDatabase } from "@/lib/mongodb"

// GET - Fetch all questions for a test
export async function GET(request, { params }) {
  try {
    // Authenticate the request
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Get the test ID from the URL params
    const testId = params.id

    // Connect to the database
    await connectToDatabase()

    // Find the test
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({ questions: test.questions || [] })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

// POST - Add questions to a test
export async function POST(request, { params }) {
  try {
    // Authenticate the request
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Get the test ID from the URL params
    const testId = params.id

    // Parse the request body
    const body = await request.json()
    const { questions } = body

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Find the test
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Add the questions to the test
    if (!test.questions) {
      test.questions = []
    }

    test.questions = [...test.questions, ...questions]

    // Save the test
    await test.save()

    return NextResponse.json({
      success: true,
      message: `${questions.length} questions added to the test`,
      questionCount: test.questions.length,
    })
  } catch (error) {
    console.error("Error adding questions:", error)
    return NextResponse.json({ error: "Failed to add questions" }, { status: 500 })
  }
}

// PUT - Update all questions in a test
export async function PUT(request, { params }) {
  try {
    // Authenticate the request
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Get the test ID from the URL params
    const testId = params.id

    // Parse the request body
    const body = await request.json()
    const { questions } = body

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid questions data" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Find the test
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Update the questions
    test.questions = questions

    // Save the test
    await test.save()

    return NextResponse.json({
      success: true,
      message: "Questions updated successfully",
      questionCount: test.questions.length,
    })
  } catch (error) {
    console.error("Error updating questions:", error)
    return NextResponse.json({ error: "Failed to update questions" }, { status: 500 })
  }
}
