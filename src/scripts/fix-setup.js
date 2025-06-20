const { connectDB } = require("../lib/mongodb")
const TestAttempt = require("../models/TestAttempt")

async function testAnalyticsData() {
  try {
    await connectDB()
    console.log("Connected to database")

    // Get total test attempts
    const totalAttempts = await TestAttempt.countDocuments()
    console.log(`Total test attempts in database: ${totalAttempts}`)

    // Get recent attempts (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentAttempts = await TestAttempt.find({
      createdAt: { $gte: sevenDaysAgo },
    }).select("timeSpent createdAt status startTime endTime")

    console.log(`Recent attempts (last 7 days): ${recentAttempts.length}`)

    // Show sample data
    if (recentAttempts.length > 0) {
      console.log("Sample recent attempts:")
      recentAttempts.slice(0, 5).forEach((attempt, index) => {
        console.log(`${index + 1}. ID: ${attempt._id}`)
        console.log(`   Status: ${attempt.status}`)
        console.log(`   Time Spent: ${attempt.timeSpent}`)
        console.log(`   Created: ${attempt.createdAt}`)
        console.log(`   Start: ${attempt.startTime}`)
        console.log(`   End: ${attempt.endTime}`)
        console.log("---")
      })

      // Calculate average time
      const completedAttempts = recentAttempts.filter((a) => a.status === "completed" || a.status === "auto-submitted")

      if (completedAttempts.length > 0) {
        const totalTime = completedAttempts.reduce((sum, attempt) => {
          let timeInMinutes = 0
          if (attempt.timeSpent) {
            timeInMinutes = attempt.timeSpent > 1000 ? Math.floor(attempt.timeSpent / 60) : attempt.timeSpent
          } else if (attempt.startTime && attempt.endTime) {
            const timeDiff = new Date(attempt.endTime) - new Date(attempt.startTime)
            timeInMinutes = Math.floor(timeDiff / (1000 * 60))
          }
          return sum + timeInMinutes
        }, 0)

        const averageTime = Math.round(totalTime / completedAttempts.length)
        console.log(`Average completion time: ${averageTime} minutes`)
      }
    } else {
      console.log("No recent test attempts found")
      console.log("Creating sample test attempt...")

      // Create a sample test attempt for testing
      const sampleAttempt = new TestAttempt({
        student: "507f1f77bcf86cd799439011", // Sample ObjectId
        test: "507f1f77bcf86cd799439012", // Sample ObjectId
        startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        endTime: new Date(),
        timeSpent: 45, // 45 minutes
        status: "completed",
        score: {
          obtained: 75,
          total: 100,
          percentage: 75,
        },
        answers: [],
      })

      await sampleAttempt.save()
      console.log("Sample test attempt created!")
    }

    process.exit(0)
  } catch (error) {
    console.error("Error testing analytics data:", error)
    process.exit(1)
  }
}

testAnalyticsData()
