import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { id } = params
    console.log("Fetching user data for ID:", id)

    // Find the user by ID
    const user = await User.findById(id).select("-password")

    if (!user) {
      console.error("User not found with ID:", id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's test statistics
    const testAttempts = await TestAttempt.find({ userId: id })

    const totalAttempts = testAttempts.length
    const completedAttempts = testAttempts.filter((attempt) => attempt.status === "completed").length
    const scores = testAttempts
      .filter((attempt) => attempt.status === "completed" && attempt.score?.obtained !== undefined)
      .map((attempt) => attempt.score.obtained)

    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0

    // Add calculated stats to user object
    const userWithStats = {
      ...user.toObject(),
      totalAttempts,
      completedAttempts,
      averageScore,
      bestScore,
      lastActivity:
        testAttempts.length > 0
          ? new Date(Math.max(...testAttempts.map((a) => new Date(a.createdAt))))
          : user.createdAt,
    }

    console.log("Successfully fetched user data for:", user.name || user.email)

    return NextResponse.json(userWithStats)
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
