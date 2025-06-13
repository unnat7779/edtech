import mongoose from "mongoose"

const DoubtSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentClass: {
      type: String,
      required: true,
    },
    whatsappNo: {
      type: String,
      required: true,
    },
    enrolledInCoaching: {
      type: Boolean,
      required: true,
    },
    coachingName: {
      type: String,
      default: "",
    },
    preferredTimeSlot: {
      date: {
        type: Date,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
    mode: {
      type: String,
      enum: ["WhatsApp", "Zoom", "Google Meet"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionLink: {
      type: String,
      default: "",
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.DoubtSession || mongoose.model("DoubtSession", DoubtSessionSchema)
