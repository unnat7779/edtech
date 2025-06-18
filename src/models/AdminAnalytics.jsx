import mongoose from "mongoose"

// Model to store aggregated analytics data for performance
const AdminAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },

    // Global Metrics
    globalMetrics: {
      totalUsers: { type: Number, default: 0 },
      totalTestAttempts: { type: Number, default: 0 },
      averageTestScore: { type: Number, default: 0 },
      averageTimePerTest: { type: Number, default: 0 }, // in minutes
      dailyActiveUsers: { type: Number, default: 0 },
      weeklyActiveUsers: { type: Number, default: 0 },
      newSignups: { type: Number, default: 0 },
    },

    // User Analytics
    userAnalytics: {
      userTypeBreakdown: {
        new: { type: Number, default: 0 },
        returning: { type: Number, default: 0 },
        premium: { type: Number, default: 0 },
        nonPremium: { type: Number, default: 0 },
      },
      retentionRates: {
        day7: { type: Number, default: 0 },
        day14: { type: Number, default: 0 },
        day30: { type: Number, default: 0 },
      },
      scoreDistribution: {
        range0_50: { type: Number, default: 0 },
        range50_100: { type: Number, default: 0 },
        range100_150: { type: Number, default: 0 },
        range150_200: { type: Number, default: 0 },
        range200_250: { type: Number, default: 0 },
        range250_300: { type: Number, default: 0 },
      },
    },

    // Test Analytics
    testAnalytics: {
      totalTests: { type: Number, default: 0 },
      averageStudentsPerTest: { type: Number, default: 0 },
      testCategoryDistribution: {
        physics: { type: Number, default: 0 },
        chemistry: { type: Number, default: 0 },
        mathematics: { type: Number, default: 0 },
        fullSyllabus: { type: Number, default: 0 },
        chapterWise: { type: Number, default: 0 },
      },
    },

    // Funnel Analytics
    funnelAnalytics: {
      registered: { type: Number, default: 0 },
      firstTest: { type: Number, default: 0 },
      scoreReview: { type: Number, default: 0 },
      nextTest: { type: Number, default: 0 },
    },

    // Raw data for detailed analysis
    rawData: {
      topPerformers: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          name: String,
          averageScore: Number,
          totalAttempts: Number,
        },
      ],
      mostActiveTests: [
        {
          testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
          title: String,
          attemptCount: Number,
          averageScore: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes for efficient querying
AdminAnalyticsSchema.index({ date: -1, type: 1 })
AdminAnalyticsSchema.index({ type: 1, createdAt: -1 })

export default mongoose.models.AdminAnalytics || mongoose.model("AdminAnalytics", AdminAnalyticsSchema)
