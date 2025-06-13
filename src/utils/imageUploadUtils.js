/**
 * Utility functions for handling image uploads in questions
 */

/**
 * Process all pending image uploads for a question
 * @param {Object} questionData - The question data containing file objects
 * @param {string} testId - The test ID
 * @param {number} questionIndex - The question index
 * @returns {Object} - Question data with uploaded image URLs
 */
export async function processImageUploads(questionData, testId, questionIndex) {
  const token = localStorage.getItem("token")
  const processedData = { ...questionData }

  try {
    // Process question image
    if (
      questionData.questionImage &&
      typeof questionData.questionImage === "object" &&
      questionData.questionImage.type === "file"
    ) {
      const uploadedUrl = await uploadImage(questionData.questionImage.file, testId, questionIndex, "question", token)
      processedData.questionImage = uploadedUrl
    }

    // Process explanation image
    if (
      questionData.explanationImage &&
      typeof questionData.explanationImage === "object" &&
      questionData.explanationImage.type === "file"
    ) {
      const uploadedUrl = await uploadImage(
        questionData.explanationImage.file,
        testId,
        questionIndex,
        "explanation",
        token,
      )
      processedData.explanationImage = uploadedUrl
    }

    // Process option images for MCQ questions
    if (questionData.questionType === "mcq" && questionData.options) {
      const processedOptions = await Promise.all(
        questionData.options.map(async (option, optionIndex) => {
          if (option.image && typeof option.image === "object" && option.image.type === "file") {
            const uploadedUrl = await uploadImage(
              option.image.file,
              testId,
              questionIndex,
              `option-${optionIndex}`,
              token,
            )
            return { ...option, image: uploadedUrl }
          }
          return option
        }),
      )
      processedData.options = processedOptions
    }

    return processedData
  } catch (error) {
    console.error("Error processing image uploads:", error)
    throw new Error(`Failed to upload images: ${error.message}`)
  }
}

/**
 * Upload a single image file
 * @param {File} file - The file to upload
 * @param {string} testId - The test ID
 * @param {number} questionIndex - The question index
 * @param {string} type - The type of image (question, explanation, option-0, etc.)
 * @param {string} token - Auth token
 * @returns {string} - The uploaded image URL
 */
async function uploadImage(file, testId, questionIndex, type, token) {
  // Upload via API route
  const formData = new FormData()
  formData.append("image", file)
  formData.append("testId", testId)
  formData.append("questionIndex", questionIndex.toString())
  formData.append("type", type)

  const response = await fetch("/api/admin/upload-image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to upload image")
  }

  const data = await response.json()
  return data.imageUrl
}

/**
 * Clean up any file objects that weren't processed
 * @param {Object} questionData - The question data
 * @returns {Object} - Cleaned question data with only string URLs
 */
export function cleanupFileObjects(questionData) {
  const cleanedData = { ...questionData }

  // Clean question image
  if (cleanedData.questionImage && typeof cleanedData.questionImage === "object") {
    cleanedData.questionImage = ""
  }

  // Clean explanation image
  if (cleanedData.explanationImage && typeof cleanedData.explanationImage === "object") {
    cleanedData.explanationImage = ""
  }

  // Clean option images
  if (cleanedData.options) {
    cleanedData.options = cleanedData.options.map((option) => ({
      ...option,
      image: option.image && typeof option.image === "object" ? "" : option.image,
    }))
  }

  return cleanedData
}

/**
 * Create a preview URL for a file
 * @param {File} file - The file to create preview for
 * @returns {string} - The blob URL for preview
 */
export function createPreviewUrl(file) {
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file // Return as-is if it's already a URL
}

/**
 * Clean up blob URLs to prevent memory leaks
 * @param {string} url - The blob URL to revoke
 */
export function cleanupPreviewUrl(url) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid and error
 */
export function validateImageFile(file) {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

  if (!file) {
    return { isValid: false, error: "No file selected" }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.",
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size too large. Please select an image smaller than 5MB.",
    }
  }

  return { isValid: true, error: null }
}

/**
 * Check if a value is a File object
 * @param {any} value - The value to check
 * @returns {boolean} - True if it's a File object
 */
export function isFileObject(value) {
  return value instanceof File
}

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} - The file extension
 */
export function getFileExtension(filename) {
  return filename.split(".").pop().toLowerCase()
}

/**
 * Generate a unique filename for upload
 * @param {string} originalName - Original filename
 * @param {string} testId - Test ID
 * @param {number} questionIndex - Question index
 * @param {string} type - Image type
 * @returns {string} - Unique filename
 */
export function generateUniqueFilename(originalName, testId, questionIndex, type) {
  const extension = getFileExtension(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${testId}_q${questionIndex}_${type}_${timestamp}_${random}.${extension}`
}
