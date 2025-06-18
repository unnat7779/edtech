import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await authenticate(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const resolvedParams = await params
    const { studentId } = resolvedParams

    // Get URL parameters
    const url = new URL(request.url)
    const timeRange = url.searchParams.get("timeRange") || "week"

    // Import models after DB connection
    const TestAttempt = (await import("@/models/TestAttempt")).default

    // Calculate date range
    const now = new Date()
    let startDate,
      endDate = now
    let groupFormat,
      dateLabels = []

    switch (timeRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        groupFormat = "%Y-%m-%d"
        // Generate last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          dateLabels.push(date.toISOString().split("T")[0])
        }
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        groupFormat = "%Y-%m-%d"
        // Generate last 30 days (sample every 3 days)
        for (let i = 30; i >= 0; i -= 3) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          dateLabels.push(date.toISOString().split("T")[0])
        }
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        groupFormat = "%Y-%m-%d"
    }

    // Aggregate test attempts by date and subject
    const aggregationPipeline = [
      {
        $match: {
          userId: studentId,
          status: "completed",
          submittedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "tests",
          localField: "testId",
          foreignField: "_id",
          as: "testDetails",
        },
      },
      {
        $unwind: {
          path: "$testDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: "$submittedAt" } },
            subject: { $ifNull: ["$testDetails.subject", "General"] },
          },
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]

    const results = await TestAttempt.aggregate(aggregationPipeline)

    // Process results into chart format
    const subjectData = {}
    const subjects = new Set()

    results.forEach((result) => {
      const date = result._id.date
      const subject = result._id.subject
      subjects.add(subject)

      if (!subjectData[date]) {
        subjectData[date] = {}
      }
      subjectData[date][subject] = result.count
    })

    // Format data for chart
    const chartData = dateLabels.map((date) => {
      const dataPoint = { date }
      Array.from(subjects).forEach((subject) => {
        dataPoint[subject] = subjectData[date]?.[subject] || 0
      })
      return dataPoint
    })

    // Calculate totals
    const totalAttempts = results.reduce((sum, result) => sum + result.count, 0)
    const subjectTotals = {}
    Array.from(subjects).forEach((subject) => {
      subjectTotals[subject] = results.filter((r) => r._id.subject === subject).reduce((sum, r) => sum + r.count, 0)
    })

    return NextResponse.json({
      success: true,
      data: {
        chartData,
        subjects: Array.from(subjects),
        totalAttempts,
        subjectTotals,
        dateRange: { startDate, endDate },
      },
    })
  } catch (error) {
    console.error("Error fetching test attempts chart:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch test attempts chart",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
