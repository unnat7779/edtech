import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import SystemNotification from "@/models/SystemNotification"
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

    const { notificationId, markAll } = await request.json()

    if (markAll) {
      // Mark all notifications as read for the user
      const notifications = await SystemNotification.find({
        isActive: true,
        $or: [{ targetAudience: "all" }, { targetAudience: "registered" }, { specificStudents: decoded.userId }],
      })

      console.log(`Found ${notifications.length} notifications to mark as read`)

      const updatePromises = notifications.map(async (notification) => {
        try {
          // Check if user has already read this notification
          const hasRead =
            notification.readBy &&
            notification.readBy.some(
              (readEntry) => readEntry.userId && readEntry.userId.toString() === decoded.userId.toString(),
            )

          if (!hasRead) {
            // Add user to readBy array
            if (!notification.readBy) {
              notification.readBy = []
            }

            notification.readBy.push({
              userId: decoded.userId,
              readAt: new Date(),
            })

            await notification.save()
            console.log(`Marked notification ${notification._id} as read for user ${decoded.userId}`)
            return true
          }
          return false
        } catch (error) {
          console.error(`Error marking notification ${notification._id} as read:`, error)
          return false
        }
      })

      const results = await Promise.all(updatePromises)
      const markedCount = results.filter(Boolean).length

      console.log(`Successfully marked ${markedCount} notifications as read for user ${decoded.userId}`)
    } else if (notificationId) {
      // Mark specific notification as read
      const notification = await SystemNotification.findById(notificationId)

      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 })
      }

      // Check if user has already read this notification
      const hasRead =
        notification.readBy &&
        notification.readBy.some(
          (readEntry) => readEntry.userId && readEntry.userId.toString() === decoded.userId.toString(),
        )

      if (!hasRead) {
        // Add user to readBy array
        if (!notification.readBy) {
          notification.readBy = []
        }

        notification.readBy.push({
          userId: decoded.userId,
          readAt: new Date(),
        })

        await notification.save()
        console.log(`Marked notification ${notificationId} as read for user ${decoded.userId}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notifications as read error:", error)
    return NextResponse.json(
      {
        error: "Failed to mark notifications as read",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
