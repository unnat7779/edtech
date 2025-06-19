import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import User from "@/models/User"

export async function GET(request) {
  try {
    console.log("=== Attempt Distribution API Called ===")

    await connectDB()
    console.log("Database connected successfully")

    // Get all students
    const students = await User.find({ role: "student" })
    console.log(`Found ${students.length} students`)

    // Get all completed test attempts
    const completedAttempts = await TestAttempt.find({
      status: "completed",
      "score.percentage": { $exists: true },
    })
    console.log(`Found ${completedAttempts.length} completed attempts`)

    // Group attempts by student
    const attemptsByStudent = {}
    completedAttempts.forEach((attempt) => {
      const studentId = attempt.student.toString()

      if (!attemptsByStudent[studentId]) {
        attemptsByStudent[studentId] = {
          count: 0,
          scores: [],
        }
      }

      attemptsByStudent[studentId].count += 1
      attemptsByStudent[studentId].scores.push(attempt.score.percentage)
    })

    // Count students by attempt count
    const attemptCountMap = {}
    Object.values(attemptsByStudent).forEach(({ count, scores }) => {
      if (!attemptCountMap[count]) {
        attemptCountMap[count] = {
          userCount: 0,
          totalScore: 0,
          scoreCount: 0,
        }
      }

      attemptCountMap[count].userCount += 1
      attemptCountMap[count].totalScore += scores.reduce((sum, score) => sum + score, 0)
      attemptCountMap[count].scoreCount += scores.length
    })

    // Add students with zero attempts
    const studentsWithAttempts = Object.keys(attemptsByStudent).length
    const studentsWithoutAttempts = students.length - studentsWithAttempts

    if (studentsWithoutAttempts > 0) {
      attemptCountMap[0] = {
        userCount: studentsWithoutAttempts,
        totalScore: 0,
        scoreCount: 0,
      }
    }

    // Format data for chart
    const attemptDistribution = Object.keys(attemptCountMap)
      .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
      .map((attemptCount) => {
        const { userCount, totalScore, scoreCount } = attemptCountMap[attemptCount]
        const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0

        return {
          attemptCount: Number.parseInt(attemptCount),
          userCount,
          avgScore,
        }
      })

    console.log(`Generated attempt distribution for ${attemptDistribution.length} attempt count groups`)

    return NextResponse.json({
      success: true,
      data: {
        attemptDistribution,
        totalStudents: students.length,
        studentsWithAttempts,
      },
    })
  } catch (error) {
    console.error("=== Attempt Distribution API Error ===")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to fetch attempt distribution",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
