import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import UserInterest from "@/models/UserInterest"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get conversion rates by interest level
    const conversionData = await UserInterest.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: {
            interested: "$interestedInPaidSubscription",
            interestLevel: "$interestLevel",
          },
          totalUsers: { $sum: 1 },
          premiumUsers: {
            $sum: {
              $cond: [{ $eq: ["$user.isPremium", true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          interestCategory: {
            $switch: {
              branches: [
                {
                  case: { $and: [{ $eq: ["$_id.interested", true] }, { $eq: ["$_id.interestLevel", "high"] }] },
                  then: "Very Interested",
                },
                {
                  case: { $and: [{ $eq: ["$_id.interested", true] }, { $eq: ["$_id.interestLevel", "medium"] }] },
                  then: "Somewhat Interested",
                },
                {
                  case: { $and: [{ $eq: ["$_id.interested", true] }, { $eq: ["$_id.interestLevel", "low"] }] },
                  then: "Maybe Later",
                },
                {
                  case: { $eq: ["$_id.interested", false] },
                  then: "Not Interested",
                },
              ],
              default: "Unknown",
            },
          },
          totalUsers: 1,
          premiumUsers: 1,
          conversionRate: {
            $cond: [
              { $gt: ["$totalUsers", 0] },
              { $multiply: [{ $divide: ["$premiumUsers", "$totalUsers"] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $sort: { conversionRate: -1 },
      },
    ])

    // If no data found, return default data
    if (conversionData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [
          { interestCategory: "Very Interested", totalUsers: 0, premiumUsers: 0, conversionRate: 0 },
          { interestCategory: "Somewhat Interested", totalUsers: 0, premiumUsers: 0, conversionRate: 0 },
          { interestCategory: "Maybe Later", totalUsers: 0, premiumUsers: 0, conversionRate: 0 },
          { interestCategory: "Not Interested", totalUsers: 0, premiumUsers: 0, conversionRate: 0 },
        ],
      })
    }

    return NextResponse.json({
      success: true,
      data: conversionData,
    })
  } catch (error) {
    console.error("Error fetching interest conversion:", error)
    return NextResponse.json({ error: "Failed to fetch interest conversion data" }, { status: 500 })
  }
}
