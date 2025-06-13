"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Camera, Trash2, Upload } from "lucide-react"
import Button from "@/components/ui/Button"

export default function AvatarUpload({ currentAvatar, onAvatarChange }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const fileInputRef = useRef(null)

  // Set initial preview URL when component mounts or currentAvatar changes
  useEffect(() => {
    if (currentAvatar) {
      setPreviewUrl(currentAvatar)
    }
  }, [currentAvatar])

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    try {
      setIsUploading(true)
      setError("")

      // Create a preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Upload via API route
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload avatar")
      }

      // Call the parent component's handler with the URL
      onAvatarChange(data.avatarUrl)

      // Clean up the object URL
      URL.revokeObjectURL(objectUrl)

      // Set the preview to the actual uploaded URL
      setPreviewUrl(data.avatarUrl)
    } catch (err) {
      console.error("Avatar upload error:", err)
      setError("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setPreviewUrl("")
    onAvatarChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle image load errors
  const handleImageError = () => {
    console.error("Avatar image failed to load:", previewUrl)
    setError("Failed to load avatar image")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          {previewUrl ? (
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={previewUrl || "/placeholder.svg"}
                alt="Avatar"
                fill
                className="object-cover"
                onError={handleImageError}
              />
            </div>
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
              ref={fileInputRef}
              disabled={isUploading}
            />
            <label htmlFor="avatar-upload">
              <Button type="button" variant="outline" className="flex items-center" disabled={isUploading} as="span">
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </label>
          </div>

          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              className="flex items-center text-red-600 hover:text-red-700"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">Upload a profile picture (JPG, PNG, or GIF). Maximum size: 5MB.</p>
    </div>
  )
}
