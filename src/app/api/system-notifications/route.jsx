import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import SystemNotification from "@/models/SystemNotification"
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

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // admin-reply, announcement, all
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    // Build query for notifications relevant to this user
    const query = {
      isActive: true,
      $or: [],
    }

    // Add targeting conditions
    query.$or.push({ targetAudience: "all" })

    // Check if user is registered (has more than just basic profile info)
    const isRegistered = user.phone || user.dateOfBirth || user.class
    if (isRegistered) {
      query.$or.push({ targetAudience: "registered" })
    }

    // Check subscription status
    const hasActiveSubscription = user.subscription && user.subscription.status === "active"
    if (hasActiveSubscription) {
      query.$or.push({ targetAudience: "premium" })
    } else {
      query.$or.push({ targetAudience: "non-premium" })
    }

    // Add specific targeting
    query.$or.push({ specificStudents: decoded.userId })

    // Filter by type if specified
    if (type && type !== "all") {
      query.type = type
    }

    // Only show non-expired notifications
    query.$or.push({ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } })

    console.log("System notifications query:", JSON.stringify(query, null, 2))

    // Get total count
    const total = await SystemNotification.countDocuments(query)

    // Get notifications
    const notifications = await SystemNotification.find(query)
      .populate("createdBy", "name email")
      .populate("relatedFeedbackId", "feedbackId subject")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    console.log(`Found ${notifications.length} notifications for user ${user.email}`)

    // Process notifications to include read status
    const processedNotifications = notifications.map((notification) => {
      const isRead = notification.isReadBy(decoded.userId)
      return {
        id: notification._id,
        notificationId: notification.notificationId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        description: notification.description,
        images: notification.images,
        priority: notification.priority,
        isRead,
        createdAt: notification.createdAt,
        createdBy: notification.createdBy,
        relatedFeedback: notification.relatedFeedbackId,
        expiresAt: notification.expiresAt,
        targetAudience: notification.targetAudience,
      }
    })

    // Count unread notifications
    const unreadCount = processedNotifications.filter((n) => !n.isRead).length

    return NextResponse.json({
      success: true,
      notifications: processedNotifications,
      unreadCount,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalItems: total,
      },
      debug: {
        userId: decoded.userId,
        userEmail: user.email,
        isRegistered,
        hasActiveSubscription,
        queryConditions: query.$or.length,
      },
    })
  } catch (error) {
    console.error("Get system notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
