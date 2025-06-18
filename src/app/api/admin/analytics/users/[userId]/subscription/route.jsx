import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
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
      subscriptionType,
      amount,
      duration, // in months
      paymentId,
      startDate,
      autoRenew = false,
    } = body

    // Verify user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const start = new Date(startDate || Date.now())
    const end = new Date(start)
    end.setMonth(end.getMonth() + duration)

    // Update user subscription
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "currentSubscription.status": "active",
          "currentSubscription.startDate": start,
          "currentSubscription.endDate": end,
          "currentSubscription.autoRenew": autoRenew,
          "currentSubscription.paymentId": paymentId,
          "currentSubscription.amount": amount,
          isPremium: true,
          premiumTier: subscriptionType,
        },
        $push: {
          subscriptionHistory: {
            status: "active",
            startDate: start,
            endDate: end,
            amount,
            paymentId,
            subscriptionType,
          },
        },
      },
      { new: true },
    )

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isPremium: updatedUser.isPremium,
        premiumTier: updatedUser.premiumTier,
        currentSubscription: updatedUser.currentSubscription,
      },
    })
  } catch (error) {
    console.error("Update subscription error:", error)
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
  }
}
