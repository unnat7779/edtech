import mongoose from "mongoose"

const StudentProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testAttempts: [
      {
        testId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Test",
          required: true,
        },
        attemptId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TestAttempt",
          required: true,
        },
        testTitle: String,
        subject: String,
        score: {
          obtained: Number,
          total: Number,
          percentage: Number,
        },
        timeSpent: Number, // in seconds
        attemptNumber: {
          type: Number,
          default: 1,
        },
        isRetake: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        subjectBreakdown: {
          Physics: {
            obtained: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 },
          },
          Chemistry: {
            obtained: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 },
          },
          Mathematics: {
            obtained: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 },
          },
        },
      },
    ],
    overallStats: {
      totalTests: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      bestScore: {
        type: Number,
        default: 0,
      },
      improvementRate: {
        type: Number,
        default: 0,
      },
      totalTimeSpent: {
        type: Number,
        default: 0,
      },
      subjectAverages: {
        Physics: { type: Number, default: 0 },
        Chemistry: { type: Number, default: 0 },
        Mathematics: { type: Number, default: 0 },
      },
    },
    learningTrends: [
      {
        date: Date,
        score: Number,
        subject: String,
        improvementFromPrevious: Number,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
StudentProgressSchema.index({ userId: 1 })
StudentProgressSchema.index({ "testAttempts.testId": 1 })
StudentProgressSchema.index({ "testAttempts.completedAt": -1 })

// Method to add a new test attempt
StudentProgressSchema.methods.addTestAttempt = function (attemptData) {
  // Validate required data
  if (!attemptData.testId || !attemptData.score) {
    console.error("Invalid attempt data:", attemptData)
    return Promise.resolve(this)
  }

  // Check if this is a retake
  const existingAttempts = this.testAttempts.filter(
    (attempt) => attempt.testId.toString() === attemptData.testId.toString(),
  )
  const attemptNumber = existingAttempts.length + 1
  const isRetake = attemptNumber > 1

  // Ensure score has percentage
  const score = {
    obtained: attemptData.score.obtained || 0,
    total: attemptData.score.total || 0,
    percentage:
      attemptData.score.percentage ||
      (attemptData.score.total > 0 ? (attemptData.score.obtained / attemptData.score.total) * 100 : 0),
  }

  // Add the new attempt
  this.testAttempts.push({
    ...attemptData,
    score,
    attemptNumber,
    isRetake,
    completedAt: attemptData.completedAt || new Date(),
  })

  // Update overall stats
  this.updateOverallStats()

  return this.save()
}

// Method to update overall statistics
StudentProgressSchema.methods.updateOverallStats = function () {
  const attempts = this.testAttempts
  if (attempts.length === 0) {
    this.overallStats = {
      totalTests: 0,
      averageScore: 0,
      bestScore: 0,
      improvementRate: 0,
      totalTimeSpent: 0,
      subjectAverages: { Physics: 0, Chemistry: 0, Mathematics: 0 },
    }
    return
  }

  // Calculate overall stats
  const totalTests = attempts.length
  const scores = attempts.map((attempt) => attempt.score.percentage || 0).filter((score) => score >= 0)
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0
  const totalTimeSpent = attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0)

  // Calculate improvement rate (comparing last 5 attempts with previous 5)
  let improvementRate = 0
  if (attempts.length >= 10) {
    const recent5 = attempts.slice(-5).map((a) => a.score.percentage || 0)
    const previous5 = attempts.slice(-10, -5).map((a) => a.score.percentage || 0)
    const recentAvg = recent5.reduce((sum, score) => sum + score, 0) / recent5.length
    const previousAvg = previous5.reduce((sum, score) => sum + score, 0) / previous5.length
    if (previousAvg > 0) {
      improvementRate = ((recentAvg - previousAvg) / previousAvg) * 100
    }
  }

  // Calculate subject averages
  const subjectAverages = { Physics: 0, Chemistry: 0, Mathematics: 0 }
  const subjectCounts = { Physics: 0, Chemistry: 0, Mathematics: 0 }

  attempts.forEach((attempt) => {
    if (attempt.subjectBreakdown) {
      Object.keys(subjectAverages).forEach((subject) => {
        if (attempt.subjectBreakdown[subject] && attempt.subjectBreakdown[subject].total > 0) {
          subjectAverages[subject] += attempt.subjectBreakdown[subject].percentage || 0
          subjectCounts[subject]++
        }
      })
    }
  })

  Object.keys(subjectAverages).forEach((subject) => {
    if (subjectCounts[subject] > 0) {
      subjectAverages[subject] = subjectAverages[subject] / subjectCounts[subject]
    }
  })

  // Update the overall stats
  this.overallStats = {
    totalTests,
    averageScore,
    bestScore,
    improvementRate,
    totalTimeSpent,
    subjectAverages,
  }

  this.lastUpdated = new Date()
}

// Static method to get or create progress for a user
StudentProgressSchema.statics.getOrCreateProgress = async function (userId) {
  let progress = await this.findOne({ userId })
  if (!progress) {
    progress = new this({ userId })
    await progress.save()
  }
  return progress
}

export default mongoose.models.StudentProgress || mongoose.model("StudentProgress", StudentProgressSchema)
