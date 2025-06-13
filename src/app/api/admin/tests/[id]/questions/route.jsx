import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { authenticate } from "@/middleware/auth"

// Function to update test metadata after adding questions
function updateTestMetadata(test) {
  const metadata = {
    totalMCQ: 0,
    totalNumerical: 0,
    subjectDistribution: {
      Physics: 0,
      Chemistry: 0,
      Mathematics: 0,
    },
    difficultyDistribution: {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    },
    levelDistribution: {
      "JEE Main": 0,
      "JEE Advanced": 0,
      NEET: 0,
    },
  }

  test.questions.forEach((question) => {
    // Count question types
    if (question.questionType === "mcq") {
      metadata.totalMCQ++
    } else if (question.questionType === "numerical") {
      metadata.totalNumerical++
    }

    // Count subjects
    if (metadata.subjectDistribution[question.subject] !== undefined) {
      metadata.subjectDistribution[question.subject]++
    }

    // Count difficulty
    if (metadata.difficultyDistribution[question.difficulty] !== undefined) {
      metadata.difficultyDistribution[question.difficulty]++
    }

    // Count levels
    if (metadata.levelDistribution[question.level] !== undefined) {
      metadata.levelDistribution[question.level]++
    }
  })

  test.testMetadata = metadata
  return test
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const test = await Test.findById(resolvedParams.id)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({
      questions: test.questions,
      testMetadata: test.testMetadata,
      summary: {
        totalQuestions: test.questions.length,
        mcqCount: test.questions.filter((q) => q.questionType === "mcq").length,
        numericalCount: test.questions.filter((q) => q.questionType === "numerical").length,
        subjects: [...new Set(test.questions.map((q) => q.subject))],
        levels: [...new Set(test.questions.map((q) => q.level))],
        topics: [...new Set(test.questions.map((q) => q.topic).filter(Boolean))],
        chapters: [...new Set(test.questions.map((q) => q.chapter))],
      },
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { questions } = await request.json()

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid questions data" }, { status: 400 })
    }

    await connectDB()

    const test = await Test.findById(resolvedParams.id)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Add questions to test
    test.questions.push(...questions)

    // Update test metadata
    updateTestMetadata(test)

    // Recalculate total marks
    test.totalMarks = test.questions.reduce((total, question) => {
      return total + (question.marks?.positive || 4)
    }, 0)

    await test.save()

    console.log("Questions added successfully:", {
      totalQuestions: test.questions.length,
      addedQuestions: questions.length,
      testMetadata: test.testMetadata,
    })

    return NextResponse.json({
      message: `${questions.length} questions added successfully`,
      totalQuestions: test.questions.length,
      testMetadata: test.testMetadata,
    })
  } catch (error) {
    console.error("Error adding questions:", error)
    return NextResponse.json({ error: "Failed to add questions" }, { status: 500 })
  }
}

// ADD THE MISSING PUT METHOD
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { questions } = await request.json()

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid questions data" }, { status: 400 })
    }

    await connectDB()

    const test = await Test.findById(resolvedParams.id)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Replace all questions with the new array
    test.questions = questions

    // Update test metadata
    updateTestMetadata(test)

    // Recalculate total marks
    test.totalMarks = test.questions.reduce((total, question) => {
      return total + (question.marks?.positive || 4)
    }, 0)

    await test.save()

    console.log("Questions updated successfully:", {
      totalQuestions: test.questions.length,
      testMetadata: test.testMetadata,
    })

    return NextResponse.json({
      message: "Questions updated successfully",
      totalQuestions: test.questions.length,
      testMetadata: test.testMetadata,
    })
  } catch (error) {
    console.error("Error updating questions:", error)
    return NextResponse.json({ error: "Failed to update questions" }, { status: 500 })
  }
}
