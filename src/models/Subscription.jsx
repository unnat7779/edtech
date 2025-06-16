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
      enum: ["mentorship", "doubt-solving", "personal-mentor"],
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
      enum: ["basic", "premium", "pro"],
      default: "basic",
    },
    benefits: [String],
    restrictions: [String],
  },
  {
    timestamps: true,
  },
)

// Pre-defined subscription plans
SubscriptionSchema.statics.getDefaultPlans = () => [
  {
    name: "Basic Mentorship",
    type: "mentorship",
    description: "Get guidance from experienced mentors",
    features: ["Weekly mentor sessions", "Study plan guidance", "Progress tracking"],
    price: 550,
    duration: { months: 1 },
    category: "basic",
  },
  {
    name: "Premium Mentorship",
    type: "mentorship",
    description: "Comprehensive mentorship program",
    features: ["Weekly mentor sessions", "Study plan guidance", "Progress tracking", "Priority support"],
    price: 1500,
    duration: { months: 3 },
    category: "premium",
  },
  {
    name: "Basic Doubt Solving",
    type: "doubt-solving",
    description: "Get your doubts resolved quickly",
    features: ["24/7 doubt support", "Text-based solutions", "Community access"],
    price: 550,
    duration: { months: 1 },
    category: "basic",
  },
  {
    name: "Personal Mentor - Monthly",
    type: "personal-mentor",
    description: "One-on-one live doubt solving sessions",
    features: ["Live video sessions", "Personal mentor", "Instant doubt resolution", "Study materials"],
    price: 4499,
    duration: { months: 1 },
    category: "pro",
  },
  {
    name: "Personal Mentor - Quarterly",
    type: "personal-mentor",
    description: "Extended personal mentorship program",
    features: [
      "Live video sessions",
      "Personal mentor",
      "Instant doubt resolution",
      "Study materials",
      "Progress reports",
    ],
    price: 10999,
    duration: { months: 3 },
    category: "pro",
  },
]

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema)
