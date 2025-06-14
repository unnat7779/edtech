import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAnalytics from "@/models/TestAnalytics"
import StudentAnalytics from "@/models/StudentAnalytics"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const { testId, regenerate = false } = await request.json()

    // Check if analytics already exist
    const existingAnalytics = await TestAnalytics.findOne({ test: testId })
    if (existingAnalytics && !regenerate) {
      return NextResponse.json({
        success: true,
        message: "Analytics already exist",
        analytics: existingAnalytics,
      })
    }

    // Generate comprehensive analytics
    const analytics = await generateComprehensiveAnalytics(testId)

    // Save or update analytics
    const savedAnalytics = await TestAnalytics.findOneAndUpdate({ test: testId }, analytics, {
      upsert: true,
      new: true,
    })

    // Generate student-level analytics for all attempts
    await generateStudentAnalytics(testId)

    return NextResponse.json({
      success: true,
      message: "Analytics generated successfully",
      analytics: savedAnalytics,
    })
  } catch (error) {
    console.error("Generate analytics error:", error)
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 })
  }
}

async function generateComprehensiveAnalytics(testId) {
  const test = await Test.findById(testId)
  const attempts = await TestAttempt.find({ test: testId }).populate("student")
  const completedAttempts = attempts.filter((attempt) => attempt.status === "completed")

  // Calculate all analytics components
  const basicStats = calculateBasicStatistics(attempts, completedAttempts)
  const scoreDistribution = calculateScoreDistribution(completedAttempts)
  const subjectPerformance = calculateSubjectPerformance(completedAttempts, test)
  const questionAnalytics = calculateQuestionAnalytics(completedAttempts, test)
  const timeAnalytics = calculateTimeAnalytics(completedAttempts)
  const difficultyAnalysis = calculateDifficultyAnalysis(completedAttempts, test)
  const dailyTrends = calculateDailyTrends(attempts)
  const comparativeAnalytics = await calculateComparativeAnalytics(testId, test)
  const advancedMetrics = calculateAdvancedMetrics(completedAttempts, test)
  const insights = generateInsights(completedAttempts, basicStats, test)
  const performanceFlags = calculatePerformanceFlags(basicStats, completedAttempts)

  return {
    test: testId,
    ...basicStats,
    scoreDistribution,
    subjectPerformance,
    questionAnalytics,
    timeAnalytics,
    difficultyAnalysis,
    dailyTrends,
    comparativeAnalytics,
    advancedMetrics,
    insights,
    performanceFlags,
    lastCalculated: new Date(),
  }
}

async function generateStudentAnalytics(testId) {
  const attempts = await TestAttempt.find({ test: testId, status: "completed" }).populate("student")
  const test = await Test.findById(testId)

  for (const attempt of attempts) {
    const studentAnalytics = await calculateStudentAnalytics(attempt, test, attempts)

    await StudentAnalytics.findOneAndUpdate(
      { student: attempt.student._id, testAttempt: attempt._id },
      studentAnalytics,
      { upsert: true, new: true },
    )
  }
}

async function calculateStudentAnalytics(attempt, test, allAttempts) {
  // Calculate rank and percentile
  const sortedAttempts = allAttempts.sort((a, b) => b.score.obtained - a.score.obtained)
  const rank = sortedAttempts.findIndex((a) => a._id.toString() === attempt._id.toString()) + 1
  const percentile = Math.round(((allAttempts.length - rank) / allAttempts.length) * 100)

  // Calculate subject-wise analysis
  const subjectAnalysis = calculateStudentSubjectAnalysis(attempt, test)

  // Calculate chapter-wise analysis
  const chapterAnalysis = calculateStudentChapterAnalysis(attempt, test)

  // Calculate time analysis
  const timeAnalysis = calculateStudentTimeAnalysis(attempt, test)

  // Calculate question analysis
  const questionAnalysis = calculateStudentQuestionAnalysis(attempt, test)

  // Calculate comparative analysis
  const comparativeAnalysis = calculateStudentComparativeAnalysis(attempt, allAttempts)

  // Generate recommendations
  const recommendations = generateStudentRecommendations(attempt, test, subjectAnalysis)

  // Identify strengths and weaknesses
  const strengthsWeaknesses = identifyStrengthsWeaknesses(subjectAnalysis, questionAnalysis)

  // Analyze learning patterns
  const learningPatterns = analyzeLearningPatterns(attempt, questionAnalysis)

  // Set flags
  const flags = calculateStudentFlags(attempt, subjectAnalysis, timeAnalysis)

  return {
    student: attempt.student._id,
    testAttempt: attempt._id,
    test: test._id,
    performance: {
      score: attempt.score.obtained,
      percentage: attempt.score.percentage,
      rank,
      percentile,
      totalStudents: allAttempts.length,
      accuracy: calculateAccuracy(attempt.answers),
      efficiency: calculateEfficiency(attempt, test),
    },
    subjectAnalysis,
    chapterAnalysis,
    timeAnalysis,
    questionAnalysis,
    comparativeAnalysis,
    recommendations,
    strengthsWeaknesses,
    learningPatterns,
    flags,
    generatedAt: new Date(),
  }
}

