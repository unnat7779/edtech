import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import SystemNotification from "@/models/SystemNotification"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function POST(request) {
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

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { notificationIds, markAll } = body

    if (markAll) {
      // Mark all unread notifications as read for this user
      const notifications = await SystemNotification.find({
        isActive: true,
        $or: [
          { targetAudience: "all" },
          { targetAudience: user.subscription?.status === "active" ? "premium" : "non-premium" },
          { specificStudents: decoded.userId },
        ],
      })

      const updatePromises = notifications.map(async (notification) => {
        if (!notification.isReadBy(decoded.userId)) {
          return notification.markAsReadBy(decoded.userId)
        }
      })

      await Promise.all(updatePromises.filter(Boolean))

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      const notifications = await SystemNotification.find({
        _id: { $in: notificationIds },
        isActive: true,
      })

      const updatePromises = notifications.map(async (notification) => {
        if (!notification.isReadBy(decoded.userId)) {
          return notification.markAsReadBy(decoded.userId)
        }
      })

      await Promise.all(updatePromises.filter(Boolean))

      return NextResponse.json({
        success: true,
        message: `${notifications.length} notification(s) marked as read`,
      })
    } else {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Mark notifications as read error:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
