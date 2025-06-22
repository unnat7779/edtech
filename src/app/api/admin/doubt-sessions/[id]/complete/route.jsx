import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import Notification from "@/models/Notification"
import jwt from "jsonwebtoken"

export async function POST(request, { params }) {
  try {
    console.log("=== Complete Doubt Session API Called ===")

    // Await params to handle Next.js 15+ async params
    const resolvedParams = await params
    const sessionId = resolvedParams.id

    console.log("Session ID:", sessionId)

    // Get token from multiple sources
    let token = null

    // 1. Check Authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
      console.log("✅ Token found in Authorization header")
    }

    // 2. Check cookies as fallback
    if (!token) {
      const cookieHeader = request.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=")
          acc[key] = value
          return acc
        }, {})
        token = cookies.token
        if (token) {
          console.log("✅ Token found in cookies")
        }
      }
    }

    if (!token) {
      console.log("❌ No token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify JWT token directly
    let user
    try {
      if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET environment variable is not set")
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
      }

      console.log("🔍 Attempting to verify token...")
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      })

      console.log("✅ Token verified successfully")
      console.log("Decoded payload:", {
        userId: decoded.userId || decoded.id,
        role: decoded.role,
        email: decoded.email,
        exp: new Date(decoded.exp * 1000).toISOString(),
      })

      user = {
        id: decoded.userId || decoded.id,
        _id: decoded.userId || decoded.id,
        role: decoded.role || "student",
        email: decoded.email,
        name: decoded.name,
        ...decoded,
      }
    } catch (jwtError) {
      console.error("❌ JWT verification error:", jwtError.message)
      console.error("Error type:", jwtError.name)

      if (jwtError.name === "TokenExpiredError") {
        return NextResponse.json({ error: "Token expired" }, { status: 401 })
      }
      if (jwtError.name === "JsonWebTokenError") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
      if (jwtError.name === "NotBeforeError") {
        return NextResponse.json({ error: "Token not active" }, { status: 401 })
      }

      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user || user.role !== "admin") {
      console.log("❌ Invalid user or not admin:", user)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("✅ Admin authenticated:", user.id)

    // Connect to MongoDB
    console.log("🔍 Connecting to MongoDB...")
    await connectDB()
    console.log("✅ MongoDB connected successfully")

    // Find the session
    console.log("🔍 Finding session with ID:", sessionId)
    const session = await DoubtSession.findById(sessionId)
    if (!session) {
      console.log("❌ Session not found:", sessionId)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    console.log("✅ Session found:", {
      id: session._id,
      studentName: session.studentName,
      subject: session.subject,
      topic: session.topic,
      status: session.status,
    })

    // Only allow completion if status is "received" (student has read the response)
    if (session.status !== "received" && session.status !== "recieved") {
      console.log("❌ Session is not in received status:", session.status)
      return NextResponse.json(
        {
          error: "Session can only be completed after student has read the response",
          currentStatus: session.status,
          requiredStatus: "received",
        },
        { status: 400 },
      )
    }

    console.log("✅ Session found and validated:", session.studentName)

    // Update the session status to "completed"
    console.log("🔍 Updating session status to completed...")
    const updatedSession = await DoubtSession.findByIdAndUpdate(
      sessionId,
      {
        status: "completed",
        completedAt: new Date(),
        lastUpdatedBy: user.id,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    )

    if (!updatedSession) {
      console.log("❌ Failed to update session")
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }

    console.log("✅ Session completed successfully:", {
      id: updatedSession._id,
      status: updatedSession.status,
      completedAt: updatedSession.completedAt,
    })

    // Create notification for student (if studentId exists)
    try {
      if (session.studentId) {
        console.log("🔍 Creating completion notification for student...")
        const notification = new Notification({
          userId: session.studentId,
          type: "doubt_session_completed",
          title: "Doubt Session Completed",
          message: `Your doubt session for ${session.subject} - ${session.topic} has been marked as completed. Thank you for using our service!`,
          data: {
            sessionId: sessionId,
            subject: session.subject,
            topic: session.topic,
            completedAt: new Date(),
          },
          isRead: false,
        })

        await notification.save()
        console.log("✅ Completion notification created for student")
      } else {
        console.log("⚠️ No studentId found, skipping notification")
      }
    } catch (notificationError) {
      console.error("⚠️ Failed to create completion notification:", notificationError)
      // Don't fail the main request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Session completed successfully",
      session: {
        _id: updatedSession._id,
        status: updatedSession.status,
        completedAt: updatedSession.completedAt,
        studentName: updatedSession.studentName,
        subject: updatedSession.subject,
        topic: updatedSession.topic,
        studentId: updatedSession.studentId,
      },
    })
  } catch (error) {
    console.error("❌ Error in complete session route:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Failed to complete session",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