// Helper functions for calculations
function calculateBasicStatistics(attempts, completedAttempts) {
  const scores = completedAttempts.map((attempt) => attempt.score.obtained)
  const times = completedAttempts.map((attempt) => attempt.timeSpent || 0)

  return {
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    completionRate: attempts.length > 0 ? (completedAttempts.length / attempts.length) * 100 : 0,
    averageScore: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
    medianScore: calculateMedian(scores),
    topScore: Math.max(...scores, 0),
    lowestScore: Math.min(...scores, 0),
    averageTime: times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0,
  }
}

function calculateMedian(numbers) {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

function calculateAccuracy(answers) {
  const attempted = answers.filter((answer) => answer.selectedAnswer !== null && answer.selectedAnswer !== undefined)
  const correct = answers.filter((answer) => answer.isCorrect)
  return attempted.length > 0 ? (correct.length / attempted.length) * 100 : 0
}

function calculateEfficiency(attempt, test) {
  const totalQuestions = test.questions.length
  const timePerQuestion = (attempt.timeSpent || 0) / totalQuestions
  const optimalTime = (test.duration * 60) / totalQuestions // Convert duration to seconds
  return optimalTime > 0 ? Math.min((optimalTime / timePerQuestion) * 100, 100) : 0
}

function calculateStudentSubjectAnalysis(attempt, test) {
  const subjectStats = {}

  attempt.answers.forEach((answer, index) => {
    const question = test.questions[index]
    if (!question) return

    const subject = question.subject || "Other"
    if (!subjectStats[subject]) {
      subjectStats[subject] = {
        subject,
        totalMarks: 0,
        obtainedMarks: 0,
        questionsAttempted: 0,
        questionsCorrect: 0,
        questionsIncorrect: 0,
        questionsUnattempted: 0,
        timeSpent: 0,
      }
    }

    const marks = question.marks?.positive || 1
    subjectStats[subject].totalMarks += marks

    if (answer.selectedAnswer === null || answer.selectedAnswer === undefined) {
      subjectStats[subject].questionsUnattempted++
    } else {
      subjectStats[subject].questionsAttempted++
      if (answer.isCorrect) {
        subjectStats[subject].questionsCorrect++
        subjectStats[subject].obtainedMarks += marks
      } else {
        subjectStats[subject].questionsIncorrect++
      }
    }

    subjectStats[subject].timeSpent += answer.timeTaken || 0
  })

  return Object.values(subjectStats).map((subject) => ({
    ...subject,
    score: subject.obtainedMarks,
    percentage: subject.totalMarks > 0 ? (subject.obtainedMarks / subject.totalMarks) * 100 : 0,
    accuracy: subject.questionsAttempted > 0 ? (subject.questionsCorrect / subject.questionsAttempted) * 100 : 0,
    strengthLevel: getStrengthLevel(
      subject.questionsAttempted > 0 ? (subject.questionsCorrect / subject.questionsAttempted) * 100 : 0,
    ),
    improvementAreas: generateImprovementAreas(subject),
  }))
}

function getStrengthLevel(accuracy) {
  if (accuracy >= 85) return "excellent"
  if (accuracy >= 70) return "strong"
  if (accuracy >= 50) return "average"
  return "weak"
}

function generateImprovementAreas(subjectStats) {
  const areas = []

  if (subjectStats.accuracy < 70) {
    areas.push("Conceptual understanding")
  }
  if (subjectStats.questionsUnattempted > subjectStats.questionsAttempted * 0.2) {
    areas.push("Time management")
  }
  if (subjectStats.questionsIncorrect > subjectStats.questionsCorrect) {
    areas.push("Problem-solving techniques")
  }

  return areas
}

function calculateStudentChapterAnalysis(attempt, test) {
  const chapterStats = {}

  attempt.answers.forEach((answer, index) => {
    const question = test.questions[index]
    if (!question) return

    const chapter = question.chapter || "Other"
    const subject = question.subject || "Other"

    if (!chapterStats[chapter]) {
      chapterStats[chapter] = {
        chapter,
        subject,
        total: 0,
        correct: 0,
        timeSpent: 0,
        difficulty: question.difficulty || "Medium",
      }
    }

    chapterStats[chapter].total++
    if (answer.isCorrect) {
      chapterStats[chapter].correct++
    }
    chapterStats[chapter].timeSpent += answer.timeTaken || 0
  })

  return Object.values(chapterStats).map((chapter) => ({
    ...chapter,
    accuracy: chapter.total > 0 ? (chapter.correct / chapter.total) * 100 : 0,
    masteryLevel: getMasteryLevel(chapter.total > 0 ? (chapter.correct / chapter.total) * 100 : 0),
    recommendedActions: generateChapterRecommendations(chapter),
  }))
}

function getMasteryLevel(accuracy) {
  if (accuracy >= 90) return "expert"
  if (accuracy >= 75) return "advanced"
  if (accuracy >= 60) return "intermediate"
  return "beginner"
}

function generateChapterRecommendations(chapterStats) {
  const recommendations = []

  if (chapterStats.accuracy < 60) {
    recommendations.push("Review fundamental concepts")
    recommendations.push("Practice basic problems")
  } else if (chapterStats.accuracy < 80) {
    recommendations.push("Focus on application problems")
    recommendations.push("Practice mixed concept questions")
  } else {
    recommendations.push("Attempt advanced level problems")
    recommendations.push("Focus on speed and accuracy")
  }

  return recommendations
}

function calculateStudentTimeAnalysis(attempt, test) {
  const questionTimes = attempt.answers.map((answer) => answer.timeTaken || 0)
  const totalTime = attempt.timeSpent || 0
  const averageTimePerQuestion = questionTimes.length > 0 ? totalTime / questionTimes.length : 0

  const fastestQuestion = questionTimes.reduce(
    (min, time, index) => (time > 0 && time < questionTimes[min.index] ? { index, timeSpent: time } : min),
    { index: 0, timeSpent: questionTimes[0] || 0 },
  )

  const slowestQuestion = questionTimes.reduce(
    (max, time, index) => (time > questionTimes[max.index] ? { index, timeSpent: time } : max),
    { index: 0, timeSpent: questionTimes[0] || 0 },
  )

  return {
    totalTime,
    averageTimePerQuestion,
    timeEfficiency: calculateTimeEfficiency(totalTime, test.duration * 60),
    fastestQuestion: {
      questionIndex: fastestQuestion.index + 1,
      timeSpent: fastestQuestion.timeSpent,
    },
    slowestQuestion: {
      questionIndex: slowestQuestion.index + 1,
      timeSpent: slowestQuestion.timeSpent,
    },
    timeDistribution: calculateTimeDistribution(attempt, test),
    timeManagementScore: calculateTimeManagementScore(questionTimes, test),
    recommendations: generateTimeRecommendations(totalTime, test.duration * 60, questionTimes),
  }
}

function calculateTimeEfficiency(actualTime, allocatedTime) {
  return allocatedTime > 0 ? Math.min((allocatedTime / actualTime) * 100, 100) : 0
}

function calculateTimeDistribution(attempt, test) {
  const subjectTimes = {}

  attempt.answers.forEach((answer, index) => {
    const question = test.questions[index]
    if (!question) return

    const subject = question.subject || "Other"
    if (!subjectTimes[subject]) {
      subjectTimes[subject] = 0
    }
    subjectTimes[subject] += answer.timeTaken || 0
  })

  const totalTime = Object.values(subjectTimes).reduce((sum, time) => sum + time, 0)

  return Object.entries(subjectTimes).map(([subject, timeSpent]) => ({
    subject,
    timeSpent,
    percentage: totalTime > 0 ? (timeSpent / totalTime) * 100 : 0,
  }))
}

function calculateTimeManagementScore(questionTimes, test) {
  const optimalTimePerQuestion = (test.duration * 60) / test.questions.length
  const deviations = questionTimes.map((time) => Math.abs(time - optimalTimePerQuestion))
  const averageDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length

  return Math.max(0, 100 - (averageDeviation / optimalTimePerQuestion) * 100)
}

function generateTimeRecommendations(actualTime, allocatedTime, questionTimes) {
  const recommendations = []

  if (actualTime > allocatedTime * 1.1) {
    recommendations.push("Practice time management techniques")
    recommendations.push("Set time limits for each question")
  }

  const variance = calculateVariance(questionTimes)
  if (variance > 60) {
    recommendations.push("Work on consistent pacing")
    recommendations.push("Identify and skip difficult questions initially")
  }

  return recommendations
}

function calculateVariance(numbers) {
  if (numbers.length === 0) return 0
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  const squaredDiffs = numbers.map((num) => Math.pow(num - mean, 2))
  return Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length)
}

