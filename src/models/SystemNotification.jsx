import mongoose from "mongoose"

// Delete the model if it exists to force re-registration
if (mongoose.models.SystemNotification) {
  delete mongoose.models.SystemNotification
}

const SystemNotificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: false, // Explicitly not required
      unique: false, // Remove unique constraint temporarily
      sparse: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["announcement", "admin-reply", "system", "alert"],
      default: "announcement",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    targetAudience: {
      type: String,
      enum: ["all", "registered", "premium", "non-premium", "specific"],
      default: "all",
    },
    specificStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readCount: {
      type: Number,
      default: 0,
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Only add essential indexes (no duplicate notificationId index)
SystemNotificationSchema.index({ type: 1, isActive: 1 })
SystemNotificationSchema.index({ targetAudience: 1, isActive: 1 })
SystemNotificationSchema.index({ createdAt: -1 })

// Virtual for read percentage
SystemNotificationSchema.virtual("readPercentage").get(function () {
  if (this.totalRecipients === 0) return 0
  return Math.round((this.readCount / this.totalRecipients) * 100)
})

// Pre-save middleware to generate notificationId if needed
SystemNotificationSchema.pre("save", function (next) {
  if (!this.notificationId) {
    this.notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  next()
})

const SystemNotification = mongoose.model("SystemNotification", SystemNotificationSchema)

export default SystemNotification
