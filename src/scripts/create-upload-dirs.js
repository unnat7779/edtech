// Script to set up CORS for Azure Blob Storage
require("dotenv").config({ path: ".env.local" })
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

// Set up CORS for Azure Blob Storage
async function setupCors() {
  try {
    console.log("\n=======================================================")
    console.log("AZURE BLOB STORAGE CORS SETUP")
    console.log("=======================================================\n")

    console.log("Setting up CORS for Azure Blob Storage...")

    if (!isAzureConfigured()) {
      console.error("Azure Storage is not configured. Please set up your environment variables.")
      return false
    }

    const accountName = extractAccountNameFromConnectionString(azureStorageConfig.connectionString)

    console.log("Azure Storage configuration:")
    console.log(`Account Name: ${accountName || "Unknown (using connection string)"}`)
    console.log(`Container Name: ${azureStorageConfig.containerName}`)
    console.log(`Connection String: ${azureStorageConfig.connectionString ? "Set (hidden)" : "Not set"}\n`)

    // Initialize Azure Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConfig.connectionString)
    console.log("Using connection string to connect to Azure Storage")

    // Get service properties
    const serviceProperties = await blobServiceClient.getProperties()
    console.log("Retrieved service properties")

    // Set CORS rules
    console.log("Setting CORS rules...")

    // Make sure the cors property exists and is an array
    serviceProperties.cors = serviceProperties.cors || []

    // Add our CORS rule
    serviceProperties.cors = [
      {
        allowedOrigins: ["*"],
        allowedMethods: "GET,HEAD,POST,PUT,DELETE",
        allowedHeaders: "*",
        exposedHeaders: "*",
        maxAgeInSeconds: 3600,
      },
    ]

    try {
      // Set the service properties with our CORS rules
      await blobServiceClient.setProperties(serviceProperties)
      console.log("✅ CORS rules set successfully!")

      console.log("\nCORS rules:")
      console.log("- Allowed origins: *")
      console.log("- Allowed methods: GET, HEAD, POST, PUT, DELETE")
      console.log("- Allowed headers: *")
      console.log("- Exposed headers: *")
      console.log("- Max age: 3600 seconds")

      return true
    } catch (error) {
      console.error("Error setting up CORS:", error.message)

      console.log(
        "\n⚠️ Important: If you're seeing an error about serializing the payload, you may need to set up CORS manually.",
      )
      console.log("Please set up CORS manually in the Azure Portal:")
      console.log("1. Go to your Storage account in the Azure Portal")
      console.log("2. Click on 'Resource sharing (CORS)' in the left menu")
      console.log("3. Add a new CORS rule with the following settings:")
      console.log("   - Allowed origins: *")
      console.log("   - Allowed methods: GET, HEAD, POST, PUT, DELETE")
      console.log("   - Allowed headers: *")
      console.log("   - Exposed headers: *")
      console.log("   - Max age: 3600")

      return false
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error.message)
    if (error.code) {
      console.error("Error code:", error.code)
    }
    if (error.details) {
      console.error("Error details:", error.details)
    }

    console.log("\n⚠️ CORS setup FAILED!")
    console.log("Please check your Azure Storage configuration and try again.")

    console.log("\nAlternatively, you can set up CORS manually in the Azure Portal:")
    console.log("1. Go to your Storage account in the Azure Portal")
    console.log("2. Click on 'Resource sharing (CORS)' in the left menu")
    console.log("3. Add a new CORS rule with the following settings:")
    console.log("   - Allowed origins: *")
    console.log("   - Allowed methods: GET, HEAD, POST, PUT, DELETE")
    console.log("   - Allowed headers: *")
    console.log("   - Exposed headers: *")
    console.log("   - Max age: 3600")

    return false
  } finally {
    console.log("\n=======================================================")
  }
}

// Run the function
setupCors().catch(console.error)
