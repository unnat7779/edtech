// Azure Blob Storage configuration and initialization
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob"

// Extract account name from connection string if available
function extractAccountNameFromConnectionString(connectionString) {
  if (!connectionString) return null

  const match = connectionString.match(/AccountName=([^;]+)/i)
  return match ? match[1] : null
}

// Azure Storage configuration
const azureStorageConfig = {
  accountName:
    process.env.AZURE_STORAGE_ACCOUNT_NAME ||
    extractAccountNameFromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING),
  containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || "jee-elevate",
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
}

// Initialize Azure Blob Service Client
let blobServiceClient

try {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    // Initialize with connection string if available
    blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
    console.log("Azure Blob Service initialized with connection string")
  } else if (process.env.AZURE_STORAGE_ACCOUNT_NAME && process.env.AZURE_STORAGE_ACCOUNT_KEY) {
    // Initialize with account name and key
    const sharedKeyCredential = new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT_NAME,
      process.env.AZURE_STORAGE_ACCOUNT_KEY,
    )
    blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      sharedKeyCredential,
    )
    console.log("Azure Blob Service initialized with account credentials")
  } else {
    console.warn("Azure Storage credentials not found, using mock storage")
    blobServiceClient = null
  }
} catch (error) {
  console.error("Error initializing Azure Blob Service:", error)
  blobServiceClient = null
}

