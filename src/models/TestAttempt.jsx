import mongoose from "mongoose"

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedAnswer: {
    type: Number,
    min: 0,
    max: 3,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  timeTaken: {
    type: Number,
    default: 0, // in seconds
  },
  marksAwarded: {
    type: Number,
    default: 0,
  },
})

const TestAttemptSchema = new mongoose.Schema(
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
    answers: [AnswerSchema],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    timeSpent: {
      type: Number,
      default: 0, // in seconds
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "auto-submitted"],
      default: "in-progress",
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
    analysis: {
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
      subjectWise: [
        {
          subject: String,
          correct: Number,
          incorrect: Number,
          unattempted: Number,
          score: Number,
        },
      ],
    },
    rank: {
      type: Number,
      default: 0,
    },
    autoSaveData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.TestAttempt || mongoose.model("TestAttempt", TestAttemptSchema)
