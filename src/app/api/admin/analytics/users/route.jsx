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

    // Filter parameters
    const activity = searchParams.get("activity") || "all"
    const subscription = searchParams.get("subscription") || "all"
    const subscriptionPlan = searchParams.get("subscriptionPlan") || "all"
    const interest = searchParams.get("interest") || "all"

    console.log("Query params:", {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      activity,
      subscription,
      subscriptionPlan,
      interest,
    })

    const skip = (page - 1) * limit

    // Build base query
    const query = { role: "student" }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "testattempts",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [{ $eq: ["$student", "$$userId"] }, { $eq: ["$user", "$$userId"] }],
                },
              },
            },
          ],
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
                in: {
                  $ifNull: [
                    "$$attempt.score.percentage",
                    {
                      $ifNull: [
                        "$$attempt.score",
                        {
                          $cond: [
                            { $and: [{ $ne: ["$$attempt.score", null] }, { $ne: ["$$attempt.score", undefined] }] },
                            "$$attempt.score",
                            0,
                          ],
                        },
                      ],
                    },
                  ],
                },
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
                in: {
                  $ifNull: [
                    "$$attempt.score.percentage",
                    {
                      $ifNull: [
                        "$$attempt.score",
                        {
                          $cond: [
                            { $and: [{ $ne: ["$$attempt.score", null] }, { $ne: ["$$attempt.score", undefined] }] },
                            "$$attempt.score",
                            0,
                          ],
                        },
                      ],
                    },
                  ],
                },
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
    ]

    // Apply activity filter
    if (activity === "active") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      pipeline.push({
        $match: {
          $or: [{ lastActivity: { $gte: thirtyDaysAgo } }, { createdAt: { $gte: thirtyDaysAgo } }],
        },
      })
    } else if (activity === "inactive") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      pipeline.push({
        $match: {
          $and: [
            {
              $or: [{ lastActivity: { $lt: thirtyDaysAgo } }, { lastActivity: { $exists: false } }],
            },
            { createdAt: { $lt: thirtyDaysAgo } },
          ],
        },
      })
    }

    // Apply subscription filter
    if (subscription === "premium") {
      pipeline.push({
        $match: {
          isPremium: true,
          "currentSubscription.status": "active",
        },
      })
    } else if (subscription === "free") {
      pipeline.push({
        $match: {
          $or: [{ isPremium: { $ne: true } }, { "currentSubscription.status": { $ne: "active" } }],
        },
      })
    }

    // Apply subscription plan filter (only if subscription is premium)
    if (subscription === "premium" && subscriptionPlan !== "all") {
      let planFilter = {}

      switch (subscriptionPlan) {
        case "mentorship-silver":
          planFilter = {
            $or: [
              { "currentSubscription.planName": { $regex: /mentorship.*silver/i } },
              {
                "currentSubscription.type": "mentorship",
                "currentSubscription.category": "silver",
              },
            ],
          }
          break
        case "mentorship-gold":
          planFilter = {
            $or: [
              { "currentSubscription.planName": { $regex: /mentorship.*gold/i } },
              {
                "currentSubscription.type": "mentorship",
                "currentSubscription.category": "gold",
              },
            ],
          }
          break
        case "chat-doubt":
          planFilter = {
            $or: [
              { "currentSubscription.planName": { $regex: /chat.*doubt/i } },
              { "currentSubscription.type": "chat-doubt-solving" },
            ],
          }
          break
        case "live-doubt":
          planFilter = {
            $or: [
              { "currentSubscription.planName": { $regex: /live.*doubt/i } },
              { "currentSubscription.type": "live-doubt-solving" },
            ],
          }
          break
      }

      if (Object.keys(planFilter).length > 0) {
        pipeline.push({ $match: planFilter })
      }
    }

    // Apply interest filter
    if (interest === "interested") {
      pipeline.push({
        $match: {
          "interestData.interestedInPaidSubscription": true,
        },
      })
    } else if (interest === "not-interested") {
      pipeline.push({
        $match: {
          "interestData.interestedInPaidSubscription": false,
        },
      })
    }

    // Add projection
    pipeline.push({
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
        lastActivity: { $ifNull: ["$lastActivity", "$createdAt"] },
        interestData: {
          interestedInPaidSubscription: "$interestData.interestedInPaidSubscription",
          interestLevel: "$interestData.interestLevel",
          followUpStatus: "$interestData.followUpStatus",
          followUpDate: "$interestData.followUpDate",
          preferredSubscription: "$interestData.preferredSubscription",
          contactPreference: "$interestData.contactPreference",
          notes: "$interestData.notes",
          updatedAt: "$interestData.updatedAt",
        },
      },
    })

    // Get total count with filters applied
    const countPipeline = [...pipeline, { $count: "total" }]
    const totalResult = await User.aggregate(countPipeline)
    const totalUsers = totalResult[0]?.total || 0

    // Add sorting and pagination
    pipeline.push({ $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } }, { $skip: skip }, { $limit: limit })

    const users = await User.aggregate(pipeline)

    console.log(`Aggregation completed. Found ${users.length} users out of ${totalUsers} total`)

    // Enhanced logging for debugging
    if (users.length > 0) {
      const sampleUser = users[0]
      console.log("Sample user data:", {
        name: sampleUser.name,
        totalAttempts: sampleUser.totalAttempts,
        completedAttempts: sampleUser.completedAttempts,
        averageScore: sampleUser.averageScore,
        bestScore: sampleUser.bestScore,
        hasInterestData: !!sampleUser.interestData?.interestedInPaidSubscription,
      })
    }

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
