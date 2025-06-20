import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import UserInterest from "@/models/UserInterest"
import Subscription from "@/models/Subscription"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get total users
    const totalUsers = await User.countDocuments({ role: "student" })

    // Get interested users
    const interestedUsers = await UserInterest.countDocuments({
      interestedInPaidSubscription: true,
    })

    // Get premium signups (users with isPremium true)
    const premiumSignups = await User.countDocuments({
      role: "student",
      isPremium: true,
    })

    // Get active premium users (with active subscriptions)
    const activePremium = await Subscription.countDocuments({
      status: "active",
      endDate: { $gt: new Date() },
    })

    // Calculate conversion rates
    const interestedRate = totalUsers > 0 ? Math.round((interestedUsers / totalUsers) * 100) : 0
    const signupRate = interestedUsers > 0 ? Math.round((premiumSignups / interestedUsers) * 100) : 0
    const activeRate = premiumSignups > 0 ? Math.round((activePremium / premiumSignups) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        stages: [
          {
            name: "Total Users",
            count: totalUsers,
            percentage: 100,
            conversionRate: null,
          },
          {
            name: "Interested Users",
            count: interestedUsers,
            percentage: interestedRate,
            conversionRate: interestedRate,
          },
          {
            name: "Premium Signups",
            count: premiumSignups,
            percentage: Math.round((premiumSignups / totalUsers) * 100),
            conversionRate: signupRate,
          },
          {
            name: "Active Premium",
            count: activePremium,
            percentage: Math.round((activePremium / totalUsers) * 100),
            conversionRate: activeRate,
          },
        ],
      },
    })
  } catch (error) {
    console.error("Error fetching conversion funnel:", error)
    return NextResponse.json({ error: "Failed to fetch conversion funnel data" }, { status: 500 })
  }
}
