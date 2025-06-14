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
  numericalAnswer: {
    type: Number,
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
  // Enhanced time tracking
  timeTracking: {
    firstViewed: {
      type: Date,
    },
    lastViewed: {
      type: Date,
    },
    totalViewTime: {
      type: Number,
      default: 0, // Total time spent viewing this question in seconds
    },
    viewSessions: [
      {
        startTime: Date,
        endTime: Date,
        duration: Number, // in seconds
      },
    ],
    answerTime: {
      type: Date, // When the answer was selected/entered
    },
  },
  // Question state tracking
  questionState: {
    type: String,
    enum: ["not-visited", "visited", "answered", "marked-for-review", "answered-and-marked"],
    default: "not-visited",
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
    // Enhanced session tracking
    sessionData: {
      questionNavigationLog: [
        {
          questionIndex: Number,
          timestamp: Date,
          action: {
            type: String,
            enum: ["view", "answer", "mark", "clear", "navigate-away"],
          },
        },
      ],
      totalActiveTime: {
        type: Number,
        default: 0, // Time when test was actually active/focused
      },
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.TestAttempt || mongoose.model("TestAttempt", TestAttemptSchema)
