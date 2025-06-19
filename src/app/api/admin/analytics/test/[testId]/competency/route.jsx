import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"

export async function GET(request, { params }) {
  try {
    console.log("=== Competency Analysis API Called ===")
    console.log("Test ID:", params.testId)

    await connectDB()

    const testId = params.testId
    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 })
    }

    // Get test details to understand question structure
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Get all completed test attempts for this test
    const attempts = await TestAttempt.find({
      test: testId,
      status: "completed",
    }).populate("student", "name email")

    console.log(`Found ${attempts.length} completed attempts`)

    if (attempts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          physics: { conceptual: 0, application: 0, problemSolving: 0, speed: 0 },
          chemistry: { conceptual: 0, application: 0, problemSolving: 0, speed: 0 },
          mathematics: { conceptual: 0, application: 0, problemSolving: 0, speed: 0 },
        },
      })
    }

    // Initialize competency tracking
    const competencyData = {
      physics: { conceptual: [], application: [], problemSolving: [], speed: [] },
      chemistry: { conceptual: [], application: [], problemSolving: [], speed: [] },
      mathematics: { conceptual: [], application: [], problemSolving: [], speed: [] },
    }

    // Process each attempt
    attempts.forEach((attempt) => {
      try {
        const answers = attempt.answers || []
        const timeSpent = attempt.timeSpent || 0
        const totalQuestions = answers.length

        // Calculate speed competency (questions per minute)
        const questionsPerMinute = totalQuestions > 0 && timeSpent > 0 ? totalQuestions / (timeSpent / 60) : 0

        // Process answers by subject
        answers.forEach((answer, index) => {
          const question = answer.question || {}
          const subject = (question.subject || "").toLowerCase()
          const difficulty = question.difficulty || "medium"
          const questionType = question.type || "mcq"
          const isCorrect = answer.isCorrect || false
          const timeForQuestion = answer.timeSpent || timeSpent / totalQuestions

          // Determine competency type based on question characteristics
          let competencyType = "conceptual" // default

          // Classify question type into competency areas
          if (question.tags && Array.isArray(question.tags)) {
            const tags = question.tags.map((tag) => tag.toLowerCase())
            if (tags.some((tag) => tag.includes("application") || tag.includes("practical"))) {
              competencyType = "application"
            } else if (tags.some((tag) => tag.includes("problem") || tag.includes("numerical"))) {
              competencyType = "problemSolving"
            }
          } else if (questionType === "numerical" || difficulty === "hard") {
            competencyType = "problemSolving"
          } else if (question.text && question.text.toLowerCase().includes("calculate")) {
            competencyType = "application"
          }

          // Calculate competency score (0-100)
          let competencyScore = 0
          if (isCorrect) {
            // Base score for correctness
            competencyScore = 60

            // Bonus for difficulty
            if (difficulty === "easy") competencyScore += 10
            else if (difficulty === "medium") competencyScore += 20
            else if (difficulty === "hard") competencyScore += 30

            // Time bonus (faster = better, but not too fast)
            const avgTimePerQuestion = 90 // 1.5 minutes average
            if (timeForQuestion > 0 && timeForQuestion <= avgTimePerQuestion) {
              const timeBonus = Math.max(0, 10 - (timeForQuestion / avgTimePerQuestion) * 10)
              competencyScore += timeBonus
            }
          } else {
            // Partial credit for attempt
            competencyScore = Math.max(0, 20 - (timeForQuestion > 180 ? 10 : 0))
          }

          // Add to appropriate subject and competency
          if (subject === "physics" || subject === "phy") {
            competencyData.physics[competencyType].push(competencyScore)
            competencyData.physics.speed.push(questionsPerMinute * 10) // Scale for visualization
          } else if (subject === "chemistry" || subject === "chem") {
            competencyData.chemistry[competencyType].push(competencyScore)
            competencyData.chemistry.speed.push(questionsPerMinute * 10)
          } else if (subject === "mathematics" || subject === "math" || subject === "maths") {
            competencyData.mathematics[competencyType].push(competencyScore)
            competencyData.mathematics.speed.push(questionsPerMinute * 10)
          }
        })
      } catch (error) {
        console.error("Error processing attempt:", error)
      }
    })

    // Calculate averages and round to 2 decimal places
    const calculateAverage = (scores) => {
      if (scores.length === 0) return 0
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
      return Math.round(avg * 100) / 100
    }

    const result = {
      physics: {
        conceptual: calculateAverage(competencyData.physics.conceptual),
        application: calculateAverage(competencyData.physics.application),
        problemSolving: calculateAverage(competencyData.physics.problemSolving),
        speed: calculateAverage(competencyData.physics.speed),
      },
      chemistry: {
        conceptual: calculateAverage(competencyData.chemistry.conceptual),
        application: calculateAverage(competencyData.chemistry.application),
        problemSolving: calculateAverage(competencyData.chemistry.problemSolving),
        speed: calculateAverage(competencyData.chemistry.speed),
      },
      mathematics: {
        conceptual: calculateAverage(competencyData.mathematics.conceptual),
        application: calculateAverage(competencyData.mathematics.application),
        problemSolving: calculateAverage(competencyData.mathematics.problemSolving),
        speed: calculateAverage(competencyData.mathematics.speed),
      },
    }

    console.log("Competency analysis result:", result)

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        totalAttempts: attempts.length,
        testTitle: test.title,
        analysisDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("=== Competency Analysis API Error ===")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to fetch competency analysis",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
