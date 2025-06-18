import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"
import mongoose from "mongoose"

export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Await params in Next.js 15
    const { studentId } = await params

    // Use mongoose.Types.ObjectId instead of ObjectId from mongodb
    const studentObjectId = new mongoose.Types.ObjectId(studentId)

    // Get student analytics
    const analytics = await TestAttempt.aggregate([
      {
        $match: {
          student: studentObjectId,
        },
      },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageScore: { $avg: "$score" },
          bestScore: { $max: "$score" },
          totalTimeSpent: { $sum: "$timeSpent" },
          completedAttempts: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ])

    // Get recent attempts
    const recentAttempts = await TestAttempt.find({ student: studentObjectId })
      .populate("test", "title")
      .sort({ submittedAt: -1 })
      .limit(10)
      .select("score timeSpent submittedAt status test")

    const formattedAttempts = recentAttempts.map((attempt) => ({
      _id: attempt._id,
      testTitle: attempt.test?.title || "Unknown Test",
      score: Math.round(attempt.score || 0),
      timeSpent: attempt.timeSpent || 0,
      submittedAt: attempt.submittedAt,
      status: attempt.status,
    }))

    const result = analytics[0] || {
      totalTests: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      completedAttempts: 0,
    }

    return NextResponse.json({
      success: true,
      ...result,
      averageScore: Math.round(result.averageScore || 0),
      bestScore: Math.round(result.bestScore || 0),
      recentAttempts: formattedAttempts,
    })
  } catch (error) {
    console.error("Get student analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch student analytics" }, { status: 500 })
  }
}
