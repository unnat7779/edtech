import path from "path"
import { mkdir } from "fs/promises"

/**
 * Create a safe folder name from test name and date
 * @param {string} testName - The test title
 * @param {Date|string} createdAt - The creation date
 * @returns {string} Safe folder name
 */
export function createSafeFolderName(testName, createdAt) {
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

/**
 * Create upload directory for a test
 * @param {string} testName - The test title
 * @param {Date|string} createdAt - The creation date
 * @returns {Promise<{folderName: string, uploadDir: string}>}
 */
export async function createTestUploadDir(testName, createdAt) {
  const folderName = createSafeFolderName(testName, createdAt)
  const uploadDir = path.join(process.cwd(), "public", "uploads", "tests", folderName)

  try {
    await mkdir(uploadDir, { recursive: true })
    // Also create subdirectories for better organization
    await mkdir(path.join(uploadDir, "images"), { recursive: true })
    await mkdir(path.join(uploadDir, "documents"), { recursive: true })
  } catch (error) {
    console.error("Error creating test upload directory:", error)
    throw error
  }

  return { folderName, uploadDir }
}

/**
 * Get the upload URL for a test file
 * @param {string} testName - The test title
 * @param {Date|string} createdAt - The creation date
 * @param {string} filename - The filename
 * @param {string} subdir - Subdirectory (images, documents, etc.)
 * @returns {string} The public URL
 */
export function getTestFileUrl(testName, createdAt, filename, subdir = "images") {
  const folderName = createSafeFolderName(testName, createdAt)
  return `/uploads/tests/${folderName}/${subdir}/${filename}`
}

/**
 * Clean up old test folders (utility for maintenance)
 * @param {number} daysOld - Delete folders older than this many days
 */
export async function cleanupOldTestFolders(daysOld = 30) {
  // This would be implemented for maintenance purposes
  // For now, just a placeholder
  console.log(`Cleanup function called for folders older than ${daysOld} days`)
}
