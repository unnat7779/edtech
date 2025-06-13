import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { authenticate } from "@/middleware/auth"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"

// Helper function to create a safe folder name from test name and date
function createSafeFolderName(testName, createdAt) {
  // Clean the test name - remove special characters and replace spaces with hyphens
  const cleanName = testName
    .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
    .substring(0, 50) // Limit length to 50 characters

  // Format date as YYYY-MM-DD
  const date = new Date(createdAt)
  const formattedDate = date.toISOString().split("T")[0]

  return `${cleanName}_${formattedDate}`
}

export async function POST(request) {
  try {
    // Authenticate the request
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Parse the form data
    const formData = await request.formData()
    const image = formData.get("image")
    const testId = formData.get("testId") // Optional, for organizing by test
    const questionIndex = formData.get("questionIndex") // Optional, for organizing by question
    const type = formData.get("type") // Optional: 'question', 'option', 'explanation'

    if (!image) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Validate the image
    if (!image.type || !image.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Create a unique filename with proper organization
    const uniqueId = uuidv4()
    const fileExtension = path.extname(image.name) || ".jpg"

    let filename
    let uploadDir
    let imageUrl
    let test

    // Organize by test if testId is provided
    if (testId) {
      try {
        // Connect to database and fetch test details
        await connectDB()
        test = await Test.findById(testId)

        if (!test) {
          return NextResponse.json({ error: "Test not found" }, { status: 404 })
        }

        // Create safe folder name from test name and creation date
        const folderName = createSafeFolderName(test.title, test.createdAt)

        // Create more specific filename based on available parameters
        if (questionIndex && type) {
          filename = `q${questionIndex}_${type}_${uniqueId}${fileExtension}`
        } else if (questionIndex) {
          filename = `q${questionIndex}_${uniqueId}${fileExtension}`
        } else {
          filename = `image_${uniqueId}${fileExtension}`
        }

        // Store in test-specific directory with readable name
        uploadDir = path.join(process.cwd(), "public", "uploads", "tests", folderName)
        imageUrl = `/uploads/tests/${folderName}/${filename}`
      } catch (error) {
        console.error("Error fetching test details:", error)

        // Fallback to using testId if there's an error fetching test details
        filename = questionIndex
          ? `q${questionIndex}_${type || "image"}_${uniqueId}${fileExtension}`
          : `image_${uniqueId}${fileExtension}`

        uploadDir = path.join(process.cwd(), "public", "uploads", "tests", testId)
        imageUrl = `/uploads/tests/${testId}/${filename}`
      }
    } else {
      // General image upload (not test-specific)
      filename = `image_${uniqueId}${fileExtension}`
      uploadDir = path.join(process.cwd(), "public", "uploads", "images")
      imageUrl = `/uploads/images/${filename}`
    }

    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Error creating directory:", error)
      return NextResponse.json({ error: "Failed to create upload directory" }, { status: 500 })
    }

    // Save the file
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, filename)

    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error("Error writing file:", error)
      return NextResponse.json({ error: "Failed to save the image" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
      folderName: testId && test ? createSafeFolderName(test.title, test.createdAt) : null,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      {
        error: "Failed to upload image",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
