import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request) {
  try {
    console.log("=== Score Trends API Called ===")

    await connectDB()
    console.log("Database connected successfully")

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "7d"

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "1d":
        startDate.setDate(now.getDate() - 1)
        break
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setDate(now.getDate() - 365)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    console.log("Date range:", { startDate, endDate: now, timeRange })

    // Get completed test attempts within the time range
    const completedAttempts = await TestAttempt.find({
      createdAt: { $gte: startDate },
      status: "completed",
      "score.percentage": { $exists: true },
    })

    console.log(`Found ${completedAttempts.length} completed attempts in the time range`)

    // Group attempts by date
    const attemptsByDate = {}
    const subjectAttemptsByDate = {}

    completedAttempts.forEach((attempt) => {
      const date = attempt.createdAt.toISOString().split("T")[0]

      // Initialize if not exists
      if (!attemptsByDate[date]) {
        attemptsByDate[date] = {
          scores: [],
          count: 0,
        }
      }

      // Add overall score to the date
      attemptsByDate[date].scores.push(attempt.score.percentage)
      attemptsByDate[date].count += 1

      // Process subject-wise scores from analysis.subjectWise array
      if (attempt.analysis && attempt.analysis.subjectWise && Array.isArray(attempt.analysis.subjectWise)) {
        attempt.analysis.subjectWise.forEach((subjectData) => {
          const subject = subjectData.subject
          const subjectScore = subjectData.score || 0

          if (subject) {
            // Initialize subject data structure if needed
            if (!subjectAttemptsByDate[subject]) {
              subjectAttemptsByDate[subject] = {}
            }

            if (!subjectAttemptsByDate[subject][date]) {
              subjectAttemptsByDate[subject][date] = {
                scores: [],
                count: 0,
              }
            }

            // Add subject score
            subjectAttemptsByDate[subject][date].scores.push(subjectScore)
            subjectAttemptsByDate[subject][date].count += 1
          }
        })
      }
    })

    // Calculate average and median scores for each date
    const scoreTrends = Object.keys(attemptsByDate)
      .sort()
      .map((date) => {
        const { scores, count } = attemptsByDate[date]
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

        // Calculate median
        const sortedScores = [...scores].sort((a, b) => a - b)
        const mid = Math.floor(sortedScores.length / 2)
        const medianScore =
          sortedScores.length % 2 === 0 ? (sortedScores[mid - 1] + sortedScores[mid]) / 2 : sortedScores[mid]

        return {
          date,
          avgScore: Math.round(avgScore * 100) / 100,
          medianScore: Math.round(medianScore * 100) / 100,
          attemptCount: count,
        }
      })

    // Calculate subject-wise score trends
    const subjectScoreTrends = {}

    Object.keys(subjectAttemptsByDate).forEach((subject) => {
      subjectScoreTrends[subject] = Object.keys(subjectAttemptsByDate[subject])
        .sort()
        .map((date) => {
          const { scores, count } = subjectAttemptsByDate[subject][date]
          const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

          return {
            date,
            avgScore: Math.round(avgScore * 100) / 100,
            attemptCount: count,
          }
        })
    })

    console.log(
      `Generated score trends for ${scoreTrends.length} dates and ${Object.keys(subjectScoreTrends).length} subjects`,
    )
    console.log("Available subjects:", Object.keys(subjectScoreTrends))

    return NextResponse.json({
      success: true,
      data: {
        scoreTrends,
        subjectScoreTrends,
        availableSubjects: Object.keys(subjectScoreTrends),
        timeRange,
        dateRange: {
          start: startDate,
          end: now,
        },
      },
    })
  } catch (error) {
    console.error("=== Score Trends API Error ===")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to fetch score trends",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
