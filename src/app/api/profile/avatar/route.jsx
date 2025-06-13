import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { authenticate } from "@/middleware/auth"

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

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}_${file.name.replace(/\s/g, "_")}`.toLowerCase()

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public/uploads")

    try {
      await writeFile(`${uploadsDir}/${filename}`, buffer)
    } catch (error) {
      console.error("File write error:", error)
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 })
    }

    const avatarUrl = `/uploads/${filename}`

    // Update user's avatar in database
    await connectDB()
    await User.findByIdAndUpdate(auth.user._id, {
      "profile.avatar": avatarUrl,
    })

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatarUrl,
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
