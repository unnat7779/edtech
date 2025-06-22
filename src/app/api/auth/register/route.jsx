import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { hashPassword } from "@/lib/auth"
import { createToken, setAuthCookie } from "@/lib/auth-cookies"

export async function POST(request) {
  try {
    console.log("Registration request received")

    const body = await request.json()
    console.log("Request body:", body)

    const {
      name,
      email,
      password,
      confirmPassword,
      whatsappNo,
      class: studentClass,
      enrolledInCoaching,
      coachingName,
    } = body

    // Enhanced validation
    const errors = {}

    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long"
    }

    if (!email || !email.includes("@")) {
      errors.email = "Please enter a valid email address"
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters long"
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (!whatsappNo || whatsappNo.trim().length < 10) {
      errors.whatsappNo = "Please enter a valid WhatsApp number"
    }

    if (!studentClass) {
      errors.class = "Please select your class"
    }

    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors)
      return NextResponse.json(
        {
          error: "Validation failed",
          errors,
          success: false,
        },
        { status: 400 },
      )
    }

    console.log("Connecting to database...")
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    })

    if (existingUser) {
      console.log("User already exists:", email)
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please try logging in instead.",
          success: false,
        },
        { status: 400 },
      )
    }

    console.log("Hashing password...")
    // Hash password
    const hashedPassword = await hashPassword(password)

    console.log("Creating user with data:", {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      whatsappNo: whatsappNo.trim(),
      class: studentClass,
      enrolledInCoaching: enrolledInCoaching || false,
      coachingName: coachingName?.trim() || "",
    })

    // Create user with all registration fields
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      whatsappNo: whatsappNo.trim(),
      class: studentClass,
      role: "student",
      enrolledInCoaching: enrolledInCoaching || false,
      coachingName: coachingName?.trim() || "",
      // Additional fields for better user management
      phone: whatsappNo.trim(), // Also store as phone for compatibility
      grade: studentClass, // Also store as grade for compatibility
      subscription: {
        type: "free",
        isActive: false,
      },
      profile: {
        whatsappNo: whatsappNo.trim(),
        class: studentClass,
        enrolledInCoaching: enrolledInCoaching || false,
        coachingName: coachingName?.trim() || "",
      },
      testStats: {
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
      },
      stats: {
        totalTestsAttempted: 0,
        totalTestsCompleted: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        streak: {
          current: 0,
          longest: 0,
          lastActivity: new Date(),
        },
      },
    })

    await user.save()
    console.log("User created successfully with ID:", user._id)
    console.log("Saved user data:", {
      name: user.name,
      email: user.email,
      whatsappNo: user.whatsappNo,
      class: user.class,
      enrolledInCoaching: user.enrolledInCoaching,
      coachingName: user.coachingName,
    })

    // Generate token
    const token = await createToken({
      userId: user._id.toString(),
      role: user.role,
    })

    console.log("Token generated, setting cookie...")
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
      subscription: user.subscription,
      profile: user.profile,
      testStats: user.testStats,
      stats: user.stats,
    }

    console.log("Registration successful for:", email)
    return NextResponse.json(
      {
        message: "Account created successfully! Welcome to JEEElevate!",
        user: userResponse,
        token,
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
          success: false,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Registration failed. Please try again later.",
        success: false,
      },
      { status: 500 },
    )
  }
}
