import mongoose from "mongoose"

const SystemNotificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      enum: ["admin-reply", "announcement"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      // For announcements - detailed description
    },
    images: [
      {
        url: String,
        filename: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // For admin replies
    relatedFeedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
    },
    // For announcements
    targetAudience: {
      type: String,
      enum: ["all", "registered", "premium", "non-premium"],
      default: "all",
    },
    specificStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Read tracking
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalRecipients: {
      type: Number,
      default: 0,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    // Admin who created/sent
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    expiresAt: {
      type: Date,
      // For announcements that should expire
    },
  },
  {
    timestamps: true,
  },
)

// Pre-save hook to generate unique notification ID
SystemNotificationSchema.pre("save", async function (next) {
  if (!this.notificationId) {
    const prefix = this.type === "announcement" ? "ANN" : "REP"
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    this.notificationId = `${prefix}-${timestamp}-${random}`

    // Ensure uniqueness by checking if ID already exists
    let attempts = 0
    while (attempts < 5) {
      const existing = await mongoose.models.SystemNotification.findOne({
        notificationId: this.notificationId,
      })
      if (!existing) break

      // Generate new ID if collision
      const newRandom = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      this.notificationId = `${prefix}-${timestamp}-${newRandom}`
      attempts++
    }
  }
  next()
})

// Virtual for read percentage
SystemNotificationSchema.virtual("readPercentage").get(function () {
  if (this.totalRecipients === 0) return 0
  return Math.round((this.readCount / this.totalRecipients) * 100)
})

// Method to mark as read by user
SystemNotificationSchema.methods.markAsReadBy = async function (userId) {
  const alreadyRead = this.readBy.some((read) => read.userId.toString() === userId.toString())
  if (!alreadyRead) {
    this.readBy.push({ userId, readAt: new Date() })
    this.readCount = this.readBy.length
    await this.save()
  }
  return this
}

// Method to check if read by user
SystemNotificationSchema.methods.isReadBy = function (userId) {
  return this.readBy.some((read) => read.userId.toString() === userId.toString())
}

// Indexes for performance
SystemNotificationSchema.index({ type: 1, isActive: 1, createdAt: -1 })
SystemNotificationSchema.index({ targetAudience: 1, isActive: 1 })
SystemNotificationSchema.index({ "readBy.userId": 1 })
SystemNotificationSchema.index({ createdBy: 1, createdAt: -1 })

export default mongoose.models.SystemNotification || mongoose.model("SystemNotification", SystemNotificationSchema)