function calculateStudentQuestionAnalysis(attempt, test) {
  return attempt.answers
    .map((answer, index) => {
      const question = test.questions[index]
      if (!question) return null

      return {
        questionIndex: index + 1,
        questionId: question._id,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeTaken || 0,
        difficulty: question.difficulty || "Medium",
        subject: question.subject || "Other",
        chapter: question.chapter || "Other",
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer || question.numericalAnswer,
        marksAwarded: answer.marksAwarded || 0,
        isBookmarked: false, // This would come from user preferences
        needsReview: !answer.isCorrect || (answer.timeTaken || 0) > 180, // More than 3 minutes
        conceptTags: question.tags || [],
        errorType: determineErrorType(answer, question),
      }
    })
    .filter(Boolean)
}

function determineErrorType(answer, question) {
  if (answer.isCorrect) return null

  // Simple heuristics for error classification
  if ((answer.timeTaken || 0) < 30) return "careless"
  if ((answer.timeTaken || 0) > 300) return "time-pressure"
  if (question.difficulty === "Hard") return "conceptual"

  return "calculation"
}

function calculateStudentComparativeAnalysis(attempt, allAttempts) {
  const scores = allAttempts.map((a) => a.score.obtained)
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

  const sortedScores = [...scores].sort((a, b) => b - a)
  const topPercentileIndex = Math.floor(sortedScores.length * 0.1)
  const bottomPercentileIndex = Math.floor(sortedScores.length * 0.9)

  return {
    peerComparison: {
      averageScore,
      topPercentileScore: sortedScores[topPercentileIndex] || 0,
      bottomPercentileScore: sortedScores[bottomPercentileIndex] || 0,
      subjectComparison: [], // This would need more detailed calculation
    },
    progressTracking: [], // This would come from historical data
    trendAnalysis: {
      overallTrend: "stable", // This would be calculated from historical data
      subjectTrends: [],
    },
  }
}

