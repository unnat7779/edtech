"use client"

import { useState, useRef } from "react"
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
  const [previewUrl, setPreviewUrl] = useState(value || "")
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState(null) // Store file temporarily
  const [isFileSelected, setIsFileSelected] = useState(false)
  const fileInputRef = useRef(null)

  const handleUrlChange = (e) => {
    const url = e.target.value
    setPreviewUrl(url)
    setError("")
    setSelectedFile(null)
    setIsFileSelected(false)
    onChange({ target: { name, value: url } })
  }

  const handleFileSelect = (e) => {
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

    // Store file data in the form state (we'll upload when saving)
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

  const clearImage = () => {
    setPreviewUrl("")
    setError("")
    setSelectedFile(null)
    setIsFileSelected(false)
    onChange({ target: { name, value: "" } })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
          />
          <label
            htmlFor={`file-${name}`}
            className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors border-gray-300 cursor-pointer hover:border-gray-400"
          >
            <div className="text-center">
              <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              {isFileSelected && (
                <p className="text-xs text-blue-600 mt-1">Image will be uploaded when question is saved</p>
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
            onError={(e) => {
              console.error("Image failed to load:", previewUrl)
              setError("Failed to load image preview")
              setPreviewUrl("")
              onChange({ target: { name, value: "" } })
            }}
          />
          <Button type="button" variant="destructive" size="sm" onClick={clearImage} className="absolute top-2 right-2">
            ×
          </Button>
          {isFileSelected && (
            <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
              Ready to upload
            </div>
          )}
        </div>
      )}
    </div>
  )
}
