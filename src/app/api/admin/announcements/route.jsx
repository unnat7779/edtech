import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import SystemNotification from "@/models/SystemNotification"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"
import { uploadToAzure } from "@/lib/azure-storage"

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

    const admin = await User.findById(decoded.userId)
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const title = formData.get("title")
    const message = formData.get("message")
    const description = formData.get("description") || ""
    const targetAudience = formData.get("targetAudience") || "all"
    const priority = formData.get("priority") || "medium"
    const expiresAt = formData.get("expiresAt")

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    // Handle image uploads
    const images = []
    const imageFiles = formData.getAll("images")

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer())
          const filename = `announcements/${Date.now()}-${file.name}`
          const imageUrl = await uploadToAzure(buffer, filename, file.type)

          images.push({
            url: imageUrl,
            filename: file.name,
            uploadedAt: new Date(),
          })
        } catch (uploadError) {
          console.error("Image upload error:", uploadError)
          // Continue without this image
        }
      }
    }

    // Generate unique notification ID
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const notificationId = `ANN-${timestamp}-${random}`

    // Calculate total recipients based on target audience
    let totalRecipients = 0
    try {
      switch (targetAudience) {
        case "all":
          totalRecipients = await User.countDocuments({ role: "student" })
          break
        case "registered":
          totalRecipients = await User.countDocuments({
            role: "student",
            isRegistered: true,
          })
          break
        case "premium":
          totalRecipients = await User.countDocuments({
            role: "student",
            "subscription.status": "active",
          })
          break
        case "non-premium":
          totalRecipients = await User.countDocuments({
            role: "student",
            $or: [{ "subscription.status": { $ne: "active" } }, { subscription: { $exists: false } }],
          })
          break
        default:
          totalRecipients = await User.countDocuments({ role: "student" })
      }
    } catch (countError) {
      console.error("Error counting recipients:", countError)
      totalRecipients = 0
    }

    // Create the announcement
    const announcement = new SystemNotification({
      notificationId,
      type: "announcement",
      title: title.trim(),
      message: message.trim(),
      description: description.trim(),
      images,
      targetAudience,
      priority,
      totalRecipients,
      readCount: 0,
      createdBy: decoded.userId,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })

    await announcement.save()

    // Populate the created announcement for response
    await announcement.populate("createdBy", "name email")

    return NextResponse.json({
      success: true,
      message: "Announcement created successfully",
      announcement: {
        id: announcement._id,
        notificationId: announcement.notificationId,
        title: announcement.title,
        message: announcement.message,
        description: announcement.description,
        targetAudience: announcement.targetAudience,
        priority: announcement.priority,
        totalRecipients: announcement.totalRecipients,
        images: announcement.images,
        createdAt: announcement.createdAt,
        createdBy: announcement.createdBy,
      },
    })
  } catch (error) {
    console.error("Create announcement error:", error)
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
  }
}

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

    const admin = await User.findById(decoded.userId)
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    const total = await SystemNotification.countDocuments({
      type: "announcement",
      isActive: true,
    })

    const announcements = await SystemNotification.find({
      type: "announcement",
      isActive: true,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      success: true,
      announcements: announcements.map((ann) => ({
        id: ann._id,
        notificationId: ann.notificationId,
        title: ann.title,
        message: ann.message,
        description: ann.description,
        targetAudience: ann.targetAudience,
        priority: ann.priority,
        totalRecipients: ann.totalRecipients,
        readCount: ann.readCount,
        readPercentage: ann.readPercentage,
        images: ann.images,
        createdAt: ann.createdAt,
        createdBy: ann.createdBy,
        expiresAt: ann.expiresAt,
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: announcements.length,
        totalItems: total,
      },
    })
  } catch (error) {
    console.error("Get announcements error:", error)
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}
