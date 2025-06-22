import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import UserSubscription from "@/models/UserSubscription"
import { authenticate } from "@/middleware/auth"

export async function POST(request) {
  try {
    // Authenticate the request
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { planName } = await request.json()

    if (!planName) {
      return NextResponse.json({ error: "Plan name is required" }, { status: 400 })
    }

    await connectDB()

    // Update expired subscriptions first
    await UserSubscription.updateExpiredSubscriptions()

    // Check for active subscription
    const activeSubscription = await UserSubscription.getActiveSubscription(auth.user._id, planName)

    return NextResponse.json({
      success: true,
      hasActiveSubscription: !!activeSubscription,
      subscription: activeSubscription,
    })
  } catch (error) {
    console.error("Error checking subscription:", error)
    return NextResponse.json(
      {
        error: "Failed to check subscription status",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
