import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import Test from "@/models/Test"
import { connectToDatabase } from "@/lib/mongodb"

// GET - Fetch a specific question from a test
export async function GET(request, { params }) {
  try {
    // Authenticate the request
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Get the test ID and question index from the URL params
    const testId = params.id
    const questionIndex = Number.parseInt(params.questionIndex)

    if (isNaN(questionIndex) || questionIndex < 0) {
      return NextResponse.json({ error: "Invalid question index" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Find the test
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if the question exists
    if (!test.questions || !test.questions[questionIndex]) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ question: test.questions[questionIndex] })
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}

// PUT - Update a specific question in a test
export async function PUT(request, { params }) {
  try {
    // Authenticate the request
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Get the test ID and question index from the URL params
    const testId = params.id
    const questionIndex = Number.parseInt(params.questionIndex)

    if (isNaN(questionIndex) || questionIndex < 0) {
      return NextResponse.json({ error: "Invalid question index" }, { status: 400 })
    }

    // Parse the request body
    const body = await request.json()
    const { question } = body

    if (!question) {
      return NextResponse.json({ error: "No question data provided" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Find the test
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if the question exists
    if (!test.questions || !test.questions[questionIndex]) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Update the question
    test.questions[questionIndex] = question

    // Save the test
    await test.save()

    return NextResponse.json({
      success: true,
      message: "Question updated successfully",
      question: test.questions[questionIndex],
    })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

// DELETE - Delete a specific question from a test
export async function DELETE(request, { params }) {
  try {
    // Authenticate the request
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Get the test ID and question index from the URL params
    const testId = params.id
    const questionIndex = Number.parseInt(params.questionIndex)

    if (isNaN(questionIndex) || questionIndex < 0) {
      return NextResponse.json({ error: "Invalid question index" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Find the test
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if the question exists
    if (!test.questions || !test.questions[questionIndex]) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Remove the question
    test.questions.splice(questionIndex, 1)

    // Save the test
    await test.save()

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
      questionCount: test.questions.length,
    })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
