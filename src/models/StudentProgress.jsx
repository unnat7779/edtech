import mongoose from "mongoose"

const TestAttemptProgressSchema = new mongoose.Schema({
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
  testTitle: {
    type: String,
    required: true,
  },
  score: {
    obtained: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1,
  },
  isRetake: {
    type: Boolean,
    default: false,
  },
  timeSpent: {
    type: Number, // in seconds
    required: true,
  },
  completedAt: {
    type: Date,
    required: true,
  },
  subject: {
    type: String,
    enum: ["Physics", "Chemistry", "Mathematics", "All", "All Subjects"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
})

const StudentProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    testAttempts: [TestAttemptProgressSchema],
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
      totalTimeSpent: {
        type: Number,
        default: 0, // in seconds
      },
      improvementRate: {
        type: Number,
        default: 0, // percentage improvement over time
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    subjectWiseProgress: {
      Physics: {
        averageScore: { type: Number, default: 0 },
        bestScore: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 },
        improvementTrend: { type: String, enum: ["improving", "declining", "stable"], default: "stable" },
      },
      Chemistry: {
        averageScore: { type: Number, default: 0 },
        bestScore: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 },
        improvementTrend: { type: String, enum: ["improving", "declining", "stable"], default: "stable" },
      },
      Mathematics: {
        averageScore: { type: Number, default: 0 },
        bestScore: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 },
        improvementTrend: { type: String, enum: ["improving", "declining", "stable"], default: "stable" },
      },
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
StudentProgressSchema.index({ student: 1 })
StudentProgressSchema.index({ "testAttempts.completedAt": -1 })
StudentProgressSchema.index({ "testAttempts.testId": 1 })

export default mongoose.models.StudentProgress || mongoose.model("StudentProgress", StudentProgressSchema)
