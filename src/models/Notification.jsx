import mongoose from "mongoose"

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    type: {
      type: String,
      enum: ["feedback", "test", "system", "admin", "general"],
      default: "system",
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      // URL to navigate to when notification is clicked
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Can reference any model (Test, Feedback, etc.)
    },
    relatedModel: {
      type: String,
      // Name of the model being referenced (e.g., "Test", "Feedback")
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      // Additional data specific to notification type
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for faster queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

// Clear any existing model to avoid conflicts
if (mongoose.models.Notification) {
  delete mongoose.models.Notification
}

// Create the model
const Notification = mongoose.model("Notification", NotificationSchema)

export default Notification
