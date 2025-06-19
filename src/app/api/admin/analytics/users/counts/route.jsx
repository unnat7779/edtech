import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request) {
  try {
    console.log("=== Fetching Student Counts ===")
    await connectDB()

    // Get current date for activity calculations
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Base query for students only
    const baseQuery = { role: "student" }

    // Get total count
    const total = await User.countDocuments(baseQuery)

    // Get active users (with test attempts in last 30 days)
    const activeUsers = await User.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: "testattempts",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [{ $eq: ["$student", "$$userId"] }, { $eq: ["$user", "$$userId"] }],
                    },
                    { $gte: ["$createdAt", thirtyDaysAgo] },
                  ],
                },
              },
            },
          ],
          as: "recentAttempts",
        },
      },
      {
        $match: {
          "recentAttempts.0": { $exists: true },
        },
      },
      { $count: "count" },
    ])

    const active = activeUsers[0]?.count || 0
    const inactive = total - active

    // Get premium users
    const premium = await User.countDocuments({
      ...baseQuery,
      isPremium: true,
      "currentSubscription.status": "active",
    })

    const free = total - premium

    // Get premium users by plan type
    const mentorshipSilver = await User.countDocuments({
      ...baseQuery,
      isPremium: true,
      "currentSubscription.status": "active",
      $or: [
        { "currentSubscription.planName": { $regex: /mentorship.*silver/i } },
        { "currentSubscription.type": "mentorship", "currentSubscription.category": "silver" },
      ],
    })

    const mentorshipGold = await User.countDocuments({
      ...baseQuery,
      isPremium: true,
      "currentSubscription.status": "active",
      $or: [
        { "currentSubscription.planName": { $regex: /mentorship.*gold/i } },
        { "currentSubscription.type": "mentorship", "currentSubscription.category": "gold" },
      ],
    })

    const chatDoubt = await User.countDocuments({
      ...baseQuery,
      isPremium: true,
      "currentSubscription.status": "active",
      $or: [
        { "currentSubscription.planName": { $regex: /chat.*doubt/i } },
        { "currentSubscription.type": "chat-doubt-solving" },
      ],
    })

    const liveDoubt = await User.countDocuments({
      ...baseQuery,
      isPremium: true,
      "currentSubscription.status": "active",
      $or: [
        { "currentSubscription.planName": { $regex: /live.*doubt/i } },
        { "currentSubscription.type": "live-doubt-solving" },
      ],
    })

    // Get interest-based counts
    const interestedUsers = await User.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: "userinterests",
          localField: "_id",
          foreignField: "user",
          as: "interest",
        },
      },
      {
        $match: {
          "interest.interestedInPaidSubscription": true,
        },
      },
      { $count: "count" },
    ])

    const notInterestedUsers = await User.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: "userinterests",
          localField: "_id",
          foreignField: "user",
          as: "interest",
        },
      },
      {
        $match: {
          "interest.interestedInPaidSubscription": false,
        },
      },
      { $count: "count" },
    ])

    const interested = interestedUsers[0]?.count || 0
    const notInterested = notInterestedUsers[0]?.count || 0

    const counts = {
      total,
      active,
      inactive,
      premium,
      free,
      mentorshipSilver,
      mentorshipGold,
      chatDoubt,
      liveDoubt,
      interested,
      notInterested,
    }

    console.log("📊 Student counts:", counts)

    return NextResponse.json({
      success: true,
      counts,
    })
  } catch (error) {
    console.error("❌ Error fetching student counts:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch student counts",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
