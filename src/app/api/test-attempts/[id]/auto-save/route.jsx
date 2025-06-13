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

    const { answers, timeSpent } = await request.json()

    await connectDB()

    const attempt = await TestAttempt.findOne({
      _id: resolvedParams.id,
      student: auth.user._id,
      status: "in-progress",
    })

    if (!attempt) {
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }

    // Auto-save the current state
    attempt.autoSaveData = {
      answers,
      timeSpent,
      lastSaved: new Date(),
    }

    await attempt.save()

    return NextResponse.json({
      message: "Progress auto-saved",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Auto-save error:", error)
    return NextResponse.json({ error: "Auto-save failed" }, { status: 500 })
  }
}
