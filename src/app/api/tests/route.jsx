import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"

export async function GET(request) {
  try {
    await connectDB()

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

    if (type) filter.type = type
    if (subject) filter.subject = subject
    if (classParam) filter.class = classParam

    const tests = await Test.find(filter)
      .select("title description type subject chapter class duration totalMarks questions isActive")
      .sort({ createdAt: -1 })

    return NextResponse.json({ tests })
  } catch (error) {
    console.error("Get tests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
