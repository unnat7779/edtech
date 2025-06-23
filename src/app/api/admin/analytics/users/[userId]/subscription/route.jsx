import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { authenticate } from "@/middleware/auth"

export async function PUT(request, { params }) {
  let client
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

    // Connect directly to MongoDB
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    const db = client.db()
    const usersCollection = db.collection("users")

    // Find user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate status - use valid enum values
    const validStatuses = ["active", "expired", "cancelled", "pending"]
    const validatedStatus = validStatuses.includes(status) ? status : "active"

    // Validate premiumTier
    let validatedPremiumTier = "basic"
    if (selectedPlan.category === "silver" || selectedPlan.type === "mentorship") {
      validatedPremiumTier = "basic"
    } else if (selectedPlan.category === "gold" || selectedPlan.type === "chat-doubt-solving") {
      validatedPremiumTier = "premium"
    } else if (selectedPlan.category === "premium" || selectedPlan.type === "live-doubt-solving") {
      validatedPremiumTier = "enterprise"
    }

    // Calculate duration
    const months = customDuration.months || 0
    const calculatedDays = months * 30
    const finalDuration = {
      months: months,
      days: calculatedDays,
    }

    // Calculate end date
    const endDate = new Date(startDateObj)
    if (months) {
      endDate.setMonth(endDate.getMonth() + months)
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          error: "Unable to calculate subscription end date",
          details: "Please check the start date and duration values",
        },
        { status: 400 },
      )
    }

    // Create plan name
    let fullPlanName = "Premium Plan"
    if (selectedPlan.name) {
      fullPlanName = selectedPlan.name
    } else if (selectedPlan.type && selectedPlan.category) {
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

    // Create subscription data - pure objects
    const subscriptionData = {
      plan: fullPlanName,
      planName: fullPlanName,
      type: selectedPlan.type || "",
      category: selectedPlan.category || "",
      planTier: selectedPlan.planTier || "",
      status: validatedStatus,
      startDate: startDateObj,
      endDate: endDate,
      amount: Number(amount),
      paymentId: paymentId || null,
      duration: finalDuration,
      autoRenew: false,
      createdAt: new Date(),
    }

    // Create history entry
    const historyEntry = {
      plan: fullPlanName,
      planName: fullPlanName,
      type: selectedPlan.type || "",
      category: selectedPlan.category || "",
      planTier: selectedPlan.planTier || "",
      status: validatedStatus,
      startDate: startDateObj,
      endDate: endDate,
      amount: Number(amount),
      paymentId: paymentId || null,
      duration: {
        months: Number(finalDuration.months),
        days: Number(finalDuration.days),
      },
      autoRenew: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Creating subscription data:", subscriptionData)
    console.log("Creating history entry:", historyEntry)

    // Update user directly with MongoDB - no Mongoose
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          currentSubscription: subscriptionData,
          premiumTier: validatedPremiumTier,
          isPremium: validatedStatus === "active",
        },
        $push: {
          subscriptionHistory: historyEntry,
        },
      },
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update user subscription" }, { status: 500 })
    }

    console.log("Successfully updated subscription using direct MongoDB operations")

    // Get updated user data
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) })

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        currentSubscription: updatedUser.currentSubscription,
        premiumTier: updatedUser.premiumTier,
        isPremium: updatedUser.isPremium,
      },
    })
  } catch (error) {
    console.error("Update user subscription error:", error)

    return NextResponse.json(
      {
        error: "Failed to update subscription",
        details: "Please check all fields and try again",
      },
      { status: 500 },
    )
  } finally {
    if (client) {
      await client.close()
    }
  }
}

export async function GET(request, { params }) {
  let client
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

    // Connect directly to MongoDB
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    const db = client.db()
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          currentSubscription: 1,
          subscriptionHistory: 1,
          premiumTier: 1,
          isPremium: 1,
        },
      },
    )

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
  } finally {
    if (client) {
      await client.close()
    }
  }
}
