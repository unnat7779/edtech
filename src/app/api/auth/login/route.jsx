import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { verifyPassword } from "@/lib/auth"
import { createToken, setAuthCookie } from "@/lib/auth-cookies"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt for email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    await connectDB()

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log("User not found for email:", email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      console.log("Invalid password for user:", email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate token with string userId
    const token = await createToken({
      userId: user._id.toString(),
      role: user.role,
    })

    // Set HTTP-only cookie
    await setAuthCookie(token)

    // Remove password from response
    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      whatsappNo: user.whatsappNo,
      class: user.class,
      role: user.role,
      enrolledInCoaching: user.enrolledInCoaching,
      coachingName: user.coachingName,
      subscription: user.subscription || {
        type: "free",
        isActive: false,
      },
      profile: user.profile || {},
      testStats: user.testStats || {
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
      },
    }

    console.log("Login successful for user:", email)

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token, // Still send token for localStorage fallback
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
