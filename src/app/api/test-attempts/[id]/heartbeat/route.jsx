import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function POST(request, { params }) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id: attemptId } = await params
    const { timestamp, currentQuestion } = await request.json()

    await connectDB()

    // Get the test attempt
    const attempt = await TestAttempt.findById(attemptId)
    if (!attempt) {
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }

    // Check if attempt belongs to the authenticated user
    if (attempt.student.toString() !== auth.user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update last heartbeat
    attempt.lastHeartbeat = new Date(timestamp)
    attempt.currentQuestion = currentQuestion
    await attempt.save()

    return NextResponse.json({
      success: true,
      message: "Heartbeat recorded",
      timestamp: attempt.lastHeartbeat,
    })
  } catch (error) {
    console.error("Heartbeat error:", error)
    return NextResponse.json(
      {
        error: "Failed to record heartbeat",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
