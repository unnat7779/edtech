import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TestAttempt from "@/models/TestAttempt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET(request) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No authentication token" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d"

    const now = new Date()
    const startDate = new Date()

    // Set start date based on period
    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    startDate.setHours(0, 0, 0, 0)

    console.log(`Fetching data for period: ${period}, from: ${startDate.toISOString()} to: ${now.toISOString()}`)

    // Get all test attempts in the date range
    const allAttempts = await TestAttempt.find({
      createdAt: { $gte: startDate, $lte: now },
    }).sort({ createdAt: 1 })

    console.log(`Found ${allAttempts.length} total attempts for ${period}`)

    // Format data based on period
    const formattedData = []

    if (period === "7d") {
      // Last 7 days - daily grouping
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const dayAttempts = allAttempts.filter((attempt) => attempt.createdAt >= date && attempt.createdAt < nextDay)

        formattedData.push({
          label: date.toLocaleDateString("en-US", { weekday: "short" }),
          fullLabel: date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          value: dayAttempts.length,
          date: date.toISOString().split("T")[0],
          attempts: dayAttempts,
        })
      }
    } else if (period === "30d") {
      // Last 30 days - weekly grouping (4 weeks)
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now)
        weekEnd.setDate(weekEnd.getDate() - i * 7)
        weekEnd.setHours(23, 59, 59, 999)

        const weekStart = new Date(weekEnd)
        weekStart.setDate(weekStart.getDate() - 6)
        weekStart.setHours(0, 0, 0, 0)

        const weekAttempts = allAttempts.filter(
          (attempt) => attempt.createdAt >= weekStart && attempt.createdAt <= weekEnd,
        )

        formattedData.push({
          label: `Week ${4 - i}`,
          fullLabel: `${weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${weekEnd.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`,
          value: weekAttempts.length,
          startDate: weekStart.toISOString().split("T")[0],
          endDate: weekEnd.toISOString().split("T")[0],
          attempts: weekAttempts,
        })
      }
    } else if (period === "1y") {
      // Last 12 months - monthly grouping
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now)
        monthStart.setMonth(monthStart.getMonth() - i)
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        const monthEnd = new Date(monthStart)
        monthEnd.setMonth(monthEnd.getMonth() + 1)
        monthEnd.setDate(0)
        monthEnd.setHours(23, 59, 59, 999)

        const monthAttempts = allAttempts.filter(
          (attempt) => attempt.createdAt >= monthStart && attempt.createdAt <= monthEnd,
        )

        formattedData.push({
          label: monthStart.toLocaleDateString("en-US", { month: "short" }),
          fullLabel: monthStart.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          value: monthAttempts.length,
          date: monthStart.toISOString().split("T")[0],
          attempts: monthAttempts,
        })
      }
    }

    // Calculate summary statistics
    const totalAttempts = formattedData.reduce((sum, item) => sum + item.value, 0)
    const averageAttempts = formattedData.length > 0 ? Math.round(totalAttempts / formattedData.length) : 0

    console.log(`Summary for ${period}: Total=${totalAttempts}, Average=${averageAttempts}`)

    return NextResponse.json({
      success: true,
      data: formattedData,
      summary: {
        total: totalAttempts,
        average: averageAttempts,
        period: period,
      },
    })
  } catch (error) {
    console.error("Error fetching test attempts chart data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch chart data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
