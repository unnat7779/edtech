"use client"

import { useState, useRef, useEffect } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function ImageUploadField({
  label,
  value,
  onChange,
  name,
  testId,
  questionIndex,
  type,
  placeholder = "Enter image URL or upload from device",
}) {
  const [uploadMethod, setUploadMethod] = useState("url") // "url" or "upload"
  const [previewUrl, setPreviewUrl] = useState("")
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState(null) // Store file temporarily
  const [isFileSelected, setIsFileSelected] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef(null)

  // Set initial preview URL when component mounts or value changes
  useEffect(() => {
    if (value) {
      // Handle both string URLs and file objects
      if (typeof value === "string") {
        setPreviewUrl(value)
      } else if (value && typeof value === "object" && value.previewUrl) {
        setPreviewUrl(value.previewUrl)
      }
    } else {
      setPreviewUrl("")
    }
  }, [value])

  const handleUrlChange = (e) => {
    const url = e.target.value
    setPreviewUrl(url)
    setError("")
    setSelectedFile(null)
    setIsFileSelected(false)
    setRetryCount(0)
    onChange({ target: { name, value: url } })
  }

  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!file.type || !allowedTypes.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: `Invalid file type: ${file.type}. Please select a JPEG, PNG, GIF, WebP, or BMP image.`,
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB.`,
      }
    }

    return { isValid: true, error: null }
  }

  const uploadWithRetry = async (file, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt)
        console.log(`Upload attempt ${attempt}/${maxRetries}`)

        const formData = new FormData()
        formData.append("image", file)
        if (testId) formData.append("testId", testId)
        if (questionIndex !== undefined) formData.append("questionIndex", questionIndex.toString())
        if (type) formData.append("type", type)

        // Add client info for debugging
        formData.append(
          "clientInfo",
          JSON.stringify({
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            timestamp: new Date().toISOString(),
          }),
        )

        console.log("Uploading image via API route", {
          testId,
          questionIndex,
          type,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          attempt,
        })

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

        const response = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.details ||
              errorData.error ||
              `Upload failed with status: ${response.status} ${response.statusText}`,
          )
        }

        const data = await response.json()
        console.log("Upload successful:", data)
        return data
      } catch (error) {
        console.error(`Upload attempt ${attempt} failed:`, error)

        if (attempt === maxRetries) {
          throw error
        }

        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setError("")
    setRetryCount(0)

    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    // Store file temporarily and create preview
    setSelectedFile(file)
    setIsFileSelected(true)

    // Create preview URL
    const previewURL = URL.createObjectURL(file)
    setPreviewUrl(previewURL)

    // Upload immediately with retry logic
    try {
      setIsUploading(true)
      setUploadProgress(0)
      setError("")

      const data = await uploadWithRetry(file, 3)

      // Clean up the object URL
      URL.revokeObjectURL(previewURL)

      // Update the form state with the uploaded URL
      onChange({ target: { name, value: data.imageUrl } })

      // Set the preview to the actual uploaded URL
      setPreviewUrl(data.imageUrl)

      setIsUploading(false)
      setIsFileSelected(false)
      setUploadProgress(100)

      console.log("Image uploaded successfully:", data.imageUrl)
    } catch (error) {
      console.error("Image upload failed after all retries:", error)

      let errorMessage = "Upload failed. Please try again."

      if (error.message.includes("timeout") || error.name === "AbortError") {
        errorMessage = "Upload timeout. Please check your connection and try again."
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.message.includes("Azure")) {
        errorMessage = "Storage service error. Please try again or contact support."
      } else if (error.message.includes("authentication")) {
        errorMessage = "Authentication error. Please refresh the page and try again."
      }

      setError(`${errorMessage} (${retryCount} attempts made)`)
      setIsUploading(false)

      // Keep the local preview URL for now
      onChange({
        target: {
          name,
          value: {
            type: "file",
            file: file,
            previewUrl: previewURL,
            testId,
            questionIndex,
            uploadType: type,
            error: error.message,
          },
        },
      })
    }
  }

  const clearImage = () => {
    setPreviewUrl("")
    setError("")
    setSelectedFile(null)
    setIsFileSelected(false)
    setUploadProgress(0)
    setRetryCount(0)
    onChange({ target: { name, value: "" } })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    // If there's a preview URL from a blob, revoke it to prevent memory leaks
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Function to handle image load errors
  const handleImageError = () => {
    console.error("Image failed to load:", previewUrl)
    setError("Failed to load image preview.")
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* Upload Method Toggle */}
      <div className="flex space-x-2 mb-3">
        <Button
          type="button"
          variant={uploadMethod === "url" ? "primary" : "outline"}
          size="sm"
          onClick={() => setUploadMethod("url")}
        >
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMethod === "upload" ? "primary" : "outline"}
          size="sm"
          onClick={() => setUploadMethod("upload")}
        >
          Upload
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              {error}
              {retryCount > 0 && (
                <div className="text-xs mt-1 text-red-600">
                  Attempted {retryCount} time{retryCount > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* URL Input */}
      {uploadMethod === "url" && (
        <Input
          name={name}
          value={typeof value === "string" ? value : ""}
          onChange={handleUrlChange}
          placeholder={placeholder}
        />
      )}

      {/* File Upload */}
      {uploadMethod === "upload" && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-${name}`}
            disabled={isUploading}
          />
          <label
            htmlFor={`file-${name}`}
            className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors border-gray-300 cursor-pointer hover:border-gray-400 ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="text-center">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <span className="text-sm text-gray-600">
                    Uploading... {retryCount > 0 && `(Attempt ${retryCount})`}
                  </span>
                  {uploadProgress > 0 && (
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <svg
                    className="h-8 w-8 text-gray-400 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {isFileSelected ? `Selected: ${selectedFile?.name}` : "Click to select image"}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP, BMP up to 10MB</p>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Preview"
            className="max-w-full h-auto max-h-48 rounded-lg border"
            onError={handleImageError}
          />
          <Button type="button" variant="destructive" size="sm" onClick={clearImage} className="absolute top-2 right-2">
            ×
          </Button>
          {isFileSelected && (
            <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
              {isUploading ? `Uploading... ${retryCount > 0 ? `(${retryCount})` : ""}` : "Ready to upload"}
            </div>
          )}
          {uploadProgress === 100 && !isUploading && (
            <div className="absolute bottom-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
              ✓ Uploaded
            </div>
          )}
        </div>
      )}
    </div>
  )
}
