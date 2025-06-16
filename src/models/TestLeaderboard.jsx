import mongoose from "mongoose"

const TestLeaderboardSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
      index: true,
    },

    // Cached leaderboard data for performance
    leaderboardData: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        attempt: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TestAttempt",
          required: true,
        },
        rank: {
          type: Number,
          required: true,
        },
        score: {
          obtained: Number,
          total: Number,
          percentage: Number,
        },
        percentile: {
          type: Number,
          default: 0,
        },
        timeSpent: {
          type: Number,
          default: 0,
        },
        subjectScores: {
          physics: {
            score: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 },
            correct: { type: Number, default: 0 },
            incorrect: { type: Number, default: 0 },
            unattempted: { type: Number, default: 0 },
          },
          chemistry: {
            score: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 },
            correct: { type: Number, default: 0 },
            incorrect: { type: Number, default: 0 },
            unattempted: { type: Number, default: 0 },
          },
          mathematics: {
            score: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 },
            correct: { type: Number, default: 0 },
            incorrect: { type: Number, default: 0 },
            unattempted: { type: Number, default: 0 },
          },
        },
        submittedAt: {
          type: Date,
          required: true,
        },
      },
    ],

    // Metadata
    totalStudents: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    topScore: {
      type: Number,
      default: 0,
    },
    averageTime: {
      type: Number,
      default: 0,
    },

    // Cache control
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isStale: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
TestLeaderboardSchema.index({ test: 1, lastUpdated: -1 })
TestLeaderboardSchema.index({ "leaderboardData.student": 1 })
TestLeaderboardSchema.index({ "leaderboardData.rank": 1 })

// Static method to update leaderboard
TestLeaderboardSchema.statics.updateLeaderboard = async function (testId) {
  const TestAttempt = mongoose.model("TestAttempt")
  const Test = mongoose.model("Test")

  try {
    console.log("🔄 Updating leaderboard for test:", testId)

    // Get test details
    const test = await Test.findById(testId)
    if (!test) {
      throw new Error("Test not found")
    }

    // Get all completed attempts
    const allAttempts = await TestAttempt.find({
      test: testId,
      status: { $in: ["completed", "auto-submitted"] },
    })
      .populate("student", "name email class batch")
      .sort({ createdAt: -1 })

    // Group by student and keep only latest attempt
    const studentLatestAttempts = new Map()
    allAttempts.forEach((attempt) => {
      const studentId = attempt.student._id.toString()
      const existing = studentLatestAttempts.get(studentId)
      if (!existing || new Date(attempt.createdAt) > new Date(existing.createdAt)) {
        studentLatestAttempts.set(studentId, attempt)
      }
    })

    const uniqueAttempts = Array.from(studentLatestAttempts.values())

    // Calculate subject-wise scores and prepare leaderboard data
    const leaderboardEntries = uniqueAttempts.map((attempt) => {
      const subjectScores = this.calculateSubjectScores(attempt, test)

      return {
        student: attempt.student._id,
        attempt: attempt._id,
        score: attempt.score,
        timeSpent: attempt.timeSpent || 0,
        subjectScores,
        submittedAt: attempt.endTime || attempt.updatedAt,
      }
    })

    // Sort by score (desc) then by time (asc)
    leaderboardEntries.sort((a, b) => {
      if (b.score.obtained !== a.score.obtained) {
        return b.score.obtained - a.score.obtained
      }
      return a.timeSpent - b.timeSpent
    })

    // Calculate ranks and percentiles
    const rankedEntries = leaderboardEntries.map((entry, index) => {
      const rank = index + 1
      const totalStudents = leaderboardEntries.length

      // Calculate JEE percentile
      const studentsWithLowerOrEqualScore = leaderboardEntries.filter(
        (other) => other.score.obtained <= entry.score.obtained,
      ).length
      const percentile = totalStudents > 0 ? (studentsWithLowerOrEqualScore / totalStudents) * 100 : 0

      return {
        ...entry,
        rank,
        percentile: Math.round(percentile * 100) / 100,
      }
    })

    // Calculate statistics
    const stats = {
      totalStudents: rankedEntries.length,
      averageScore:
        rankedEntries.length > 0
          ? rankedEntries.reduce((sum, entry) => sum + entry.score.obtained, 0) / rankedEntries.length
          : 0,
      topScore: rankedEntries.length > 0 ? rankedEntries[0].score.obtained : 0,
      averageTime:
        rankedEntries.length > 0
          ? rankedEntries.reduce((sum, entry) => sum + entry.timeSpent, 0) / rankedEntries.length
          : 0,
    }

    // Update or create leaderboard document
    await this.findOneAndUpdate(
      { test: testId },
      {
        leaderboardData: rankedEntries,
        ...stats,
        lastUpdated: new Date(),
        isStale: false,
      },
      { upsert: true, new: true },
    )

    console.log("✅ Leaderboard updated successfully:", {
      testId,
      totalStudents: stats.totalStudents,
      averageScore: stats.averageScore.toFixed(2),
    })

    return rankedEntries
  } catch (error) {
    console.error("❌ Error updating leaderboard:", error)
    throw error
  }
}

// Static method to calculate subject scores
TestLeaderboardSchema.statics.calculateSubjectScores = (attempt, test) => {
  const subjectScores = {
    physics: { score: 0, total: 0, percentage: 0, correct: 0, incorrect: 0, unattempted: 0 },
    chemistry: { score: 0, total: 0, percentage: 0, correct: 0, incorrect: 0, unattempted: 0 },
    mathematics: { score: 0, total: 0, percentage: 0, correct: 0, incorrect: 0, unattempted: 0 },
  }

  if (!attempt.answers || !test.questions) {
    return subjectScores
  }

  test.questions.forEach((question, index) => {
    const subject = question.subject?.toLowerCase() || "physics"
    const answer = attempt.answers[index]
    const questionMarks = question.marks?.positive || 4
    const negativeMark = question.marks?.negative || -1

    if (subjectScores[subject]) {
      subjectScores[subject].total += questionMarks

      if (!answer || (answer.selectedAnswer === null && answer.numericalAnswer === null)) {
        subjectScores[subject].unattempted++
      } else if (answer.isCorrect) {
        subjectScores[subject].correct++
        subjectScores[subject].score += questionMarks
      } else {
        subjectScores[subject].incorrect++
        subjectScores[subject].score += negativeMark
      }
    }
  })

  // Calculate percentages
  Object.keys(subjectScores).forEach((subject) => {
    const data = subjectScores[subject]
    if (data.total > 0) {
      data.percentage = Math.round((data.score / data.total) * 100 * 100) / 100
    }
  })

  return subjectScores
}

export default mongoose.models.TestLeaderboard || mongoose.model("TestLeaderboard", TestLeaderboardSchema)
