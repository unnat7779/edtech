// src/models/DoubtSession.jsx

import mongoose from "mongoose"

const DoubtSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Student ID must be a valid ObjectId",
      },
    },
    // Keep studentId for backward compatibility but make it optional
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional for backward compatibility
      validate: {
        validator: (v) => !v || mongoose.Types.ObjectId.isValid(v),
        message: "Student ID must be a valid ObjectId",
      },
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    studentClass: {
      type: String,
      required: [true, "Student class is required"],
      trim: true,
    },
    whatsappNo: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    preferredTimeSlot: {
      date: {
        type: Date,
        required: [true, "Preferred date is required"],
      },
      time: {
        type: String,
        required: [true, "Preferred time is required"],
        trim: true,
      },
    },
    mode: {
      type: String,
      enum: {
        values: ["Zoom", "Google Meet", "WhatsApp", "Phone Call"],
        message: "Mode must be one of: Zoom, Google Meet, WhatsApp, Phone Call",
      },
      default: "Zoom",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "responded", "received", "completed", "cancelled", "confirmed"],
        message: "Status must be one of: pending, responded, received, completed, cancelled, confirmed",
      },
      default: "pending",
    },
    enrolledInCoaching: {
      type: Boolean,
      default: false,
    },
    coachingName: {
      type: String,
      trim: true,
      default: "",
    },
    adminResponse: {
      mentorName: String,
      mentorEmail: String,
      scheduledDateTime: Date,
      meetingPlatform: String,
      meetingLink: String,
      sessionDuration: {
        type: Number,
        default: 60, // minutes
      },
      responseDescription: String,
      specialInstructions: String,
      respondedAt: Date,
      isDraft: {
        type: Boolean,
        default: false,
      },
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    readAt: {
      type: Date, // When student read the admin response
    },
    completedAt: {
      type: Date, // When admin marked as completed
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
  {
    timestamps: true, // This will automatically handle createdAt and updatedAt
  },
)

// Pre-save middleware to ensure both student and studentId are set
DoubtSessionSchema.pre("save", function (next) {
  // If student is set but studentId is not, copy student to studentId
  if (this.student && !this.studentId) {
    this.studentId = this.student
  }

  // If studentId is set but student is not, copy studentId to student
  if (this.studentId && !this.student) {
    this.student = this.studentId
  }

  // If neither is set, this is an error
  if (!this.student && !this.studentId) {
    return next(new Error("Either student or studentId must be set"))
  }

  this.updatedAt = new Date()
  next()
})

// Add indexes for better query performance
DoubtSessionSchema.index({ student: 1 })
DoubtSessionSchema.index({ studentId: 1 }) // Keep for backward compatibility
DoubtSessionSchema.index({ status: 1 })
DoubtSessionSchema.index({ createdAt: -1 })
DoubtSessionSchema.index({ "preferredTimeSlot.date": 1 })

const DoubtSession = mongoose.models.DoubtSession || mongoose.model("DoubtSession", DoubtSessionSchema)

export default DoubtSession
