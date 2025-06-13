import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { requireAdmin } from "@/middleware/auth"

export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    // Get all tests for admin
    const tests = await Test.find({})
      .select("title description type subject chapter class duration totalMarks questions isActive createdBy")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json({ tests })
  } catch (error) {
    console.error("Get admin tests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const testData = await request.json()

    await connectDB()

    const test = new Test({
      ...testData,
      createdBy: auth.user._id,
      questions: [],
      isActive: true, // All tests are active by default
    })

    await test.save()

    return NextResponse.json(
      {
        message: "Test created successfully",
        test,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
