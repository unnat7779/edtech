import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema({
  plan: { type: String, default: "Premium Plan" },
  planName: { type: String, default: "Premium Plan" }, // Full descriptive plan name
  type: { type: String }, // mentorship, chat-doubt-solving, live-doubt-solving
  category: { type: String }, // silver, gold, premium
  planTier: { type: String }, // basic, premium, pro, enterprise
  status: {
    type: String,
    enum: ["active", "expired", "cancelled", "pending"],
    default: "active",
  },
  startDate: { type: Date },
  endDate: { type: Date },
  amount: { type: Number, default: 0 },
  paymentId: { type: String, default: null },
  duration: {
    months: { type: Number, default: 0 },
    days: { type: Number, default: 0 },
  },
  autoRenew: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },

  // Premium subscription fields
  isPremium: { type: Boolean, default: false },
  premiumTier: {
    type: String,
    enum: ["basic", "premium", "pro", "enterprise"],
    default: "basic",
  },

  // Current active subscription
  currentSubscription: subscriptionSchema,

  // Subscription history
  subscriptionHistory: [subscriptionSchema],

  // Profile fields
  phone: String,
  dateOfBirth: Date,
  grade: String,
  school: String,
  city: String,
  state: String,
  interests: [String],
  avatar: String,

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.models.User || mongoose.model("User", userSchema)
