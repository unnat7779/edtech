import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request) {
  try {
    console.log("=== Admin Analytics Users API Called ===")

    await connectDB()
    console.log("Database connected")

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    console.log("Query params:", { page, limit, search, sortBy, sortOrder })

    const skip = (page - 1) * limit

    // Build search query
    const query = { role: "student" }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    console.log("Database query:", JSON.stringify(query))

    // Get total count
    const totalUsers = await User.countDocuments(query)
    console.log("Total users found:", totalUsers)

    // Get users with aggregation pipeline
    const users = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "testattempts",
          localField: "_id",
          foreignField: "student",
          as: "attempts",
        },
      },
      {
        $lookup: {
          from: "userinterests",
          localField: "_id",
          foreignField: "user",
          as: "interest",
        },
      },
      {
        $addFields: {
          totalAttempts: { $size: "$attempts" },
          completedAttempts: {
            $size: {
              $filter: {
                input: "$attempts",
                cond: { $eq: ["$$this.status", "completed"] },
              },
            },
          },
          averageScore: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: "$attempts",
                    cond: { $eq: ["$$this.status", "completed"] },
                  },
                },
                as: "attempt",
                in: "$$attempt.score.percentage",
              },
            },
          },
          bestScore: {
            $max: {
              $map: {
                input: {
                  $filter: {
                    input: "$attempts",
                    cond: { $eq: ["$$this.status", "completed"] },
                  },
                },
                as: "attempt",
                in: "$$attempt.score.percentage",
              },
            },
          },
          totalTimeSpent: {
            $sum: {
              $map: {
                input: "$attempts",
                as: "attempt",
                in: { $ifNull: ["$$attempt.timeSpent", 0] },
              },
            },
          },
          lastActivity: {
            $max: {
              $map: {
                input: "$attempts",
                as: "attempt",
                in: "$$attempt.createdAt",
              },
            },
          },
          interestData: { $arrayElemAt: ["$interest", 0] },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          whatsappNo: 1,
          class: 1,
          isPremium: 1,
          premiumTier: 1,
          createdAt: 1,
          totalAttempts: 1,
          completedAttempts: 1,
          averageScore: { $round: [{ $ifNull: ["$averageScore", 0] }, 1] },
          bestScore: { $round: [{ $ifNull: ["$bestScore", 0] }, 1] },
          totalTimeSpent: { $round: [{ $divide: [{ $ifNull: ["$totalTimeSpent", 0] }, 60] }, 0] },
          lastActivity: 1,
          interestData: {
            interestedInPaidSubscription: "$interestData.interestedInPaidSubscription",
            interestLevel: "$interestData.interestLevel",
            followUpStatus: "$interestData.followUpStatus",
            followUpDate: "$interestData.followUpDate",
          },
        },
      },
      { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
      { $skip: skip },
      { $limit: limit },
    ])

    console.log(`Aggregation completed. Found ${users.length} users`)

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        totalItems: totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1,
        total: Math.ceil(totalUsers / limit),
      },
    })
  } catch (error) {
    console.error("=== API Error ===")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to fetch users analytics",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
