import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Check if user is admin
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const test = await Test.findById(resolvedParams.id)

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({ test })
  } catch (error) {
    console.error("Get test details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Check if user is admin
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const updateData = await request.json()

    await connectDB()

    const test = await Test.findById(resolvedParams.id)

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Update test fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id" && key !== "createdBy" && key !== "questions") {
        test[key] = updateData[key]
      }
    })

    await test.save()

    return NextResponse.json({
      message: "Test updated successfully",
      test,
    })
  } catch (error) {
    console.error("Update test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Check if user is admin
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const test = await Test.findById(resolvedParams.id)

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    await test.deleteOne()

    return NextResponse.json({
      message: "Test deleted successfully",
    })
  } catch (error) {
    console.error("Delete test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
