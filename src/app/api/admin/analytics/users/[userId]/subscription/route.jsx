import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"

export async function PUT(request, { params }) {
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

    const body = await request.json()
    const { selectedPlan, customDuration, amount, paymentId, startDate, status = "active" } = body

    console.log("Received subscription update data:", {
      selectedPlan,
      customDuration,
      amount,
      paymentId,
      startDate,
      status,
    })

    // Validation: Check required fields
    const missingFields = []
    if (!selectedPlan) missingFields.push("Subscription plan")
    if (!amount || amount <= 0) missingFields.push("Amount paid")
    if (!startDate) missingFields.push("Start date")
    if (!customDuration?.months || customDuration.months <= 0) missingFields.push("Plan duration")

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Please fill in all required information",
          details: `Missing: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 },
      )
    }

    // Validate dates
    const startDateObj = new Date(startDate)
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json(
        {
          error: "Please provide a valid start date",
          details: "The start date format is invalid",
        },
        { status: 400 },
      )
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate status - use valid enum values from User model
    const validStatuses = ["active", "expired", "cancelled", "pending"]
    const validatedStatus = validStatuses.includes(status) ? status : "active"

    // Validate premiumTier - use valid enum values from User model
    const validPremiumTiers = ["basic", "premium", "pro", "enterprise"]
    let validatedPremiumTier = "basic"

    // Map plan categories/types to valid premium tiers
    if (selectedPlan.category === "silver" || selectedPlan.type === "mentorship") {
      validatedPremiumTier = "basic"
    } else if (selectedPlan.category === "gold" || selectedPlan.type === "chat-doubt-solving") {
      validatedPremiumTier = "premium"
    } else if (selectedPlan.category === "premium" || selectedPlan.type === "live-doubt-solving") {
      validatedPremiumTier = "pro"
    }

    // Calculate duration - use the exact duration from form
    const months = customDuration.months || 0
    const calculatedDays = months * 30
    const finalDuration = {
      months: months,
      days: calculatedDays,
    }

    // Calculate end date based on start date and duration
    const endDate = new Date(startDateObj)
    if (months) {
      endDate.setMonth(endDate.getMonth() + months)
    }

    // Validate end date
    if (isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          error: "Unable to calculate subscription end date",
          details: "Please check the start date and duration values",
        },
        { status: 400 },
      )
    }

    // Create the full plan name based on selectedPlan data
    let fullPlanName = "Premium Plan" // Default fallback

    if (selectedPlan.name) {
      fullPlanName = selectedPlan.name
    } else if (selectedPlan.type && selectedPlan.category) {
      // Construct plan name from type and category
      if (selectedPlan.type === "mentorship") {
        fullPlanName = `1:1 Mentorship - ${selectedPlan.category.charAt(0).toUpperCase() + selectedPlan.category.slice(1)} Plan`
      } else if (selectedPlan.type === "chat-doubt-solving") {
        fullPlanName = "PCM Chat Doubt Support"
      } else if (selectedPlan.type === "live-doubt-solving") {
        fullPlanName = "PCM Live 1:1 Doubt Support"
      } else {
        fullPlanName = `${selectedPlan.type} - ${selectedPlan.category}`
      }
    } else if (selectedPlan.planName) {
      fullPlanName = selectedPlan.planName
    }

    console.log("Generated full plan name:", fullPlanName)

    // Update user subscription with the full plan name
    user.currentSubscription = {
      plan: fullPlanName, // Use the constructed full plan name
      planName: fullPlanName, // Also save as planName for consistency
      type: selectedPlan.type,
      category: selectedPlan.category,
      planTier: selectedPlan.planTier,
      status: validatedStatus,
      startDate: startDateObj,
      endDate: endDate,
      amount: amount,
      paymentId: paymentId || null,
      duration: finalDuration,
      autoRenew: false, // Default to false
    }

    user.premiumTier = validatedPremiumTier
    user.isPremium = validatedStatus === "active"

    // Add to subscription history with the full plan name
    user.subscriptionHistory = user.subscriptionHistory || []
    user.subscriptionHistory.push({
      plan: fullPlanName, // Use the constructed full plan name
      planName: fullPlanName, // Also save as planName for consistency
      type: selectedPlan.type,
      category: selectedPlan.category,
      planTier: selectedPlan.planTier,
      status: validatedStatus,
      startDate: startDateObj,
      endDate: endDate,
      amount: amount,
      paymentId: paymentId || null,
      duration: finalDuration,
      updatedAt: new Date(),
      autoRenew: false,
    })

    await user.save()

    console.log("Saved subscription with plan name:", fullPlanName)

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currentSubscription: user.currentSubscription,
        premiumTier: user.premiumTier,
        isPremium: user.isPremium,
      },
    })
  } catch (error) {
    console.error("Update user subscription error:", error)

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json(
        {
          error: "Please check all required fields and try again",
          details: validationErrors.join(", "),
          validationErrors,
        },
        { status: 400 },
      )
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Subscription data conflict",
          details: "This subscription information already exists",
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to update subscription",
        details: "Please check all fields and try again",
      },
      { status: 500 },
    )
  }
}

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

    const user = await User.findById(userId).select("currentSubscription subscriptionHistory premiumTier isPremium")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      subscription: user.currentSubscription,
      subscriptionHistory: user.subscriptionHistory,
      premiumTier: user.premiumTier,
      isPremium: user.isPremium,
    })
  } catch (error) {
    console.error("Get user subscription error:", error)
    return NextResponse.json({ error: "Failed to get user subscription" }, { status: 500 })
  }
}