/**
 * Upload a file to Azure Blob Storage with enhanced error handling
 * @param {File|Buffer} file - The file to upload
 * @param {string} path - The storage path (e.g., 'uploads/tests/image.jpg')
 * @param {Object} metadata - Optional metadata for the file
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export async function uploadFileToAzure(file, path, metadata = {}) {
  const uploadStartTime = Date.now()

  try {
    console.log("Starting Azure upload for path:", path)
    console.log("Azure config check:", {
      hasConnectionString: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
      hasAccountName: !!process.env.AZURE_STORAGE_ACCOUNT_NAME,
      hasAccountKey: !!process.env.AZURE_STORAGE_ACCOUNT_KEY,
      containerName: azureStorageConfig.containerName,
      useMockUploads: process.env.NEXT_PUBLIC_USE_MOCK_UPLOADS,
    })

    // Check if we should use mock uploads
    if (!blobServiceClient || process.env.NEXT_PUBLIC_USE_MOCK_UPLOADS === "true") {
      console.log("Using mock upload - Azure not configured or mock mode enabled")

      // Create a more realistic mock URL that includes the path
      const mockUrl = `https://mockstorageaccount.blob.core.windows.net/${azureStorageConfig.containerName}/${path}?sv=2021-06-08&st=2023-01-01T00%3A00%3A00Z&se=2025-01-01T00%3A00%3A00Z&sr=b&sp=r&sig=mockSignature`

      console.log("Generated mock URL:", mockUrl)
      return mockUrl
    }

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(azureStorageConfig.containerName)
    console.log("Container client created for:", azureStorageConfig.containerName)

    // Create container if it doesn't exist with retry logic
    let containerCreated = false
    let containerAttempts = 0
    const maxContainerAttempts = 3

    while (!containerCreated && containerAttempts < maxContainerAttempts) {
      try {
        containerAttempts++
        console.log(`Container creation attempt ${containerAttempts}/${maxContainerAttempts}`)

        const containerExists = await containerClient.exists()

        if (!containerExists) {
          console.log(`Container "${azureStorageConfig.containerName}" does not exist, creating...`)
          await containerClient.create({
            access: "blob", // Public read access for blobs only
          })
          console.log(`Container "${azureStorageConfig.containerName}" created successfully`)
        } else {
          console.log(`Container "${azureStorageConfig.containerName}" already exists`)
        }

        containerCreated = true
      } catch (containerError) {
        console.warn(`Container operation attempt ${containerAttempts} failed:`, containerError.message)

        if (containerAttempts === maxContainerAttempts) {
          // If container operations fail, we can still try to upload
          console.log("Proceeding with upload despite container operation failures")
          containerCreated = true
        } else {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * containerAttempts))
        }
      }
    }

    // Get blob client
    const blobClient = containerClient.getBlockBlobClient(path)
    console.log("Blob client created for path:", path)

    // Prepare file data
    let fileBuffer
    let contentType

    if (file instanceof File) {
      console.log("Processing File object")
      fileBuffer = await file.arrayBuffer()
      contentType = file.type
    } else if (file instanceof ArrayBuffer) {
      console.log("Processing ArrayBuffer")
      fileBuffer = file
      contentType = metadata.contentType || "application/octet-stream"
    } else if (Buffer.isBuffer(file)) {
      console.log("Processing Buffer")
      fileBuffer = file
      contentType = metadata.contentType || "application/octet-stream"
    } else {
      console.log("Processing unknown file type")
      fileBuffer = file
      contentType = metadata.contentType || "application/octet-stream"
    }

    // Convert metadata values to strings and limit their length
    const stringMetadata = {}
    if (metadata) {
      Object.keys(metadata).forEach((key) => {
        if (metadata[key] !== undefined && metadata[key] !== null) {
          // Azure metadata values must be strings and have length limits
          let value = String(metadata[key])
          if (value.length > 8192) {
            // Azure limit is 8KB per metadata value
            value = value.substring(0, 8192)
          }
          stringMetadata[key] = value
        }
      })
    }

    // Upload the file with timeout
    console.log("Starting Azure blob upload...")
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: "public, max-age=31536000", // Cache for 1 year
      },
      metadata: stringMetadata,
    }

    // Create upload timeout
    const uploadTimeout = 60000 // 60 seconds
    const uploadPromise = blobClient.uploadData(fileBuffer, uploadOptions)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Upload timeout after 60 seconds")), uploadTimeout),
    )

    const uploadResponse = await Promise.race([uploadPromise, timeoutPromise])
    console.log("Upload successful:", {
      requestId: uploadResponse.requestId,
      etag: uploadResponse.etag,
      lastModified: uploadResponse.lastModified,
    })

    // Get the download URL
    const downloadUrl = blobClient.url
    console.log("Download URL obtained:", downloadUrl)

    const uploadTime = Date.now() - uploadStartTime
    console.log(`Azure upload completed in ${uploadTime}ms`)

    return downloadUrl
  } catch (error) {
    const uploadTime = Date.now() - uploadStartTime
    console.error("Error uploading file to Azure:", error)
    console.error("Upload failed after:", uploadTime, "ms")
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      status: error.status_,
      customData: error.customData,
      name: error.name,
    })

    // Provide more specific error messages
    let errorMessage = "Failed to upload file to Azure"

    if (error.code === "AuthenticationFailed") {
      errorMessage = "Azure authentication failed - check your storage credentials"
    } else if (error.code === "ContainerNotFound") {
      errorMessage = "Azure storage container not found"
    } else if (error.code === "BlobAlreadyExists") {
      errorMessage = "File already exists in Azure storage"
    } else if (error.code === "RequestBodyTooLarge") {
      errorMessage = "File too large for Azure storage"
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Upload timeout - file may be too large or connection too slow"
    } else if (error.message?.includes("network")) {
      errorMessage = "Network error during upload"
    }

    // For development, return a mock URL instead of failing
    if (process.env.NODE_ENV === "development") {
      console.log("Development mode: returning mock URL due to Azure error")
      const mockUrl = `https://mockstorageaccount.blob.core.windows.net/${azureStorageConfig.containerName}/${path}?sv=2021-06-08&st=2023-01-01T00%3A00%3A00Z&se=2025-01-01T00%3A00%3A00Z&sr=b&sp=r&sig=mockSignature`
      return mockUrl
    }

    throw new Error(`${errorMessage}: ${error.message}`)
  }
}

/**
 * Delete a file from Azure Blob Storage
 * @param {string} url - The URL of the file to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export async function deleteFileFromAzure(url) {
  try {
    // For development with mock storage
    if (!blobServiceClient || process.env.NEXT_PUBLIC_USE_MOCK_UPLOADS === "true") {
      console.log("Mock delete in development")
      return true
    }

    // Extract the path from the URL
    const path = extractPathFromUrl(url)
    if (!path) {
      throw new Error("Could not extract path from URL")
    }

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(azureStorageConfig.containerName)

    // Get blob client
    const blobClient = containerClient.getBlockBlobClient(path)

    // Delete the blob
    const deleteResponse = await blobClient.delete()
    console.log("Delete successful:", deleteResponse)

    return true
  } catch (error) {
    console.error("Error deleting file from Azure:", error)
    return false
  }
}

/**
 * Extract the path from an Azure Blob Storage URL
 * @param {string} url - The Azure Blob Storage URL
 * @returns {string|null} - The path or null if not found
 */
export function extractPathFromUrl(url) {
  try {
    const urlObj = new URL(url)
    const containerName = azureStorageConfig.containerName

    // Extract path after the container name
    const pathRegex = new RegExp(`/${containerName}/(.+?)(?:\\?|$)`)
    const match = urlObj.pathname.match(pathRegex)

    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }

    return null
  } catch (error) {
    console.error("Error extracting path from URL:", error)
    return null
  }
}

/**
 * Check if Azure Storage is properly configured
 * @returns {boolean} - True if Azure Storage is configured
 */
export function isAzureStorageConfigured() {
  return (
    !!process.env.AZURE_STORAGE_CONNECTION_STRING ||
    (!!process.env.AZURE_STORAGE_ACCOUNT_NAME && !!process.env.AZURE_STORAGE_ACCOUNT_KEY)
  )
}

/**
 * Get the base URL for Azure Blob Storage
 * @returns {string} - The base URL
 */
export function getAzureStorageBaseUrl() {
  if (azureStorageConfig.accountName) {
    return `https://${azureStorageConfig.accountName}.blob.core.windows.net/${
      azureStorageConfig.containerName || "jee-elevate"
    }`
  }
  return null
}

export { blobServiceClient, azureStorageConfig }
