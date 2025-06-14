import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"
import { verifyToken } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    // Get token from headers
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Await params before accessing properties
    const resolvedParams = await params
    const { attemptId } = resolvedParams

    console.log("=== FETCHING ANALYTICS DATA ===")
    console.log("Attempt ID:", attemptId)

    // Fetch the test attempt with populated data
    const attempt = await TestAttempt.findById(attemptId).populate("student", "name email class").lean()

    if (!attempt) {
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }

    console.log("Found attempt with time tracking:", {
      id: attempt._id,
      timeSpent: attempt.timeSpent,
      hasQuestionTimeTracking: !!attempt.questionTimeTracking,
      hasSubjectTimeTracking: !!attempt.subjectTimeTracking,
      questionTrackingKeys: attempt.questionTimeTracking ? Object.keys(attempt.questionTimeTracking).length : 0,
      subjectTrackingKeys: attempt.subjectTimeTracking ? Object.keys(attempt.subjectTimeTracking).length : 0,
    })

    // Verify the attempt belongs to the authenticated user (unless admin)
    if (attempt.student._id.toString() !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Fetch the test with questions
    const test = await Test.findById(attempt.test).lean()

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    console.log("Found test:", {
      id: test._id,
      title: test.title,
      questionsCount: test.questions?.length || 0,
      duration: test.duration,
    })

    // Calculate analytics using the SAME logic as test results
    const analytics = await calculateStudentAnalytics(attempt, test)

    return NextResponse.json({
      success: true,
      attempt: {
        ...attempt,
        test: test._id, // Keep reference
      },
      test: {
        ...test,
        // Ensure questions are properly formatted
        questions:
          test.questions?.map((q, index) => ({
            ...q,
            _id: q._id || `q_${index}`,
            questionText:
              typeof q.questionText === "object"
                ? q.questionText.text || JSON.stringify(q.questionText)
                : q.questionText,
            options: Array.isArray(q.options)
              ? q.options.map((opt) => (typeof opt === "object" ? opt.text || JSON.stringify(opt) : opt))
              : [],
          })) || [],
      },
      analytics,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

async function calculateStudentAnalytics(attempt, test) {
  try {
    console.log("=== CALCULATING ANALYTICS WITH TIME TRACKING ===")
    console.log("Attempt analysis from DB:", attempt.analysis)
    console.log("Time tracking data:", {
      timeSpent: attempt.timeSpent,
      questionTimeTracking: attempt.questionTimeTracking ? Object.keys(attempt.questionTimeTracking).length : 0,
      subjectTimeTracking: attempt.subjectTimeTracking ? Object.keys(attempt.subjectTimeTracking).length : 0,
    })

    // Get all attempts for this test to calculate rank and percentile
    const allAttempts = await TestAttempt.find({
      test: attempt.test,
      status: "completed",
    })
      .sort({ "score.obtained": -1 })
      .lean()

    console.log(`Found ${allAttempts.length} completed attempts for this test`)

    const totalStudents = allAttempts.length
    const userRank = allAttempts.findIndex((a) => a._id.toString() === attempt._id.toString()) + 1
    const percentile = totalStudents > 0 ? Math.round(((totalStudents - userRank) / totalStudents) * 100) : 0

    // Use the EXISTING subject-wise analysis from the attempt (which is working correctly)
    let subjectWise = []

    if (attempt.analysis && attempt.analysis.subjectWise && attempt.analysis.subjectWise.length > 0) {
      console.log("Using existing subject-wise analysis from attempt:", attempt.analysis.subjectWise)

      // Use the existing data and enhance it with additional calculations
      subjectWise = attempt.analysis.subjectWise.map((subject) => {
        const totalQuestions = subject.correct + subject.incorrect + subject.unattempted
        const accuracy =
          totalQuestions > 0 && subject.correct + subject.incorrect > 0
            ? Math.round((subject.correct / (subject.correct + subject.incorrect)) * 100)
            : 0

        // Calculate marks based on standard scoring (4 marks correct, -1 incorrect)
        const obtainedMarks = subject.correct * 4 + subject.incorrect * -1
        const totalMarks = totalQuestions * 4
        const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0

        console.log(`Subject ${subject.subject}:`, {
          correct: subject.correct,
          incorrect: subject.incorrect,
          unattempted: subject.unattempted,
          totalQuestions,
          accuracy,
          obtainedMarks,
          totalMarks,
          percentage,
        })

        return {
          subject: subject.subject,
          correct: subject.correct,
          incorrect: subject.incorrect,
          unattempted: subject.unattempted,
          totalQuestions,
          obtainedMarks,
          totalMarks,
          accuracy,
          percentage,
          timeSpent: 0, // Will be updated when time tracking is fixed
          averageTimePerQuestion: 0,
        }
      })
    } else {
      console.log("No existing subject-wise analysis found, calculating from scratch...")
      // Fallback: calculate from answers if no existing analysis
      subjectWise = calculateSubjectWiseFromAnswers(attempt, test)
    }

    // Enhanced time analytics using ACTUAL tracking data
    const timeAnalytics = calculateTimeAnalytics(attempt, test)

    // Calculate difficulty-wise performance
    const difficultyWise = calculateDifficultyWisePerformance(attempt, test)

    // Get user's previous attempts for progress tracking
    const previousAttempts = await TestAttempt.find({
      student: attempt.student._id || attempt.student,
      status: "completed",
      createdAt: { $lt: attempt.createdAt },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("test", "title")
      .lean()

    console.log(`Found ${previousAttempts.length} previous attempts for progress tracking`)

    const averageScore = calculateAverageScore(allAttempts)
    const topScore = allAttempts[0]?.score?.obtained || 0

    const result = {
      rank: userRank || null,
      totalStudents,
      percentile,
      subjectWise,
      timeAnalytics,
      difficultyWise,
      previousAttempts: previousAttempts.map((a) => ({
        testTitle: a.test?.title || "Unknown Test",
        score: a.score?.obtained || 0,
        percentage: a.score?.percentage || 0,
        date: a.createdAt,
        totalMarks: a.score?.total || 0,
      })),
      averageScore,
      topScore,
      totalQuestions: test.questions?.length || 0,
      attemptedQuestions: attempt.analysis?.correct + attempt.analysis?.incorrect || 0,
      correctAnswers: attempt.analysis?.correct || 0,
      incorrectAnswers: attempt.analysis?.incorrect || 0,
      unattemptedQuestions: attempt.analysis?.unattempted || 0,
    }

    console.log("Final analytics result:", result)
    console.log("=== END ANALYTICS CALCULATION ===")

    return result
  } catch (error) {
    console.error("Error calculating analytics:", error)
    return {
      rank: null,
      totalStudents: 0,
      percentile: 0,
      subjectWise: [],
      timeAnalytics: {
        totalTime: attempt.timeSpent || 0,
        averageTimePerQuestion: 0,
        timeDistribution: [],
        totalTimeInMinutes: 0,
        timeEfficiency: 0,
        questionTimeDetails: [],
        timePerCorrectAnswer: 0,
        timePerIncorrectAnswer: 0,
        averageTimePerSubject: {},
        totalQuestionsWithTime: 0,
      },
      difficultyWise: [],
      previousAttempts: [],
      averageScore: 0,
      topScore: 0,
      totalQuestions: 0,
      attemptedQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unattemptedQuestions: 0,
    }
  }
}

function calculateTimeAnalytics(attempt, test) {
  console.log("=== CALCULATING TIME ANALYTICS ===")

  const totalTime = attempt.timeSpent || 0
  const questionTimeTracking = attempt.questionTimeTracking || {}
  const subjectTimeTracking = attempt.subjectTimeTracking || {}

  console.log("Time data:", {
    totalTime,
    questionTrackingKeys: Object.keys(questionTimeTracking).length,
    subjectTrackingKeys: Object.keys(subjectTimeTracking).length,
  })

  // Calculate question-wise time details
  const questionTimeDetails = []
  if (test.questions) {
    test.questions.forEach((question, index) => {
      const answer = attempt.answers?.[index]
      let subject = "Mathematics"

      if (question.subject) {
        const subjectLower = question.subject.toLowerCase()
        if (subjectLower.includes("phys")) subject = "Physics"
        else if (subjectLower.includes("chem")) subject = "Chemistry"
        else if (subjectLower.includes("math")) subject = "Mathematics"
      }

      // Get actual time from tracking data
      let timeSpent = 0
      if (questionTimeTracking[index]?.totalTime) {
        timeSpent = questionTimeTracking[index].totalTime
      } else if (answer?.timeTaken) {
        timeSpent = answer.timeTaken
      }

      questionTimeDetails.push({
        questionIndex: index,
        questionNo: index + 1,
        subject,
        timeSpent,
        isAnswered: answer?.selectedAnswer !== undefined || answer?.numericalAnswer !== undefined,
        isCorrect: answer?.isCorrect || false,
      })
    })
  }

  // Calculate subject-wise time distribution
  const timeDistribution = ["Physics", "Chemistry", "Mathematics"].map((subject) => {
    let subjectTime = 0

    // Use subject time tracking if available
    if (subjectTimeTracking[subject]?.totalTime) {
      subjectTime = subjectTimeTracking[subject].totalTime
    } else {
      // Fallback: sum question times for this subject
      subjectTime = questionTimeDetails.filter((q) => q.subject === subject).reduce((sum, q) => sum + q.timeSpent, 0)
    }

    const subjectQuestions = questionTimeDetails.filter((q) => q.subject === subject)
    const percentage = totalTime > 0 ? Math.round((subjectTime / totalTime) * 100) : 0

    return {
      subject,
      time: subjectTime,
      timeInSeconds: subjectTime,
      percentage,
      questions: subjectQuestions.length,
    }
  })

  // Calculate averages
  const totalQuestions = questionTimeDetails.length
  const averageTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0

  const correctAnswers = questionTimeDetails.filter((q) => q.isAnswered && q.isCorrect)
  const incorrectAnswers = questionTimeDetails.filter((q) => q.isAnswered && !q.isCorrect)

  const timePerCorrectAnswer =
    correctAnswers.length > 0
      ? Math.round(correctAnswers.reduce((sum, q) => sum + q.timeSpent, 0) / correctAnswers.length)
      : 0

  const timePerIncorrectAnswer =
    incorrectAnswers.length > 0
      ? Math.round(incorrectAnswers.reduce((sum, q) => sum + q.timeSpent, 0) / incorrectAnswers.length)
      : 0

  const result = {
    totalTime,
    averageTimePerQuestion,
    timeDistribution,
    totalTimeInMinutes: Math.round(totalTime / 60),
    timeEfficiency: 0, // Can be calculated based on performance vs time
    questionTimeDetails,
    timePerCorrectAnswer,
    timePerIncorrectAnswer,
    averageTimePerSubject: timeDistribution.reduce((acc, item) => {
      acc[item.subject] = item.questions > 0 ? Math.round(item.time / item.questions) : 0
      return acc
    }, {}),
    totalQuestionsWithTime: questionTimeDetails.filter((q) => q.timeSpent > 0).length,
  }

  console.log("Time analytics result:", result)
  return result
}

function calculateSubjectWiseFromAnswers(attempt, test) {
  console.log("Calculating subject-wise from answers as fallback...")

  const subjectStats = {
    Physics: { correct: 0, incorrect: 0, unattempted: 0 },
    Chemistry: { correct: 0, incorrect: 0, unattempted: 0 },
    Mathematics: { correct: 0, incorrect: 0, unattempted: 0 },
  }

  if (!attempt.answers || !test.questions) {
    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      ...stats,
      totalQuestions: 0,
      obtainedMarks: 0,
      totalMarks: 0,
      accuracy: 0,
      percentage: 0,
      timeSpent: 0,
      averageTimePerQuestion: 0,
    }))
  }

  attempt.answers.forEach((answer, index) => {
    const question = test.questions[index]
    if (!question) return

    let subject = question.subject || "Mathematics" // Default fallback

    // Normalize subject names
    if (subject.toLowerCase().includes("math")) subject = "Mathematics"
    if (subject.toLowerCase().includes("phys")) subject = "Physics"
    if (subject.toLowerCase().includes("chem")) subject = "Chemistry"

    if (!subjectStats[subject]) {
      subjectStats[subject] = { correct: 0, incorrect: 0, unattempted: 0 }
    }

    const hasAnswer =
      (answer.selectedAnswer !== null && answer.selectedAnswer !== undefined) ||
      (answer.numericalAnswer !== null && answer.numericalAnswer !== undefined)

    if (!hasAnswer) {
      subjectStats[subject].unattempted++
    } else if (answer.isCorrect) {
      subjectStats[subject].correct++
    } else {
      subjectStats[subject].incorrect++
    }
  })

  return Object.entries(subjectStats).map(([subject, stats]) => {
    const totalQuestions = stats.correct + stats.incorrect + stats.unattempted
    const accuracy =
      stats.correct + stats.incorrect > 0 ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) : 0
    const obtainedMarks = stats.correct * 4 + stats.incorrect * -1
    const totalMarks = totalQuestions * 4
    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0

    return {
      subject,
      ...stats,
      totalQuestions,
      obtainedMarks,
      totalMarks,
      accuracy,
      percentage,
      timeSpent: 0,
      averageTimePerQuestion: 0,
    }
  })
}

function calculateDifficultyWisePerformance(attempt, test) {
  const difficultyStats = {
    Easy: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
    Medium: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
    Hard: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
  }

  if (!attempt.answers || !test.questions) {
    return Object.entries(difficultyStats).map(([level, stats]) => ({
      level,
      ...stats,
      attempted: 0,
      accuracy: 0,
    }))
  }

  attempt.answers.forEach((answer, index) => {
    const question = test.questions[index]
    if (!question) return

    const difficulty = question.difficulty || "Medium"
    if (!difficultyStats[difficulty]) {
      difficultyStats[difficulty] = { correct: 0, incorrect: 0, unattempted: 0, total: 0 }
    }

    difficultyStats[difficulty].total++

    const hasAnswer =
      (answer.selectedAnswer !== null && answer.selectedAnswer !== undefined) ||
      (answer.numericalAnswer !== null && answer.numericalAnswer !== undefined)

    if (!hasAnswer) {
      difficultyStats[difficulty].unattempted++
    } else if (answer.isCorrect) {
      difficultyStats[difficulty].correct++
    } else {
      difficultyStats[difficulty].incorrect++
    }
  })

  return Object.entries(difficultyStats).map(([level, stats]) => ({
    level,
    ...stats,
    attempted: stats.correct + stats.incorrect,
    accuracy:
      stats.correct + stats.incorrect > 0 ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) : 0,
  }))
}

function calculateAverageScore(attempts) {
  if (attempts.length === 0) return 0
  const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score?.obtained || 0), 0)
  return Math.round(totalScore / attempts.length)
}
