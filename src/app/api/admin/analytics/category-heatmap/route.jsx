import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"

export async function GET(request) {
  try {
    console.log("=== Category Heatmap API Called ===")

    await connectDB()
    console.log("Database connected successfully")

    // Get all tests to extract categories/subjects
    const tests = await Test.find({})

    // Extract unique subjects/categories
    const allSubjects = new Set()
    tests.forEach((test) => {
      if (test.subjects && Array.isArray(test.subjects)) {
        test.subjects.forEach((subject) => allSubjects.add(subject))
      }
    })

    const subjects = Array.from(allSubjects)
    console.log(`Found ${subjects.length} unique subjects/categories`)

    // Get all completed test attempts
    const completedAttempts = await TestAttempt.find({
      status: "completed",
      "score.percentage": { $exists: true },
      "score.subjectScores": { $exists: true },
    }).populate("student test")

    console.log(`Found ${completedAttempts.length} completed attempts with subject scores`)

    // Group attempts by student
    const attemptsByStudent = {}
    completedAttempts.forEach((attempt) => {
      const studentId = attempt.student._id.toString()

      if (!attemptsByStudent[studentId]) {
        attemptsByStudent[studentId] = {
          count: 0,
          subjectScores: {},
        }
      }

      attemptsByStudent[studentId].count += 1

      // Process subject scores
      if (attempt.score.subjectScores) {
        Object.entries(attempt.score.subjectScores).forEach(([subject, score]) => {
          if (!attemptsByStudent[studentId].subjectScores[subject]) {
            attemptsByStudent[studentId].subjectScores[subject] = []
          }

          attemptsByStudent[studentId].subjectScores[subject].push(score)
        })
      }
    })

    // Build the heatmap data structure
    const categoryHeatmap = {}

    // Initialize with all subjects
    subjects.forEach((subject) => {
      categoryHeatmap[subject] = {}
    })

    // Process student data
    Object.values(attemptsByStudent).forEach(({ count, subjectScores }) => {
      // For each subject the student has scores in
      Object.entries(subjectScores).forEach(([subject, scores]) => {
        if (!categoryHeatmap[subject][count]) {
          categoryHeatmap[subject][count] = {
            totalScore: 0,
            attemptCount: 0,
            studentCount: 0,
          }
        }

        const avgSubjectScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

        categoryHeatmap[subject][count].totalScore += avgSubjectScore
        categoryHeatmap[subject][count].attemptCount += scores.length
        categoryHeatmap[subject][count].studentCount += 1
      })
    })

    // Calculate averages
    Object.keys(categoryHeatmap).forEach((subject) => {
      Object.keys(categoryHeatmap[subject]).forEach((count) => {
        const { totalScore, studentCount } = categoryHeatmap[subject][count]
        categoryHeatmap[subject][count].avgScore = studentCount > 0 ? totalScore / studentCount : 0
      })
    })

    console.log(`Generated category heatmap for ${Object.keys(categoryHeatmap).length} categories`)

    return NextResponse.json({
      success: true,
      data: {
        categoryHeatmap,
        subjects,
      },
    })
  } catch (error) {
    console.error("=== Category Heatmap API Error ===")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to fetch category heatmap data",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
