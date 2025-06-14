import mongoose from "mongoose"

const TestHistorySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestAttempt",
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
    },
    score: {
      obtained: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    subjectWiseScores: [
      {
        subject: {
          type: String,
          required: true,
        },
        obtained: {
          type: Number,
          default: 0,
        },
        total: {
          type: Number,
          required: true,
        },
        percentage: {
          type: Number,
          default: 0,
        },
        correct: {
          type: Number,
          default: 0,
        },
        incorrect: {
          type: Number,
          default: 0,
        },
        unattempted: {
          type: Number,
          default: 0,
        },
      },
    ],
    timeSpent: {
      type: Number,
      default: 0, // in seconds
    },
    completionStatus: {
      type: String,
      enum: ["completed", "auto-submitted", "abandoned"],
      default: "completed",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    rank: {
      type: Number,
      default: 0,
    },
    percentile: {
      type: Number,
      default: 0,
    },
    improvement: {
      scoreChange: {
        type: Number,
        default: 0,
      },
      percentageChange: {
        type: Number,
        default: 0,
      },
      rankChange: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient queries
TestHistorySchema.index({ student: 1, test: 1, attemptNumber: 1 })
TestHistorySchema.index({ student: 1, createdAt: -1 })

export default mongoose.models.TestHistory || mongoose.model("TestHistory", TestHistorySchema)
