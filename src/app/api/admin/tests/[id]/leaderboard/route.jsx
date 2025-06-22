import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import TestAttempt from "@/models/TestAttempt"
import { authenticate } from "@/middleware/auth"

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const { id: testId } = resolvedParams
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit")) || 100
    const includeCurrentUser = searchParams.get("includeCurrentUser") === "true"

    console.log("🏆 Fetching leaderboard for test:", testId)

    // Get test details
    const test = await Test.findById(testId)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Get all completed attempts for this test
    const allAttempts = await TestAttempt.find({
      test: testId,
      status: { $in: ["completed", "auto-submitted"] },
    })
      .populate("student", "name email class batch")
      .sort({ createdAt: -1 })

    console.log("📊 Total attempts found:", allAttempts.length)

    // Group by student and keep only the latest attempt for each student
    const studentLatestAttempts = new Map()

    allAttempts.forEach((attempt) => {
      const studentId = attempt.student._id.toString()
      const existingAttempt = studentLatestAttempts.get(studentId)

      if (!existingAttempt || new Date(attempt.createdAt) > new Date(existingAttempt.createdAt)) {
        studentLatestAttempts.set(studentId, attempt)
      }
    })

    console.log("👥 Unique students:", studentLatestAttempts.size)

    // Convert to array and calculate additional metrics
    const uniqueAttempts = Array.from(studentLatestAttempts.values())

    // Calculate subject-wise scores for each attempt
    const leaderboardData = await Promise.all(
      uniqueAttempts.map(async (attempt) => {
        console.log("🔍 Processing attempt:", attempt._id)

        // DEBUG: Log the entire attempt object structure
        console.log("🔍 FULL ATTEMPT OBJECT KEYS:", Object.keys(attempt.toObject ? attempt.toObject() : attempt))

        // DEBUG: Check all possible subject-wise data locations
        console.log("🔍 attempt.subjectWise:", attempt.subjectWise)
        console.log("🔍 attempt.subjectWiseScores:", attempt.subjectWiseScores)
        console.log("🔍 attempt.analysis:", attempt.analysis)
        console.log("🔍 attempt.analysis?.subjectWise:", attempt.analysis?.subjectWise)

        // Use existing subjectWise data from the database
        const subjectScores = extractSubjectWiseScoresDebug(attempt)

        // Calculate total time spent
        const totalTime = attempt.timeSpent || 0

        // Calculate PCM scores using the extracted data
        const pcmScores = {
          physics: {
            score: subjectScores.Physics?.score || 0,
            total: subjectScores.Physics?.total || 0,
            percentage: subjectScores.Physics?.percentage || 0,
            correct: subjectScores.Physics?.correct || 0,
            incorrect: subjectScores.Physics?.incorrect || 0,
            unattempted: subjectScores.Physics?.unattempted || 0,
          },
          chemistry: {
            score: subjectScores.Chemistry?.score || 0,
            total: subjectScores.Chemistry?.total || 0,
            percentage: subjectScores.Chemistry?.percentage || 0,
            correct: subjectScores.Chemistry?.correct || 0,
            incorrect: subjectScores.Chemistry?.incorrect || 0,
            unattempted: subjectScores.Chemistry?.unattempted || 0,
          },
          mathematics: {
            score: subjectScores.Mathematics?.score || 0,
            total: subjectScores.Mathematics?.total || 0,
            percentage: subjectScores.Mathematics?.percentage || 0,
            correct: subjectScores.Mathematics?.correct || 0,
            incorrect: subjectScores.Mathematics?.incorrect || 0,
            unattempted: subjectScores.Mathematics?.unattempted || 0,
          },
        }

        console.log(`✅ FINAL Subject scores for ${attempt.student.name}:`, {
          physics: pcmScores.physics.score,
          chemistry: pcmScores.chemistry.score,
          mathematics: pcmScores.mathematics.score,
        })

        return {
          _id: attempt._id,
          student: {
            _id: attempt.student._id,
            name: attempt.student.name,
            email: attempt.student.email,
            class: attempt.student.class,
            batch: attempt.student.batch,
          },
          score: {
            obtained: attempt.score.obtained,
            total: attempt.score.total,
            percentage: attempt.score.percentage,
          },
          pcmScores,
          totalTime,
          submittedAt: attempt.endTime || attempt.updatedAt,
          createdAt: attempt.createdAt,
          isCurrentUser: attempt.student._id.toString() === auth.user._id.toString(),
        }
      }),
    )

    // Sort by score (descending) and then by time (ascending for tie-breaking)
    leaderboardData.sort((a, b) => {
      if (b.score.obtained !== a.score.obtained) {
        return b.score.obtained - a.score.obtained
      }
      return a.totalTime - b.totalTime
    })

    // Calculate ranks and percentiles
    const rankedLeaderboard = leaderboardData.map((entry, index) => {
      const rank = index + 1
      const totalStudents = leaderboardData.length

      const studentsWithLowerOrEqualScore = leaderboardData.filter(
        (other) => other.score.obtained <= entry.score.obtained,
      ).length

      const percentile = totalStudents > 0 ? (studentsWithLowerOrEqualScore / totalStudents) * 100 : 0

      return {
        ...entry,
        rank,
        percentile: Math.round(percentile * 100) / 100,
        totalStudents,
      }
    })

    // Apply limit if specified
    const limitedLeaderboard = limit > 0 ? rankedLeaderboard.slice(0, limit) : rankedLeaderboard

    // Find current user's position if not in top results
    let currentUserEntry = null
    if (includeCurrentUser) {
      currentUserEntry = rankedLeaderboard.find((entry) => entry.isCurrentUser)
      if (currentUserEntry && !limitedLeaderboard.find((entry) => entry.isCurrentUser)) {
        limitedLeaderboard.push(currentUserEntry)
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard: limitedLeaderboard,
      stats: {
        totalStudents: rankedLeaderboard.length,
        averageScore:
          rankedLeaderboard.length > 0
            ? Math.round(
                rankedLeaderboard.reduce((sum, entry) => sum + entry.score.obtained, 0) / rankedLeaderboard.length,
              )
            : 0,
        topScore: rankedLeaderboard.length > 0 ? rankedLeaderboard[0].score.obtained : 0,
        averageTime:
          rankedLeaderboard.length > 0
            ? Math.round(rankedLeaderboard.reduce((sum, entry) => sum + entry.totalTime, 0) / rankedLeaderboard.length)
            : 0,
      },
      test: {
        title: test.title,
        subject: test.subject,
        totalMarks: test.totalMarks,
        duration: test.duration,
      },
    })
  } catch (error) {
    console.error("❌ Leaderboard API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function extractSubjectWiseScoresDebug(attempt) {
  console.log("🔍 DEBUG: Starting subject-wise extraction...")

  const subjectScores = {
    Physics: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0, percentage: 0 },
    Chemistry: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0, percentage: 0 },
    Mathematics: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0, percentage: 0 },
  }

  // Convert to plain object if it's a Mongoose document
  const attemptObj = attempt.toObject ? attempt.toObject() : attempt

  console.log("🔍 DEBUG: Attempt object keys:", Object.keys(attemptObj))

  // Check multiple possible locations for subject-wise data
  let subjectWiseData = null

  // Location 1: attempt.subjectWise (array)
  if (attemptObj.subjectWise && Array.isArray(attemptObj.subjectWise)) {
    console.log("✅ Found subjectWise array:", attemptObj.subjectWise)
    subjectWiseData = attemptObj.subjectWise
  }
  // Location 2: attempt.analysis.subjectWise (from your database screenshot)
  else if (attemptObj.analysis && attemptObj.analysis.subjectWise) {
    console.log("✅ Found analysis.subjectWise:", attemptObj.analysis.subjectWise)
    subjectWiseData = attemptObj.analysis.subjectWise
  }
  // Location 3: attempt.subjectWiseScores (object)
  else if (attemptObj.subjectWiseScores) {
    console.log("✅ Found subjectWiseScores:", attemptObj.subjectWiseScores)
    // Convert object to array format
    subjectWiseData = Object.keys(attemptObj.subjectWiseScores).map((subject) => ({
      subject: subject,
      ...attemptObj.subjectWiseScores[subject],
    }))
  }

  if (subjectWiseData) {
    console.log("🔍 Processing subject-wise data:", subjectWiseData)

    // Handle array format
    if (Array.isArray(subjectWiseData)) {
      subjectWiseData.forEach((subjectData, index) => {
        console.log(`🔍 Processing subject entry ${index}:`, subjectData)

        const subject = subjectData.subject
        console.log(`🔍 Subject name: "${subject}"`)

        // Map subject names correctly
        let mappedSubject = "Physics"
        if (subject) {
          const subjectLower = subject.toLowerCase()
          if (subjectLower.includes("chemistry") || subjectLower.includes("chem")) {
            mappedSubject = "Chemistry"
          } else if (subjectLower.includes("mathematics") || subjectLower.includes("math")) {
            mappedSubject = "Mathematics"
          } else if (subjectLower.includes("physics") || subjectLower.includes("phys")) {
            mappedSubject = "Physics"
          }
        }

        console.log(`🔍 Mapped to: "${mappedSubject}"`)

        // Use the stored data directly
        subjectScores[mappedSubject] = {
          correct: subjectData.correct || 0,
          incorrect: subjectData.incorrect || 0,
          unattempted: subjectData.unattempted || 0,
          score: subjectData.score || 0,
          total: subjectData.total || 0,
          percentage: subjectData.percentage || 0,
        }

        console.log(`✅ ${mappedSubject} final scores:`, subjectScores[mappedSubject])
      })
    }
  } else {
    console.log("❌ No subject-wise data found in any expected location")
    console.log("🔍 Available fields:", Object.keys(attemptObj))
  }

  console.log("🔍 DEBUG: Final subject scores:", subjectScores)
  return subjectScores
}
