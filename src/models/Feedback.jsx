import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema(
  {
    feedbackId: {
      type: String,
      // Remove all constraints - will be set in pre-save hook
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["bug", "test-issue", "query"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    testName: {
      type: String,
      // Only required for test-issue type
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      // Only for test-issue type
    },
    images: [
      {
        url: String,
        filename: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    adminResponse: {
      message: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
    },
    tags: [String],
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      userAgent: String,
      browserInfo: String,
      deviceInfo: String,
      url: String,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes - only define each index once
feedbackSchema.index({ studentId: 1, createdAt: -1 })
feedbackSchema.index({ type: 1, status: 1 })
feedbackSchema.index({ status: 1, createdAt: -1 })
// Remove the unique index on feedbackId to avoid conflicts during creation
feedbackSchema.index({ feedbackId: 1 })

// Generate unique feedback ID before saving
feedbackSchema.pre("save", async function (next) {
  // Only generate feedbackId for new documents that don't have one
  if (this.isNew && !this.feedbackId) {
    try {
      let attempts = 0
      let feedbackId = null

      // Try to generate a unique ID with retries
      while (attempts < 5) {
        // Get count of existing feedbacks of this type
        const count = await this.constructor.countDocuments({ type: this.type })

        // Create type prefix
        const typePrefix = this.type.toUpperCase().replace("-", "").substring(0, 3)

        // Generate timestamp with some randomness to avoid collisions
        const timestamp = Date.now() + Math.floor(Math.random() * 1000)

        // Generate counter with padding
        const counter = (count + attempts + 1).toString().padStart(4, "0")

        // Format: TYPE-TIMESTAMP-COUNTER (e.g., BUG-1703123456-0001)
        const candidateId = `${typePrefix}-${timestamp}-${counter}`

        // Check if this ID already exists
        const existing = await this.constructor.findOne({ feedbackId: candidateId })

        if (!existing) {
          feedbackId = candidateId
          break
        }

        attempts++
      }

      if (feedbackId) {
        this.feedbackId = feedbackId
        console.log(`Generated feedbackId: ${this.feedbackId}`)
      } else {
        // Ultimate fallback - use ObjectId + timestamp
        const fallbackId = `FB-${this._id.toString().slice(-8)}-${Date.now().toString().slice(-6)}`
        this.feedbackId = fallbackId
        console.log(`Using fallback feedbackId: ${this.feedbackId}`)
      }
    } catch (error) {
      console.error("Error generating feedbackId:", error)
      // Final fallback ID generation
      const emergencyId = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      this.feedbackId = emergencyId
      console.log(`Using emergency feedbackId: ${this.feedbackId}`)
    }
  }
  next()
})

// Virtual for formatted creation date
feedbackSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
})

// Virtual for time since creation
feedbackSchema.virtual("timeAgo").get(function () {
  const now = new Date()
  const diff = now - this.createdAt
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  return "Just now"
})

// Ensure virtual fields are serialized
feedbackSchema.set("toJSON", { virtuals: true })
feedbackSchema.set("toObject", { virtuals: true })

// Clear any existing model to avoid conflicts
if (mongoose.models.Feedback) {
  delete mongoose.models.Feedback
}

export default mongoose.model("Feedback", feedbackSchema)
