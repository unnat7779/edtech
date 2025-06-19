import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    // Await params before using
    const { userId } = await params

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Fetch user with all subscription data
    const user = await User.findById(userId).select(
      "name email currentSubscription subscriptionHistory premiumTier isPremium",
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("User subscription data:", {
      currentSubscription: user.currentSubscription,
      subscriptionHistory: user.subscriptionHistory,
      premiumTier: user.premiumTier,
      isPremium: user.isPremium,
    })

    // Calculate subscription status if current subscription exists
    let subscriptionStatus = "inactive"
    let daysRemaining = 0
    let isActive = false
    let isExpired = true

    if (user.currentSubscription && user.currentSubscription.startDate && user.currentSubscription.duration) {
      const now = new Date()
      const startDate = new Date(user.currentSubscription.startDate)
      const expiryDate = new Date(startDate)

      // Calculate expiry based on duration
      if (user.currentSubscription.duration.months) {
        expiryDate.setMonth(expiryDate.getMonth() + user.currentSubscription.duration.months)
      } else if (user.currentSubscription.duration.days) {
        expiryDate.setDate(expiryDate.getDate() + user.currentSubscription.duration.days)
      }

      const timeDiff = expiryDate.getTime() - now.getTime()
      daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      isExpired = daysRemaining <= 0
      isActive = !isExpired && daysRemaining > 0

      if (isActive) {
        subscriptionStatus = "active"
      } else if (isExpired) {
        subscriptionStatus = "expired"
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          premiumTier: user.premiumTier,
          isPremium: user.isPremium,
        },
        currentSubscription: user.currentSubscription,
        subscriptionHistory: user.subscriptionHistory || [],
        hasActiveSubscription: isActive,
        subscriptionStatus,
        calculatedData: {
          daysRemaining,
          isActive,
          isExpired,
        },
      },
    })
  } catch (error) {
    console.error("Get subscription details error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch subscription details",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
