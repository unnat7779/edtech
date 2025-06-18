import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import SystemNotification from "@/models/SystemNotification"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("=== DEBUG: Admin Announcements GET Request ===")

    await connectDB()
    console.log("✓ Database connected")

    // Try to get token from different sources
    let token = request.headers.get("authorization")?.replace("Bearer ", "")

    // If no authorization header, try to get from cookies
    if (!token) {
      const cookies = request.headers.get("cookie")
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/)
        if (tokenMatch) {
          token = tokenMatch[1]
        }
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Try to find user with different ID fields
    const userId = decoded.userId || decoded.id
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    // Get announcements
    const announcements = await SystemNotification.find({
      type: "announcement",
      isActive: true,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await SystemNotification.countDocuments({
      type: "announcement",
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      announcements: announcements.map((announcement) => ({
        _id: announcement._id,
        notificationId: announcement.notificationId,
        title: announcement.title,
        message: announcement.message,
        description: announcement.description,
        images: announcement.images || [],
        priority: announcement.priority,
        targetAudience: announcement.targetAudience,
        readCount: announcement.readBy ? announcement.readBy.length : 0,
        totalRecipients: announcement.totalRecipients || 0,
        readPercentage:
          announcement.totalRecipients > 0
            ? Math.round(((announcement.readBy ? announcement.readBy.length : 0) / announcement.totalRecipients) * 100)
            : 0,
        createdAt: announcement.createdAt,
        createdBy: announcement.createdBy,
        expiresAt: announcement.expiresAt,
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: announcements.length,
        totalItems: total,
      },
    })
  } catch (error) {
    console.error("❌ Get announcements error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch announcements",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    console.log("=== Creating Announcement ===")
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
    const userId = decoded.userId || decoded.id
    const user = await User.findById(userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Parse FormData
    const formData = await request.formData()

    const title = formData.get("title")
    const message = formData.get("message")
    const description = formData.get("description") || ""
    const priority = formData.get("priority") || "medium"
    const targetAudience = formData.get("targetAudience") || "all"
    const expiresAt = formData.get("expiresAt")

    console.log("Form data received:", { title, message, description, priority, targetAudience })

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    // Calculate total recipients
    let totalRecipients = 0
    try {
      switch (targetAudience) {
        case "all":
          totalRecipients = await User.countDocuments({})
          break
        case "registered":
          totalRecipients = await User.countDocuments({ role: { $ne: "guest" } })
          break
        case "premium":
          totalRecipients = await User.countDocuments({
            $or: [{ subscriptionType: "premium" }, { subscriptionType: "pro" }],
          })
          break
        case "non-premium":
          totalRecipients = await User.countDocuments({
            $or: [{ subscriptionType: { $in: ["free", "basic"] } }, { subscriptionType: { $exists: false } }],
          })
          break
        default:
          totalRecipients = await User.countDocuments({})
      }
    } catch (countError) {
      console.error("Error counting recipients:", countError)
      totalRecipients = 0
    }

    // Create notification object without notificationId initially
    const notificationData = {
      type: "announcement",
      title: title.trim(),
      message: message.trim(),
      description: description?.trim() || "",
      images: [],
      priority,
      targetAudience,
      createdBy: userId,
      isActive: true,
      totalRecipients,
      readCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }

    console.log("Creating notification with data:", notificationData)

    // Create and save the notification
    const systemNotification = new SystemNotification(notificationData)
    await systemNotification.save()

    console.log("✅ Notification created successfully:", systemNotification._id)

    return NextResponse.json({
      success: true,
      message: "Announcement created successfully",
      announcement: {
        id: systemNotification._id,
        notificationId: systemNotification.notificationId,
        type: systemNotification.type,
        title: systemNotification.title,
        message: systemNotification.message,
        description: systemNotification.description,
        priority: systemNotification.priority,
        targetAudience: systemNotification.targetAudience,
        totalRecipients: systemNotification.totalRecipients,
        readCount: systemNotification.readCount,
        createdAt: systemNotification.createdAt,
      },
    })
  } catch (error) {
    console.error("Create announcement error:", error)
    console.error("Error details:", error.message)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Failed to create announcement",
        details: error.message,
        validation: error.errors ? Object.keys(error.errors) : null,
      },
      { status: 500 },
    )
  }
}
