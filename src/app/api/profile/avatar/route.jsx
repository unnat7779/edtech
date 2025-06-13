import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { v4 as uuidv4 } from "uuid"
import { uploadFileToAzure, deleteFileFromAzure } from "@/lib/azure-storage"

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename
    const filename = `${uuidv4()}_${file.name.replace(/\s/g, "_")}`.toLowerCase()

    // Define the Azure storage path - organize avatars by user ID
    const storagePath = `avatars/${auth.user._id}/${filename}`

    try {
      // Upload to Azure Blob Storage
      const downloadURL = await uploadFileToAzure(buffer, storagePath, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedBy: auth.user._id.toString(),
          uploadedAt: new Date().toISOString(),
        },
      })

      // If user already has an avatar, delete the old one
      await connectDB()
      const user = await User.findById(auth.user._id)
      if (user.profile?.avatar) {
        // Delete old avatar from Azure
        await deleteFileFromAzure(user.profile.avatar)
      }

      // Update user's avatar in database
      await User.findByIdAndUpdate(auth.user._id, {
        "profile.avatar": downloadURL,
      })

      return NextResponse.json({
        message: "Avatar uploaded successfully",
        avatarUrl: downloadURL,
      })
    } catch (error) {
      console.error("Avatar upload error:", error)
      return NextResponse.json({ error: "Failed to upload avatar to Azure" }, { status: 500 })
    }
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
