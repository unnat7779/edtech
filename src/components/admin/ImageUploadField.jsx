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
    onChange({ target: { name, value: url } })
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setError("")

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    // Store file temporarily and create preview
    setSelectedFile(file)
    setIsFileSelected(true)

    // Create preview URL
    const previewURL = URL.createObjectURL(file)
    setPreviewUrl(previewURL)

    // Upload immediately to avoid CORS issues
    try {
      setIsUploading(true)
      setError("")

      // Use the API route for upload
      const formData = new FormData()
      formData.append("image", file)
      if (testId) formData.append("testId", testId)
      if (questionIndex !== undefined) formData.append("questionIndex", questionIndex.toString())
      if (type) formData.append("type", type)

      console.log("Uploading image via API route", {
        testId,
        questionIndex,
        type,
        fileName: file.name,
      })

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || `Upload failed with status: ${response.status}`)
      }

      const data = await response.json()

      // Clean up the object URL
      URL.revokeObjectURL(previewURL)

      // Update the form state with the Azure URL
      onChange({ target: { name, value: data.imageUrl } })

      // Set the preview to the actual uploaded URL
      setPreviewUrl(data.imageUrl)

      setIsUploading(false)
      setIsFileSelected(false)
      console.log("Image uploaded successfully:", data.imageUrl)
    } catch (error) {
      console.error("Image upload failed:", error)
      setError(`Upload failed: ${error.message}. Please try again or use URL option.`)
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
    setError("Failed to load image preview. Using placeholder instead.")
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
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
                  <span className="text-sm text-gray-600">Uploading...</span>
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
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
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
              {isUploading ? "Uploading..." : "Ready to upload"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
