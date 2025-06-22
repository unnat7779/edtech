import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"
import mongoose from "mongoose"

export async function POST(request) {
  try {
    console.log("🔍 Doubt session booking - Starting...")

    const auth = await authenticate(request)
    if (auth.error) {
      console.log("❌ Authentication failed:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    console.log("✅ User authenticated:", auth.user._id)

    await connectDB()

    // Fetch complete user data from database
    const user = await User.findById(auth.user._id).select("-password").lean()
    if (!user) {
      console.log("❌ User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("📋 User data from database:", {
      id: user._id,
      name: user.name,
      email: user.email,
      class: user.class || user.grade,
      whatsappNo: user.whatsappNo || user.phone,
      enrolledInCoaching: user.enrolledInCoaching,
      coachingName: user.coachingName,
    })

    const requestBody = await request.json()
    console.log("📋 Request body received:", requestBody)

    const { preferredTimeSlot, mode, subject, topic, description } = requestBody

    console.log("📝 Extracted fields:", {
      preferredTimeSlot,
      mode,
      subject,
      topic,
      description,
    })

    // Enhanced validation with detailed logging
    const missingFields = []
    const fieldDetails = {}

    // Check preferredTimeSlot
    if (!preferredTimeSlot) {
      missingFields.push("preferredTimeSlot")
      fieldDetails.preferredTimeSlot = "Missing entire object"
    } else {
      if (!preferredTimeSlot.date) {
        missingFields.push("preferredTimeSlot.date")
        fieldDetails["preferredTimeSlot.date"] = "Missing date"
      }
      if (!preferredTimeSlot.time) {
        missingFields.push("preferredTimeSlot.time")
        fieldDetails["preferredTimeSlot.time"] = "Missing time"
      }
    }

    // Check other fields
    if (!mode || mode.trim() === "") {
      missingFields.push("mode")
      fieldDetails.mode = `Value: "${mode}"`
    }
    if (!subject || subject.trim() === "") {
      missingFields.push("subject")
      fieldDetails.subject = `Value: "${subject}"`
    }
    if (!topic || topic.trim() === "") {
      missingFields.push("topic")
      fieldDetails.topic = `Value: "${topic}"`
    }
    if (!description || description.trim() === "") {
      missingFields.push("description")
      fieldDetails.description = `Value: "${description}"`
    }

    if (missingFields.length > 0) {
      console.log("❌ Missing required fields:", missingFields)
      console.log("📋 Field details:", fieldDetails)
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
          fieldDetails,
          receivedData: requestBody,
          details: `Please provide: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    console.log("✅ All required fields validated")

    // Prepare user data with fallbacks
    const studentName = user.name || user.fullName || "User"
    const studentClass = user.class || user.grade || "Not specified"
    const whatsappNo = user.whatsappNo || user.phone || user.phoneNumber || "Not provided"
    const enrolledInCoaching = Boolean(user.enrolledInCoaching)
    const coachingName = enrolledInCoaching ? user.coachingName || "" : ""

    console.log("📋 Prepared user data:", {
      studentName,
      studentClass,
      whatsappNo,
      enrolledInCoaching,
      coachingName,
    })

    // Create doubt session using user data from database
    const userObjectId = new mongoose.Types.ObjectId(auth.user._id)
    const doubtSessionData = {
      student: userObjectId, // Primary field
      studentId: userObjectId, // For backward compatibility
      studentName,
      studentClass,
      whatsappNo,
      enrolledInCoaching,
      coachingName,
      preferredTimeSlot: {
        date: new Date(preferredTimeSlot.date),
        time: preferredTimeSlot.time,
      },
      mode: mode.trim(),
      subject: subject.trim(),
      topic: topic.trim(),
      description: description.trim(),
      status: "pending",
      createdAt: new Date(),
    }

    console.log("📤 Creating doubt session with data:", doubtSessionData)

    const doubtSession = new DoubtSession(doubtSessionData)
    await doubtSession.save()

    console.log("✅ Doubt session created successfully:", doubtSession._id)

    return NextResponse.json(
      {
        success: true,
        message: "Doubt session booked successfully",
        session: {
          id: doubtSession._id,
          studentName: doubtSession.studentName,
          subject: doubtSession.subject,
          topic: doubtSession.topic,
          preferredTimeSlot: doubtSession.preferredTimeSlot,
          mode: doubtSession.mode,
          status: doubtSession.status,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Doubt session booking error:", error)

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }))

      console.log("❌ MongoDB validation errors:", validationErrors)

      return NextResponse.json(
        {
          error: "Validation failed",
          validationErrors,
          details: "Please check the provided data",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: "Failed to book doubt session. Please try again.",
        errorMessage: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  try {
    console.log("🔍 Fetching doubt sessions...")

    const auth = await authenticate(request)
    if (auth.error) {
      console.log("❌ Authentication failed:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const userId = auth.user._id
    console.log("✅ User authenticated:", userId)

    await connectDB()

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId

    console.log("🔍 Searching for sessions with both student and studentId fields:", userObjectId)

    // Fetch sessions for the authenticated user using BOTH fields with $or operator
    // This handles cases where some sessions use 'student' and others use 'studentId'
    const sessions = await DoubtSession.find({
      $or: [{ student: userObjectId }, { studentId: userObjectId }],
    })
      .sort({ createdAt: -1 })
      .lean()

    console.log(`✅ Found ${sessions.length} sessions for user ${userId}`)
    console.log("🔍 Query used: { $or: [{ student: ObjectId }, { studentId: ObjectId }] }")

    // Log session details for debugging
    if (sessions.length > 0) {
      console.log("📋 Sample session data:", {
        sessionId: sessions[0]._id,
        studentField: sessions[0].student,
        studentIdField: sessions[0].studentId,
        subject: sessions[0].subject,
        status: sessions[0].status,
        createdAt: sessions[0].createdAt,
      })

      // Log field usage statistics
      const studentFieldCount = sessions.filter((s) => s.student).length
      const studentIdFieldCount = sessions.filter((s) => s.studentId).length
      console.log("📊 Field usage stats:", {
        totalSessions: sessions.length,
        withStudentField: studentFieldCount,
        withStudentIdField: studentIdFieldCount,
        withBothFields: sessions.filter((s) => s.student && s.studentId).length,
      })
    }

    // Transform sessions to include proper field names and formatting
    const transformedSessions = sessions.map((session) => ({
      _id: session._id,
      studentId: session.studentId || session.student, // Use studentId if available, fallback to student
      student: session.student || session.studentId, // Use student if available, fallback to studentId
      studentName: session.studentName,
      studentClass: session.studentClass,
      whatsappNo: session.whatsappNo,
      subject: session.subject,
      topic: session.topic,
      description: session.description,
      preferredTimeSlot: session.preferredTimeSlot,
      mode: session.mode,
      status: session.status,
      adminResponse: session.adminResponse || null,
      readAt: session.readAt || null,
      completedAt: session.completedAt || null,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      sessions: transformedSessions,
      count: transformedSessions.length,
      userId: userId,
      debug: {
        searchedFor: userObjectId,
        foundSessions: sessions.length,
        userIdType: typeof userId,
        queryUsed: "{ $or: [{ student: ObjectId }, { studentId: ObjectId }] }",
        fieldStats: {
          withStudentField: sessions.filter((s) => s.student).length,
          withStudentIdField: sessions.filter((s) => s.studentId).length,
        },
      },
    })
  } catch (error) {
    console.error("❌ Get doubt sessions error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "Failed to fetch doubt sessions. Please try again.",
        errorMessage: error.message,
      },
      { status: 500 },
    )
  }
}
