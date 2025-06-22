import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    // Academic Information
    whatsappNo: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    class: {
      type: String,
      required: [true, "Class is required"],
      enum: ["11th", "12th", "Dropper"],
    },
    grade: {
      type: String,
      enum: ["11th", "12th", "Dropper"],
    },

    // Coaching Information
    enrolledInCoaching: {
      type: Boolean,
      default: false,
    },
    coachingName: {
      type: String,
      trim: true,
    },

    // Personal Information
    dateOfBirth: {
      type: Date,
    },
    dob: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },

    // Premium Features
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumTier: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      default: "basic",
    },

    // Subscription Management
    currentSubscription: {
      plan: String,
      planName: String,
      type: String,
      category: String,
      planTier: String,
      status: {
        type: String,
        enum: ["active", "expired", "cancelled", "pending"],
        default: "active",
      },
      startDate: Date,
      endDate: Date,
      amount: Number,
      paymentId: String,
      duration: {
        months: Number,
        days: Number,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
    },

    subscriptionHistory: [
      {
        plan: String,
        planName: String,
        type: String,
        category: String,
        planTier: String,
        status: {
          type: String,
          enum: ["active", "expired", "cancelled", "pending"],
          default: "active",
        },
        startDate: Date,
        endDate: Date,
        amount: Number,
        paymentId: String,
        duration: {
          months: Number,
          days: Number,
        },
        autoRenew: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // User Interests
    interests: [
      {
        type: String,
        trim: true,
      },
    ],

    // Profile Image
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
)

// Virtual for subscription status
userSchema.virtual("hasActiveSubscription").get(function () {
  if (!this.currentSubscription) return false

  const now = new Date()
  return this.currentSubscription.status === "active" && this.currentSubscription.endDate > now
})

// Pre-save middleware to sync duplicate fields
userSchema.pre("save", function (next) {
  // Sync phone with whatsappNo
  if (this.whatsappNo && !this.phone) {
    this.phone = this.whatsappNo
  }

  // Sync grade with class
  if (this.class && !this.grade) {
    this.grade = this.class
  }

  // Sync dob with dateOfBirth
  if (this.dateOfBirth && !this.dob) {
    this.dob = this.dateOfBirth
  }

  next()
})

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true })
userSchema.set("toObject", { virtuals: true })

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User
