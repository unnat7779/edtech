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

    // Debug: Log all headers
    const headers = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log("Request headers:", headers)

    // Try to get token from different sources
    let token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("Authorization header token:", token ? "Found" : "Not found")

    // If no authorization header, try to get from cookies
    if (!token) {
      const cookies = request.headers.get("cookie")
      console.log("Cookies:", cookies)
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/)
        if (tokenMatch) {
          token = tokenMatch[1]
          console.log("Token from cookies:", "Found")
        }
      }
    }

    if (!token) {
      console.log("❌ No token found")
      return NextResponse.json({ error: "Authentication required", debug: "No token found" }, { status: 401 })
    }

    console.log("✓ Token found, verifying...")
    const decoded = verifyToken(token)
    console.log("Token decoded:", decoded ? "Success" : "Failed")

    if (!decoded) {
      console.log("❌ Token verification failed")
      return NextResponse.json({ error: "Invalid token", debug: "Token verification failed" }, { status: 401 })
    }

    console.log("Decoded token data:", {
      userId: decoded.userId,
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    })

    // Try to find user with different ID fields
    const userId = decoded.userId || decoded.id
    console.log("Looking for user with ID:", userId)

    const user = await User.findById(userId)
    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      console.log("❌ User not found in database")
      return NextResponse.json(
        {
          error: "User not found",
          debug: {
            searchedId: userId,
            decodedToken: decoded,
          },
        },
        { status: 404 },
      )
    }

    console.log("User details:", {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    if (user.role !== "admin") {
      console.log("❌ User is not admin. Role:", user.role)
      return NextResponse.json(
        {
          error: "Admin access required",
          debug: {
            userRole: user.role,
            userId: user._id,
            requiredRole: "admin",
          },
        },
        { status: 403 },
      )
    }

    console.log("✓ User is admin, proceeding with request")

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

    console.log("Found announcements:", announcements.length)

    // Update read counts for each announcement
    const updatedAnnouncements = await Promise.all(
      announcements.map(async (announcement) => {
        const currentReadCount = announcement.readBy ? announcement.readBy.length : 0

        return {
          _id: announcement._id,
          notificationId: announcement.notificationId,
          title: announcement.title,
          message: announcement.message,
          description: announcement.description,
          images: announcement.images || [],
          priority: announcement.priority,
          targetAudience: announcement.targetAudience,
          readCount: currentReadCount,
          totalRecipients: announcement.totalRecipients || 0,
          readPercentage:
            announcement.totalRecipients > 0 ? Math.round((currentReadCount / announcement.totalRecipients) * 100) : 0,
          createdAt: announcement.createdAt,
          createdBy: announcement.createdBy,
          expiresAt: announcement.expiresAt,
        }
      }),
    )

    const total = await SystemNotification.countDocuments({
      type: "announcement",
      isActive: true,
    })

    console.log("✓ Successfully returning announcements")

    return NextResponse.json({
      success: true,
      announcements: updatedAnnouncements,
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
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

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

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    // Calculate total recipients based on target audience
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

    // Create system notification without images
    const systemNotification = new SystemNotification({
      type: "announcement",
      title: title.trim(),
      message: message.trim(),
      description: description?.trim(),
      images: [],
      priority,
      targetAudience,
      createdBy: userId,
      isActive: true,
      totalRecipients,
      readCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })

    await systemNotification.save()

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
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
  }
}
