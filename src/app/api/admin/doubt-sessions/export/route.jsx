import { NextResponse } from "next/server"
import DoubtSession from "@/models/DoubtSession"
import { generateCSV } from "@/utils/csvGenerator"
import connectDB from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function GET(req) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized - No token provided" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user is admin
    if (!decoded.isAdmin) {
      return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
    }

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

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ message: "Error fetching doubt sessions" }, { status: 500 })
  }
}
