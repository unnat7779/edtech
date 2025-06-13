// Script to upload logo.png from public directory to Azure Blob Storage
require("dotenv").config({ path: ".env.local" })
const fs = require("fs")
const path = require("path")
const { BlobServiceClient } = require("@azure/storage-blob")

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

// Upload logo.png to Azure Blob Storage
async function uploadLogo() {
  try {
    console.log("\n=======================================================")
    console.log("UPLOADING LOGO.PNG TO AZURE BLOB STORAGE")
    console.log("=======================================================\n")

    if (!isAzureConfigured()) {
      console.error("Azure Storage is not configured. Please set up your environment variables.")
      return false
    }

    const accountName = extractAccountNameFromConnectionString(azureStorageConfig.connectionString)

    console.log("Azure Storage configuration:")
    console.log(`Account Name: ${accountName || "Unknown (using connection string)"}`)
    console.log(`Container Name: ${azureStorageConfig.containerName}`)
    console.log(`Connection String: ${azureStorageConfig.connectionString ? "Set (hidden)" : "Not set"}\n`)

    // Path to logo.png in public directory
    const logoPath = path.join(process.cwd(), "public", "logo.png")

    // Check if logo.png exists
    if (!fs.existsSync(logoPath)) {
      console.error(`❌ Logo file not found at ${logoPath}`)
      return false
    }

    console.log(`✅ Found logo file at ${logoPath}`)
    console.log(`File size: ${fs.statSync(logoPath).size} bytes`)

    // Initialize Azure Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConfig.connectionString)
    console.log("✅ Connected to Azure Blob Storage")

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(azureStorageConfig.containerName)

    // Check if container exists
    const containerExists = await containerClient.exists()
    if (!containerExists) {
      console.log(`❌ Container "${azureStorageConfig.containerName}" does not exist. Creating...`)
      await containerClient.create({ access: "blob" })
      console.log(`✅ Container "${azureStorageConfig.containerName}" created with public access level: blob`)
    } else {
      console.log(`✅ Container "${azureStorageConfig.containerName}" exists`)

      // Get container properties to check access level
      const containerProperties = await containerClient.getProperties()
      console.log(`Container access level: ${containerProperties.blobPublicAccess || "private"}`)

      if (!containerProperties.blobPublicAccess) {
        console.log(`⚠️ Warning: Container does not have public access. Images may not be publicly accessible.`)
      }
    }

    // Upload the logo
    const blobName = `test/logo-${Date.now()}.png`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    console.log(`Uploading logo to "${blobName}"...`)
    const fileBuffer = fs.readFileSync(logoPath)

    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: "image/png",
      },
      metadata: {
        source: "upload-logo-script",
        timestamp: new Date().toISOString(),
      },
    }

    const uploadResponse = await blockBlobClient.uploadData(fileBuffer, uploadOptions)
    console.log("✅ Logo uploaded successfully:", uploadResponse.requestId)

    const imageUrl = blockBlobClient.url
    console.log("Logo URL:", imageUrl)

    // Verify the uploaded image is accessible
    console.log("\nVerifying image access...")

    // Use Node.js http/https module to check if the image is accessible
    const url = new URL(imageUrl)
    const httpModule = url.protocol === "https:" ? require("https") : require("http")

    return new Promise((resolve) => {
      const req = httpModule.get(imageUrl, (res) => {
        console.log(`Response status: ${res.statusCode} ${res.statusMessage}`)

        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("\n✅ SUCCESS: Logo image is accessible!")
          console.log(`You can view the uploaded logo at: ${imageUrl}`)
          console.log("\nThis confirms that your Azure Blob Storage is correctly configured for image uploads.")
          resolve(true)
        } else {
          console.error("\n❌ ERROR: Logo image is not accessible.")
          console.error(`Status code: ${res.statusCode} ${res.statusMessage}`)
          console.error("\nPossible issues:")
          console.error("1. Container public access level is not set to 'blob' or 'container'")
          console.error("2. CORS settings are not properly configured")
          console.error("3. Network/firewall restrictions are blocking access")
          resolve(false)
        }

        // Consume response data to free up memory
        res.resume()
      })

      req.on("error", (error) => {
        console.error("\n❌ ERROR: Failed to verify image access:", error.message)
        console.error("\nThis could indicate network connectivity issues or incorrect URL format.")
        resolve(false)
      })

      req.end()
    })
  } catch (error) {
    console.error("\n❌ ERROR:", error.message)
    if (error.code) {
      console.error("Error code:", error.code)
    }
    if (error.details) {
      console.error("Error details:", error.details)
    }
    return false
  } finally {
    console.log("\n=======================================================")
  }
}

// Run the upload function
uploadLogo().catch(console.error)
