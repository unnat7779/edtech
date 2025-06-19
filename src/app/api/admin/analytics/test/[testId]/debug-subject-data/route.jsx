import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { testId } = resolvedParams

    await connectDB()

    console.log("=== DEBUGGING SUBJECT DATA ===")
    console.log("Test ID:", testId)

    // 1. Check if test exists
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    console.log("✅ Test found:", {
      title: test.title,
      questionsCount: test.questions?.length || 0,
      subjects: test.questions?.map((q) => q.subject).filter((v, i, a) => a.indexOf(v) === i) || [],
    })

    // 2. Check all test attempts (not just completed)
    const allAttempts = await TestAttempt.find({
      $or: [{ test: testId }, { testId: testId }],
    })
      .populate("student", "name email")
      .lean()

    console.log("📊 All attempts found:", allAttempts.length)

    const completedAttempts = allAttempts.filter((a) => a.status === "completed")
    console.log("✅ Completed attempts:", completedAttempts.length)

    // 3. Analyze attempt data structures
    if (allAttempts.length > 0) {
      const sampleAttempt = allAttempts[0]
      console.log("🔍 Sample attempt structure:", {
        id: sampleAttempt._id,
        status: sampleAttempt.status,
        hasSubjectWise: !!sampleAttempt.subjectWise,
        subjectWiseType: typeof sampleAttempt.subjectWise,
        subjectWiseLength: Array.isArray(sampleAttempt.subjectWise) ? sampleAttempt.subjectWise.length : "not array",
        subjectWiseData: sampleAttempt.subjectWise,
        hasAnalysis: !!sampleAttempt.analysis,
        analysisKeys: sampleAttempt.analysis ? Object.keys(sampleAttempt.analysis) : [],
        hasAnswers: !!sampleAttempt.answers,
        answersLength: sampleAttempt.answers?.length || 0,
        scoreStructure: sampleAttempt.score,
      })

      // Check if answers have subject mapping
      if (sampleAttempt.answers && test.questions) {
        console.log("📝 Answer-Question mapping sample:")
        sampleAttempt.answers.slice(0, 3).forEach((answer, index) => {
          const question = test.questions[index]
          console.log(`Answer ${index}:`, {
            questionSubject: question?.subject,
            isCorrect: answer.isCorrect,
            marksAwarded: answer.marksAwarded,
            selectedAnswer: answer.selectedAnswer,
          })
        })
      }
    }

    // 4. Calculate subject stats manually for debugging
    const debugSubjectStats = {}

    if (completedAttempts.length > 0 && test.questions) {
      console.log("🧮 Manual calculation starting...")

      // Initialize subjects from test questions
      const subjects = [...new Set(test.questions.map((q) => q.subject).filter(Boolean))]
      console.log("📚 Subjects found in test:", subjects)

      subjects.forEach((subject) => {
        debugSubjectStats[subject] = {
          totalQuestions: 0,
          totalCorrect: 0,
          totalMarks: 0,
          totalMaxMarks: 0,
          attempts: 0,
        }
      })

      // Process each completed attempt
      completedAttempts.forEach((attempt, attemptIndex) => {
        console.log(`\n--- Processing Attempt ${attemptIndex + 1} ---`)

        if (attempt.answers && attempt.answers.length > 0) {
          attempt.answers.forEach((answer, questionIndex) => {
            const question = test.questions[questionIndex]
            if (!question || !question.subject) return

            const subject = question.subject
            if (!debugSubjectStats[subject]) return

            debugSubjectStats[subject].totalQuestions++
            debugSubjectStats[subject].totalMaxMarks += question.marks?.positive || 4

            if (answer.isCorrect) {
              debugSubjectStats[subject].totalCorrect++
              debugSubjectStats[subject].totalMarks += answer.marksAwarded || question.marks?.positive || 4
            }
          })
          debugSubjectStats[Object.keys(debugSubjectStats)[0]].attempts++
        }
      })

      console.log("📊 Debug subject stats:", debugSubjectStats)
    }

    // 5. Return comprehensive debug info
    return NextResponse.json({
      success: true,
      debug: {
        testInfo: {
          id: testId,
          title: test.title,
          questionsCount: test.questions?.length || 0,
          subjects: test.questions?.map((q) => q.subject).filter((v, i, a) => a.indexOf(v) === i) || [],
        },
        attemptInfo: {
          totalAttempts: allAttempts.length,
          completedAttempts: completedAttempts.length,
          inProgressAttempts: allAttempts.filter((a) => a.status === "in-progress").length,
          sampleAttemptStructure:
            allAttempts.length > 0
              ? {
                  hasSubjectWise: !!allAttempts[0].subjectWise,
                  hasAnalysis: !!allAttempts[0].analysis,
                  hasAnswers: !!allAttempts[0].answers,
                  answersCount: allAttempts[0].answers?.length || 0,
                }
              : null,
        },
        calculatedStats: debugSubjectStats,
        recommendations: [
          completedAttempts.length === 0
            ? "❌ No completed attempts found - this explains 0% scores"
            : "✅ Completed attempts found",
          !test.questions || test.questions.length === 0 ? "❌ No questions in test" : "✅ Test has questions",
          allAttempts.length > 0 && !allAttempts[0].subjectWise
            ? "⚠️ Attempts missing subjectWise data"
            : "✅ SubjectWise data available",
          Object.keys(debugSubjectStats).length === 0
            ? "❌ No subject data could be calculated"
            : "✅ Subject data calculated",
        ],
      },
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
