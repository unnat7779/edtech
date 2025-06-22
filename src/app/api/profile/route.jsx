import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"

export async function GET(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(auth.user._id).select("-password")

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const userData = await request.json()
    console.log("📤 Profile update request data:", userData)

    await connectDB()

    // Remove fields that shouldn't be updated
    delete userData.email // Don't allow email changes
    delete userData._id
    delete userData.password
    delete userData.role
    delete userData.isPremium
    delete userData.premiumTier
    delete userData.currentSubscription
    delete userData.subscriptionHistory
    delete userData.testStats
    delete userData.createdAt
    delete userData.updatedAt

    console.log("🔄 Sanitized update data:", userData)

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      auth.user._id,
      { $set: userData },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("✅ User updated successfully:", {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      whatsappNo: updatedUser.whatsappNo,
      class: updatedUser.class,
    })

    // Return the updated user data (keeping the same structure as login response)
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        whatsappNo: updatedUser.whatsappNo,
        phone: updatedUser.phone,
        class: updatedUser.class,
        grade: updatedUser.grade,
        enrolledInCoaching: updatedUser.enrolledInCoaching,
        coachingName: updatedUser.coachingName,
        dob: updatedUser.dob,
        dateOfBirth: updatedUser.dateOfBirth,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        role: updatedUser.role,
        isPremium: updatedUser.isPremium,
        premiumTier: updatedUser.premiumTier,
        currentSubscription: updatedUser.currentSubscription,
        subscriptionHistory: updatedUser.subscriptionHistory,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)

    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    if (error.name === "CastError") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
