import mongoose from "mongoose"

const UserSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planName: {
      type: String,
      required: true,
      enum: [
        "1:1 Mentorship - Silver Plan",
        "1:1 Mentorship - Gold Plan",
        "PCM Chat Doubt Support",
        "PCM Live 1:1 Doubt Support",
      ],
    },
    planType: {
      type: String,
      enum: ["mentorship", "chat-doubt-solving", "live-doubt-solving"],
      required: true,
    },
    planCategory: {
      type: String,
      enum: ["silver", "gold", "premium"],
      required: true,
    },
    planTier: {
      type: String,
      enum: ["SILVER PLAN", "GOLD PLAN", "PREMIUM PLAN"],
      required: true,
    },
    paidAmount: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    duration: {
      months: {
        type: Number,
        required: true,
      },
      days: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "active",
    },
    paymentId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "paytm", "upi", "bank_transfer"],
      default: "razorpay",
    },
    features: [String],
    autoRenew: {
      type: Boolean,
      default: false,
    },
    renewalAttempts: {
      type: Number,
      default: 0,
    },
    lastRenewalAttempt: Date,
    cancellationReason: String,
    cancelledAt: Date,
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },
    notes: String,
  },
  {
    timestamps: true,
  },
)

// Virtual field to calculate remaining days
UserSubscriptionSchema.virtual("remainingDays").get(function () {
  if (this.status === "expired" || this.status === "cancelled") {
    return 0
  }

  const now = new Date()
  const expiry = new Date(this.expiryDate)
  const diffTime = expiry - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
})

// Virtual field to check if subscription is about to expire (within 7 days)
UserSubscriptionSchema.virtual("isExpiringSoon").get(function () {
  return this.remainingDays <= 7 && this.remainingDays > 0
})

// Virtual field to get subscription progress percentage
UserSubscriptionSchema.virtual("progressPercentage").get(function () {
  const totalDays = this.duration.days
  const remainingDays = this.remainingDays
  const usedDays = totalDays - remainingDays

  return Math.min(100, Math.max(0, (usedDays / totalDays) * 100))
})

// Pre-save middleware to automatically update status based on expiry date
UserSubscriptionSchema.pre("save", function (next) {
  const now = new Date()
  const expiry = new Date(this.expiryDate)

  if (now > expiry && this.status === "active") {
    this.status = "expired"
  }

  next()
})

// Static method to update expired subscriptions
UserSubscriptionSchema.statics.updateExpiredSubscriptions = async function () {
  const now = new Date()

  const result = await this.updateMany(
    {
      expiryDate: { $lt: now },
      status: "active",
    },
    {
      $set: { status: "expired" },
    },
  )

  return result
}

// Static method to get active subscription for a user and plan
UserSubscriptionSchema.statics.getActiveSubscription = async function (userId, planName) {
  return await this.findOne({
    userId,
    planName,
    status: "active",
    expiryDate: { $gt: new Date() },
  })
}

// Static method to get subscription history for a user
UserSubscriptionSchema.statics.getUserSubscriptionHistory = async function (userId) {
  return await this.find({ userId }).sort({ createdAt: -1 }).populate("userId", "name email")
}

// Ensure virtual fields are serialized
UserSubscriptionSchema.set("toJSON", { virtuals: true })
UserSubscriptionSchema.set("toObject", { virtuals: true })

export default mongoose.models.UserSubscription || mongoose.model("UserSubscription", UserSubscriptionSchema)
