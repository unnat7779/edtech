import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import { authenticate } from "@/middleware/auth"
import mongoose from "mongoose"

export async function POST(request, { params }) {
  try {
    console.log("=== Mark Read Route ===")

    // Await params to handle Next.js 15+ async params
    const resolvedParams = await params
    const sessionId = resolvedParams.id

    console.log("Session ID:", sessionId)

    const auth = await authenticate(request)
    if (auth.error) {
      console.log("❌ Authentication failed:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    console.log("✅ User authenticated:", auth.user._id, "Name:", auth.user.name, "Role:", auth.user.role)

    await connectDB()

    // Find the session using the session ID
    const session = await DoubtSession.findById(sessionId)
    if (!session) {
      console.log("❌ Session not found:", sessionId)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    console.log("📋 Session Details:")
    console.log("  Session ID:", session._id)
    console.log("  Student Name:", session.studentName)
    console.log("  Student Field:", session.student)
    console.log("  StudentId Field:", session.studentId)
    console.log("  Status:", session.status)

    // Check if user is admin - admins can mark any session as read
    const isAdmin = auth.user.role === "admin"
    console.log("🔐 User is admin:", isAdmin)

    let userOwnsSession = false
    let ownershipMethod = ""

    if (isAdmin) {
      userOwnsSession = true
      ownershipMethod = "admin privileges"
      console.log("✅ Admin access granted")
    } else {
      // Convert user ID to ObjectId for comparison
      const userObjectId = new mongoose.Types.ObjectId(auth.user._id)
      console.log("🔍 User ObjectId:", userObjectId)

      // Check ownership with detailed logging
      if (session.student) {
        const sessionStudentId = new mongoose.Types.ObjectId(session.student)
        console.log("🔍 Session Student ObjectId:", sessionStudentId)
        console.log("🔍 IDs Equal (student):", userObjectId.equals(sessionStudentId))

        if (userObjectId.equals(sessionStudentId)) {
          userOwnsSession = true
          ownershipMethod = "student field"
        }
      }

      if (!userOwnsSession && session.studentId) {
        const sessionStudentId = new mongoose.Types.ObjectId(session.studentId)
        console.log("🔍 Session StudentId ObjectId:", sessionStudentId)
        console.log("🔍 IDs Equal (studentId):", userObjectId.equals(sessionStudentId))

        if (userObjectId.equals(sessionStudentId)) {
          userOwnsSession = true
          ownershipMethod = "studentId field"
        }
      }
    }

    console.log("🔐 User owns session:", userOwnsSession, ownershipMethod ? `(via ${ownershipMethod})` : "")

    if (!userOwnsSession) {
      console.log("❌ Access denied - User doesn't own this session and is not admin")
      return NextResponse.json(
        {
          error: "Access denied",
          debug: {
            userId: auth.user._id,
            userRole: auth.user.role,
            sessionStudent: session.student,
            sessionStudentId: session.studentId,
            sessionName: session.studentName,
          },
        },
        { status: 403 },
      )
    }

    console.log("✅ Session found:", session.studentName, "Current status:", session.status)

    // Only allow marking as read if status is "responded"
    if (session.status !== "responded") {
      console.log("❌ Session not in responded status:", session.status)
      return NextResponse.json(
        {
          error: `Session must be in 'responded' status to mark as read. Current status: ${session.status}`,
        },
        { status: 400 },
      )
    }

    // Handle sessions with missing student fields (admin can force-fix these)
    if (!session.student && !session.studentId) {
      console.log("⚠️ Session missing student fields...")

      if (isAdmin) {
        console.log("🔧 Admin is force-fixing session student fields...")

        // For admin users, we'll create a placeholder student reference
        // This is a fallback for corrupted data
        const User = mongoose.model("User")
        const fallbackStudent = await User.findOne({ role: { $ne: "admin" } })

        if (!fallbackStudent) {
          console.log("❌ No student users found to assign session to")
          return NextResponse.json(
            {
              error: "Cannot process session - no student users available and session data is corrupted",
            },
            { status: 500 },
          )
        }

        console.log("✅ Using fallback student:", fallbackStudent._id, fallbackStudent.name)
        session.student = fallbackStudent._id
        session.studentId = fallbackStudent._id
        // Don't change the studentName as it might be intentionally different
      } else {
        // For non-admin users, use their own ID
        session.student = new mongoose.Types.ObjectId(auth.user._id)
        session.studentId = new mongoose.Types.ObjectId(auth.user._id)
        console.log("✅ Fixed session student fields with current user ID")
      }
    }

    // Update session status to "received" and set readAt timestamp
    session.status = "received"
    session.readAt = new Date()
    session.updatedAt = new Date()

    console.log("💾 Attempting to save session...")
    const updatedSession = await session.save()

    console.log("✅ Session marked as read. New status:", updatedSession.status)

    return NextResponse.json({
      success: true,
      message: "Response marked as read",
      session: {
        ...updatedSession.toObject(),
        id: updatedSession._id,
      },
    })
  } catch (error) {
    console.error("❌ Error in mark read route:", error)
    console.error("❌ Error details:", error.message)
    if (error.errors) {
      console.error("❌ Validation errors:", error.errors)
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to mark as read",
        details: error.message,
        validationErrors: error.errors,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
