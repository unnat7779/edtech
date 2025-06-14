import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Bookmark from "@/models/Bookmark"
import { verifyToken } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const resolvedParams = await params
    const bookmark = await Bookmark.findOne({
      _id: resolvedParams.id,
      student: decoded.userId,
      isActive: true,
    })
      .populate("testId", "title subject")
      .lean()

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      bookmark,
    })
  } catch (error) {
    console.error("Get bookmark error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const resolvedParams = await params
    const { notes, tags } = await request.json()

    const bookmark = await Bookmark.findOneAndUpdate(
      {
        _id: resolvedParams.id,
        student: decoded.userId,
      },
      {
        notes: notes || "",
        tags: tags || [],
        updatedAt: new Date(),
      },
      { new: true },
    ).populate("testId", "title subject")

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Bookmark updated successfully",
      bookmark,
    })
  } catch (error) {
    console.error("Update bookmark error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const resolvedParams = await params
    const result = await Bookmark.findOneAndDelete({
      _id: resolvedParams.id,
      student: decoded.userId,
    })

    if (!result) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Bookmark deleted successfully",
    })
  } catch (error) {
    console.error("Delete bookmark error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
