import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Feedback from "@/models/Feedback"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Build query
    const query = {}
    if (type && type !== "all") query.type = type
    if (status && status !== "all") query.status = status
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { feedbackId: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .populate("student", "name email class")
        .populate("adminResponse.respondedBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments(query),
    ])

    // Format feedbacks
    const formattedFeedbacks = feedbacks.map((feedback) => ({
      ...feedback,
      id: feedback._id.toString(),
      formattedDate: new Date(feedback.createdAt).toLocaleDateString(),
      timeAgo: getTimeAgo(feedback.createdAt),
    }))

    return NextResponse.json({
      feedbacks: formattedFeedbacks,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalItems: total,
      },
    })
  } catch (error) {
    console.error("Error fetching feedback history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getTimeAgo(date) {
  const now = new Date()
  const diffInMs = now - new Date(date)
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  return new Date(date).toLocaleDateString()
}
