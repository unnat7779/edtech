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
 * Upload a file to Azure Blob Storage
 * @param {File|Buffer} file - The file to upload
 * @param {string} path - The storage path (e.g., 'uploads/tests/image.jpg')
 * @param {Object} metadata - Optional metadata for the file
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export async function uploadFileToAzure(file, path, metadata = {}) {
  try {
    console.log("Starting Azure upload for path:", path)

    // For development with mock storage or if Azure isn't configured
    if (!blobServiceClient || process.env.NEXT_PUBLIC_USE_MOCK_UPLOADS === "true") {
      console.log("Using mock upload in development")
      // Use a data URL for a simple black square as a placeholder
      const mockUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAFElEQVR42u3BAQEAAACCIP+vbkhAAQAA8GLq3wABBk8WpAAAAABJRU5ErkJggg==`
      console.log("Generated mock URL (data URL)")
      return mockUrl
    }

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(azureStorageConfig.containerName)

    // Create container if it doesn't exist
    try {
      await containerClient.createIfNotExists({
        access: "blob", // Public read access for blobs only
      })
      console.log(`Container "${azureStorageConfig.containerName}" created or already exists`)
    } catch (error) {
      console.warn(`Warning: Could not create container: ${error.message}`)
      // Continue anyway, as the container might already exist
    }

    // Get blob client
    const blobClient = containerClient.getBlockBlobClient(path)
    console.log("Blob client created for path:", path)

    // Prepare file data
    let fileBuffer
    let contentType

    if (file instanceof File) {
      fileBuffer = await file.arrayBuffer()
      contentType = file.type
    } else if (file instanceof ArrayBuffer) {
      fileBuffer = file
      contentType = metadata.contentType || "application/octet-stream"
    } else if (Buffer.isBuffer(file)) {
      fileBuffer = file
      contentType = metadata.contentType || "application/octet-stream"
    } else {
      fileBuffer = file
      contentType = metadata.contentType || "application/octet-stream"
    }

    // Convert metadata values to strings
    const stringMetadata = {}
    if (metadata) {
      Object.keys(metadata).forEach((key) => {
        if (metadata[key] !== undefined && metadata[key] !== null) {
          stringMetadata[key] = String(metadata[key])
        }
      })
    }

    // Upload the file
    console.log("Uploading to Azure Blob Storage...")
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
      metadata: stringMetadata, // Use the string-converted metadata
    }

    const uploadResponse = await blobClient.uploadData(fileBuffer, uploadOptions)
    console.log("Upload successful:", uploadResponse)

    // Get the download URL
    const downloadUrl = blobClient.url
    console.log("Download URL:", downloadUrl)

    return downloadUrl
  } catch (error) {
    console.error("Error uploading file to Azure:", error)

    // For development, return a data URL for a simple black square as a placeholder
    if (process.env.NODE_ENV === "development") {
      console.log("Returning data URL placeholder for development")
      return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAFElEQVR42u3BAQEAAACCIP+vbkhAAQAA8GLq3wABBk8WpAAAAABJRU5ErkJggg==`
    }

    throw new Error(`Failed to upload file to Azure: ${error.message}`)
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
  return !!process.env.AZURE_STORAGE_CONNECTION_STRING
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
