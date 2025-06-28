// Script to debug image upload issues across different devices
require("dotenv").config({ path: ".env.local" })

async function debugImageUpload() {
  console.log("\n=======================================================")
  console.log("IMAGE UPLOAD DEBUG SCRIPT")
  console.log("=======================================================\n")

  // Check environment variables
  console.log("1. Environment Variables Check:")
  const envVars = {
    AZURE_STORAGE_CONNECTION_STRING: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
    AZURE_STORAGE_ACCOUNT_NAME: !!process.env.AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_ACCOUNT_KEY: !!process.env.AZURE_STORAGE_ACCOUNT_KEY,
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || "jee-elevate",
    NEXT_PUBLIC_USE_MOCK_UPLOADS: process.env.NEXT_PUBLIC_USE_MOCK_UPLOADS,
    NODE_ENV: process.env.NODE_ENV,
  }

  console.log(JSON.stringify(envVars, null, 2))

  // Check Azure Storage configuration
  if (
    envVars.AZURE_STORAGE_CONNECTION_STRING ||
    (envVars.AZURE_STORAGE_ACCOUNT_NAME && envVars.AZURE_STORAGE_ACCOUNT_KEY)
  ) {
    console.log("\n✅ Azure Storage credentials are configured")

    try {
      const { BlobServiceClient } = require("@azure/storage-blob")

      let blobServiceClient
      if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
        blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
      } else {
        const { StorageSharedKeyCredential } = require("@azure/storage-blob")
        const sharedKeyCredential = new StorageSharedKeyCredential(
          process.env.AZURE_STORAGE_ACCOUNT_NAME,
          process.env.AZURE_STORAGE_ACCOUNT_KEY,
        )
        blobServiceClient = new BlobServiceClient(
          `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
          sharedKeyCredential,
        )
      }

      // Test connection
      console.log("\n2. Testing Azure Storage Connection:")
      const accountInfo = await blobServiceClient.getAccountInfo()
      console.log("✅ Azure Storage connection successful")
      console.log("Account info:", accountInfo)

      // Test container
      console.log("\n3. Testing Container Access:")
      const containerClient = blobServiceClient.getContainerClient(envVars.AZURE_STORAGE_CONTAINER_NAME)
      const containerExists = await containerClient.exists()

      if (containerExists) {
        console.log(`✅ Container "${envVars.AZURE_STORAGE_CONTAINER_NAME}" exists`)

        const containerProperties = await containerClient.getProperties()
        console.log("Container properties:", {
          publicAccess: containerProperties.blobPublicAccess,
          lastModified: containerProperties.lastModified,
          etag: containerProperties.etag,
        })
      } else {
        console.log(`❌ Container "${envVars.AZURE_STORAGE_CONTAINER_NAME}" does not exist`)
        console.log("Creating container...")

        await containerClient.create({ access: "blob" })
        console.log("✅ Container created successfully")
      }

      // Test upload
      console.log("\n4. Testing File Upload:")
      const testBlobName = `debug/test-upload-${Date.now()}.txt`
      const blockBlobClient = containerClient.getBlockBlobClient(testBlobName)

      const testData = "This is a test upload from the debug script"
      await blockBlobClient.upload(testData, testData.length, {
        blobHTTPHeaders: {
          blobContentType: "text/plain",
        },
        metadata: {
          source: "debug-script",
          timestamp: new Date().toISOString(),
        },
      })

      console.log("✅ Test upload successful")
      console.log("Test file URL:", blockBlobClient.url)

      // Test download
      console.log("\n5. Testing File Access:")
      try {
        const response = await fetch(blockBlobClient.url)
        if (response.ok) {
          const content = await response.text()
          console.log("✅ Test file is publicly accessible")
          console.log("Content:", content)
        } else {
          console.log("❌ Test file is not publicly accessible")
          console.log("Response status:", response.status, response.statusText)
        }
      } catch (fetchError) {
        console.log("❌ Error accessing test file:", fetchError.message)
      }
    } catch (azureError) {
      console.log("\n❌ Azure Storage test failed:")
      console.error("Error:", azureError.message)
      console.error("Code:", azureError.code)
      console.error("Status:", azureError.statusCode)
    }
  } else {
    console.log("\n❌ Azure Storage credentials are not configured")
    console.log("Mock uploads will be used")
  }

  // Check CORS settings
  console.log("\n6. CORS Configuration Check:")
  console.log("For production deployments, ensure CORS is configured in Azure Storage")
  console.log("Allowed origins should include your domain: https://www.jeeelevate.com")
  console.log("Allowed methods should include: GET, POST, PUT, OPTIONS")
  console.log("Allowed headers should include: Content-Type, Authorization, x-ms-*")

  // Device-specific recommendations
  console.log("\n7. Device-Specific Troubleshooting:")
  console.log("Common issues that affect some devices but not others:")
  console.log("- Network restrictions (corporate firewalls, VPNs)")
  console.log("- Browser security settings (strict CORS, content blocking)")
  console.log("- Mobile data vs WiFi differences")
  console.log("- Browser extensions (ad blockers, privacy tools)")
  console.log("- Older browser versions with limited fetch/FormData support")
  console.log("- Device storage limitations")
  console.log("- Regional network routing issues")

  console.log("\n8. Recommended Solutions:")
  console.log("- Implement retry logic with exponential backoff ✅")
  console.log("- Add comprehensive error logging ✅")
  console.log("- Provide fallback upload methods")
  console.log("- Add client-side validation ✅")
  console.log("- Implement upload progress indicators ✅")
  console.log("- Add timeout handling ✅")
  console.log("- Use mock uploads for development ✅")

  console.log("\n=======================================================")
}

// Run the debug script
debugImageUpload().catch(console.error)
