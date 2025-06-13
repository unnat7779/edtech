import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import User from "@/models/User"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function GET(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Check if user is admin
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Get statistics
    const [totalTests, totalStudents, totalAttempts, recentTests] = await Promise.all([
      Test.countDocuments(),
      User.countDocuments({ role: "student" }),
      TestAttempt.countDocuments(),
      Test.find().sort({ createdAt: -1 }).limit(5).select("title createdAt"),
    ])

    const stats = {
      totalTests,
      totalStudents,
      totalAttempts,
      recentTests,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Get admin dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
