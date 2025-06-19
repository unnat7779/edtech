import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request, { params }) {
  try {
    console.log("=== Subject Intelligence API Called ===")

    const resolvedParams = await params
    const { testId } = resolvedParams

    console.log("Test ID:", testId)

    await connectDB()

    // Fetch test details
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    console.log("Test found:", {
      title: test.title,
      hasQuestions: !!test.questions,
      questionCount: test.questions?.length || 0,
    })

    // Get all completed attempts for this test
    console.log("Fetching attempts for test:", testId)
    const attempts = await TestAttempt.find({
      $or: [{ test: testId }, { testId: testId }],
      status: "completed",
    })
      .populate("student", "name email class")
      .lean()

    console.log(`Found ${attempts.length} completed attempts`)

    // Extract subject names from test questions
    let subjectNames = ["Physics", "Chemistry", "Mathematics"] // Default
    if (test.questions && test.questions.length > 0) {
      const subjectSet = new Set()
      test.questions.forEach((question) => {
        if (question.subject) {
          subjectSet.add(question.subject)
        }
      })
      if (subjectSet.size > 0) {
        subjectNames = Array.from(subjectSet)
      }
    }

    console.log("Subject names:", subjectNames)

    if (attempts.length === 0) {
      console.log("⚠️ No completed attempts found - returning empty data")

      // Return empty data structure with subject names
      const emptySubjectPerformance = subjectNames.map((subject) => ({
        subject,
        averageScore: 0,
        accuracy: 0,
        totalQuestions: test.questions
          ? test.questions.filter((q) => q.subject === subject).length
          : Math.floor(test.questions?.length / subjectNames.length) || 1,
        averageTime: 0,
        attemptRate: 0,
      }))

      const emptyCompetencyRadar = subjectNames.map((subject) => ({
        subject,
        conceptual: 0,
        application: 0,
        problem_solving: 0,
        speed: 0,
      }))

      return NextResponse.json({
        success: true,
        subjectPerformance: emptySubjectPerformance,
        competencyRadar: emptyCompetencyRadar,
        learningGaps: [],
        totalAttempts: 0,
        message: "No completed attempts found for this test",
        debugInfo: {
          reason: "No completed test attempts in database",
          totalAttempts: await TestAttempt.countDocuments({
            $or: [{ test: testId }, { testId: testId }],
          }),
          testHasQuestions: !!test.questions?.length,
        },
      })
    }

    // Process subject-wise data from actual TestAttempt collection
    console.log("Processing subject intelligence data...")
    const subjectIntelligence = await processSubjectIntelligenceData(attempts, test, subjectNames)

    console.log("Final processed data:", {
      subjectPerformance: subjectIntelligence.subjectPerformance?.length || 0,
      competencyRadar: subjectIntelligence.competencyRadar?.length || 0,
      learningGaps: subjectIntelligence.learningGaps?.length || 0,
    })

    return NextResponse.json({
      success: true,
      ...subjectIntelligence,
      totalAttempts: attempts.length,
    })
  } catch (error) {
    console.error("Subject intelligence API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch subject intelligence data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

async function processSubjectIntelligenceData(attempts, test, defaultSubjectNames) {
  try {
    console.log("🔄 Processing subject intelligence data...")
    console.log("Attempts to process:", attempts.length)
    console.log("Default subjects:", defaultSubjectNames)

    // Initialize subject statistics
    const subjectStats = {}
    defaultSubjectNames.forEach((subject) => {
      subjectStats[subject] = {
        subject,
        totalAttempts: 0,
        totalMarks: 0,
        totalMaxMarks: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalTime: 0,
        scores: [],
        accuracyScores: [],
      }
    })

    // MAIN PROCESSING: Calculate from answers array using test questions
    if (test.questions && test.questions.length > 0) {
      console.log("📊 Calculating from test questions and answers...")

      attempts.forEach((attempt, attemptIndex) => {
        console.log(`\n--- Processing Attempt ${attemptIndex + 1}/${attempts.length} ---`)
        console.log("Attempt ID:", attempt._id)
        console.log("Student:", attempt.student?.name || "Unknown")
        console.log("Answers count:", attempt.answers?.length || 0)
        console.log("Test questions count:", test.questions.length)

        if (!attempt.answers || attempt.answers.length === 0) {
          console.log("❌ No answers found in this attempt")
          return
        }

        // Track per-attempt subject scores
        const attemptSubjectScores = {}
        defaultSubjectNames.forEach((subject) => {
          attemptSubjectScores[subject] = {
            correct: 0,
            total: 0,
            marks: 0,
            maxMarks: 0,
            time: 0,
          }
        })

        // Process each answer
        attempt.answers.forEach((answer, questionIndex) => {
          const question = test.questions[questionIndex]
          if (!question) {
            console.log(`⚠️ No question found for index ${questionIndex}`)
            return
          }

          const subject = question.subject || defaultSubjectNames[questionIndex % defaultSubjectNames.length]
          const questionMarks = question.marks?.positive || 4

          console.log(`Q${questionIndex + 1} (${subject}):`, {
            isCorrect: answer.isCorrect,
            selectedAnswer: answer.selectedAnswer,
            marksAwarded: answer.marksAwarded,
            questionMarks,
          })

          // Update attempt-level stats
          attemptSubjectScores[subject].total++
          attemptSubjectScores[subject].maxMarks += questionMarks
          attemptSubjectScores[subject].time += answer.timeTaken || 0

          if (answer.isCorrect) {
            attemptSubjectScores[subject].correct++
            attemptSubjectScores[subject].marks += answer.marksAwarded || questionMarks
          }

          // Update global stats
          subjectStats[subject].totalQuestions++
          subjectStats[subject].totalMaxMarks += questionMarks
          subjectStats[subject].totalTime += answer.timeTaken || 0

          if (answer.isCorrect) {
            subjectStats[subject].totalCorrect++
            subjectStats[subject].totalMarks += answer.marksAwarded || questionMarks
          }
        })

        // Calculate scores for this attempt
        Object.keys(attemptSubjectScores).forEach((subject) => {
          const subjectData = attemptSubjectScores[subject]

          if (subjectData.total > 0) {
            subjectStats[subject].totalAttempts++

            // Calculate percentage score for this attempt
            const scorePercentage = subjectData.maxMarks > 0 ? (subjectData.marks / subjectData.maxMarks) * 100 : 0

            // Calculate accuracy for this attempt
            const accuracyPercentage = (subjectData.correct / subjectData.total) * 100

            console.log(`${subject} attempt scores:`, {
              scorePercentage: scorePercentage.toFixed(2),
              accuracyPercentage: accuracyPercentage.toFixed(2),
              correct: subjectData.correct,
              total: subjectData.total,
              marks: subjectData.marks,
              maxMarks: subjectData.maxMarks,
            })

            subjectStats[subject].scores.push(scorePercentage)
            subjectStats[subject].accuracyScores.push(accuracyPercentage)
          }
        })
      })
    }

    console.log("\n📈 Final subject statistics:")
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      console.log(`${subject}:`, {
        totalAttempts: stats.totalAttempts,
        totalMarks: stats.totalMarks,
        totalMaxMarks: stats.totalMaxMarks,
        totalCorrect: stats.totalCorrect,
        totalQuestions: stats.totalQuestions,
        scoresCount: stats.scores.length,
        avgScore:
          stats.scores.length > 0
            ? (stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length).toFixed(2)
            : 0,
      })
    })

    // Convert to final format
    const subjectPerformance = Object.values(subjectStats).map((subject) => {
      const averageScore =
        subject.scores.length > 0 ? subject.scores.reduce((sum, score) => sum + score, 0) / subject.scores.length : 0

      const accuracy =
        subject.accuracyScores.length > 0
          ? subject.accuracyScores.reduce((sum, acc) => sum + acc, 0) / subject.accuracyScores.length
          : 0

      const averageTime = subject.totalAttempts > 0 ? subject.totalTime / subject.totalAttempts : 0

      const questionsPerSubject =
        subject.totalAttempts > 0
          ? Math.floor(subject.totalQuestions / subject.totalAttempts)
          : test.questions
            ? test.questions.filter((q) => q.subject === subject.subject).length
            : 1

      return {
        subject: subject.subject,
        averageScore: Math.round(averageScore * 100) / 100,
        accuracy: Math.round(accuracy * 100) / 100,
        totalQuestions: Math.max(1, questionsPerSubject),
        averageTime: Math.round(averageTime),
        attemptRate: subject.totalAttempts > 0 ? 100 : 0,
      }
    })

    // Create competency radar data
    const competencyRadar = subjectPerformance.map((subject) => ({
      subject: subject.subject,
      conceptual: Math.round(subject.averageScore * 100) / 100,
      application: Math.round(subject.accuracy * 100) / 100,
      problem_solving: Math.round(((subject.averageScore + subject.accuracy) / 2) * 100) / 100,
      speed: Math.round(Math.max(0, 100 - subject.averageTime / 60) * 100) / 100,
    }))

    // Identify learning gaps
    const learningGaps = subjectPerformance
      .filter((subject) => subject.averageScore < 60)
      .map((subject) => ({
        area: subject.subject,
        severity: subject.averageScore < 40 ? "High" : "Medium",
        affectedStudents: Math.round((100 - subject.accuracy) * 0.8),
        avgScore: subject.averageScore,
      }))

    console.log("\n✅ Final processed data:")
    console.log(
      "Subject Performance:",
      subjectPerformance.map(
        (s) => `${s.subject}: ${s.averageScore.toFixed(2)}% (${s.totalQuestions}Q, ${s.accuracy.toFixed(2)}% acc)`,
      ),
    )

    return {
      subjectPerformance,
      competencyRadar,
      learningGaps,
    }
  } catch (error) {
    console.error("❌ Error processing subject intelligence data:", error)
    return {
      subjectPerformance: [],
      competencyRadar: [],
      learningGaps: [],
      error: error.message,
    }
  }
}
