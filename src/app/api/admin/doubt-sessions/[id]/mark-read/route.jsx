import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import { verifyToken } from "@/lib/auth"

export async function POST(request, { params }) {
  try {
    console.log("=== Mark Read Route ===")

    // Await params to handle Next.js 15+ async params
    const resolvedParams = await params
    const sessionId = resolvedParams.id

    console.log("Session ID:", sessionId)

    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("❌ No token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("❌ Invalid token:", decoded)
      return NextResponse.json({ error: "Invalid authentication" }, { status: 403 })
    }

    console.log("✅ User authenticated:", decoded.userId)

    await connectDB()

    // Find the session
    const session = await DoubtSession.findById(sessionId)
    if (!session) {
      console.log("❌ Session not found:", sessionId)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Verify the user owns this session
    if (session.studentId.toString() !== decoded.userId) {
      console.log("❌ User doesn't own this session")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    console.log("✅ Session found:", session.studentName, "Current status:", session.status)

    // Only allow marking as read if status is "responded"
    if (session.status !== "responded") {
      console.log("❌ Session not in responded status:", session.status)
      return NextResponse.json({ error: "Session must be in responded status to mark as read" }, { status: 400 })
    }

    // Update session status to "received" and set readAt timestamp
    session.status = "received"
    session.readAt = new Date()
    session.updatedAt = new Date()

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
    return NextResponse.json(
      {
        error: "Failed to mark as read",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
