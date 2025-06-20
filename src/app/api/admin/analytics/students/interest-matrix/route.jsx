import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get active users with interest data
    const activeUsersData = await User.aggregate([
      { $match: { role: "student" } },
      {
        $lookup: {
          from: "testattempts",
          localField: "_id",
          foreignField: "userId",
          as: "recentAttempts",
          pipeline: [{ $match: { createdAt: { $gte: thirtyDaysAgo } } }],
        },
      },
      {
        $lookup: {
          from: "userinterests",
          localField: "_id",
          foreignField: "userId",
          as: "interest",
        },
      },
      {
        $addFields: {
          isActive: { $gt: [{ $size: "$recentAttempts" }, 0] },
          interestStatus: {
            $cond: {
              if: { $eq: [{ $size: "$interest" }, 0] },
              then: "unknown",
              else: {
                $cond: {
                  if: { $eq: [{ $arrayElemAt: ["$interest.interestedInPaidSubscription", 0] }, true] },
                  then: "interested",
                  else: "not_interested",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            isActive: "$isActive",
            interestStatus: "$interestStatus",
          },
          count: { $sum: 1 },
        },
      },
    ])

    // Process data into matrix format
    const matrix = {
      active: { interested: 0, not_interested: 0, unknown: 0 },
      inactive: { interested: 0, not_interested: 0, unknown: 0 },
    }

    activeUsersData.forEach((item) => {
      const activityKey = item._id.isActive ? "active" : "inactive"
      const interestKey = item._id.interestStatus
      matrix[activityKey][interestKey] = item.count
    })

    // Calculate totals and percentages
    const totalActive = matrix.active.interested + matrix.active.not_interested + matrix.active.unknown
    const totalInactive = matrix.inactive.interested + matrix.inactive.not_interested + matrix.inactive.unknown
    const grandTotal = totalActive + totalInactive

    const matrixWithPercentages = {
      active: {
        interested: {
          count: matrix.active.interested,
          percentage: grandTotal > 0 ? Math.round((matrix.active.interested / grandTotal) * 100) : 0,
        },
        not_interested: {
          count: matrix.active.not_interested,
          percentage: grandTotal > 0 ? Math.round((matrix.active.not_interested / grandTotal) * 100) : 0,
        },
        unknown: {
          count: matrix.active.unknown,
          percentage: grandTotal > 0 ? Math.round((matrix.active.unknown / grandTotal) * 100) : 0,
        },
      },
      inactive: {
        interested: {
          count: matrix.inactive.interested,
          percentage: grandTotal > 0 ? Math.round((matrix.inactive.interested / grandTotal) * 100) : 0,
        },
        not_interested: {
          count: matrix.inactive.not_interested,
          percentage: grandTotal > 0 ? Math.round((matrix.inactive.not_interested / grandTotal) * 100) : 0,
        },
        unknown: {
          count: matrix.inactive.unknown,
          percentage: grandTotal > 0 ? Math.round((matrix.inactive.unknown / grandTotal) * 100) : 0,
        },
      },
    }

    return NextResponse.json({
      success: true,
      data: {
        matrix: matrixWithPercentages,
        totals: {
          active: totalActive,
          inactive: totalInactive,
          total: grandTotal,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching interest matrix:", error)
    return NextResponse.json({ error: "Failed to fetch interest matrix data" }, { status: 500 })
  }
}
