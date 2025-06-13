import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestRating from "@/models/TestRating"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"
import { ObjectId } from "mongodb"

export async function POST(request, { params }) {
  try {
    console.log("🌟 Rating API called")

    const resolvedParams = await params
    console.log("📊 Resolved params:", resolvedParams)

    const testId = resolvedParams.id
    console.log("🎯 Test ID:", testId)

    // Validate test ID format
    if (!testId || testId === "undefined" || testId === "null") {
      console.error("❌ Invalid test ID:", testId)
      return NextResponse.json({ error: "Invalid test ID provided" }, { status: 400 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(testId)) {
      console.error("❌ Invalid ObjectId format:", testId)
      return NextResponse.json({ error: "Invalid test ID format" }, { status: 400 })
    }

    const auth = await authenticate(request)
    if (auth.error) {
      console.error("❌ Authentication failed:", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    console.log("✅ User authenticated:", auth.user._id)

    const requestBody = await request.json()
    console.log("📊 Request body:", requestBody)

    const { rating, categories, feedback, isAnonymous, testAttemptId } = requestBody

    if (!rating || !categories || !feedback?.difficulty || !feedback?.quality) {
      console.error("❌ Missing required rating data")
      return NextResponse.json({ error: "Missing required rating data" }, { status: 400 })
    }

    if (!testAttemptId) {
      console.error("❌ Missing test attempt ID")
      return NextResponse.json({ error: "Test attempt ID is required" }, { status: 400 })
    }

    await connectDB()
    console.log("✅ Database connected")

    // Verify test exists
    console.log("🔍 Looking for test with ID:", testId)
    const test = await Test.findById(testId)
    if (!test) {
      console.error("❌ Test not found:", testId)
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }
    console.log("✅ Test found:", test.title)

    // Verify test attempt exists and belongs to user
    console.log("🔍 Looking for test attempt:", testAttemptId)
    const testAttempt = await TestAttempt.findOne({
      _id: testAttemptId,
      student: auth.user._id,
      test: testId,
    })
    if (!testAttempt) {
      console.error("❌ Test attempt not found or doesn't belong to user")
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 })
    }
    console.log("✅ Test attempt verified")

    // Check if user already rated this test
    const existingRating = await TestRating.findOne({
      test: testId,
      student: auth.user._id,
    })

    let testRating
    if (existingRating) {
      console.log("🔄 Updating existing rating")
      // Update existing rating
      existingRating.rating = rating
      existingRating.categories = categories
      existingRating.feedback = feedback
      existingRating.isAnonymous = isAnonymous
      testRating = await existingRating.save()
    } else {
      console.log("✨ Creating new rating")
      // Create new rating
      testRating = new TestRating({
        test: testId,
        student: auth.user._id,
        testAttempt: testAttemptId,
        rating,
        categories,
        feedback,
        isAnonymous,
      })
      await testRating.save()
    }

    console.log("✅ Rating saved successfully")

    // Update test statistics
    await updateTestRatingStatistics(testId)
    console.log("✅ Test statistics updated")

    return NextResponse.json({
      message: "Rating submitted successfully",
      rating: testRating,
    })
  } catch (error) {
    console.error("❌ Submit rating error:", error)
    if (error.code === 11000) {
      return NextResponse.json({ error: "You have already rated this test" }, { status: 400 })
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request, { params }) {
  try {
    console.log("🔍 Get rating API called")

    const resolvedParams = await params
    const testId = resolvedParams.id

    // Validate test ID
    if (!testId || testId === "undefined" || testId === "null") {
      return NextResponse.json({ error: "Invalid test ID provided" }, { status: 400 })
    }

    if (!ObjectId.isValid(testId)) {
      return NextResponse.json({ error: "Invalid test ID format" }, { status: 400 })
    }

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    // Get user's rating for this test
    const userRating = await TestRating.findOne({
      test: testId,
      student: auth.user._id,
    })

    // Get test rating statistics
    const test = await Test.findById(testId).select("ratings statistics")

    return NextResponse.json({
      userRating,
      testRatings: test?.ratings || { average: 0, count: 0 },
      statistics: test?.statistics || {},
    })
  } catch (error) {
    console.error("❌ Get rating error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateTestRatingStatistics(testId) {
  try {
    console.log("📊 Updating test rating statistics for:", testId)

    const ratings = await TestRating.find({ test: testId })
    console.log("📊 Found ratings:", ratings.length)

    if (ratings.length === 0) return

    // Calculate average rating
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0)
    const averageRating = totalRating / ratings.length

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.forEach((rating) => {
      distribution[rating.rating]++
    })

    // Calculate category averages
    const categoryAverages = {
      questionQuality: 0,
      difficulty: 0,
      timeAllocation: 0,
      overallExperience: 0,
    }

    Object.keys(categoryAverages).forEach((category) => {
      const total = ratings.reduce((sum, rating) => sum + (rating.categories[category] || 0), 0)
      categoryAverages[category] = total / ratings.length
    })

    // Update test document
    const updateResult = await Test.findByIdAndUpdate(testId, {
      $set: {
        "ratings.average": Math.round(averageRating * 10) / 10,
        "ratings.count": ratings.length,
        "ratings.distribution": distribution,
        "statistics.categoryAverages": categoryAverages,
      },
    })

    console.log("✅ Test statistics updated successfully")
  } catch (error) {
    console.error("❌ Error updating test rating statistics:", error)
  }
}
