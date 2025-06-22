import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params // Await params for Next.js 15

    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Get session without populate to avoid strictPopulate error
    const session = await DoubtSession.findById(resolvedParams.id).lean()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Manually populate student data using either field
    let studentData = null
    let lastUpdatedByData = null

    const studentId = session.student || session.studentId
    if (studentId) {
      try {
        studentData = await User.findById(studentId).select("name email").lean()
      } catch (error) {
        console.log("Could not fetch student data:", error.message)
      }
    }

    if (session.lastUpdatedBy) {
      try {
        lastUpdatedByData = await User.findById(session.lastUpdatedBy).select("name").lean()
      } catch (error) {
        console.log("Could not fetch lastUpdatedBy data:", error.message)
      }
    }

    // Add populated data to session
    const populatedSession = {
      ...session,
      studentData,
      lastUpdatedByData,
      effectiveStudentId: studentId,
    }

    return NextResponse.json({
      success: true,
      session: populatedSession,
    })
  } catch (error) {
    console.error("Error fetching doubt session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params // Await params for Next.js 15

    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    const { status, adminResponse, priority, tags, internalNotes } = body

    const updateData = {
      lastUpdatedBy: decoded.userId,
      updatedAt: new Date(),
    }

    if (status) updateData.status = status
    if (adminResponse) updateData.adminResponse = adminResponse
    if (priority) updateData.priority = priority
    if (tags) updateData.tags = tags
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes

    // Update without populate to avoid strictPopulate error
    const session = await DoubtSession.findByIdAndUpdate(resolvedParams.id, updateData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Manually populate student data
    let studentData = null
    const studentId = session.student || session.studentId
    if (studentId) {
      try {
        studentData = await User.findById(studentId).select("name email").lean()
      } catch (error) {
        console.log("Could not fetch student data:", error.message)
      }
    }

    const populatedSession = {
      ...session,
      studentData,
      effectiveStudentId: studentId,
    }

    return NextResponse.json({
      success: true,
      session: populatedSession,
    })
  } catch (error) {
    console.error("Error updating doubt session:", error)
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params // Await params for Next.js 15

    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const session = await DoubtSession.findByIdAndDelete(resolvedParams.id)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting doubt session:", error)
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
  }
}
