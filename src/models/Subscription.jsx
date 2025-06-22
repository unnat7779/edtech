import mongoose from "mongoose"

const SubscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["mentorship", "chat-doubt-solving", "live-doubt-solving"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: [String],
    price: {
      type: Number,
      required: true,
    },
    duration: {
      months: {
        type: Number,
        required: true,
      },
      days: {
        type: Number,
        default: function () {
          return this.months * 30
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    maxStudents: {
      type: Number,
      // For limited subscriptions
    },
    category: {
      type: String,
      enum: ["silver", "gold", "premium"],
      default: "premium",
    },
    benefits: [String],
    restrictions: [String],
    planTier: {
      type: String,
      enum: ["SILVER PLAN", "GOLD PLAN", "PREMIUM PLAN"],
    },
    supportMode: {
      type: String,
      enum: ["chat", "live", "both"],
      default: "both",
    },
  },
  {
    timestamps: true,
  },
)

// Pre-defined subscription plans
SubscriptionSchema.statics.getDefaultPlans = () => [
  {
    name: "1:1 Mentorship - Silver Plan",
    type: "mentorship",
    description: "3 Months Plan with IITian mentorship",
    features: [
      "Customized study plan",
      "24/7 call & chat support",
      "Bi-Weekly deep strategy analysis",
      "Help in test analysis",
    ],
    price: 2000,
    duration: { months: 3 },
    category: "silver",
    planTier: "SILVER PLAN",
    supportMode: "both",
  },
  {
    name: "1:1 Mentorship - Gold Plan",
    type: "mentorship",
    description: "6 Months Plan with IITian mentorship",
    features: [
      "Customized study plan",
      "Bi-Weekly deep strategy analysis",
      "Help in test analysis",
      "Extended 6-month support",
    ],
    price: 3500,
    duration: { months: 6 },
    category: "gold",
    planTier: "GOLD PLAN",
    supportMode: "both",
  },
  {
    name: "PCM Chat Doubt Support",
    type: "chat-doubt-solving",
    description: "IITian doubt experts help through WhatsApp/Telegram",
    features: [
      "IITian doubt experts",
      "WhatsApp/Telegram support",
      "Doubts solved within 10 minutes",
      "PCM subject coverage",
    ],
    price: 1500,
    duration: { months: 3 },
    category: "premium",
    planTier: "PREMIUM PLAN",
    supportMode: "chat",
  },
  {
    name: "PCM Live 1:1 Doubt Support",
    type: "live-doubt-solving",
    description: "IITian with under 1500 rank on live VC daily",
    features: [
      "IITian with under 1500 rank",
      "Daily live video calls",
      "Real-time doubt solving",
      "JEE guidance and mentoring",
      "Personalized attention",
    ],
    price: 4499,
    duration: { months: 1 },
    category: "premium",
    planTier: "PREMIUM PLAN",
    supportMode: "live",
  },
]

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema)
