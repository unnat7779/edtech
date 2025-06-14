import mongoose from "mongoose"

const BookmarkSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
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
    questionData: {
      questionText: String,
      subject: String,
      chapter: String,
      difficulty: String,
      questionType: String,
      options: [String],
      correctAnswer: mongoose.Schema.Types.Mixed,
      explanation: String,
      solution: String,
    },
    notes: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure one bookmark per question per student
BookmarkSchema.index({ student: 1, questionId: 1 }, { unique: true })

// Index for efficient queries
BookmarkSchema.index({ student: 1, testId: 1 })
BookmarkSchema.index({ student: 1, "questionData.subject": 1 })

export default mongoose.models.Bookmark || mongoose.model("Bookmark", BookmarkSchema)
