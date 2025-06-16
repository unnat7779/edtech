import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Feedback from "@/models/Feedback"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    // Build query
    const query = {}
    if (type && type !== "all") {
      query.type = type
    }
    if (status && status !== "all") {
      query.status = status
    }
    if (priority && priority !== "all") {
      query.priority = priority
    }
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { feedbackId: { $regex: search, $options: "i" } },
        { testName: { $regex: search, $options: "i" } },
      ]
    }

    // Get statistics
    const statistics = {
      total: await Feedback.countDocuments(),
      open: await Feedback.countDocuments({ status: "open" }),
      inProgress: await Feedback.countDocuments({ status: "in-progress" }),
      resolved: await Feedback.countDocuments({ status: "resolved" }),
      bugs: await Feedback.countDocuments({ type: "bug" }),
      urgent: await Feedback.countDocuments({ priority: "urgent" }),
    }

    // Get total count for pagination
    const total = await Feedback.countDocuments(query)

    // Get feedbacks with pagination
    const feedbacks = await Feedback.find(query)
      .populate("studentId", "name email class")
      .populate("testId", "title")
      .populate("adminResponse.respondedBy", "name")
      .sort({ createdAt: -1, priority: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      success: true,
      feedbacks: feedbacks.map((feedback) => ({
        id: feedback._id,
        feedbackId: feedback.feedbackId,
        type: feedback.type,
        subject: feedback.subject,
        description: feedback.description,
        testName: feedback.testName,
        images: feedback.images,
        status: feedback.status,
        priority: feedback.priority,
        adminResponse: feedback.adminResponse,
        student: feedback.studentId,
        createdAt: feedback.createdAt,
        formattedDate: feedback.formattedDate,
        timeAgo: feedback.timeAgo,
        metadata: feedback.metadata,
      })),
      statistics,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: feedbacks.length,
        totalItems: total,
      },
    })
  } catch (error) {
    console.error("Get admin feedbacks error:", error)
    return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 })
  }
}
