import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    console.log("=== Impersonation API Called ===")
    await connectDB()

    // Get admin token from Authorization header
    const authHeader = request.headers.get("authorization")
    console.log("Auth header present:", !!authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid authorization header")
      return NextResponse.json({ error: "Admin token required" }, { status: 401 })
    }

    const adminToken = authHeader.split(" ")[1]
    console.log("Admin token extracted:", !!adminToken)

    // Verify admin token
    let adminUser
    try {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET)
      console.log("Token decoded:", { userId: decoded.userId, role: decoded.role })

      adminUser = await User.findById(decoded.userId)
      console.log("Admin user found:", !!adminUser, "Role:", adminUser?.role)

      if (!adminUser) {
        console.log("Admin user not found in database")
        return NextResponse.json({ error: "Admin user not found" }, { status: 403 })
      }

      if (adminUser.role !== "admin") {
        console.log("User is not admin. Role:", adminUser.role)
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    } catch (error) {
      console.log("Token verification failed:", error.message)
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    // Await params before destructuring
    const { userId } = await params
    console.log("Target user ID:", userId)

    // Find the target user to impersonate
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      console.log("Target user not found:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Target user found:", targetUser.email)

    // Generate impersonation token for the target user
    const impersonationToken = jwt.sign(
      {
        userId: targetUser._id,
        email: targetUser.email,
        role: targetUser.role,
        impersonatedBy: adminUser._id,
        impersonatedAt: new Date(),
        type: "impersonation",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }, // Short-lived token for security
    )

    // Log the impersonation attempt
    console.log(
      `Admin ${adminUser.email} (${adminUser._id}) impersonating user ${targetUser.email} (${targetUser._id})`,
    )

    return NextResponse.json({
      success: true,
      token: impersonationToken,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        class: targetUser.class,
        profile: targetUser.profile,
      },
      message: `Impersonation token generated for ${targetUser.name}`,
    })
  } catch (error) {
    console.error("Impersonation error:", error)
    return NextResponse.json({ error: "Failed to generate impersonation token" }, { status: 500 })
  }
}
