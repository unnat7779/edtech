import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { userId } = resolvedParams

    console.log("=== SUBSCRIPTION HISTORY API ===")
    console.log("1. Route userId:", userId)

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("❌ Invalid userId format")
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    console.log("2. Token received:", token ? "Yes" : "No")

    if (!token) {
      console.log("❌ No token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify JWT token
    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      console.log("3. Token decoded - userId:", decodedToken.userId, "role:", decodedToken.role)
    } catch (error) {
      console.log("❌ Token verification failed:", error.message)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check authorization
    if (decodedToken.userId !== userId && decodedToken.role !== "admin") {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()
    console.log("4. Database connected")

    // Convert userId to ObjectId and fetch user with subscription data
    const objectId = new mongoose.Types.ObjectId(userId)
    const user = await User.findById(objectId).select("currentSubscription subscriptionHistory name email").lean()

    if (!user) {
      console.log("❌ User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("5. User found:", {
      name: user.name,
      email: user.email,
      hasCurrentSubscription: !!user.currentSubscription,
      subscriptionHistoryLength: user.subscriptionHistory?.length || 0,
    })

    // Get current subscription plan details
    const currentPlan = user.currentSubscription
    console.log("6. Current subscription:", currentPlan ? currentPlan.planName : "None")

    // Get subscription history
    const history = user.subscriptionHistory || []
    console.log("7. Subscription history count:", history.length)

    // Combine current subscription with history (avoid duplicates)
    const allSubscriptions = [...history]

    if (currentPlan) {
      // Check if current subscription is already in history
      const currentSubExists = history.some(
        (sub) =>
          sub.planName === currentPlan.planName &&
          new Date(sub.startDate).getTime() === new Date(currentPlan.startDate).getTime(),
      )

      if (!currentSubExists) {
        console.log("8. Adding current subscription to list")
        allSubscriptions.unshift(currentPlan)
      } else {
        console.log("8. Current subscription already in history")
      }
    }

    console.log("9. Total subscriptions:", allSubscriptions.length)

    // Calculate summary statistics
    const now = new Date()

    // Find active subscriptions
    const activeSubscriptions = allSubscriptions.filter((sub) => {
      const endDate = new Date(sub.endDate)
      const isActive = sub.status === "active" && endDate > now
      console.log(`   ${sub.planName}: status=${sub.status}, endDate=${endDate.toISOString()}, isActive=${isActive}`)
      return isActive
    })

    console.log("10. Active subscriptions:", activeSubscriptions.length)

    // Calculate total spending from payment amounts
    const totalSpending = allSubscriptions.reduce((sum, sub) => {
      const amount = sub.amount || 0
      console.log(`    Adding ₹${amount} from ${sub.planName}`)
      return sum + amount
    }, 0)

    console.log("11. Total spending: ₹", totalSpending)

    // Get active plan name
    const activePlanName =
      activeSubscriptions.length > 0 ? activeSubscriptions[0].planName || activeSubscriptions[0].plan : "No Active Plan"

    console.log("12. Active plan name:", activePlanName)

    // Calculate expiring soon (within 7 days from end date)
    const expiringSoon = activeSubscriptions.filter((sub) => {
      const endDate = new Date(sub.endDate)
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
      console.log(`    ${sub.planName}: ${daysLeft} days left, expiring soon: ${isExpiringSoon}`)
      return isExpiringSoon
    }).length

    console.log("13. Expiring soon count:", expiringSoon)

    // Group subscriptions by status
    const groupedSubscriptions = {
      active: allSubscriptions.filter((sub) => {
        const endDate = new Date(sub.endDate)
        return sub.status === "active" && endDate > now
      }),
      expired: allSubscriptions.filter((sub) => {
        const endDate = new Date(sub.endDate)
        return sub.status === "expired" || (sub.status === "active" && endDate <= now)
      }),
      cancelled: allSubscriptions.filter((sub) => sub.status === "cancelled"),
      pending: allSubscriptions.filter((sub) => sub.status === "pending"),
    }

    console.log("14. Grouped subscriptions:", {
      active: groupedSubscriptions.active.length,
      expired: groupedSubscriptions.expired.length,
      cancelled: groupedSubscriptions.cancelled.length,
      pending: groupedSubscriptions.pending.length,
    })

    const summary = {
      totalSpending,
      activePlanName,
      activeSubscriptionsCount: activeSubscriptions.length,
      expiringSoon,
      totalSubscriptions: allSubscriptions.length,
    }

    console.log("15. Final summary:", summary)

    const response = {
      success: true,
      subscriptions: allSubscriptions,
      groupedSubscriptions,
      summary,
      user: {
        name: user.name,
        email: user.email,
      },
      currentPlan: currentPlan || null,
      history: history,
    }

    console.log("16. ✅ Sending response with", allSubscriptions.length, "subscriptions")
    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch subscription data",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
