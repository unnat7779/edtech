import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import { generateToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request) {
  try {
    console.log("🔄 Token refresh request received")

    // Authenticate current token (even if expired, we can still decode it)
    const auth = await authenticate(request)

    if (auth.error && auth.error !== "Token expired") {
      console.log("❌ Invalid token for refresh:", auth.error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Get user from database to ensure they still exist
    const user = await User.findById(auth.user.id || auth.user._id)
    if (!user) {
      console.log("❌ User not found during refresh")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate new token
    const newToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || "student",
      name: user.name,
    })

    console.log("✅ Token refreshed successfully for user:", user.email)

    return NextResponse.json({
      success: true,
      token: newToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || "student",
        profileCompleted: user.profileCompleted || false,
      },
    })
  } catch (error) {
    console.error("❌ Token refresh error:", error)
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 })
  }
}
