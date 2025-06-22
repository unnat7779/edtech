import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(request, { params }) {
  try {
    // Await params for Next.js 15+ compatibility
    const { userId } = await params
    console.log("🔍 Fetching current subscription for user:", userId)

    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ No valid authorization header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    console.log("🔑 Token received:", token ? "Present" : "Missing")

    const decoded = verifyToken(token)
    if (!decoded) {
      console.error("❌ Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("✅ Token verified for user:", decoded.userId || decoded.id)

    // Connect to database
    await connectDB()
    console.log("✅ Database connected successfully")

    // Convert userId to Mongoose ObjectId (compatible with BSON)
    let objectId
    try {
      objectId = new mongoose.Types.ObjectId(userId)
      console.log("🔍 Converted Mongoose ObjectId:", objectId)
    } catch (error) {
      console.error("❌ Invalid user ID format:", userId)
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // First, get the user data with currentSubscription
    const userData = await User.findOne(
      { _id: objectId },
      { currentSubscription: 1, subscriptionHistory: 1, _id: 0 },
    ).lean()

    console.log("📊 Raw user data from DB:", JSON.stringify(userData, null, 2))

    if (!userData) {
      console.error("❌ User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let currentSubscription = null

    // Check if currentSubscription is an ObjectId (reference) or an object
    if (userData.currentSubscription) {
      if (
        typeof userData.currentSubscription === "string" ||
        userData.currentSubscription instanceof mongoose.Types.ObjectId
      ) {
        console.log("🔍 currentSubscription is a reference, looking in subscriptionHistory...")

        // Look for the subscription in subscriptionHistory
        const subscriptionHistory = userData.subscriptionHistory || []
        const subscriptionId = userData.currentSubscription.toString()

        console.log("🔍 Looking for subscription ID:", subscriptionId)
        console.log("🔍 Available subscriptions in history:", subscriptionHistory.length)

        // Find the subscription in history that matches the currentSubscription ID
        currentSubscription = subscriptionHistory.find((sub) => {
          const subId = sub._id ? sub._id.toString() : null
          console.log("   Checking subscription:", subId, "vs", subscriptionId)
          return subId === subscriptionId
        })

        if (!currentSubscription) {
          // If not found in history, try to find the most recent active subscription
          console.log("🔍 Subscription not found by ID, looking for most recent active...")
          const now = new Date()
          currentSubscription = subscriptionHistory
            .filter((sub) => {
              try {
                return sub.status === "active" && sub.endDate && new Date(sub.endDate) > now
              } catch (error) {
                return false
              }
            })
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0]
        }
      } else {
        // currentSubscription is already an object
        console.log("🔍 currentSubscription is already an object")
        currentSubscription = userData.currentSubscription
      }
    }

    console.log("📋 Final current subscription:", JSON.stringify(currentSubscription, null, 2))

    // Extract subscription details
    let hasActivePCMPlan = false
    let subscriptionDetails = null

    if (currentSubscription) {
      // Check if it's the PCM Live 1:1 Doubt Support plan
      const planName = currentSubscription.planName || currentSubscription.name || currentSubscription.plan
      const status = currentSubscription.status
      const endDate = currentSubscription.endDate

      console.log("🔍 Plan details:")
      console.log("   Plan Name:", planName)
      console.log("   Status:", status)
      console.log("   End Date:", endDate)

      // Check if it matches PCM Live plan
      const isPCMPlan = planName === "PCM Live 1:1 Doubt Support" || (planName && planName.includes("PCM Live"))

      // Check if it's active and not expired
      const isActive = status === "active"
      let notExpired = true

      if (endDate) {
        try {
          const endDateObj = new Date(endDate)
          if (!isNaN(endDateObj.getTime())) {
            notExpired = endDateObj > new Date()
          }
        } catch (error) {
          console.log("   Error parsing end date:", error.message)
        }
      }

      console.log("✅ Plan validation:")
      console.log("   Is PCM Plan:", isPCMPlan)
      console.log("   Is Active:", isActive)
      console.log("   Not Expired:", notExpired)

      hasActivePCMPlan = isPCMPlan && isActive && notExpired
      subscriptionDetails = currentSubscription
    } else {
      console.log("⚠️ No current subscription found")
    }

    console.log("🎯 Final result - Has Active PCM Plan:", hasActivePCMPlan)

    return NextResponse.json({
      success: true,
      hasActivePCMPlan,
      currentSubscription: subscriptionDetails,
      message: hasActivePCMPlan
        ? "User has active PCM Live 1:1 Doubt Support subscription"
        : "User does not have active PCM Live 1:1 Doubt Support subscription",
    })
  } catch (error) {
    console.error("❌ Error fetching current subscription:", error)
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
