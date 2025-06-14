import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { questionIndex, action, timeSpent, timestamp, selectedAnswer, numericalAnswer } = await request.json()

    await connectDB()

    const attempt = await TestAttempt.findOne({
      _id: resolvedParams.id,
      student: auth.user._id,
    })

    if (!attempt) {
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }

    // Initialize timeTracking if it doesn't exist
    if (!attempt.timeTracking) {
      attempt.timeTracking = {}
    }

    // Initialize question tracking if it doesn't exist
    if (!attempt.timeTracking[questionIndex]) {
      attempt.timeTracking[questionIndex] = {
        totalTime: 0,
        sessions: [],
        actions: [],
      }
    }

    const questionTracking = attempt.timeTracking[questionIndex]

    // Add action log
    const actionLog = {
      action,
      timestamp: new Date(timestamp),
      timeSpent: timeSpent || 0,
    }

    if (selectedAnswer !== undefined) {
      actionLog.selectedAnswer = selectedAnswer
    }
    if (numericalAnswer !== undefined) {
      actionLog.numericalAnswer = numericalAnswer
    }

    questionTracking.actions.push(actionLog)

    // Update total time if timeSpent is provided
    if (timeSpent && timeSpent > 0) {
      questionTracking.totalTime += timeSpent
      questionTracking.sessions.push({
        start: new Date(new Date(timestamp).getTime() - timeSpent * 1000),
        end: new Date(timestamp),
        duration: timeSpent,
      })
    }

    // Mark as modified and save
    attempt.markModified("timeTracking")
    await attempt.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Time tracking error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
