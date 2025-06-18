import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import UserInterest from "@/models/UserInterest"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"

export async function POST(request, { params }) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const { userId } = params
    const body = await request.json()
    const {
      interestedInPaidSubscription,
      interestLevel,
      preferredSubscriptionType,
      budgetRange,
      contactPreference,
      notes,
      followUpDate,
    } = body

    // Verify user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update or create user interest
    const userInterest = await UserInterest.findOneAndUpdate(
      { user: userId },
      {
        interestedInPaidSubscription,
        interestLevel,
        preferredSubscriptionType,
        budgetRange,
        contactPreference,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpStatus: interestedInPaidSubscription ? "pending" : "not_interested",
        lastUpdatedBy: auth.user.id,
      },
      { upsert: true, new: true },
    )

    return NextResponse.json({
      success: true,
      message: "User interest updated successfully",
      userInterest,
    })
  } catch (error) {
    console.error("Update user interest error:", error)
    return NextResponse.json({ error: "Failed to update user interest" }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const { userId } = params

    const userInterest = await UserInterest.findOne({ user: userId })
      .populate("user", "name email whatsappNo")
      .populate("lastUpdatedBy", "name")

    return NextResponse.json({
      success: true,
      userInterest,
    })
  } catch (error) {
    console.error("Get user interest error:", error)
    return NextResponse.json({ error: "Failed to fetch user interest" }, { status: 500 })
  }
}