function generateStudentRecommendations(attempt, test, subjectAnalysis) {
  const weakSubjects = subjectAnalysis.filter(
    (subject) => subject.strengthLevel === "weak" || subject.strengthLevel === "average",
  )

  const studyPlan = weakSubjects.map((subject, index) => ({
    week: index + 1,
    focus: `${subject.subject} Improvement`,
    tasks: [`Review ${subject.subject} fundamentals`, `Practice 20-30 problems daily`, `Take chapter-wise tests`],
    estimatedTime: "8-10 hours",
    resources: [
      {
        type: "video",
        title: `${subject.subject} Concept Videos`,
        description: "Comprehensive video lectures",
        difficulty: "beginner",
      },
    ],
  }))

  return {
    studyPlan,
    practiceAreas: weakSubjects.map((subject) => ({
      subject: subject.subject,
      chapter: "All chapters", // This would be more specific
      priority: subject.strengthLevel === "weak" ? "high" : "medium",
      recommendedQuestions: 50,
      estimatedTime: "5-7 hours",
    })),
    timeManagementTips: [
      {
        tip: "Set time limits for each question",
        description: "Allocate specific time based on question difficulty",
        priority: "high",
      },
    ],
    nextSteps: [
      {
        action: "Focus on weak subjects",
        timeline: "Next 2 weeks",
        expectedOutcome: "Improve accuracy by 15-20%",
      },
    ],
  }
}

