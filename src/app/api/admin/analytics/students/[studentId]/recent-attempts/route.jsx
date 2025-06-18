import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await authenticate(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const resolvedParams = await params
    const { studentId } = resolvedParams

    // Import models after DB connection
    const TestAttempt = (await import("@/models/TestAttempt")).default
    const Test = (await import("@/models/Test")).default

    // Fetch recent test attempts for the student
    const recentAttempts = await TestAttempt.find({
      userId: studentId,
      status: "completed",
    })
      .populate("testId", "title subject")
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean()

    // Format the data
    const formattedAttempts = recentAttempts.map((attempt) => ({
      _id: attempt._id,
      testId: attempt.testId?._id,
      testTitle: attempt.testId?.title || "Unknown Test",
      subject: attempt.testId?.subject || "General",
      score: attempt.score || 0,
      obtainedMarks: attempt.obtainedMarks || 0,
      totalMarks: attempt.totalMarks || 0,
      timeSpent: attempt.timeSpent || 0,
      submittedAt: attempt.submittedAt,
      status: attempt.status,
    }))

    return NextResponse.json({
      success: true,
      recentAttempts: formattedAttempts,
    })
  } catch (error) {
    console.error("Error fetching recent attempts:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch recent attempts",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
