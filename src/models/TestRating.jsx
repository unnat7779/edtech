import mongoose from "mongoose"

const TestRatingSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      difficulty: {
        type: String,
        enum: ["Too Easy", "Easy", "Just Right", "Hard", "Too Hard"],
        required: true,
      },
      quality: {
        type: String,
        enum: ["Poor", "Fair", "Good", "Very Good", "Excellent"],
        required: true,
      },
      comments: {
        type: String,
        maxlength: 500,
        default: "",
      },
    },
    categories: {
      questionQuality: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      difficulty: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      timeAllocation: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      overallExperience: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure one rating per student per test
TestRatingSchema.index({ test: 1, student: 1 }, { unique: true })

export default mongoose.models.TestRating || mongoose.model("TestRating", TestRatingSchema)
