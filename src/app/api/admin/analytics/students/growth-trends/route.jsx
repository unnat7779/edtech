import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
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

    // Get last 6 months data
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      })
    }

    const trendsData = await Promise.all(
      months.map(async (monthData) => {
        // New signups
        const newSignups = await User.countDocuments({
          role: "student",
          createdAt: {
            $gte: monthData.startDate,
            $lte: monthData.endDate,
          },
        })

        // Premium conversions
        const premiumConversions = await Subscription.countDocuments({
          createdAt: {
            $gte: monthData.startDate,
            $lte: monthData.endDate,
          },
        })

        // Revenue growth
        const revenueResult = await Subscription.aggregate([
          {
            $match: {
              createdAt: {
                $gte: monthData.startDate,
                $lte: monthData.endDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
            },
          },
        ])

        // Churn rate (subscriptions that ended this month)
        const churnedSubscriptions = await Subscription.countDocuments({
          status: "cancelled",
          endDate: {
            $gte: monthData.startDate,
            $lte: monthData.endDate,
          },
        })

        const totalActiveAtStart = await Subscription.countDocuments({
          createdAt: { $lt: monthData.startDate },
          $or: [{ status: "active" }, { endDate: { $gte: monthData.startDate } }],
        })

        return {
          month: monthData.month,
          year: monthData.year,
          label: monthData.startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          newSignups,
          premiumConversions,
          revenue: revenueResult[0]?.totalRevenue || 0,
          churnRate: totalActiveAtStart > 0 ? Math.round((churnedSubscriptions / totalActiveAtStart) * 100) : 0,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: trendsData,
    })
  } catch (error) {
    console.error("Error fetching growth trends:", error)
    return NextResponse.json({ error: "Failed to fetch growth trends data" }, { status: 500 })
  }
}
