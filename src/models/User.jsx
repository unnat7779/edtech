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
      validate: {
        validator: (value) => ["11", "11th", "12", "12th", "Dropper"].includes(value),
        message: "Class must be 11, 11th, 12, 12th, or Dropper",
      },
    },
    grade: {
      type: String,
      validate: {
        validator: (value) => {
          if (!value) return true // Optional field
          return ["11", "11th", "12", "12th", "Dropper"].includes(value)
        },
        message: "Grade must be 11, 11th, 12, 12th, or Dropper",
      },
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

    // Subscription Management - FIXED: Using proper object schema
    currentSubscription: {
      plan: {
        type: String,
        trim: true,
      },
      planName: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        trim: true,
      },
      category: {
        type: String,
        trim: true,
      },
      planTier: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["active", "expired", "cancelled", "pending"],
        default: "active",
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      amount: {
        type: Number,
      },
      paymentId: {
        type: String,
        trim: true,
      },
      duration: {
        months: {
          type: Number,
        },
        days: {
          type: Number,
        },
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

    // FIXED: Proper array of objects schema
    subscriptionHistory: [
      {
        plan: {
          type: String,
          trim: true,
        },
        planName: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          trim: true,
        },
        planTier: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          enum: ["active", "expired", "cancelled", "pending"],
          default: "active",
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        amount: {
          type: Number,
        },
        paymentId: {
          type: String,
          trim: true,
        },
        duration: {
          months: {
            type: Number,
          },
          days: {
            type: Number,
          },
        },
        autoRenew: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
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

// Pre-save middleware to sync duplicate fields and normalize values
userSchema.pre("save", function (next) {
  // Only normalize class values - no subscription handling
  if (this.class === "11") {
    this.class = "11th"
  } else if (this.class === "12") {
    this.class = "12th"
  }

  // Sync basic fields only
  if (this.whatsappNo && !this.phone) {
    this.phone = this.whatsappNo
  }

  if (this.class && !this.grade) {
    this.grade = this.class
  } else if (this.grade === "11") {
    this.grade = "11th"
  } else if (this.grade === "12") {
    this.grade = "12th"
  }

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
