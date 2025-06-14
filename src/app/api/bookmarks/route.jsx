import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Bookmark from "@/models/Bookmark"
import Test from "@/models/Test"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const bookmarks = await Bookmark.find({
      student: decoded.userId,
      isActive: true,
    })
      .populate("testId", "title subject")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      bookmarks,
    })
  } catch (error) {
    console.error("Get bookmarks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { questionId, testId, attemptId } = await request.json()

    if (!questionId || !testId || !attemptId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get test data to store question information
    const test = await Test.findById(testId).lean()
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Find the question in the test
    const question = test.questions.find((q) => q._id.toString() === questionId)
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Create bookmark with question data for future reference
    const bookmark = new Bookmark({
      student: decoded.userId,
      questionId,
      testId,
      attemptId,
      questionData: {
        questionText: question.questionText,
        subject: question.subject,
        chapter: question.chapter,
        difficulty: question.difficulty,
        questionType: question.questionType || question.type,
        options: question.options?.map((opt) => (typeof opt === "object" ? opt.text : opt)) || [],
        correctAnswer: question.correctAnswer || question.numericalAnswer,
        explanation: question.explanation,
        solution: question.solution,
      },
    })

    await bookmark.save()

    return NextResponse.json({
      success: true,
      message: "Question bookmarked successfully",
      bookmark,
    })
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Question already bookmarked" }, { status: 409 })
    }
    console.error("Create bookmark error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { questionId } = await request.json()

    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 })
    }

    const result = await Bookmark.findOneAndDelete({
      student: decoded.userId,
      questionId,
    })

    if (!result) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Bookmark removed successfully",
    })
  } catch (error) {
    console.error("Delete bookmark error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
