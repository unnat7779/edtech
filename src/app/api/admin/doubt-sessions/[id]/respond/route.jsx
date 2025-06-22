import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import Notification from "@/models/Notification"
import { verifyToken } from "@/lib/auth"

export async function POST(request, { params }) {
  try {
    console.log("=== Admin Response Route ===")

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
    if (!decoded || decoded.role !== "admin") {
      console.log("❌ Invalid token or not admin:", decoded)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("✅ Admin authenticated:", decoded.userId)

    await connectDB()

    const body = await request.json()
    console.log("📝 Request body:", JSON.stringify(body, null, 2))

    // Handle nested adminResponse structure
    const responseData = body.adminResponse || body
    console.log("📝 Response data:", JSON.stringify(responseData, null, 2))

    // Validate required fields
    if (!responseData.responseDescription && !responseData.mentorName && !responseData.meetingLink) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        {
          error: "At least one of responseDescription, mentorName, or meetingLink is required",
          received: responseData,
        },
        { status: 400 },
      )
    }

    // Find the session
    const session = await DoubtSession.findById(sessionId)
    if (!session) {
      console.log("❌ Session not found:", sessionId)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    console.log("✅ Session found:", session.studentName, "Current status:", session.status)

    // Prepare admin response data
    const adminResponseUpdate = {
      mentorName: responseData.mentorName || session.adminResponse?.mentorName || "Admin",
      mentorEmail: responseData.mentorEmail || session.adminResponse?.mentorEmail || "",
      scheduledDateTime: responseData.scheduledDateTime
        ? new Date(responseData.scheduledDateTime)
        : session.adminResponse?.scheduledDateTime || null,
      meetingPlatform: responseData.meetingPlatform || session.adminResponse?.meetingPlatform || session.mode || "Zoom",
      meetingLink: responseData.meetingLink || session.adminResponse?.meetingLink || "",
      sessionDuration: responseData.sessionDuration || session.adminResponse?.sessionDuration || 60,
      responseDescription: responseData.responseDescription || session.adminResponse?.responseDescription || "",
      specialInstructions: responseData.specialInstructions || session.adminResponse?.specialInstructions || "",
      respondedAt: new Date(),
      isDraft: responseData.isDraft || false,
    }

    console.log("📝 Admin response update:", JSON.stringify(adminResponseUpdate, null, 2))

    // Use findByIdAndUpdate with validation disabled temporarily
    const updatedSession = await DoubtSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          adminResponse: adminResponseUpdate,
          status: "responded", // Set to responded status
          lastUpdatedBy: decoded.userId,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: false, // Disable validation temporarily
        upsert: false,
      },
    )

    if (!updatedSession) {
      console.log("❌ Failed to update session")
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }

    console.log("✅ Session updated successfully. New status:", updatedSession.status)

    // Create notification for student (only if not draft)
    if (!responseData.isDraft) {
      try {
        const notification = new Notification({
          userId: session.studentId,
          type: "doubt_session_response",
          title: "Doubt Session Response Received",
          message: `Your doubt session for ${session.subject} - ${session.topic} has been responded to by our team.`,
          data: {
            sessionId: sessionId,
            subject: session.subject,
            topic: session.topic,
            mentorName: adminResponseUpdate.mentorName,
            meetingPlatform: adminResponseUpdate.meetingPlatform,
            scheduledDateTime: adminResponseUpdate.scheduledDateTime,
          },
          isRead: false,
        })

        await notification.save()
        console.log("✅ Notification created for student")
      } catch (notificationError) {
        console.error("⚠️ Failed to create notification:", notificationError)
        // Don't fail the main request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: responseData.isDraft ? "Draft saved successfully" : "Response sent successfully",
      session: {
        ...updatedSession.toObject(),
        id: updatedSession._id,
      },
    })
  } catch (error) {
    console.error("❌ Error in admin response route:", error)
    return NextResponse.json(
      {
        error: "Failed to send response",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// Also support PUT method
export async function PUT(request, { params }) {
  return POST(request, { params })
}
