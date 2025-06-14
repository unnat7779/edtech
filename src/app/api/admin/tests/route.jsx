import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { verifyToken } from "@/lib/auth"

// Fixed constants
const FIXED_DURATION = 180 // 3 hours in minutes
const FIXED_SUBJECT = "All" // Changed from "All Subjects" to "All"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const skip = (page - 1) * limit

    const tests = await Test.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")

    const total = await Test.countDocuments({})

    return NextResponse.json({
      tests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    const { title, description, type, chapter, class: testClass, totalMarks, instructions, isActive } = body

    // Validate required fields
    if (!title || !description || !type || !testClass || !totalMarks) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create test with fixed duration and subject
    const test = new Test({
      title: title.trim(),
      description: description.trim(),
      type,
      subject: FIXED_SUBJECT, // Now uses "All" instead of "All Subjects"
      chapter: chapter?.trim() || "",
      class: testClass,
      duration: FIXED_DURATION, // Always 180 minutes (3 hours)
      totalMarks: Number.parseInt(totalMarks),
      instructions: instructions.filter((instruction) => instruction.trim() !== ""),
      isActive: Boolean(isActive),
      createdBy: decoded.userId,
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await test.save()

    return NextResponse.json({
      message: "Test created successfully",
      test,
    })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}
