import mongoose from "mongoose"

const TestAnalyticsSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
      unique: true,
    },

    // Basic Statistics
    totalAttempts: {
      type: Number,
      default: 0,
    },
    completedAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    medianScore: {
      type: Number,
      default: 0,
    },
    topScore: {
      type: Number,
      default: 0,
    },
    lowestScore: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    averageTime: {
      type: Number,
      default: 0,
    },

    // Score Distribution
    scoreDistribution: [
      {
        range: String,
        count: Number,
        percentage: Number,
      },
    ],

    // Subject-wise Performance
    subjectPerformance: [
      {
        subject: String,
        averageScore: Number,
        accuracy: Number,
        attemptRate: Number,
        averageTime: Number,
        totalQuestions: Number,
        difficultyRating: Number,
      },
    ],

    // Question Analytics
    questionAnalytics: [
      {
        questionIndex: Number,
        questionId: mongoose.Schema.Types.ObjectId,
        accuracy: Number,
        averageTime: Number,
        discriminationIndex: Number,
        difficultyIndex: Number,
        totalAttempts: Number,
        correctAnswers: Number,
        commonWrongAnswers: [
          {
            option: Number,
            count: Number,
            percentage: Number,
          },
        ],
      },
    ],

    // Time Analytics
    timeAnalytics: {
      averageTimePerQuestion: Number,
      timeDistribution: [
        {
          timeRange: String,
          count: Number,
          averageScore: Number,
          percentage: Number,
        },
      ],
      timeEfficiencyCorrelation: Number,
    },

    // Difficulty Analysis
    difficultyAnalysis: [
      {
        difficulty: String,
        totalQuestions: Number,
        accuracy: Number,
        averageTime: Number,
        attemptRate: Number,
      },
    ],

    // Daily Trends
    dailyTrends: [
      {
        date: Date,
        totalAttempts: Number,
        completedAttempts: Number,
        averageScore: Number,
        completionRate: Number,
      },
    ],

    // Comparative Analytics
    comparativeAnalytics: {
      benchmarkScore: Number,
      percentileRanking: Number,
      similarTestsComparison: [
        {
          testId: mongoose.Schema.Types.ObjectId,
          testTitle: String,
          averageScore: Number,
          totalAttempts: Number,
        },
      ],
    },

    // Advanced Analytics
    advancedMetrics: {
      reliabilityCoefficient: Number,
      standardError: Number,
      itemTotalCorrelation: Number,
      guessCorrection: Number,
      speedAccuracyTradeoff: Number,
    },

    // Insights and Recommendations
    insights: [
      {
        type: {
          type: String,
          enum: ["success", "warning", "alert", "info"],
        },
        title: String,
        description: String,
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        actionRequired: Boolean,
        generatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Performance Flags
    performanceFlags: {
      lowCompletionRate: Boolean,
      highDifficultyVariance: Boolean,
      timeManagementIssues: Boolean,
      suspiciousPatterns: Boolean,
      outlierDetection: Boolean,
    },

    // Last Updated
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
    calculationVersion: {
      type: String,
      default: "1.0",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
TestAnalyticsSchema.index({ test: 1 })
TestAnalyticsSchema.index({ lastCalculated: -1 })
TestAnalyticsSchema.index({ "insights.type": 1 })
TestAnalyticsSchema.index({ "performanceFlags.lowCompletionRate": 1 })

export default mongoose.models.TestAnalytics || mongoose.model("TestAnalytics", TestAnalyticsSchema)
