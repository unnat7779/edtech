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

    // Use the exact MongoDB query you provided
    const objectId = new mongoose.Types.ObjectId(userId)

    const userData = await User.findOne(
      { _id: objectId },
      {
        currentSubscription: 1,
        subscriptionHistory: 1,
        isPremium: 1,
        premiumTier: 1,
        name: 1,
        email: 1,
        _id: 0,
      },
    ).lean()

    if (!userData) {
      console.log("❌ User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("5. User data fetched:", {
      hasCurrentSubscription: !!userData.currentSubscription,
      subscriptionHistoryLength: userData.subscriptionHistory?.length || 0,
      isPremium: userData.isPremium,
      premiumTier: userData.premiumTier,
    })

    // Extract current subscription and history
    let currentSubscription = null
    const subscriptionHistory = userData.subscriptionHistory || []

    // Handle currentSubscription if it's a reference
    if (userData.currentSubscription) {
      if (
        typeof userData.currentSubscription === "string" ||
        userData.currentSubscription instanceof mongoose.Types.ObjectId
      ) {
        // Find the subscription in history
        const subscriptionId = userData.currentSubscription.toString()
        currentSubscription = subscriptionHistory.find((sub) => sub._id && sub._id.toString() === subscriptionId)
      } else {
        currentSubscription = userData.currentSubscription
      }
    }

    console.log("6. Current subscription:", currentSubscription ? currentSubscription.planName : "None")
    console.log("7. Subscription history count:", subscriptionHistory.length)

    // Filter out invalid subscriptions
    const validSubscriptions = subscriptionHistory.filter((sub) => {
      // Check if subscription has valid data
      const hasValidAmount = sub.amount && !isNaN(sub.amount) && sub.amount > 0
      const hasValidPlanName = sub.planName || sub.plan || sub.name
      const hasValidStartDate = sub.startDate && !isNaN(new Date(sub.startDate).getTime())
      const hasValidEndDate = sub.endDate && !isNaN(new Date(sub.endDate).getTime())

      const isValid = hasValidAmount && hasValidPlanName && hasValidStartDate && hasValidEndDate

      if (!isValid) {
        console.log("Filtering out invalid subscription:", {
          planName: sub.planName,
          amount: sub.amount,
          startDate: sub.startDate,
          endDate: sub.endDate,
          hasValidAmount,
          hasValidPlanName,
          hasValidStartDate,
          hasValidEndDate,
        })
      }

      return isValid
    })

    console.log("8. Valid subscriptions after filtering:", validSubscriptions.length)

    // Combine current subscription with history (avoid duplicates)
    const allSubscriptions = [...validSubscriptions]

    if (currentSubscription) {
      // Validate current subscription too
      const hasValidAmount =
        currentSubscription.amount && !isNaN(currentSubscription.amount) && currentSubscription.amount > 0
      const hasValidPlanName = currentSubscription.planName || currentSubscription.plan || currentSubscription.name
      const hasValidStartDate =
        currentSubscription.startDate && !isNaN(new Date(currentSubscription.startDate).getTime())
      const hasValidEndDate = currentSubscription.endDate && !isNaN(new Date(currentSubscription.endDate).getTime())

      const isCurrentValid = hasValidAmount && hasValidPlanName && hasValidStartDate && hasValidEndDate

      if (isCurrentValid) {
        // Check if current subscription is already in history by comparing key fields
        const currentSubExists = validSubscriptions.some(
          (sub) =>
            sub.planName === currentSubscription.planName &&
            new Date(sub.startDate).getTime() === new Date(currentSubscription.startDate).getTime() &&
            sub.amount === currentSubscription.amount,
        )

        if (!currentSubExists) {
          console.log("9. Adding current subscription to list")
          // Add current subscription at the beginning
          allSubscriptions.unshift(currentSubscription)
        } else {
          console.log("9. Current subscription already exists in history")
        }
      } else {
        console.log("9. Current subscription is invalid, not adding")
      }
    }

    console.log("10. Total valid subscriptions to process:", allSubscriptions.length)

    // Calculate summary statistics
    const now = new Date()
    console.log("11. Current date:", now.toISOString())

    // Find active subscriptions with proper date validation
    const activeSubscriptions = allSubscriptions.filter((sub) => {
      try {
        // Check if endDate exists and is valid
        if (!sub.endDate) {
          console.log(`   Subscription: ${sub.planName || "Unknown"} - No end date`)
          return false
        }

        const endDate = new Date(sub.endDate)

        // Check if the date is valid
        if (isNaN(endDate.getTime())) {
          console.log(`   Subscription: ${sub.planName || "Unknown"} - Invalid end date: ${sub.endDate}`)
          return false
        }

        const isActive = sub.status === "active" && endDate > now
        console.log(`   Subscription: ${sub.planName || "Unknown"}`)
        console.log(`   Status: ${sub.status}, End Date: ${endDate.toISOString()}, Is Active: ${isActive}`)
        return isActive
      } catch (error) {
        console.log(`   Subscription: ${sub.planName || "Unknown"} - Date processing error:`, error.message)
        return false
      }
    })

    console.log("12. Active subscriptions found:", activeSubscriptions.length)

    // Calculate total spending from all subscription amounts
    const totalSpending = allSubscriptions.reduce((sum, sub) => {
      const amount = sub.amount || 0
      console.log(`    Adding ₹${amount} from ${sub.planName}`)
      return sum + amount
    }, 0)

    console.log("13. Total spending calculated: ₹", totalSpending)

    // Get active plan name (first active subscription)
    const activePlanName =
      activeSubscriptions.length > 0 ? activeSubscriptions[0].planName || activeSubscriptions[0].plan : "No Active Plan"

    console.log("14. Active plan name:", activePlanName)

    // Calculate expiring soon details (within 30 days from end date)
    const expiringSoonDetails = activeSubscriptions
      .map((sub) => {
        try {
          if (!sub.endDate) {
            return null
          }

          const endDate = new Date(sub.endDate)

          // Validate the date
          if (isNaN(endDate.getTime())) {
            console.log(`    Invalid end date for ${sub.planName}: ${sub.endDate}`)
            return null
          }

          const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
          const hoursLeft = Math.ceil((endDate - now) / (1000 * 60 * 60))

          console.log(`    ${sub.planName}: ${daysLeft} days left (${hoursLeft} hours)`)

          return {
            subscription: sub,
            daysLeft,
            hoursLeft,
            endDate,
            isExpiringSoon: daysLeft <= 30 && daysLeft > 0,
          }
        } catch (error) {
          console.log(`    Error processing expiry for ${sub.planName}:`, error.message)
          return null
        }
      })
      .filter((item) => item !== null && item.isExpiringSoon)
      .sort((a, b) => a.daysLeft - b.daysLeft) // Sort by closest expiry first

    console.log("15. Expiring soon subscriptions:", expiringSoonDetails.length)

    // Get the closest expiring subscription for display
    const closestExpiring = expiringSoonDetails.length > 0 ? expiringSoonDetails[0] : null

    let expiringDisplay = {
      count: expiringSoonDetails.length,
      daysLeft: null,
      hoursLeft: null,
      planName: null,
      endDate: null,
      displayText: "None",
    }

    if (closestExpiring) {
      expiringDisplay = {
        count: expiringSoonDetails.length,
        daysLeft: closestExpiring.daysLeft,
        hoursLeft: closestExpiring.hoursLeft,
        planName: closestExpiring.subscription.planName,
        endDate: closestExpiring.endDate,
        displayText:
          closestExpiring.daysLeft > 0
            ? `${closestExpiring.daysLeft} day${closestExpiring.daysLeft !== 1 ? "s" : ""} left`
            : closestExpiring.hoursLeft > 0
              ? `${closestExpiring.hoursLeft} hour${closestExpiring.hoursLeft !== 1 ? "s" : ""} left`
              : "Expires today",
      }
    }

    console.log("16. Expiring display:", expiringDisplay)

    // Group subscriptions by status with safe date handling
    const groupedSubscriptions = {
      active: allSubscriptions.filter((sub) => {
        try {
          if (!sub.endDate) return false
          const endDate = new Date(sub.endDate)
          if (isNaN(endDate.getTime())) return false
          return sub.status === "active" && endDate > now
        } catch (error) {
          return false
        }
      }),
      expired: allSubscriptions.filter((sub) => {
        try {
          if (!sub.endDate) return sub.status === "expired"
          const endDate = new Date(sub.endDate)
          if (isNaN(endDate.getTime())) return sub.status === "expired"
          return sub.status === "expired" || (sub.status === "active" && endDate <= now)
        } catch (error) {
          return sub.status === "expired"
        }
      }),
      cancelled: allSubscriptions.filter((sub) => sub.status === "cancelled"),
      pending: allSubscriptions.filter((sub) => sub.status === "pending"),
    }

    console.log("17. Grouped subscriptions:", {
      active: groupedSubscriptions.active.length,
      expired: groupedSubscriptions.expired.length,
      cancelled: groupedSubscriptions.cancelled.length,
      pending: groupedSubscriptions.pending.length,
    })

    // Create summary object
    const summary = {
      totalSpending,
      activePlanName,
      activeSubscriptionsCount: activeSubscriptions.length,
      expiringSoon: expiringDisplay.count,
      expiringSoonDetails: expiringDisplay,
      totalSubscriptions: allSubscriptions.length,
    }

    console.log("18. Final summary:", summary)

    // Prepare response
    const response = {
      success: true,
      subscriptions: allSubscriptions,
      groupedSubscriptions,
      summary,
      user: {
        name: userData.name,
        email: userData.email,
        isPremium: userData.isPremium,
        premiumTier: userData.premiumTier,
      },
      currentSubscription: currentSubscription || null,
      subscriptionHistory: validSubscriptions,
    }

    console.log("19. ✅ Sending response with", allSubscriptions.length, "valid subscriptions")
    console.log("20. Expiring soon display:", expiringDisplay.displayText)

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
