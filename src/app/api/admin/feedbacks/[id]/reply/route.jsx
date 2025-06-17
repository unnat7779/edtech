import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Feedback from "@/models/Feedback"
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

    // Await params before using
    const { id } = await params
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

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateData, { new: true })

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      feedback: {
        id: updatedFeedback._id,
        status: updatedFeedback.status,
        priority: updatedFeedback.priority,
        adminResponse: updatedFeedback.adminResponse,
      },
    })
  } catch (error) {
    console.error("Admin reply error:", error)
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 })
  }
}
