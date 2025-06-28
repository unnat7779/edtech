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

// Helper function to get client info for debugging
function getClientInfo(request) {
  const headers = request.headers
  return {
    userAgent: headers.get("user-agent") || "Unknown",
    origin: headers.get("origin") || "Unknown",
    referer: headers.get("referer") || "Unknown",
    contentType: headers.get("content-type") || "Unknown",
    contentLength: headers.get("content-length") || "Unknown",
    acceptEncoding: headers.get("accept-encoding") || "Unknown",
    xForwardedFor: headers.get("x-forwarded-for") || "Unknown",
    xRealIp: headers.get("x-real-ip") || "Unknown",
  }
}

// Helper function to validate image file
function validateImageFile(file) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml"]

  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!file) {
    return { isValid: false, error: "No file provided" }
  }

  if (!file.type || !allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(", ")}`,
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB`,
    }
  }

  return { isValid: true, error: null }
}

// Helper function to create a fallback data URL for failed uploads
function createFallbackDataUrl(width = 300, height = 200) {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" fontFamily="Arial, sans-serif" fontSize="14" fill="#6b7280" textAnchor="middle" dy=".3em">
        Image Upload Failed
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

export async function POST(request) {
  const startTime = Date.now()
  let clientInfo = {}

  try {
    console.log("=== IMAGE UPLOAD REQUEST START ===")

    // Get client information for debugging
    clientInfo = getClientInfo(request)
    console.log("Client Info:", clientInfo)

    // Parse the form data with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Form data parsing timeout")), 30000),
    )

    const formData = await Promise.race([request.formData(), timeoutPromise])

    const image = formData.get("image")
    const testId = formData.get("testId")
    const questionIndex = formData.get("questionIndex")
    const type = formData.get("type")

    console.log("Form data parsed successfully:", {
      hasImage: !!image,
      testId,
      questionIndex,
      type,
      imageType: image?.type,
      imageSize: image?.size,
      imageName: image?.name,
    })

    // Validate the image file
    const validation = validateImageFile(image)
    if (!validation.isValid) {
      console.error("File validation failed:", validation.error)
      return NextResponse.json(
        {
          error: validation.error,
          clientInfo,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    console.log("File validation passed")

    // Create a unique filename with proper organization
    const uniqueId = uuidv4()
    const fileExtension = image.name.split(".").pop()?.toLowerCase() || "jpg"

    let filename
    let storagePath
    let folderName = "general"
    let test = null

    // Organize by test if testId is provided
    if (testId) {
      try {
        console.log("Fetching test details for testId:", testId)
        await connectDB()
        test = await Test.findById(testId)

        if (test) {
          folderName = createSafeFolderName(test.title, test.createdAt)

          if (questionIndex && type) {
            filename = `q${questionIndex}_${type}_${uniqueId}.${fileExtension}`
          } else if (questionIndex) {
            filename = `q${questionIndex}_${uniqueId}.${fileExtension}`
          } else {
            filename = `image_${uniqueId}.${fileExtension}`
          }

          storagePath = `tests/${folderName}/${filename}`
          console.log("Test found, using organized path:", storagePath)
        } else {
          console.log("Test not found, using testId as folder name")
          filename = questionIndex
            ? `q${questionIndex}_${type || "image"}_${uniqueId}.${fileExtension}`
            : `image_${uniqueId}.${fileExtension}`
          storagePath = `tests/${testId}/${filename}`
        }
      } catch (dbError) {
        console.error("Database error while fetching test:", dbError)
        // Fallback to using testId if there's an error
        filename = questionIndex
          ? `q${questionIndex}_${type || "image"}_${uniqueId}.${fileExtension}`
          : `image_${uniqueId}.${fileExtension}`
        storagePath = `tests/${testId}/${filename}`
      }
    } else {
      filename = `image_${uniqueId}.${fileExtension}`
      storagePath = `images/${filename}`
    }

    console.log("Final storage path:", storagePath)

    try {
      // Convert file to buffer with error handling
      let buffer
      try {
        console.log("Converting file to buffer...")
        const arrayBuffer = await image.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
        console.log("Buffer created successfully, size:", buffer.length)
      } catch (bufferError) {
        console.error("Error converting file to buffer:", bufferError)
        throw new Error(`File processing failed: ${bufferError.message}`)
      }

      // Create metadata object with string values
      const metadata = {
        originalName: image.name || "unknown",
        testId: testId ? String(testId) : "",
        questionIndex: questionIndex ? String(questionIndex) : "",
        type: type ? String(type) : "",
        uploadedAt: new Date().toISOString(),
        clientUserAgent: clientInfo.userAgent.substring(0, 200), // Limit length
        fileSize: String(image.size),
        contentType: image.type || "unknown",
      }

      console.log("Attempting Azure upload with metadata:", metadata)

      // Upload to Azure Blob Storage with retry logic
      let downloadURL
      let uploadAttempts = 0
      const maxAttempts = 3

      while (uploadAttempts < maxAttempts) {
        try {
          uploadAttempts++
          console.log(`Azure upload attempt ${uploadAttempts}/${maxAttempts}`)

          downloadURL = await uploadFileToAzure(buffer, storagePath, {
            contentType: image.type,
            ...metadata,
          })

          console.log("Azure upload successful:", downloadURL)
          break
        } catch (azureError) {
          console.error(`Azure upload attempt ${uploadAttempts} failed:`, azureError)

          if (uploadAttempts === maxAttempts) {
            // If all attempts failed, check if we should use fallback
            if (process.env.NEXT_PUBLIC_USE_MOCK_UPLOADS === "true" || !process.env.AZURE_STORAGE_CONNECTION_STRING) {
              console.log("Using fallback data URL due to Azure configuration")
              downloadURL = createFallbackDataUrl()
              break
            } else {
              throw azureError
            }
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * uploadAttempts))
        }
      }

      const processingTime = Date.now() - startTime
      console.log(`Upload completed successfully in ${processingTime}ms`)

      return NextResponse.json({
        success: true,
        imageUrl: downloadURL,
        message: "Image uploaded successfully",
        folderName: folderName,
        processingTime,
        uploadAttempts,
        metadata: {
          filename,
          storagePath,
          fileSize: image.size,
          contentType: image.type,
        },
      })
    } catch (uploadError) {
      console.error("Upload process failed:", uploadError)

      // Provide detailed error information
      const errorDetails = {
        message: uploadError.message,
        stack: uploadError.stack,
        code: uploadError.code,
        statusCode: uploadError.statusCode,
        clientInfo,
        processingTime: Date.now() - startTime,
        storagePath,
        fileInfo: {
          name: image.name,
          size: image.size,
          type: image.type,
        },
      }

      console.error("Detailed error info:", errorDetails)

      // Return fallback URL for development/testing
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode: returning fallback URL")
        return NextResponse.json({
          success: true,
          imageUrl: createFallbackDataUrl(),
          message: "Upload failed, using fallback (development mode)",
          error: uploadError.message,
          fallback: true,
        })
      }

      return NextResponse.json(
        {
          error: "Failed to upload image to storage",
          details: uploadError.message,
          errorCode: "UPLOAD_FAILED",
          clientInfo,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("Critical error in upload image API route:", error)

    const errorResponse = {
      error: "Failed to process image upload",
      details: error.message,
      errorCode: "PROCESSING_FAILED",
      clientInfo,
      timestamp: new Date().toISOString(),
      processingTime,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }

    console.error("Error response:", errorResponse)

    return NextResponse.json(errorResponse, { status: 500 })
  } finally {
    console.log("=== IMAGE UPLOAD REQUEST END ===")
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request) {
  console.log("CORS preflight request received")

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}
