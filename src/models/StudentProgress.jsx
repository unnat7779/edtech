import mongoose from "mongoose"

const StudentProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
      index: true,
    },

    // Progress tracking for this specific test
    attempts: [
      {
        attemptId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TestAttempt",
          required: true,
        },
        attemptNumber: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        score: {
          obtained: Number,
          total: Number,
          percentage: Number,
        },
        timeSpent: {
          type: Number,
          default: 0,
        },
        improvement: {
          scoreChange: { type: Number, default: 0 },
          percentageChange: { type: Number, default: 0 },
          type: {
            type: String,
            enum: ["positive", "negative", "same", "none"],
            default: "none",
          },
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
        analysis: {
          correct: { type: Number, default: 0 },
          incorrect: { type: Number, default: 0 },
          unattempted: { type: Number, default: 0 },
        },
      },
    ],

    // Overall progress metrics for this test
    progressMetrics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      bestScore: {
        obtained: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        attemptNumber: { type: Number, default: 0 },
      },
      worstScore: {
        obtained: { type: Number, default: 0 },
        percentage: { type: Number, default: 100 },
        attemptNumber: { type: Number, default: 0 },
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      overallImprovement: {
        type: Number,
        default: 0,
      },
      latestImprovement: {
        type: Number,
        default: 0,
      },
      trend: {
        type: String,
        enum: ["improving", "declining", "stable", "insufficient_data"],
        default: "insufficient_data",
      },
      consistencyScore: {
        type: Number,
        default: 0,
      },
    },

    // Time-based analytics
    timeAnalytics: {
      totalTimeSpent: {
        type: Number,
        default: 0,
      },
      averageTimePerAttempt: {
        type: Number,
        default: 0,
      },
      fastestAttempt: {
        time: { type: Number, default: 0 },
        attemptNumber: { type: Number, default: 0 },
      },
      slowestAttempt: {
        time: { type: Number, default: 0 },
        attemptNumber: { type: Number, default: 0 },
      },
    },

    // Last updated timestamp
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes for better query performance
StudentProgressSchema.index({ student: 1, test: 1 }, { unique: true })
StudentProgressSchema.index({ student: 1, lastUpdated: -1 })
StudentProgressSchema.index({ test: 1, "progressMetrics.bestScore.percentage": -1 })

// Static method to update progress
StudentProgressSchema.statics.updateProgress = async function (studentId, testId, attemptData) {
  try {
    console.log("📈 Updating student progress:", { studentId, testId })

    let progress = await this.findOne({ student: studentId, test: testId })

    if (!progress) {
      progress = new this({
        student: studentId,
        test: testId,
        attempts: [],
        progressMetrics: {
          totalAttempts: 0,
          bestScore: { obtained: 0, percentage: 0, attemptNumber: 0 },
          worstScore: { obtained: 0, percentage: 100, attemptNumber: 0 },
          averageScore: 0,
          overallImprovement: 0,
          latestImprovement: 0,
          trend: "insufficient_data",
          consistencyScore: 0,
        },
        timeAnalytics: {
          totalTimeSpent: 0,
          averageTimePerAttempt: 0,
          fastestAttempt: { time: 0, attemptNumber: 0 },
          slowestAttempt: { time: 0, attemptNumber: 0 },
        },
      })
    }

    // Add new attempt
    const attemptNumber = progress.attempts.length + 1
    const newAttempt = {
      attemptId: attemptData._id,
      attemptNumber,
      date: attemptData.endTime || attemptData.updatedAt,
      score: attemptData.score,
      timeSpent: attemptData.timeSpent || 0,
      improvement: {
        scoreChange: 0,
        percentageChange: 0,
        type: "none",
      },
      subjectScores: attemptData.subjectScores || {},
      analysis: attemptData.analysis || {},
    }

    // Calculate improvement from previous attempt
    if (progress.attempts.length > 0) {
      const previousAttempt = progress.attempts[progress.attempts.length - 1]
      newAttempt.improvement.scoreChange = attemptData.score.obtained - previousAttempt.score.obtained
      newAttempt.improvement.percentageChange = attemptData.score.percentage - previousAttempt.score.percentage

      if (newAttempt.improvement.percentageChange > 0) {
        newAttempt.improvement.type = "positive"
      } else if (newAttempt.improvement.percentageChange < 0) {
        newAttempt.improvement.type = "negative"
      } else {
        newAttempt.improvement.type = "same"
      }
    }

    progress.attempts.push(newAttempt)

    // Update progress metrics
    progress.progressMetrics.totalAttempts = progress.attempts.length

    // Update best score
    if (attemptData.score.percentage > progress.progressMetrics.bestScore.percentage) {
      progress.progressMetrics.bestScore = {
        obtained: attemptData.score.obtained,
        percentage: attemptData.score.percentage,
        attemptNumber,
      }
    }

    // Update worst score
    if (attemptData.score.percentage < progress.progressMetrics.worstScore.percentage) {
      progress.progressMetrics.worstScore = {
        obtained: attemptData.score.obtained,
        percentage: attemptData.score.percentage,
        attemptNumber,
      }
    }

    // Calculate average score
    const totalPercentage = progress.attempts.reduce((sum, attempt) => sum + attempt.score.percentage, 0)
    progress.progressMetrics.averageScore = totalPercentage / progress.attempts.length

    // Calculate overall improvement
    if (progress.attempts.length > 1) {
      const firstAttempt = progress.attempts[0]
      const lastAttempt = progress.attempts[progress.attempts.length - 1]
      progress.progressMetrics.overallImprovement = lastAttempt.score.percentage - firstAttempt.score.percentage
      progress.progressMetrics.latestImprovement = newAttempt.improvement.percentageChange

      // Determine trend
      if (progress.attempts.length >= 3) {
        const recentAttempts = progress.attempts.slice(-3)
        const improvements = recentAttempts
          .slice(1)
          .map((attempt, index) => attempt.score.percentage - recentAttempts[index].score.percentage)
        const avgImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length

        if (avgImprovement > 2) {
          progress.progressMetrics.trend = "improving"
        } else if (avgImprovement < -2) {
          progress.progressMetrics.trend = "declining"
        } else {
          progress.progressMetrics.trend = "stable"
        }
      }

      // Calculate consistency score (lower variance = higher consistency)
      const scores = progress.attempts.map((attempt) => attempt.score.percentage)
      const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
      progress.progressMetrics.consistencyScore = Math.max(0, 100 - Math.sqrt(variance))
    }

    // Update time analytics
    progress.timeAnalytics.totalTimeSpent += attemptData.timeSpent || 0
    progress.timeAnalytics.averageTimePerAttempt = progress.timeAnalytics.totalTimeSpent / progress.attempts.length

    // Update fastest/slowest attempts
    const currentTime = attemptData.timeSpent || 0
    if (progress.timeAnalytics.fastestAttempt.time === 0 || currentTime < progress.timeAnalytics.fastestAttempt.time) {
      progress.timeAnalytics.fastestAttempt = { time: currentTime, attemptNumber }
    }
    if (currentTime > progress.timeAnalytics.slowestAttempt.time) {
      progress.timeAnalytics.slowestAttempt = { time: currentTime, attemptNumber }
    }

    progress.lastUpdated = new Date()
    await progress.save()

    console.log("✅ Student progress updated successfully")
    return progress
  } catch (error) {
    console.error("❌ Error updating student progress:", error)
    throw error
  }
}

export default mongoose.models.StudentProgress || mongoose.model("StudentProgress", StudentProgressSchema)
