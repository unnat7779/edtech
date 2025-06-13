"use client"

import { useRef } from "react"
import Button from "@/components/ui/Button"

export default function AvatarUpload({ avatarPreview, onAvatarChange }) {
  const fileInputRef = useRef(null)

  return (
    <div className="flex flex-col items-center mb-6">
      <div
        className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden flex items-center justify-center border-2 border-gray-300"
        style={{
          backgroundImage: avatarPreview ? `url(${avatarPreview})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!avatarPreview && <span className="text-gray-500">No Image</span>}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
        Change Avatar
      </Button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
    </div>
  )
}
