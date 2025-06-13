import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"

export async function POST(request, { params }) {
  try {
    console.log("🚀 Submit API called")
    const resolvedParams = await params
    console.log("📝 Attempt ID:", resolvedParams.id)

    const auth = await authenticate(request)
    if (auth.error) {
      console.error("❌ Authentication failed:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    console.log("✅ User authenticated:", auth.user._id)

    const requestBody = await request.json()
    console.log("📊 Request body:", requestBody)
    const { answers, timeSpent, isAutoSubmit = false } = requestBody

    await connectDB()
    console.log("✅ Database connected")

    const attempt = await TestAttempt.findOne({
      _id: resolvedParams.id,
      student: auth.user._id,
    })

    if (!attempt) {
      console.error("❌ Test attempt not found")
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }
    console.log("✅ Test attempt found:", attempt._id)

    const test = await Test.findById(attempt.test)
    if (!test) {
      console.error("❌ Test not found")
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }
    console.log("✅ Test found:", test._id)

    // Calculate actual time spent based on start time and current time
    const startTime = new Date(attempt.startTime)
    const endTime = new Date()
    const actualTimeSpent = Math.floor((endTime - startTime) / 1000) // in seconds

    // Use the provided timeSpent if it's valid, otherwise use calculated time
    let finalTimeSpent = timeSpent
    if (!timeSpent || timeSpent <= 0 || isNaN(timeSpent)) {
      finalTimeSpent = actualTimeSpent
      console.log("⚠️ Using calculated time instead of provided time:", {
        providedTime: timeSpent,
        calculatedTime: actualTimeSpent,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
    }

    console.log("⏱️ Time calculation:", {
      providedTimeSpent: timeSpent,
      calculatedTimeSpent: actualTimeSpent,
      finalTimeSpent: finalTimeSpent,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationInMinutes: (finalTimeSpent / 60).toFixed(2),
    })

    // Calculate score and analysis
    let totalScore = 0
    let correct = 0
    let incorrect = 0
    let unattempted = 0
    const subjectWiseAnalysis = {}

    console.log("📊 Processing answers...")
    const processedAnswers = test.questions.map((question, index) => {
      const userAnswer = answers[index]
      let isCorrect = false
      let marksAwarded = 0

      // Handle MCQ questions
      if (userAnswer?.selectedAnswer !== undefined && userAnswer?.selectedAnswer !== null) {
        isCorrect = userAnswer.selectedAnswer === question.correctAnswer
        if (isCorrect) {
          correct++
          marksAwarded = question.marks?.positive || 1
        } else {
          incorrect++
          marksAwarded = question.marks?.negative || 0
        }
      }
      // Handle numerical questions
      else if (userAnswer?.numericalAnswer !== undefined && userAnswer?.numericalAnswer !== null) {
        // For numerical questions, compare with tolerance if available
        const userNum = Number.parseFloat(userAnswer.numericalAnswer)
        const correctNum = Number.parseFloat(question.numericalAnswer || question.correctAnswer)
        const tolerance = question.tolerance || 0.01

        isCorrect = Math.abs(userNum - correctNum) <= tolerance
        if (isCorrect) {
          correct++
          marksAwarded = question.marks?.positive || 1
        } else {
          incorrect++
          marksAwarded = question.marks?.negative || 0
        }
      }
      // Unattempted
      else {
        unattempted++
        marksAwarded = 0
      }

      totalScore += marksAwarded

      // Subject-wise analysis
      const subject = question.subject || "General"
      if (!subjectWiseAnalysis[subject]) {
        subjectWiseAnalysis[subject] = {
          subject: subject,
          correct: 0,
          incorrect: 0,
          unattempted: 0,
          score: 0,
        }
      }

      if (userAnswer?.selectedAnswer !== undefined || userAnswer?.numericalAnswer !== undefined) {
        if (isCorrect) {
          subjectWiseAnalysis[subject].correct++
        } else {
          subjectWiseAnalysis[subject].incorrect++
        }
      } else {
        subjectWiseAnalysis[subject].unattempted++
      }
      subjectWiseAnalysis[subject].score += marksAwarded

      return {
        questionId: question._id,
        selectedAnswer: userAnswer?.selectedAnswer,
        numericalAnswer: userAnswer?.numericalAnswer,
        isCorrect,
        timeTaken: userAnswer?.timeTaken || 0,
        marksAwarded,
      }
    })

    const totalMarks = test.totalMarks || test.questions.reduce((sum, q) => sum + (q.marks?.positive || 1), 0)
    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0

    console.log("📊 Calculated results:", {
      totalScore,
      totalMarks,
      percentage,
      correct,
      incorrect,
      unattempted,
      finalTimeSpent,
    })

    // Update attempt
    attempt.answers = processedAnswers
    attempt.endTime = endTime
    attempt.timeSpent = finalTimeSpent // Use the calculated/validated time
    attempt.status = isAutoSubmit ? "auto-submitted" : "completed"
    attempt.score = {
      obtained: totalScore,
      total: totalMarks,
      percentage: Math.max(0, Math.round(percentage * 100) / 100),
    }
    attempt.analysis = {
      correct,
      incorrect,
      unattempted,
      subjectWise: Object.values(subjectWiseAnalysis),
    }

    await attempt.save()
    console.log("✅ Test attempt saved with timeSpent:", finalTimeSpent)

    // Update test statistics
    await updateTestStatistics(test._id, attempt)
    console.log("✅ Test statistics updated")

    // Update user stats
    await User.findByIdAndUpdate(auth.user._id, {
      $inc: {
        "testStats.totalTests": 1,
        "testStats.totalTimeSpent": finalTimeSpent,
      },
      $max: { "testStats.bestScore": percentage },
      $set: {
        "testStats.averageScore": await calculateAverageScore(auth.user._id),
      },
    })
    console.log("✅ User stats updated")

    console.log("🎉 Test submission completed successfully")
    return NextResponse.json({
      success: true,
      message: "Test submitted successfully",
      result: {
        score: attempt.score,
        analysis: attempt.analysis,
        timeSpent: attempt.timeSpent,
      },
    })
  } catch (error) {
    console.error("❌ Submit test error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

async function updateTestStatistics(testId, attempt) {
  try {
    console.log("📊 Updating test statistics for:", testId)

    // Get all completed attempts for this test
    const allAttempts = await TestAttempt.find({
      test: testId,
      status: { $in: ["completed", "auto-submitted"] },
    })

    const totalAttempts = allAttempts.length
    const completedAttempts = allAttempts.filter((a) => a.status === "completed").length

    // Calculate averages
    const totalScore = allAttempts.reduce((sum, a) => sum + (a.score?.percentage || 0), 0)
    const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0

    const totalTime = allAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
    const averageTime = totalAttempts > 0 ? totalTime / totalAttempts : 0

    // Update test statistics
    await Test.findByIdAndUpdate(testId, {
      $set: {
        "statistics.totalAttempts": totalAttempts,
        "statistics.completedAttempts": completedAttempts,
        "statistics.averageScore": Math.round(averageScore * 10) / 10,
        "statistics.averageTime": Math.round(averageTime),
      },
    })

    console.log("✅ Test statistics updated:", {
      totalAttempts,
      completedAttempts,
      averageScore: Math.round(averageScore * 10) / 10,
      averageTime: Math.round(averageTime),
    })
  } catch (error) {
    console.error("❌ Error updating test statistics:", error)
  }
}

async function calculateAverageScore(userId) {
  try {
    const attempts = await TestAttempt.find({
      student: userId,
      status: { $in: ["completed", "auto-submitted"] },
    })

    if (attempts.length === 0) return 0

    const totalPercentage = attempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0)
    return Math.round((totalPercentage / attempts.length) * 100) / 100
  } catch (error) {
    console.error("❌ Error calculating average score:", error)
    return 0
  }
}
