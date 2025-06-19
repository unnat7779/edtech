import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import UserInterest from "@/models/UserInterest"
import { authenticate } from "@/middleware/auth"

export async function POST(request, { params }) {
  try {
    console.log("=== Interest Update API Called ===")

    const auth = await authenticate(request)
    if (auth.error) {
      console.log("Authentication failed:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      console.log("User is not admin:", auth.user.role)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()
    console.log("Database connected")

    const body = await request.json()
    console.log("Request body:", body)

    // Await params in Next.js 15
    const { userId } = await params
    console.log("User ID:", userId)

    const {
      interestedInPaidSubscription,
      interestLevel,
      preferredSubscription,
      contactPreference,
      followUpDate,
      notes,
    } = body

    // Validate required field
    if (typeof interestedInPaidSubscription !== "boolean") {
      return NextResponse.json(
        { error: "interestedInPaidSubscription is required and must be a boolean" },
        { status: 400 },
      )
    }

    // Upsert the user interest record
    const interestData = {
      user: userId,
      interestedInPaidSubscription,
      interestLevel: interestLevel || null,
      preferredSubscription: preferredSubscription || null,
      contactPreference: contactPreference || "whatsapp",
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      notes: notes || "",
      lastUpdatedBy: auth.user.id,
      updatedAt: new Date(),
    }

    console.log("Upserting interest data:", interestData)

    const result = await UserInterest.findOneAndUpdate({ user: userId }, interestData, {
      upsert: true,
      new: true,
      runValidators: true,
    })

    console.log("✅ Interest update result:", result)

    // Verify the data was saved
    const verification = await UserInterest.findOne({ user: userId }).lean()
    console.log("🔍 Verification query result:", verification)

    return NextResponse.json({
      success: true,
      message: "Interest data updated successfully",
      data: result,
    })
  } catch (error) {
    console.error("❌ Interest update error:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Failed to update interest data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request, { params }) {
  try {
    console.log("=== Get Interest API Called ===")

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Await params in Next.js 15
    const { userId } = await params
    console.log("User ID:", userId)

    const interest = await UserInterest.findOne({ user: userId }).lean()
    console.log("Found interest data:", interest)

    return NextResponse.json({
      success: true,
      data: interest,
    })
  } catch (error) {
    console.error("Get interest error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch interest data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
