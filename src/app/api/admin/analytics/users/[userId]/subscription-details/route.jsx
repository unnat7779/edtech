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

    console.log("Fetching subscription details for user:", userId)

    const user = await User.findById(userId)
      .select("name email currentSubscription subscriptionHistory isPremium premiumTier")
      .lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("User found:", {
      name: user.name,
      email: user.email,
      hasCurrentSubscription: !!user.currentSubscription,
      subscriptionHistoryLength: user.subscriptionHistory?.length || 0,
      isPremium: user.isPremium,
      premiumTier: user.premiumTier,
    })

    // Handle current subscription - expect object format
    let currentSubscription = null
    if (user.currentSubscription && typeof user.currentSubscription === "object") {
      currentSubscription = user.currentSubscription
    }

    // Handle subscription history - expect array of objects
    const validSubscriptionHistory = Array.isArray(user.subscriptionHistory)
      ? user.subscriptionHistory.filter((sub) => sub && typeof sub === "object" && sub.planName)
      : []

    console.log("Valid subscription history count:", validSubscriptionHistory.length)

    // Determine subscription status
    let hasActiveSubscription = false
    let subscriptionStatus = "inactive"

    if (currentSubscription && currentSubscription.status && currentSubscription.endDate) {
      const now = new Date()
      const endDate = new Date(currentSubscription.endDate)

      hasActiveSubscription = currentSubscription.status === "active" && endDate > now
      subscriptionStatus = hasActiveSubscription ? "active" : "expired"
    }

    const responseData = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumTier: user.premiumTier,
      },
      currentSubscription,
      subscriptionHistory: validSubscriptionHistory,
      hasActiveSubscription,
      subscriptionStatus,
    }

    console.log("Returning subscription details:", {
      hasCurrentSubscription: !!currentSubscription,
      hasActiveSubscription,
      subscriptionStatus,
      historyCount: validSubscriptionHistory.length,
    })

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("Error fetching subscription details:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch subscription details",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
