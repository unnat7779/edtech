import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Notification from "@/models/Notification"
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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 20
    const page = Number.parseInt(searchParams.get("page")) || 1
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    // Build query
    const query = { userId: decoded.userId }
    if (unreadOnly) {
      query.read = false
    }

    // Get total count
    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({ userId: decoded.userId, read: false })

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      success: true,
      notifications: notifications.map((notification) => ({
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        actionUrl: notification.actionUrl,
        read: notification.read,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
      })),
      unreadCount,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalItems: total,
      },
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
