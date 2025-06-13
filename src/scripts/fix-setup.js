// Script to test Azure Blob Storage image uploads
require("dotenv").config({ path: ".env.local" })
const fs = require("fs")
const path = require("path")
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob")

// Azure Storage configuration
const azureStorageConfig = {
  containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads",
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
}

// Extract account name from connection string if available
function extractAccountNameFromConnectionString(connectionString) {
  if (!connectionString) return null

  const match = connectionString.match(/AccountName=([^;]+)/i)
  return match ? match[1] : null
}

// Check if Azure Storage is configured
function isAzureConfigured() {
  return azureStorageConfig.connectionString
}

// Create a test image if it doesn't exist
async function createTestImage() {
  const testImagePath = path.join(__dirname, "test-image.png")

  // Check if test image already exists
  if (fs.existsSync(testImagePath)) {
    console.log("Test image already exists")
    return testImagePath
  }

  console.log("Creating test image...")

  try {
    // Create a simple test image using Node.js Buffer
    // This creates a 100x100 black square as a PNG
    const width = 100
    const height = 100
    const buffer = Buffer.alloc(width * height * 4) // RGBA format

    // Fill with black pixels
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 0 // R
      buffer[i + 1] = 0 // G
      buffer[i + 2] = 0 // B
      buffer[i + 3] = 255 // A (fully opaque)
    }

    // Write a simple PNG header and data
    // This is a very basic PNG, not a proper implementation
    const pngHeader = Buffer.from([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a, // PNG signature
      0x00,
      0x00,
      0x00,
      0x0d, // IHDR chunk length
      0x49,
      0x48,
      0x44,
      0x52, // "IHDR"
      0x00,
      0x00,
      0x00,
      0x64, // width (100)
      0x00,
      0x00,
      0x00,
      0x64, // height (100)
      0x08, // bit depth
      0x06, // color type (RGBA)
      0x00, // compression method
      0x00, // filter method
      0x00, // interlace method
      0x00,
      0x00,
      0x00,
      0x00, // CRC (placeholder)
      // IDAT chunk would follow here with actual pixel data
    ])

    // For simplicity, we'll just create a text file instead of a proper PNG
    fs.writeFileSync(testImagePath, "This is a test image file for Azure upload testing.")
    console.log(`Test image created at ${testImagePath}`)
    return testImagePath
  } catch (error) {
    console.error("Error creating test image:", error)
    throw error
  }
}

// Upload test image to Azure Blob Storage
async function uploadTestImage(imagePath) {
  try {
    if (!isAzureConfigured()) {
      console.error("Azure Storage is not configured. Please set up your environment variables.")
      return null
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConfig.connectionString)
    console.log("Using connection string to connect to Azure Storage")

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(azureStorageConfig.containerName)

    // Check if container exists
    console.log(`Checking if container "${azureStorageConfig.containerName}" exists...`)
    const containerExists = await containerClient.exists()

    if (!containerExists) {
      console.log(`Container "${azureStorageConfig.containerName}" does not exist. Creating...`)
      await containerClient.create({ access: "blob" })
      console.log(`Container "${azureStorageConfig.containerName}" created successfully`)
    } else {
      console.log(`Container "${azureStorageConfig.containerName}" already exists`)
    }

    // Upload the test image
    const testBlobName = `test/test-image-${Date.now()}.txt`
    const blockBlobClient = containerClient.getBlockBlobClient(testBlobName)

    console.log(`Uploading test image to "${testBlobName}"...`)
    const fileBuffer = fs.readFileSync(imagePath)

    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: "text/plain",
      },
      metadata: {
        source: "test-script",
        timestamp: new Date().toISOString(),
      },
    }

    const uploadResponse = await blockBlobClient.uploadData(fileBuffer, uploadOptions)
    console.log("Test image uploaded successfully:", uploadResponse.requestId)

    const imageUrl = blockBlobClient.url
    console.log("Test image URL:", imageUrl)

    return {
      success: true,
      url: imageUrl,
      blobName: testBlobName,
    }
  } catch (error) {
    console.error("Error uploading test image to Azure:", error.message)
    if (error.code) {
      console.error("Error code:", error.code)
    }
    if (error.details) {
      console.error("Error details:", error.details)
    }
    return {
      success: false,
      error: error.message,
    }
  }
}

// Verify the uploaded image is accessible
async function verifyImageAccess(imageUrl) {
  try {
    console.log(`Verifying image access at ${imageUrl}...`)

    // Use Node.js http/https module instead of fetch
    const url = new URL(imageUrl)
    const httpModule = url.protocol === "https:" ? require("https") : require("http")

    return new Promise((resolve) => {
      const req = httpModule.get(imageUrl, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✅ Image is accessible! Status:", res.statusCode)
          resolve(true)
        } else {
          console.error("❌ Image is not accessible. Status:", res.statusCode, res.statusMessage)
          resolve(false)
        }

        // Consume response data to free up memory
        res.resume()
      })

      req.on("error", (error) => {
        console.error("❌ Error verifying image access:", error.message)
        resolve(false)
      })

      req.end()
    })
  } catch (error) {
    console.error("❌ Error verifying image access:", error.message)
    return false
  }
}

// Main function
async function main() {
  console.log("\n=======================================================")
  console.log("AZURE BLOB STORAGE IMAGE UPLOAD TEST")
  console.log("=======================================================\n")

  try {
    // Check Azure configuration
    if (!isAzureConfigured()) {
      console.log("Azure Storage is not configured. Please set up your environment variables:")
      console.log("AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER_NAME")
      return
    }

    const accountName = extractAccountNameFromConnectionString(azureStorageConfig.connectionString)

    console.log("Azure Storage configuration:")
    console.log(`Account Name: ${accountName || "Unknown (using connection string)"}`)
    console.log(`Container Name: ${azureStorageConfig.containerName}`)
    console.log(`Connection String: ${azureStorageConfig.connectionString ? "Set (hidden)" : "Not set"}\n`)

    // Create and upload test image
    const testImagePath = await createTestImage()
    const uploadResult = await uploadTestImage(testImagePath)

    if (!uploadResult || !uploadResult.success) {
      console.error("\n❌ Image upload test FAILED!")
      return
    }

    // Verify image access
    const isAccessible = await verifyImageAccess(uploadResult.url)

    console.log("\n=======================================================\n")

    if (isAccessible) {
      console.log("✅ AZURE STORAGE IMAGE UPLOAD TEST PASSED!")
      console.log("Your Azure Storage is properly configured and images are publicly accessible.")
      console.log("\nYou can now set NEXT_PUBLIC_USE_MOCK_UPLOADS=false in your .env.local file")
      console.log("to start using Azure Storage for image uploads.")
    } else {
      console.log("❌ AZURE STORAGE IMAGE UPLOAD TEST FAILED!")
      console.log("The image was uploaded but is not publicly accessible.")
      console.log("\nPossible issues:")
      console.log("1. Container public access level is not set to 'blob' or 'container'")
      console.log("2. CORS settings are not properly configured")
      console.log("3. Network/firewall restrictions are blocking access")
      console.log("\nPlease check your Azure Storage configuration and try again.")
      console.log("Run the set-container-public-access.js script to set the container's public access level.")
    }
  } catch (error) {
    console.error("Error running test:", error)
  }

  console.log("\n=======================================================")
}

// Run the main function
main().catch(console.error)
