import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    whatsappNo: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
      enum: ["9", "10", "11", "12", "Dropper"],
    },
    role: {
      type: String,
      enum: ["student", "admin", "teacher"],
      default: "student",
    },
    // Registration and subscription status
    isRegistered: {
      type: Boolean,
      default: true, // True when user completes registration
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    // Current subscription status
    currentSubscription: {
      subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
      },
      status: {
        type: String,
        enum: ["active", "cancelled", "expired", "none"],
        default: "none",
      },
      startDate: Date,
      endDate: Date,
      autoRenew: {
        type: Boolean,
        default: false,
      },
      paymentId: String,
      amount: Number,
    },
    // Subscription history
    subscriptionHistory: [
      {
        subscriptionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subscription",
        },
        status: {
          type: String,
          enum: ["active", "cancelled", "expired", "completed"],
        },
        startDate: Date,
        endDate: Date,
        amount: Number,
        paymentId: String,
        cancelledAt: Date,
        cancelReason: String,
      },
    ],
    // Premium status (derived from subscription)
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumTier: {
      type: String,
      enum: ["none", "basic", "premium", "pro"],
      default: "none",
    },
    enrolledInCoaching: {
      type: Boolean,
      default: false,
    },
    coachingName: {
      type: String,
      default: "",
    },
    profile: {
      avatar: String,
      dateOfBirth: Date,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    testStats: {
      totalTests: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      bestScore: {
        type: Number,
        default: 0,
      },
      totalTimeSpent: {
        type: Number,
        default: 0,
      },
    },
    // Notification preferences
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      announcements: {
        type: Boolean,
        default: true,
      },
      feedbackReplies: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Method to check if user has active subscription
UserSchema.methods.hasActiveSubscription = function () {
  return this.currentSubscription.status === "active" && new Date() < new Date(this.currentSubscription.endDate)
}

// Method to get subscription category
UserSchema.methods.getSubscriptionCategory = function () {
  if (!this.hasActiveSubscription()) return "none"
  return this.premiumTier
}

// Method to check if user is premium
UserSchema.methods.checkPremiumStatus = function () {
  const hasActive = this.hasActiveSubscription()
  this.isPremium = hasActive
  if (hasActive) {
    // Set premium tier based on subscription
    const subscription = this.currentSubscription
    if (subscription.amount >= 4000) {
      this.premiumTier = "pro"
    } else if (subscription.amount >= 1000) {
      this.premiumTier = "premium"
    } else {
      this.premiumTier = "basic"
    }
  } else {
    this.premiumTier = "none"
    this.isPremium = false
  }
  return this.isPremium
}

// Pre-save hook to update premium status
UserSchema.pre("save", function (next) {
  this.checkPremiumStatus()
  next()
})

// Static method to get users by subscription status
UserSchema.statics.getUsersBySubscriptionStatus = function (status) {
  const query = {}
  switch (status) {
    case "all":
      query.isRegistered = true
      break
    case "registered":
      query.isRegistered = true
      break
    case "premium":
      query.isPremium = true
      query["currentSubscription.status"] = "active"
      break
    case "non-premium":
      query.isRegistered = true
      query.$or = [{ isPremium: false }, { "currentSubscription.status": { $ne: "active" } }]
      break
  }
  return this.find(query)
}

export default mongoose.models.User || mongoose.model("User", UserSchema)
