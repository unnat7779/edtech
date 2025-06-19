import mongoose from "mongoose"

const UserInterestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    interestedInPaidSubscription: {
      type: Boolean,
      default: null,
    },
    interestLevel: {
      type: String,
      enum: [
        "very-high",
        "high",
        "medium",
        "low",
        "very_interested",
        "somewhat_interested",
        "maybe_later",
        "not_interested",
      ],
      default: null,
    },
    preferredSubscription: {
      type: String,
      enum: [
        "mentorship-silver",
        "mentorship-gold",
        "doubt-chat",
        "doubt-live",
        "mentorship_silver",
        "mentorship_gold",
        "doubt_chat_support",
        "doubt_live_support",
      ],
      default: null,
    },
    contactPreference: {
      type: String,
      enum: ["whatsapp", "email", "phone", "no_contact"],
      default: "whatsapp",
    },
    notes: {
      type: String,
      default: "",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes (removed duplicate user index)
UserInterestSchema.index({ interestedInPaidSubscription: 1 })
UserInterestSchema.index({ interestLevel: 1 })
UserInterestSchema.index({ followUpDate: 1 })

export default mongoose.models.UserInterest || mongoose.model("UserInterest", UserInterestSchema)
