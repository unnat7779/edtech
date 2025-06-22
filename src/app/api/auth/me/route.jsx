import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import User from "@/models/User"
import connectDB from "@/lib/mongodb"

export async function GET(request) {
  try {
    console.log("🔍 /api/auth/me - Starting user data fetch...")

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid authorization header found")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix
    console.log("🔑 Token extracted:", token ? "Present" : "Missing")

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log("✅ Token verified for user:", decoded.userId)
    } catch (error) {
      console.log("❌ Token verification failed:", error.message)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to database
    await connectDB()
    console.log("✅ Database connected")

    // Fetch complete user data from database
    const user = await User.findById(decoded.userId).select("-password").lean()

    if (!user) {
      console.log("❌ User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("📊 Complete user data found:", {
      id: user._id,
      name: user.name,
      email: user.email,
      whatsappNo: user.whatsappNo,
      class: user.class,
      enrolledInCoaching: user.enrolledInCoaching,
      coachingName: user.coachingName,
      hasAllFields: !!(user.whatsappNo && user.class),
    })

    // Return complete user data
    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        whatsappNo: user.whatsappNo,
        class: user.class,
        enrolledInCoaching: user.enrolledInCoaching,
        coachingName: user.coachingName,
        phone: user.phone,
        grade: user.grade,
        dateOfBirth: user.dateOfBirth,
        dob: user.dob,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        role: user.role,
        isPremium: user.isPremium,
        premiumTier: user.premiumTier,
        currentSubscription: user.currentSubscription,
        subscriptionHistory: user.subscriptionHistory,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("❌ /api/auth/me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
