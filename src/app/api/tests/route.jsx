import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"

export async function GET(request) {
  try {
    await connectDB()
    console.log("Connected to MongoDB, fetching tests...")

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const subject = searchParams.get("subject")
    const classParam = searchParams.get("class")

    // Build filter query
    const filter = {
      isActive: true,
      // Only show tests that have questions
      $expr: { $gt: [{ $size: "$questions" }, 0] },
    }

    if (type && type !== "All Types") filter.type = type
    if (subject && subject !== "All Subjects") filter.subject = subject
    if (classParam && classParam !== "All Classes") filter.class = classParam

    console.log("Applying filter:", JSON.stringify(filter))

    const tests = await Test.find(filter)
      .select("title description type subject chapter class duration totalMarks questions isActive")
      .sort({ createdAt: -1 })

    console.log(`Found ${tests.length} tests`)

    // Debug output of test data
    if (tests.length === 0) {
      // If no tests found with filters, check if any tests exist at all
      const allTests = await Test.find({}).select("_id title isActive questions").lean()
      console.log("All tests in database:", JSON.stringify(allTests))
    }

    return NextResponse.json({ tests })
  } catch (error) {
    console.error("Get tests error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
