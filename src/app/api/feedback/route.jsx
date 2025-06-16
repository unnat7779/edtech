import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Feedback from "@/models/Feedback"
import Notification from "@/models/Notification"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"
import { uploadFileToAzure } from "@/lib/azure-storage"

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

    const formData = await request.formData()
    const type = formData.get("type")
    const subject = formData.get("subject")
    const description = formData.get("description")
    const testName = formData.get("testName")
    const testId = formData.get("testId")

    // Get browser/device info
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""

    console.log("Received feedback data:", { type, subject, description, testName, testId })

    // Validate required fields
    if (!type || !subject || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["bug", "test-issue", "query"].includes(type)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 })
    }

    // For test-issue type, testName is required
    if (type === "test-issue" && !testName) {
      return NextResponse.json({ error: "Test name is required for test issues" }, { status: 400 })
    }

    // Create feedback document - DO NOT include feedbackId, let pre-save hook handle it
    const feedbackData = {
      studentId: decoded.userId,
      type,
      subject,
      description,
      metadata: {
        userAgent,
        url: referer,
        browserInfo: userAgent,
        deviceInfo: userAgent,
      },
    }

    // Add test-specific fields
    if (type === "test-issue") {
      feedbackData.testName = testName
      if (testId) {
        feedbackData.testId = testId
      }
    }

    console.log("Creating feedback with data:", feedbackData)

    // Create new feedback instance
    const feedback = new Feedback(feedbackData)

    // Save feedback - this will trigger the pre-save hook to generate feedbackId
    await feedback.save()

    console.log("Feedback saved successfully with ID:", feedback.feedbackId)

    // Handle image uploads after feedback is saved and has a feedbackId
    const images = []
    const imageFiles = formData.getAll("images")

    if (imageFiles && imageFiles.length > 0) {
      console.log(`Processing ${imageFiles.length} image files`)

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        if (file && file.size > 0) {
          try {
            // Create path: queries/[feedbackId]/image-[index]-[timestamp].[ext]
            const fileExtension = file.name.split(".").pop()
            const timestamp = Date.now()
            const imagePath = `queries/${feedback.feedbackId}/image-${i + 1}-${timestamp}.${fileExtension}`

            console.log(`Uploading image ${i + 1} to path: ${imagePath}`)

            const imageUrl = await uploadFileToAzure(file, imagePath, {
              feedbackId: feedback.feedbackId,
              studentId: decoded.userId,
              type: "feedback-image",
              originalName: file.name,
            })

            images.push({
              url: imageUrl,
              filename: file.name,
              uploadedAt: new Date(),
            })

            console.log(`Image ${i + 1} uploaded successfully: ${imageUrl}`)
          } catch (uploadError) {
            console.error(`Error uploading image ${i + 1}:`, uploadError)
            // Continue with other images even if one fails
          }
        }
      }
    }

    // Update feedback with images if any were uploaded
    if (images.length > 0) {
      feedback.images = images
      await feedback.save()
      console.log(`Updated feedback with ${images.length} images`)
    }

    // Create notification for student
    try {
      const studentNotification = new Notification({
        userId: decoded.userId,
        title: "Feedback Submitted Successfully",
        message: `Your ${type.replace("-", " ")} feedback "${subject}" has been received. We'll review it shortly.`,
        type: "feedback",
        actionUrl: `/feedback-history?id=${feedback._id}`,
        relatedId: feedback._id,
        relatedModel: "Feedback",
      })

      await studentNotification.save()
      console.log("Student notification created successfully")
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError)
      // Don't fail the entire request if notification fails
    }

    // Get student info for response (without populate to avoid schema issues)
    let studentInfo = null
    try {
      studentInfo = await User.findById(decoded.userId).select("name email class").lean()
    } catch (populateError) {
      console.error("Error fetching student info:", populateError)
      // Continue without student info
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback._id,
        feedbackId: feedback.feedbackId,
        type: feedback.type,
        subject: feedback.subject,
        description: feedback.description,
        testName: feedback.testName,
        images: feedback.images,
        status: feedback.status,
        createdAt: feedback.createdAt,
        formattedDate: feedback.formattedDate,
        student: studentInfo,
      },
      message: "Feedback submitted successfully",
    })
  } catch (error) {
    console.error("Feedback submission error:", error)

    // Provide more specific error messages
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      console.error("Validation errors:", validationErrors)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    if (error.code === 11000) {
      console.error("Duplicate key error:", error.keyValue)
      return NextResponse.json(
        {
          error: "Duplicate feedback ID generated. Please try again.",
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to submit feedback",
        details: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      },
      { status: 500 },
    )
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    // Build query
    const query = { studentId: decoded.userId }
    if (type && type !== "all") {
      query.type = type
    }
    if (status && status !== "all") {
      query.status = status
    }

    // Get total count
    const total = await Feedback.countDocuments(query)

    // Get feedbacks with pagination
    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Manually populate student info to avoid schema issues
    const populatedFeedbacks = await Promise.all(
      feedbacks.map(async (feedback) => {
        let studentInfo = null
        try {
          studentInfo = await User.findById(feedback.studentId).select("name email class").lean()
        } catch (err) {
          console.error("Error fetching student for feedback:", err)
        }

        return {
          id: feedback._id,
          feedbackId: feedback.feedbackId,
          type: feedback.type,
          subject: feedback.subject,
          description: feedback.description,
          testName: feedback.testName,
          images: feedback.images,
          status: feedback.status,
          priority: feedback.priority,
          adminResponse: feedback.adminResponse,
          createdAt: feedback.createdAt,
          formattedDate: feedback.formattedDate,
          timeAgo: feedback.timeAgo,
          isRead: feedback.isRead,
          student: studentInfo,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      feedbacks: populatedFeedbacks,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: feedbacks.length,
        totalItems: total,
      },
    })
  } catch (error) {
    console.error("Get feedbacks error:", error)
    return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 })
  }
}
