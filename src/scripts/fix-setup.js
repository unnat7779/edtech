
require("dotenv").config({ path: ".env.local" })

const { MongoClient } = require("mongodb")

async function fixTestAttemptsQuery() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    console.log("🔧 FIXING TEST ATTEMPTS QUERY")
    console.log("===============================")

    // Get a student to test with
    const student = await db.collection("users").findOne({ role: "student" })
    if (!student) {
      console.log("❌ No students found")
      return
    }

    console.log(`🎯 Testing with student: ${student.name} (${student._id})`)

    // Check all possible field names in test attempts
    const sampleAttempt = await db.collection("testattempts").findOne({})
    if (!sampleAttempt) {
      console.log("❌ No test attempts found")
      return
    }

    console.log("\n📋 Available fields in test attempts:")
    Object.keys(sampleAttempt).forEach((key) => {
      console.log(`  - ${key}: ${typeof sampleAttempt[key]}`)
    })

    // Test different query combinations
    const studentIdStr = student._id.toString()
    const studentIdObj = student._id

    const testQueries = [
      { name: "userId as string", query: { userId: studentIdStr } },
      { name: "userId as ObjectId", query: { userId: studentIdObj } },
      { name: "student as string", query: { student: studentIdStr } },
      { name: "student as ObjectId", query: { student: studentIdObj } },
      { name: "user as string", query: { user: studentIdStr } },
      { name: "user as ObjectId", query: { user: studentIdObj } },
      { name: "studentId as string", query: { studentId: studentIdStr } },
      { name: "studentId as ObjectId", query: { studentId: studentIdObj } },
    ]

    console.log("\n🔍 Testing queries:")
    for (const test of testQueries) {
      try {
        const count = await db.collection("testattempts").countDocuments(test.query)
        console.log(`  ${test.name}: ${count} results`)

        if (count > 0) {
          const sample = await db.collection("testattempts").findOne(test.query)
          console.log(`    Sample: Status=${sample.status}, Score=${JSON.stringify(sample.score)}`)
        }
      } catch (error) {
        console.log(`    Error: ${error.message}`)
      }
    }

    // Find the correct field name by checking what actually exists
    console.log("\n🎯 FINDING CORRECT FIELD NAME:")
    const allAttempts = await db.collection("testattempts").find({}).limit(10).toArray()

    const userFields = new Set()
    allAttempts.forEach((attempt) => {
      Object.keys(attempt).forEach((key) => {
        if (key.toLowerCase().includes("user") || key.toLowerCase().includes("student")) {
          userFields.add(key)
        }
      })
    })

    console.log("User-related fields found:", Array.from(userFields))

    // Test with the actual field names found
    for (const field of userFields) {
      const query = { [field]: studentIdStr }
      const count = await db.collection("testattemts").countDocuments(query)
      console.log(`Field '${field}' with string ID: ${count} results`)

      if (count === 0) {
        const queryObj = { [field]: studentIdObj }
        const countObj = await db.collection("testattempts").countDocuments(queryObj)
        console.log(`Field '${field}' with ObjectId: ${countObj} results`)
      }
    }
  } catch (error) {
    console.error("❌ Fix query error:", error)
  } finally {
    await client.close()
  }
}

fixTestAttemptsQuery()
