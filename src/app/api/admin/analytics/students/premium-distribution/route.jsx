import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
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

    // Get premium plan distribution
    const planDistribution = await Subscription.aggregate([
      {
        $match: {
          status: "active",
          endDate: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: "$planType",
          count: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $project: {
          planType: "$_id",
          count: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ])

    // If no subscriptions found, return default data
    if (planDistribution.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          plans: [
            { planType: "1:1 Mentorship - Silver Plan", count: 0, revenue: 0, percentage: 0, revenuePercentage: 0 },
            { planType: "1:1 Mentorship - Gold Plan", count: 0, revenue: 0, percentage: 0, revenuePercentage: 0 },
            { planType: "PCM Chat Doubt Support", count: 0, revenue: 0, percentage: 0, revenuePercentage: 0 },
            { planType: "PCM Live 1:1 Doubt Support", count: 0, revenue: 0, percentage: 0, revenuePercentage: 0 },
          ],
          totalRevenue: 0,
          totalUsers: 0,
        },
      })
    }

    // Calculate total revenue and percentages
    const totalRevenue = planDistribution.reduce((sum, plan) => sum + plan.revenue, 0)
    const totalUsers = planDistribution.reduce((sum, plan) => sum + plan.count, 0)

    const formattedData = planDistribution.map((plan) => ({
      ...plan,
      percentage: totalUsers > 0 ? Math.round((plan.count / totalUsers) * 100) : 0,
      revenuePercentage: totalRevenue > 0 ? Math.round((plan.revenue / totalRevenue) * 100) : 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        plans: formattedData,
        totalRevenue,
        totalUsers,
      },
    })
  } catch (error) {
    console.error("Error fetching premium distribution:", error)
    return NextResponse.json({ error: "Failed to fetch premium distribution data" }, { status: 500 })
  }
}
