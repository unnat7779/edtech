import mongoose from "mongoose"

const StudentAnalyticsSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestAttempt",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    // Performance Metrics
    performance: {
      score: Number,
      percentage: Number,
      rank: Number,
      percentile: Number,
      totalStudents: Number,
      accuracy: Number,
      efficiency: Number,
    },

    // Subject-wise Analysis
    subjectAnalysis: [
      {
        subject: String,
        score: Number,
        totalMarks: Number,
        percentage: Number,
        accuracy: Number,
        timeSpent: Number,
        questionsAttempted: Number,
        questionsCorrect: Number,
        questionsIncorrect: Number,
        questionsUnattempted: Number,
        strengthLevel: {
          type: String,
          enum: ["weak", "average", "strong", "excellent"],
        },
        improvementAreas: [String],
      },
    ],

    // Chapter-wise Performance
    chapterAnalysis: [
      {
        chapter: String,
        subject: String,
        accuracy: Number,
        timeSpent: Number,
        difficulty: String,
        masteryLevel: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        recommendedActions: [String],
      },
    ],

    // Time Management Analysis
    timeAnalysis: {
      totalTime: Number,
      averageTimePerQuestion: Number,
      timeEfficiency: Number,
      fastestQuestion: {
        questionIndex: Number,
        timeSpent: Number,
      },
      slowestQuestion: {
        questionIndex: Number,
        timeSpent: Number,
      },
      timeDistribution: [
        {
          subject: String,
          timeSpent: Number,
          percentage: Number,
        },
      ],
      timeManagementScore: Number,
      recommendations: [String],
    },

    // Question-level Analysis
    questionAnalysis: [
      {
        questionIndex: Number,
        questionId: mongoose.Schema.Types.ObjectId,
        isCorrect: Boolean,
        timeSpent: Number,
        difficulty: String,
        subject: String,
        chapter: String,
        selectedAnswer: Number,
        correctAnswer: Number,
        marksAwarded: Number,
        isBookmarked: Boolean,
        needsReview: Boolean,
        conceptTags: [String],
        errorType: {
          type: String,
          enum: ["conceptual", "calculation", "careless", "time-pressure", "unknown"],
        },
      },
    ],

    // Comparative Analysis
    comparativeAnalysis: {
      peerComparison: {
        averageScore: Number,
        topPercentileScore: Number,
        bottomPercentileScore: Number,
        subjectComparison: [
          {
            subject: String,
            studentScore: Number,
            peerAverage: Number,
            topPercentile: Number,
          },
        ],
      },
      progressTracking: [
        {
          attemptNumber: Number,
          score: Number,
          percentage: Number,
          rank: Number,
          date: Date,
          improvement: Number,
        },
      ],
      trendAnalysis: {
        overallTrend: {
          type: String,
          enum: ["improving", "declining", "stable", "fluctuating"],
        },
        subjectTrends: [
          {
            subject: String,
            trend: String,
            changePercentage: Number,
          },
        ],
      },
    },

    // Strengths and Weaknesses
    strengthsWeaknesses: {
      strengths: [
        {
          area: String,
          description: String,
          evidence: String,
          maintainanceStrategy: String,
        },
      ],
      weaknesses: [
        {
          area: String,
          description: String,
          impact: String,
          improvementStrategy: String,
          priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
          },
        },
      ],
    },

    // Personalized Recommendations
    recommendations: {
      studyPlan: [
        {
          week: Number,
          focus: String,
          tasks: [String],
          estimatedTime: String,
          resources: [
            {
              type: String,
              title: String,
              description: String,
              url: String,
              difficulty: String,
            },
          ],
        },
      ],
      practiceAreas: [
        {
          subject: String,
          chapter: String,
          priority: String,
          recommendedQuestions: Number,
          estimatedTime: String,
        },
      ],
      timeManagementTips: [
        {
          tip: String,
          description: String,
          priority: String,
        },
      ],
      nextSteps: [
        {
          action: String,
          timeline: String,
          expectedOutcome: String,
        },
      ],
    },

    // Learning Patterns
    learningPatterns: {
      preferredSubjects: [String],
      learningStyle: {
        type: String,
        enum: ["visual", "auditory", "kinesthetic", "mixed"],
      },
      peakPerformanceTime: String,
      consistencyScore: Number,
      adaptabilityScore: Number,
      problemSolvingApproach: String,
    },

    // Flags and Alerts
    flags: {
      needsAttention: Boolean,
      significantImprovement: Boolean,
      performanceDecline: Boolean,
      timeManagementIssues: Boolean,
      conceptualGaps: Boolean,
      examReadiness: Boolean,
    },

    // Metadata
    analysisVersion: {
      type: String,
      default: "1.0",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
StudentAnalyticsSchema.index({ student: 1, test: 1 })
StudentAnalyticsSchema.index({ testAttempt: 1 })
StudentAnalyticsSchema.index({ "performance.rank": 1 })
StudentAnalyticsSchema.index({ "performance.percentile": -1 })
StudentAnalyticsSchema.index({ generatedAt: -1 })

export default mongoose.models.StudentAnalytics || mongoose.model("StudentAnalytics", StudentAnalyticsSchema)