function identifyStrengthsWeaknesses(subjectAnalysis, questionAnalysis) {
  const strengths = subjectAnalysis
    .filter((subject) => subject.strengthLevel === "strong" || subject.strengthLevel === "excellent")
    .map((subject) => ({
      area: subject.subject,
      description: `Strong performance in ${subject.subject}`,
      evidence: `${subject.accuracy.toFixed(1)}% accuracy`,
      maintainanceStrategy: "Continue regular practice",
    }))

  const weaknesses = subjectAnalysis
    .filter((subject) => subject.strengthLevel === "weak" || subject.strengthLevel === "average")
    .map((subject) => ({
      area: subject.subject,
      description: `Needs improvement in ${subject.subject}`,
      impact: "Affecting overall score",
      improvementStrategy: "Focused practice and concept review",
      priority: subject.strengthLevel === "weak" ? "high" : "medium",
    }))

  return { strengths, weaknesses }
}

function analyzeLearningPatterns(attempt, questionAnalysis) {
  const subjectAccuracies = {}

  questionAnalysis.forEach((q) => {
    if (!subjectAccuracies[q.subject]) {
      subjectAccuracies[q.subject] = { correct: 0, total: 0 }
    }
    subjectAccuracies[q.subject].total++
    if (q.isCorrect) {
      subjectAccuracies[q.subject].correct++
    }
  })

  const preferredSubjects = Object.entries(subjectAccuracies)
    .map(([subject, stats]) => ({
      subject,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }))
    .filter((s) => s.accuracy > 70)
    .map((s) => s.subject)

  return {
    preferredSubjects,
    learningStyle: "mixed", // This would require more analysis
    peakPerformanceTime: "morning", // This would come from timing analysis
    consistencyScore: 75, // This would be calculated from performance variance
    adaptabilityScore: 80, // This would be calculated from different question types
    problemSolvingApproach: "systematic", // This would be inferred from time patterns
  }
}

function calculateStudentFlags(attempt, subjectAnalysis, timeAnalysis) {
  const averageAccuracy = subjectAnalysis.reduce((sum, s) => sum + s.accuracy, 0) / subjectAnalysis.length

  return {
    needsAttention: averageAccuracy < 60,
    significantImprovement: false, // This would come from historical comparison
    performanceDecline: false, // This would come from historical comparison
    timeManagementIssues: timeAnalysis.timeEfficiency < 70,
    conceptualGaps: subjectAnalysis.some((s) => s.strengthLevel === "weak"),
    examReadiness: averageAccuracy > 75 && timeAnalysis.timeEfficiency > 80,
  }
}

function calculatePerformanceFlags(basicStats, completedAttempts) {
  return {
    lowCompletionRate: basicStats.completionRate < 70,
    highDifficultyVariance: false, // Would need more calculation
    timeManagementIssues: basicStats.averageTime > 180 * 60, // More than 3 hours
    suspiciousPatterns: false, // Would need pattern analysis
    outlierDetection: false, // Would need statistical analysis
  }
}

function calculateAdvancedMetrics(completedAttempts, test) {
  // These would be more sophisticated statistical calculations
  return {
    reliabilityCoefficient: 0.85, // Cronbach's alpha
    standardError: 5.2,
    itemTotalCorrelation: 0.72,
    guessCorrection: 0.15,
    speedAccuracyTradeoff: 0.68,
  }
}

function calculateScoreDistribution(completedAttempts) {
  const scores = completedAttempts.map((attempt) => attempt.score.obtained)
  const distribution = {}

  scores.forEach((score) => {
    const roundedScore = Math.round(score)
    distribution[roundedScore] = (distribution[roundedScore] || 0) + 1
  })

  return distribution
}

