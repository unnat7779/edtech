import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import Test from "@/models/Test"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    console.log("=== STUDENT ANALYTICS API CALLED ===")

    await connectDB()

    // Get token from headers
    const authHeader = request.headers.get("authorization")
    console.log("Auth header present:", !!authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid authorization header")
      return NextResponse.json(
        {
          error: "No token provided",
          details: "Authorization header missing or invalid format",
        },
        { status: 401 },
      )
    }

    const token = authHeader.replace("Bearer ", "")
    console.log("Token extracted:", token ? "Present" : "Missing")

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("❌ Token verification failed")
      return NextResponse.json(
        {
          error: "Invalid token",
          details: "Token verification failed",
        },
        { status: 401 },
      )
    }

    console.log("✅ Token verified for user:", decoded.userId || decoded.id)

    // Await params before accessing properties
    const resolvedParams = await params
    const { attemptId } = resolvedParams

    console.log("Looking for attempt/user ID:", attemptId)

    // First, try to find as test attempt ID
    let attempt = await TestAttempt.findById(attemptId).lean()

    if (attempt) {
      console.log("✅ Found as test attempt ID")
      console.log("Attempt student field:", attempt.student)
      console.log("Attempt userId field:", attempt.userId)

      // Try to populate student if it exists
      if (attempt.student) {
        try {
          const populatedAttempt = await TestAttempt.findById(attemptId).populate("student", "name email class").lean()
          if (populatedAttempt && populatedAttempt.student) {
            attempt = populatedAttempt
            console.log("✅ Successfully populated student data")
          }
        } catch (populateError) {
          console.log("⚠️ Failed to populate student, using raw data:", populateError.message)
        }
      }

      // Determine student ID from multiple possible fields
      let studentId = null
      if (attempt.student) {
        studentId = attempt.student._id || attempt.student
      } else if (attempt.userId) {
        studentId = attempt.userId
      } else {
        console.log("❌ No student reference found in attempt")
        return NextResponse.json(
          {
            error: "Invalid test attempt",
            details: "No student reference found in test attempt",
          },
          { status: 400 },
        )
      }

      console.log("Student ID determined:", studentId)
      console.log("Authenticated user ID:", decoded.userId)

      // Verify the attempt belongs to the authenticated user (unless admin)
      if (studentId.toString() !== decoded.userId && decoded.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
      }

      // If student data wasn't populated, fetch it separately
      if (!attempt.student || !attempt.student.name) {
        try {
          const User = (await import("@/models/User")).default
          const studentData = await User.findById(studentId).select("name email class").lean()
          if (studentData) {
            attempt.student = studentData
            console.log("✅ Fetched student data separately")
          }
        } catch (userError) {
          console.log("⚠️ Could not fetch student data:", userError.message)
          // Continue without student data - not critical for analytics
          attempt.student = {
            _id: studentId,
            name: "Unknown Student",
            email: "",
            class: "",
          }
        }
      }

      // Fetch the test with questions
      const test = await Test.findById(attempt.test).lean()
      if (!test) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 })
      }

      // Calculate analytics
      const analytics = await calculateStudentAnalytics(attempt, test)

      return NextResponse.json({
        success: true,
        attempt: {
          ...attempt,
          test: test._id,
        },
        test: {
          ...test,
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
    }

    // If not found as attempt ID, try as user ID
    console.log("Not found as attempt ID, trying as user ID...")

    const user = await User.findById(attemptId).lean()
    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
          details: `No user found with ID: ${attemptId}`,
        },
        { status: 404 },
      )
    }

    console.log("✅ Found user:", user.name)

    // Verify access (user can only access their own data, unless admin)
    if (attemptId !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Get user's test attempts
    const userAttempts = await TestAttempt.find({
      $or: [{ student: attemptId }, { userId: attemptId }],
      status: "completed",
    })
      .populate("test", "title subject")
      .sort({ createdAt: -1 })
      .lean()

    console.log(`Found ${userAttempts.length} completed attempts for user`)

    if (userAttempts.length === 0) {
      return NextResponse.json({
        success: true,
        user,
        attempts: [],
        analytics: {
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          subjectWise: [],
          recentAttempts: [],
        },
      })
    }

    // Calculate user analytics from all attempts
    const analytics = calculateUserAnalytics(userAttempts, user)

    return NextResponse.json({
      success: true,
      user,
      attempts: userAttempts,
      analytics,
    })
  } catch (error) {
    console.error("❌ Student Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function calculateUserAnalytics(attempts, user) {
  const totalAttempts = attempts.length
  const scores = attempts.map((a) => a.score?.percentage || a.score?.obtained || 0)
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const bestScore = Math.max(...scores, 0)
  const totalTimeSpent = attempts.reduce((total, attempt) => total + (attempt.timeSpent || 0), 0)

  // Subject-wise analysis
  const subjectStats = {}
  attempts.forEach((attempt) => {
    if (attempt.analysis?.subjectWise) {
      attempt.analysis.subjectWise.forEach((subject) => {
        if (!subjectStats[subject.subject]) {
          subjectStats[subject.subject] = {
            correct: 0,
            incorrect: 0,
            unattempted: 0,
            totalAttempts: 0,
          }
        }
        subjectStats[subject.subject].correct += subject.correct || 0
        subjectStats[subject.subject].incorrect += subject.incorrect || 0
        subjectStats[subject.subject].unattempted += subject.unattempted || 0
        subjectStats[subject.subject].totalAttempts += 1
      })
    }
  })

  const subjectWise = Object.entries(subjectStats).map(([subject, stats]) => {
    const totalQuestions = stats.correct + stats.incorrect + stats.unattempted
    const accuracy =
      stats.correct + stats.incorrect > 0 ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) : 0

    return {
      subject,
      ...stats,
      totalQuestions,
      accuracy,
      averageScore:
        totalQuestions > 0 ? Math.round(((stats.correct * 4 - stats.incorrect) / (totalQuestions * 4)) * 100) : 0,
    }
  })

  return {
    totalAttempts,
    averageScore,
    bestScore,
    totalTimeSpent: Math.round(totalTimeSpent / 3600), // Convert to hours
    subjectWise,
    recentAttempts: attempts.slice(0, 5).map((attempt) => ({
      testTitle: attempt.test?.title || "Unknown Test",
      score: attempt.score?.percentage || attempt.score?.obtained || 0,
      date: attempt.createdAt,
      timeSpent: Math.round((attempt.timeSpent || 0) / 60), // Convert to minutes
    })),
  }
}

// Keep the existing calculateStudentAnalytics function for backward compatibility
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
