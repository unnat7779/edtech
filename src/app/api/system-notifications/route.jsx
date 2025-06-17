import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import SystemNotification from "@/models/SystemNotification"
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
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    // Get system notifications for all users or specific user based on targetAudience
    const notifications = await SystemNotification.find({
      $or: [
        { targetAudience: "all" },
        { targetAudience: "students" },
        { "readBy.userId": { $ne: decoded.userId } }, // Not read by this user
      ],
      isActive: true,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    // Filter notifications that haven't been read by this user
    const userNotifications = notifications.map((notification) => {
      const isRead = notification.readBy.some((read) => read.userId.toString() === decoded.userId)

      return {
        id: notification._id,
        notificationId: notification.notificationId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        description: notification.description,
        priority: notification.priority,
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
        isRead,
        createdAt: notification.createdAt,
        createdBy: notification.createdBy,
      }
    })

    // Count unread notifications
    const unreadCount = userNotifications.filter((n) => !n.isRead).length

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
      unreadCount,
      pagination: {
        current: page,
        hasMore: notifications.length === limit,
      },
    })
  } catch (error) {
    console.error("Get system notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
