import { NextResponse } from "next/server"
import { uploadFileToAzure } from "@/lib/azure-storage"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { v4 as uuidv4 } from "uuid"

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
    console.log("Image upload API route called")

    // Parse the form data
    const formData = await request.formData()
    const image = formData.get("image")
    const testId = formData.get("testId") // Optional, for organizing by test
    const questionIndex = formData.get("questionIndex") // Optional, for organizing by question
    const type = formData.get("type") // Optional: 'question', 'option', 'explanation'

    console.log("Received upload request:", {
      hasImage: !!image,
      testId,
      questionIndex,
      type,
      imageType: image?.type,
      imageSize: image?.size,
    })

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
    const fileExtension = image.name.split(".").pop() || "jpg"

    let filename
    let storagePath
    let folderName = "general"
    let test = null

    // Organize by test if testId is provided
    if (testId) {
      try {
        // Connect to database and fetch test details
        await connectDB()
        test = await Test.findById(testId)

        if (test) {
          // Create safe folder name from test name and creation date
          folderName = createSafeFolderName(test.title, test.createdAt)

          // Create more specific filename based on available parameters
          if (questionIndex && type) {
            filename = `q${questionIndex}_${type}_${uniqueId}.${fileExtension}`
          } else if (questionIndex) {
            filename = `q${questionIndex}_${uniqueId}.${fileExtension}`
          } else {
            filename = `image_${uniqueId}.${fileExtension}`
          }

          // Store in test-specific directory with readable name
          storagePath = `tests/${folderName}/${filename}`
        } else {
          console.log("Test not found, using testId as folder name")
          filename = questionIndex
            ? `q${questionIndex}_${type || "image"}_${uniqueId}.${fileExtension}`
            : `image_${uniqueId}.${fileExtension}`

          storagePath = `tests/${testId}/${filename}`
        }
      } catch (error) {
        console.error("Error fetching test details:", error)

        // Fallback to using testId if there's an error fetching test details
        filename = questionIndex
          ? `q${questionIndex}_${type || "image"}_${uniqueId}.${fileExtension}`
          : `image_${uniqueId}.${fileExtension}`

        storagePath = `tests/${testId}/${filename}`
      }
    } else {
      // General image upload (not test-specific)
      filename = `image_${uniqueId}.${fileExtension}`
      storagePath = `images/${filename}`
    }

    try {
      console.log("Preparing to upload to Azure:", storagePath)

      // Get file buffer for Azure upload
      const buffer = Buffer.from(await image.arrayBuffer())

      // Create metadata object with string values
      const metadata = {
        originalName: image.name,
        testId: testId ? String(testId) : "",
        questionIndex: questionIndex ? String(questionIndex) : "",
        type: type ? String(type) : "",
        uploadedAt: new Date().toISOString(),
      }

      // Upload to Azure Blob Storage
      const downloadURL = await uploadFileToAzure(buffer, storagePath, {
        contentType: image.type,
        ...metadata,
      })

      console.log("Upload successful, URL:", downloadURL)

      return NextResponse.json({
        success: true,
        imageUrl: downloadURL,
        message: "Image uploaded successfully to Azure",
        folderName: folderName,
      })
    } catch (error) {
      console.error("Error uploading to Azure:", error)
      return NextResponse.json(
        {
          error: "Failed to upload image to Azure",
          details: error.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in upload image API route:", error)
    return NextResponse.json(
      {
        error: "Failed to upload image",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
