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
      default: null, // null = not asked, true = interested, false = not interested
    },
    interestLevel: {
      type: String,
      enum: ["very_interested", "somewhat_interested", "not_interested", "maybe_later"],
      default: null,
    },
    preferredSubscriptionType: {
      type: String,
      enum: ["basic", "premium", "pro"],
      default: null,
    },
    budgetRange: {
      type: String,
      enum: ["under_500", "500_1000", "1000_2000", "2000_plus"],
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
    followUpStatus: {
      type: String,
      enum: ["pending", "contacted", "converted", "not_interested"],
      default: "pending",
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

export default mongoose.models.UserInterest || mongoose.model("UserInterest", UserInterestSchema)
