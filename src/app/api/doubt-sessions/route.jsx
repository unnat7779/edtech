import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoubtSession from "@/models/DoubtSession"
import { authenticate } from "@/middleware/auth"

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const {
      studentName,
      studentClass,
      whatsappNo,
      enrolledInCoaching,
      coachingName,
      preferredTimeSlot,
      mode,
      subject,
      topic,
      description,
    } = await request.json()

    // Validation
    if (
      !studentName ||
      !studentClass ||
      !whatsappNo ||
      !preferredTimeSlot ||
      !mode ||
      !subject ||
      !topic ||
      !description
    ) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    await connectDB()

    const doubtSession = new DoubtSession({
      student: auth.user._id,
      studentName,
      studentClass,
      whatsappNo,
      enrolledInCoaching: enrolledInCoaching || false,
      coachingName: coachingName || "",
      preferredTimeSlot,
      mode,
      subject,
      topic,
      description,
    })

    await doubtSession.save()

    return NextResponse.json(
      {
        message: "Doubt session booked successfully",
        session: doubtSession,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Doubt session booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const sessions = await DoubtSession.find({ student: auth.user._id }).sort({ createdAt: -1 })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Get doubt sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
