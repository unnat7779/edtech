import mongoose from "mongoose"

const StudentStreakSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Daily streak tracking
    dailyStreak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastActiveDate: {
        type: String, // Format: "2024-01-15"
        default: null,
      },
    },

    // Weekly streak tracking
    weeklyStreak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastActiveWeek: {
        type: String, // Format: "2024-01"
        default: null,
      },
    },

    // Activity heatmap data (last 365 days) - using regular object instead of Map
    activityMap: {
      type: Map,
      of: {
        tests: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        subjects: {
          Physics: { type: Number, default: 0 },
          Chemistry: { type: Number, default: 0 },
          Mathematics: { type: Number, default: 0 },
        },
      },
      default: new Map(),
    },

    // Monthly statistics - using array instead of Map
    monthlyStats: [
      {
        month: String, // Format: "2024-01"
        tests: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        subjects: {
          Physics: { type: Number, default: 0 },
          Chemistry: { type: Number, default: 0 },
          Mathematics: { type: Number, default: 0 },
        },
      },
    ],

    // Weekly statistics - using array instead of Map
    weeklyStats: [
      {
        week: String, // Format: "2024-01"
        tests: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        subjects: {
          Physics: { type: Number, default: 0 },
          Chemistry: { type: Number, default: 0 },
          Mathematics: { type: Number, default: 0 },
        },
      },
    ],

    // Overall statistics
    totalTests: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
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

    // Achievements
    achievements: [
      {
        type: String,
        default: [],
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

// Indexes for efficient queries
StudentStreakSchema.index({ student: 1 })
StudentStreakSchema.index({ "dailyStreak.current": -1 })
StudentStreakSchema.index({ "weeklyStreak.current": -1 })
StudentStreakSchema.index({ lastUpdated: -1 })

export default mongoose.models.StudentStreak || mongoose.model("StudentStreak", StudentStreakSchema)
