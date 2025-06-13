import { NextResponse } from "next/server"
import { authenticate } from "@/middleware/auth"

// Simple PDF text extraction endpoint
// In production, you would use a proper PDF parsing library like pdf-parse
export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    // For now, return a message asking users to convert to text
    // In production, you would implement actual PDF parsing here
    return NextResponse.json(
      {
        error: "PDF processing is currently limited. Please convert your PDF to a text file (.txt) for better results.",
        suggestion: "You can copy the text from your PDF and save it as a .txt file, then upload that instead.",
        text: "", // Empty text since we can't process PDF yet
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("PDF processing error:", error)
    return NextResponse.json({ error: "Failed to process PDF file" }, { status: 500 })
  }
}
