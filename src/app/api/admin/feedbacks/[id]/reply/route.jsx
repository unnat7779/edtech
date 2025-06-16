import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Feedback from "@/models/Feedback"
import Notification from "@/models/Notification"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function POST(request, { params }) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verify admin role
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = params
    const { message, status, priority } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Reply message is required" }, { status: 400 })
    }

    // Find the feedback
    const feedback = await Feedback.findById(id).populate("studentId", "name email")
    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Update feedback with admin response
    const updateData = {
      adminResponse: {
        message: message.trim(),
        respondedBy: decoded.userId,
        respondedAt: new Date(),
      },
      isRead: false, // Mark as unread for student
    }

    // Update status if provided
    if (status && ["open", "in-progress", "resolved", "closed"].includes(status)) {
      updateData.status = status
    }

    // Update priority if provided
    if (priority && ["low", "medium", "high", "urgent"].includes(priority)) {
      updateData.priority = priority
    }

    await Feedback.findByIdAndUpdate(id, updateData)

    // Create system notification for student about admin reply
    const notification = new Notification({
      userId: feedback.studentId._id,
      title: "Admin Response Received",
      message: `Admin replied to your ${feedback.type.replace("-", " ")} feedback: "${feedback.subject}". ${message.substring(0, 100)}${message.length > 100 ? "..." : ""}`,
      type: "admin-reply",
      actionUrl: `/feedback-history?id=${feedback._id}`,
      relatedId: feedback._id,
      relatedModel: "Feedback",
      metadata: {
        feedbackType: feedback.type,
        feedbackSubject: feedback.subject,
        adminMessage: message,
        status: status || feedback.status,
        priority: priority || feedback.priority,
      },
    })

    await notification.save()

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt,
      },
    })
  } catch (error) {
    console.error("Admin reply error:", error)
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 })
  }
}