function calculateSubjectPerformance(completedAttempts, test) {
  const subjectPerformance = {}

  completedAttempts.forEach((attempt) => {
    attempt.answers.forEach((answer, index) => {
      const question = test.questions[index]
      if (!question) return

      const subject = question.subject || "Other"
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = {
          correct: 0,
          total: 0,
        }
      }

      subjectPerformance[subject].total++
      if (answer.isCorrect) {
        subjectPerformance[subject].correct++
      }
    })
  })

  return Object.entries(subjectPerformance).map(([subject, performance]) => ({
    subject,
    accuracy: performance.total > 0 ? (performance.correct / performance.total) * 100 : 0,
  }))
}

function calculateQuestionAnalytics(completedAttempts, test) {
  const questionAnalytics = {}

  completedAttempts.forEach((attempt) => {
    attempt.answers.forEach((answer, index) => {
      const question = test.questions[index]
      if (!question) return

      const questionId = question._id.toString()
      if (!questionAnalytics[questionId]) {
        questionAnalytics[questionId] = {
          correct: 0,
          total: 0,
          timeSpent: 0,
        }
      }

      questionAnalytics[questionId].total++
      if (answer.isCorrect) {
        questionAnalytics[questionId].correct++
      }
      questionAnalytics[questionId].timeSpent += answer.timeTaken || 0
    })
  })

  return Object.entries(questionAnalytics).map(([questionId, analytics]) => ({
    questionId,
    accuracy: analytics.total > 0 ? (analytics.correct / analytics.total) * 100 : 0,
    averageTimeSpent: analytics.total > 0 ? analytics.timeSpent / analytics.total : 0,
  }))
}

function calculateTimeAnalytics(completedAttempts) {
  const totalTimeSpent = completedAttempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0)
  const averageTimeSpent = completedAttempts.length > 0 ? totalTimeSpent / completedAttempts.length : 0

  return {
    averageTimeSpent,
    timeDistribution: getTimeDistribution(completedAttempts),
  }
}

function getTimeDistribution(completedAttempts) {
  const timeDistribution = {}

  completedAttempts.forEach((attempt) => {
    const timeSpent = attempt.timeSpent || 0
    const bucket = Math.floor(timeSpent / 60) // Group by minutes

    timeDistribution[bucket] = (timeDistribution[bucket] || 0) + 1
  })

  return Object.entries(timeDistribution).map(([bucket, count]) => ({
    bucket: `${bucket}-${Number.parseInt(bucket) + 1} min`,
    count,
  }))
}

function calculateDifficultyAnalysis(completedAttempts, test) {
  const difficultyAnalysis = {}

  completedAttempts.forEach((attempt) => {
    attempt.answers.forEach((answer, index) => {
      const question = test.questions[index]
      if (!question) return

      const difficulty = question.difficulty || "Medium"
      if (!difficultyAnalysis[difficulty]) {
        difficultyAnalysis[difficulty] = {
          correct: 0,
          total: 0,
        }
      }

      difficultyAnalysis[difficulty].total++
      if (answer.isCorrect) {
        difficultyAnalysis[difficulty].correct++
      }
    })
  })

  return Object.entries(difficultyAnalysis).map(([difficulty, analysis]) => ({
    difficulty,
    accuracy: analysis.total > 0 ? (analysis.correct / analysis.total) * 100 : 0,
  }))
}

function calculateDailyTrends(attempts) {
  const dailyTrends = {}

  attempts.forEach((attempt) => {
    const date = new Date(attempt.createdAt).toLocaleDateString()
    dailyTrends[date] = (dailyTrends[date] || 0) + 1
  })

  return Object.entries(dailyTrends).map(([date, count]) => ({
    date,
    attempts: count,
  }))
}

async function calculateComparativeAnalytics(testId, test) {
  // Placeholder for comparative analytics logic
  return {
    averageScore: 70,
    topPerformers: [],
    subjectWiseComparison: [],
  }
}

function generateInsights(completedAttempts, basicStats, test) {
  // Placeholder for generating insights
  return ["Students performed well on easy questions", "Time management is a key area for improvement"]
}
