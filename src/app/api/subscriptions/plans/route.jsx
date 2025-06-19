import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Subscription from "@/models/Subscription"

export async function GET() {
  try {
    await connectDB()

    // Get all active subscription plans
    const plans = await Subscription.find({ isActive: true }).sort({ price: 1 })

    // If no plans exist, create default plans with explicit duration values
    if (plans.length === 0) {
      const defaultPlansData = [
        {
          name: "1:1 Mentorship - Silver Plan",
          type: "mentorship",
          description: "3 Months Plan with IITian mentorship",
          features: [
            "Customized study plan",
            "24/7 call & chat support",
            "Weekly deep strategy analysis",
            "Help in test analysis",
          ],
          price: 2000,
          duration: { months: 3, days: 90 },
          category: "silver",
          planTier: "SILVER PLAN",
          supportMode: "both",
          isActive: true,
        },
        {
          name: "1:1 Mentorship - Gold Plan",
          type: "mentorship",
          description: "6 Months Plan with IITian mentorship",
          features: [
            "Customized study plan",
            "24/7 call & chat support",
            "Weekly deep strategy analysis",
            "Help in test analysis",
            "Extended 6-month support",
          ],
          price: 5000,
          duration: { months: 6, days: 180 },
          category: "gold",
          planTier: "GOLD PLAN",
          supportMode: "both",
          isActive: true,
        },
        {
          name: "PCM Chat Doubt Support",
          type: "chat-doubt-solving",
          description: "IITian doubt experts help through WhatsApp/Telegram",
          features: [
            "IITian doubt experts",
            "WhatsApp/Telegram support",
            "Doubts solved within 10 minutes",
            "PCM subject coverage",
          ],
          price: 1500,
          duration: { months: 3, days: 90 },
          category: "premium",
          planTier: "PREMIUM PLAN",
          supportMode: "chat",
          isActive: true,
        },
        {
          name: "PCM Live 1:1 Doubt Support",
          type: "live-doubt-solving",
          description: "IITian with under 1500 rank on live VC daily",
          features: [
            "IITian with under 1500 rank",
            "Daily live video calls",
            "Real-time doubt solving",
            "JEE guidance and mentoring",
            "Personalized attention",
          ],
          price: 4499,
          duration: { months: 1, days: 30 },
          category: "premium",
          planTier: "PREMIUM PLAN",
          supportMode: "live",
          isActive: true,
        },
      ]

      try {
        await Subscription.insertMany(defaultPlansData)
        console.log("Default subscription plans created successfully")
      } catch (insertError) {
        console.error("Error creating default plans:", insertError)
        // If insertion fails, try to fetch existing plans anyway
      }

      // Fetch the plans again after insertion attempt
      const newPlans = await Subscription.find({ isActive: true }).sort({ price: 1 })

      return NextResponse.json({
        success: true,
        data: newPlans,
        message: "Subscription plans fetched successfully",
      })
    }

    return NextResponse.json({
      success: true,
      data: plans,
      message: "Subscription plans fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching subscription plans:", error)

    // Return a fallback response with basic plan structure
    const fallbackPlans = [
      {
        _id: "fallback-1",
        name: "1:1 Mentorship - Silver Plan",
        type: "mentorship",
        description: "3 Months Plan with IITian mentorship",
        price: 2000,
        duration: { months: 3, days: 90 },
        category: "silver",
        planTier: "SILVER PLAN",
        features: ["Customized study plan", "24/7 support", "Weekly analysis"],
        isActive: true,
      },
      {
        _id: "fallback-2",
        name: "1:1 Mentorship - Gold Plan",
        type: "mentorship",
        description: "6 Months Plan with IITian mentorship",
        price: 5000,
        duration: { months: 6, days: 180 },
        category: "gold",
        planTier: "GOLD PLAN",
        features: ["All Silver features", "Extended support"],
        isActive: true,
      },
    ]

    return NextResponse.json({
      success: true,
      data: fallbackPlans,
      message: "Fallback subscription plans provided",
      warning: "Using fallback data due to database error",
    })
  }
}
