import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import SystemNotification from "@/models/SystemNotification"
import { authenticate } from "@/middleware/auth"

// GET single announcement
export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request)
    if (!auth.success || auth.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const announcement = await SystemNotification.findById(params.id)

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error("Get announcement error:", error)
    return NextResponse.json({ error: "Failed to fetch announcement" }, { status: 500 })
  }
}

// PUT update announcement
export async function PUT(request, { params }) {
  try {
    const auth = await authenticate(request)
    if (!auth.success || auth.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const formData = await request.formData()
    const title = formData.get("title")
    const message = formData.get("message")
    const description = formData.get("description")
    const priority = formData.get("priority") || "medium"
    const targetAudience = formData.get("targetAudience") || "all"
    const expiresAt = formData.get("expiresAt")

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    const updateData = {
      title,
      message,
      description,
      priority,
      targetAudience,
      updatedAt: new Date(),
    }

    if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt)
    }

    const announcement = await SystemNotification.findByIdAndUpdate(params.id, updateData, {
      new: true,
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      announcement,
      message: "Announcement updated successfully",
    })
  } catch (error) {
    console.error("Update announcement error:", error)
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 })
  }
}

// DELETE announcement
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request)
    if (!auth.success || auth.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const announcement = await SystemNotification.findByIdAndDelete(params.id)

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
    })
  } catch (error) {
    console.error("Delete announcement error:", error)
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
  }
}
