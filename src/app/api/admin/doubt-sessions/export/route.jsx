import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import DoubtSession from "@/models/doubtSession"
import { generateCSV } from "@/utils/csvGenerator"
import connectDB from "@/lib/mongodb"

export async function GET(req, res) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const doubtSessions = await DoubtSession.find({}).populate("student").populate("tutor")

    if (!doubtSessions || doubtSessions.length === 0) {
      return NextResponse.json({ message: "No doubt sessions found" }, { status: 404 })
    }

    const csvData = generateCSV(doubtSessions)

    const headers = {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="doubt_sessions.csv"',
    }

    return new NextResponse(csvData, { headers, status: 200 })
  } catch (error) {
    console.error("Error fetching and exporting doubt sessions:", error)
    return NextResponse.json({ message: "Error fetching doubt sessions" }, { status: 500 })
  }
}
