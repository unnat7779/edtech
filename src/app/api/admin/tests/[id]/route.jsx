import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { verifyToken } from "@/lib/auth"

// Fixed constants
const FIXED_DURATION = 180 // 3 hours in minutes
const FIXED_SUBJECT = "All" // Changed to match existing enum

export async function GET(request, { params }) {
  try {
    await connectDB()

    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params
    const test = await Test.findById(id)

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({ test })
  } catch (error) {
    console.error("Error fetching test:", error)
    return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
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

    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params
    const body = await request.json()

    console.log("=== PUT REQUEST DEBUG ===")
    console.log("Test ID:", id)
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Check if this is a partial update (status toggle) or full update
    const isPartialUpdate =
      Object.keys(body).length <= 2 && (body.hasOwnProperty("isActive") || body.hasOwnProperty("status"))

    if (isPartialUpdate) {
      console.log("Performing partial update (status toggle)")

      // Handle partial update - just toggle status
      const updateData = {}

      if (body.hasOwnProperty("isActive")) {
        updateData.isActive = Boolean(body.isActive)
      }

      if (body.hasOwnProperty("status")) {
        // Map status to isActive if needed
        if (body.status === "published") {
          updateData.isActive = true
        } else if (body.status === "draft") {
          updateData.isActive = false
        }
      }

      updateData.updatedAt = new Date()

      console.log("Partial update data:", JSON.stringify(updateData, null, 2))

      const updatedTest = await Test.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: false, // Skip validation for partial updates
      })

      if (!updatedTest) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 })
      }

      console.log("Test status updated successfully:", updatedTest._id)

      return NextResponse.json({
        message: "Test status updated successfully",
        test: updatedTest,
      })
    }

    // Handle full update
    console.log("Performing full update")

    const { title, description, type, chapter, class: testClass, totalMarks, instructions, isActive } = body

    // Enhanced validation for full updates only
    const validationErrors = []

    if (!title || typeof title !== "string" || !title.trim()) {
      validationErrors.push("Title is required and must be a non-empty string")
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      validationErrors.push("Description is required and must be a non-empty string")
    }

    if (!type || !["full-syllabus", "chapter-wise"].includes(type)) {
      validationErrors.push("Type must be either 'full-syllabus' or 'chapter-wise'")
    }

    if (!testClass || !["11", "12", "Dropper"].includes(testClass)) {
      validationErrors.push("Class must be '11', '12', or 'Dropper'")
    }

    if (!totalMarks || isNaN(Number(totalMarks)) || Number(totalMarks) <= 0) {
      validationErrors.push("Total marks must be a positive number")
    }

    if (type === "chapter-wise" && (!chapter || !chapter.trim())) {
      validationErrors.push("Chapter is required for chapter-wise tests")
    }

    if (validationErrors.length > 0) {
      console.log("Validation errors:", validationErrors)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    // Prepare full update data
    const updateData = {
      title: title.trim(),
      description: description.trim(),
      type,
      subject: FIXED_SUBJECT, // Always "All"
      chapter: type === "chapter-wise" ? chapter?.trim() || "" : "",
      class: testClass,
      duration: FIXED_DURATION, // Always 180 minutes (3 hours)
      totalMarks: Number(totalMarks),
      instructions: Array.isArray(instructions)
        ? instructions.filter((instruction) => instruction && instruction.trim() !== "")
        : [],
      isActive: Boolean(isActive),
      updatedAt: new Date(),
    }

    console.log("Full update data:", JSON.stringify(updateData, null, 2))

    // Update test with fixed duration and subject
    const updatedTest = await Test.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      context: "query",
    })

    if (!updatedTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    console.log("Test updated successfully:", updatedTest._id)

    return NextResponse.json({
      message: "Test updated successfully",
      test: updatedTest,
    })
  } catch (error) {
    console.error("Error updating test:", error)

    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    // Handle cast errors (invalid ObjectId, etc.)
    if (error.name === "CastError") {
      return NextResponse.json(
        {
          error: "Invalid data format",
          details: [error.message],
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to update test",
        details: [error.message],
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
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

    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params
    const deletedTest = await Test.findByIdAndDelete(id)

    if (!deletedTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Test deleted successfully" })
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 })
  }
}
