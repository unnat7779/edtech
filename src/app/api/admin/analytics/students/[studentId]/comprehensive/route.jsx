import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { authenticate } from "@/middleware/auth"
import mongoose from "mongoose"

export async function GET(request, { params }) {
  try {
    console.log("🔍 COMPREHENSIVE API CALLED")

    // Verify admin authentication
    const authResult = await authenticate(request)
    if (!authResult.success) {
      console.log("❌ Auth failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    if (authResult.user.role !== "admin") {
      console.log("❌ Not admin:", authResult.user.role)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const resolvedParams = await params
    const { studentId } = resolvedParams

    console.log("🎯 Target Student ID:", studentId)

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      console.log("❌ Invalid ObjectId:", studentId)
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    // Import models
    const User = (await import("@/models/User")).default
    const TestAttempt = (await import("@/models/TestAttempt")).default
    const Test = (await import("@/models/Test")).default
    const StudentStreak = (await import("@/models/StudentStreak")).default

    // 1. FETCH STUDENT PROFILE
    console.log("👤 Fetching student profile...")
    const student = await User.findById(studentId).select("-password").lean()
    if (!student) {
      console.log("❌ Student not found:", studentId)
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    console.log("✅ Student found:", student.name, student.email)

    // 2. DISCOVER THE CORRECT FIELD NAME FOR USER REFERENCE
    console.log("🔍 Discovering test attempt structure...")

    // Get a sample test attempt to see the structure
    const sampleAttempt = await TestAttempt.findOne({}).lean()
    if (sampleAttempt) {
      console.log("📋 Sample test attempt fields:")
      Object.keys(sampleAttempt).forEach((key) => {
        console.log(`  ${key}: ${typeof sampleAttempt[key]} = ${sampleAttempt[key]}`)
      })
    }

    // 3. TRY MULTIPLE QUERY PATTERNS TO FIND TEST ATTEMPTS
    console.log("📊 Searching for test attempts with multiple patterns...")

    const studentIdStr = studentId.toString()
    const studentIdObj = new mongoose.Types.ObjectId(studentId)

    // Try all possible field combinations
    const queryPatterns = [
      { userId: studentIdStr },
      { userId: studentIdObj },
      { student: studentIdStr },
      { student: studentIdObj },
      { user: studentIdStr },
      { user: studentIdObj },
      { studentId: studentIdStr },
      { studentId: studentIdObj },
      // Also try with different casing
      { UserId: studentIdStr },
      { UserId: studentIdObj },
      { Student: studentIdStr },
      { Student: studentIdObj },
    ]

    let testAttempts = []
    let workingQuery = null

    for (let i = 0; i < queryPatterns.length; i++) {
      const query = queryPatterns[i]
      console.log(`  Testing query ${i + 1}: ${JSON.stringify(query)}`)

      try {
        const results = await TestAttempt.find(query).lean()
        console.log(`    Found ${results.length} results`)

        if (results.length > 0 && testAttempts.length === 0) {
          testAttempts = results
          workingQuery = query
          console.log(`    ✅ Using this query pattern: ${JSON.stringify(query)}`)
          break
        }
      } catch (error) {
        console.log(`    ❌ Query failed: ${error.message}`)
      }
    }

    // If no attempts found with specific queries, try a broader search
    if (testAttempts.length === 0) {
      console.log("🔍 No results with specific queries, trying broader search...")

      // Get all test attempts and manually filter
      const allAttempts = await TestAttempt.find({}).lean()
      console.log(`📊 Total test attempts in database: ${allAttempts.length}`)

      if (allAttempts.length > 0) {
        console.log("🔍 Manually filtering attempts...")
        testAttempts = allAttempts.filter((attempt) => {
          // Check all possible user reference fields
          const userRefs = [
            attempt.userId,
            attempt.student,
            attempt.user,
            attempt.studentId,
            attempt.UserId,
            attempt.Student,
          ]

          return userRefs.some((ref) => {
            if (!ref) return false
            const refStr = ref.toString()
            return refStr === studentIdStr || refStr === studentIdObj.toString()
          })
        })

        console.log(`📊 Manual filter found ${testAttempts.length} attempts`)
      }
    }

    console.log(`📊 Final result: ${testAttempts.length} test attempts found`)

    // 4. POPULATE TEST DATA
    const populatedAttempts = []
    for (const attempt of testAttempts) {
      try {
        if (attempt.test) {
          const testData = await Test.findById(attempt.test).lean()
          populatedAttempts.push({
            ...attempt,
            test: testData,
          })
        } else {
          populatedAttempts.push(attempt)
        }
      } catch (error) {
        console.log(`⚠️ Failed to populate test for attempt ${attempt._id}:`, error.message)
        populatedAttempts.push(attempt)
      }
    }

    console.log(`📝 Populated ${populatedAttempts.length} attempts with test data`)

    // 5. FILTER COMPLETED ATTEMPTS
    const completedAttempts = populatedAttempts.filter(
      (attempt) =>
        attempt.status === "completed" || attempt.status === "submitted" || attempt.status === "auto-submitted",
    )

    console.log(`✅ Found ${completedAttempts.length} completed attempts`)

    // Debug completed attempts
    if (completedAttempts.length > 0) {
      console.log("📋 Sample completed attempts:")
      completedAttempts.slice(0, 3).forEach((attempt, index) => {
        console.log(`  ${index + 1}. ID: ${attempt._id}`)
        console.log(`     Status: ${attempt.status}`)
        console.log(`     Score: ${JSON.stringify(attempt.score)}`)
        console.log(`     Time: ${attempt.timeSpent}`)
        console.log(`     Test: ${attempt.test?.title || "No test data"}`)
      })
    }

    // 6. CALCULATE QUICK STATS WITH RAW SCORES
    let quickStats = {
      totalTests: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      totalTimeSpentHours: 0,
      averageRawScore: 0,
      bestRawScore: 0,
    }

    if (completedAttempts.length > 0) {
      console.log("📊 Calculating stats from attempts...")

      const percentageScores = []
      const rawScores = []
      let totalTimeSpent = 0
      let bestRawScore = 0

      completedAttempts.forEach((attempt, index) => {
        console.log(`Processing attempt ${index + 1}:`)

        // Calculate percentage score and raw score
        let percentage = 0
        let rawScore = 0
        let totalMarks = 0

        if (attempt.score) {
          rawScore = attempt.score.obtained || 0
          totalMarks = attempt.score.total || 0

          if (typeof attempt.score.percentage === "number" && attempt.score.percentage > 0) {
            percentage = attempt.score.percentage
            console.log(`    Using percentage: ${percentage}%`)
          } else if (totalMarks > 0) {
            percentage = (rawScore / totalMarks) * 100
            console.log(`    Calculated percentage: ${percentage}% (${rawScore}/${totalMarks})`)
          } else {
            console.log(`    No valid score data: ${JSON.stringify(attempt.score)}`)
          }

          // Track raw scores
          if (rawScore >= 0) {
            rawScores.push(rawScore)
            if (rawScore > bestRawScore) {
              bestRawScore = rawScore
            }
          }
        }

        if (percentage > 0) {
          percentageScores.push(percentage)
        }

        // Add time spent
        if (attempt.timeSpent && typeof attempt.timeSpent === "number") {
          totalTimeSpent += attempt.timeSpent
          console.log(`    Time spent: ${attempt.timeSpent} seconds`)
        }
      })

      console.log(`📊 Valid percentage scores: [${percentageScores.join(", ")}]`)
      console.log(`📊 Valid raw scores: [${rawScores.join(", ")}]`)
      console.log(`⏱️ Total time: ${totalTimeSpent} seconds`)

      quickStats = {
        totalTests: completedAttempts.length,
        averageScore:
          percentageScores.length > 0 ? percentageScores.reduce((a, b) => a + b, 0) / percentageScores.length : 0,
        bestScore: percentageScores.length > 0 ? Math.max(...percentageScores) : 0,
        averageRawScore: rawScores.length > 0 ? rawScores.reduce((a, b) => a + b, 0) / rawScores.length : 0,
        bestRawScore: bestRawScore,
        totalTimeSpent: totalTimeSpent,
        totalTimeSpentHours: Math.round((totalTimeSpent / 3600) * 10) / 10,
      }
    } else {
      console.log("⚠️ No completed attempts found")
      // Try to use data from User model if available
      if (student.totalTests || student.averageScore || student.bestScore || student.totalTimeSpent) {
        console.log("📊 Using stats from User model")
        quickStats = {
          totalTests: student.totalTests || 0,
          averageScore: student.averageScore || 0,
          bestScore: student.bestScore || 0,
          averageRawScore: student.averageRawScore || 0,
          bestRawScore: student.bestRawScore || 0,
          totalTimeSpent: student.totalTimeSpent || 0,
          totalTimeSpentHours: Math.round(((student.totalTimeSpent || 0) / 3600) * 10) / 10,
        }
      }
    }

    console.log("📊 FINAL QUICK STATS:", quickStats)

    // 7. PROCESS TEST HISTORY (with proper score formatting)
    const testHistoryArray = completedAttempts.map((attempt) => {
      let rawScore = 0
      let totalMarks = 0
      let percentage = 0

      if (attempt.score) {
        rawScore = attempt.score.obtained || 0
        totalMarks = attempt.score.total || 0

        if (typeof attempt.score.percentage === "number") {
          percentage = attempt.score.percentage
        } else if (totalMarks > 0) {
          percentage = (rawScore / totalMarks) * 100
        }
      }

      return {
        _id: attempt._id,
        test: attempt.test,
        score: {
          ...attempt.score,
          obtained: rawScore,
          total: totalMarks,
          percentage: percentage,
          displayScore: `${rawScore.toFixed(2)}/${totalMarks.toFixed(2)}`, // For display
        },
        status: attempt.status,
        createdAt: attempt.createdAt,
        timeSpent: attempt.timeSpent || 0,
      }
    })

    // 8. GENERATE PROGRESS DATA WITH RAW SCORES FOR CHART
    const progressData = completedAttempts
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((attempt, index) => {
        let percentage = 0
        let rawScore = 0
        let totalMarks = 0

        if (attempt.score) {
          rawScore = attempt.score.obtained || 0
          totalMarks = attempt.score.total || 0

          if (typeof attempt.score.percentage === "number") {
            percentage = attempt.score.percentage
          } else if (totalMarks > 0) {
            percentage = (rawScore / totalMarks) * 100
          }
        }

        return {
          x: index + 1,
          y: rawScore, // Use raw score for chart Y-axis (like student dashboard)
          score: rawScore, // Raw score for display
          percentage: percentage,
          rawScore: rawScore,
          totalMarks: totalMarks,
          date: attempt.createdAt,
          testTitle: attempt.test?.title || "Unknown Test",
          testName: attempt.test?.title || "Unknown Test",
          subject: attempt.test?.subject || "General",
        }
      })

    // 9. FETCH STREAK DATA (simplified)
    const streakData = await StudentStreak.findOne({
      $or: [{ student: studentId }, { userId: studentId }, { student: studentIdObj }, { userId: studentIdObj }],
    }).lean()

    // 10. GENERATE HEATMAP DATA (simplified)
    const heatmapData = []
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateString = date.toISOString().split("T")[0]
      heatmapData.push({
        date: dateString,
        count: 0,
        averageScore: 0,
        level: 0,
      })
    }

    // 11. BUILD RESPONSE
    const comprehensiveData = {
      profile: {
        ...student,
        lastActivity: completedAttempts.length > 0 ? completedAttempts[0].createdAt : student.createdAt,
      },
      quickStats,
      testHistory: testHistoryArray,
      progressData: {
        trendData: progressData,
        summary: {
          totalTests: progressData.length,
          averageScore: quickStats.averageScore,
          bestScore: quickStats.bestScore,
          averageRawScore: quickStats.averageRawScore,
          bestRawScore: quickStats.bestRawScore,
        },
      },
      streakData: streakData || {
        student: studentId,
        dailyStreak: { current: 0, longest: 0 },
        totalTests: quickStats.totalTests,
        averageScore: quickStats.averageScore,
      },
      heatmapData,
      debug: {
        workingQuery: workingQuery,
        totalAttempts: testAttempts.length,
        completedAttempts: completedAttempts.length,
        sampleAttemptFields: sampleAttempt ? Object.keys(sampleAttempt) : [],
      },
    }

    console.log("✅ COMPREHENSIVE DATA READY:")
    console.log("  - Quick Stats:", comprehensiveData.quickStats)
    console.log("  - Test History:", comprehensiveData.testHistory.length)
    console.log("  - Progress Data:", comprehensiveData.progressData.trendData.length)
    console.log("  - Working Query:", workingQuery)

    return NextResponse.json({
      success: true,
      data: comprehensiveData,
    })
  } catch (error) {
    console.error("❌ COMPREHENSIVE API ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch student data",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
