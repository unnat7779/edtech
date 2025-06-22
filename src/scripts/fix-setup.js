const { MongoClient } = require("mongodb")

async function debugSessionDates() {
  const client = new MongoClient("mongodb+srv://unnatagrawal195:VNSUtKjboeCNVlP2@cluster0.alca8wl.mongodb.net/")

  try {
    await client.connect()
    const db = client.db()

    console.log("=== DEBUGGING SESSION DATES ===")

    // Fetch all doubt sessions
    const sessions = await db.collection("doubtsessions").find({}).toArray()

    console.log(`Found ${sessions.length} sessions`)

    sessions.forEach((session, index) => {
      console.log(`\n--- Session ${index + 1} ---`)
      console.log("Session ID:", session._id)
      console.log("Raw preferredTimeSlot:", session.preferredTimeSlot)

      if (session.preferredTimeSlot?.date) {
        const rawDate = session.preferredTimeSlot.date
        console.log("Raw date:", rawDate)
        console.log("Raw date type:", typeof rawDate)

        // Test different date parsing methods
        const parsedDate = new Date(rawDate)
        console.log("Parsed date:", parsedDate)
        console.log("Parsed date ISO:", parsedDate.toISOString())
        console.log("Parsed date local string:", parsedDate.toLocaleDateString())

        // Normalize date (set to 00:00:00)
        const normalized = new Date(parsedDate)
        normalized.setHours(0, 0, 0, 0)
        console.log("Normalized date:", normalized)
        console.log("Normalized ISO:", normalized.toISOString())
        console.log("Date key (YYYY-MM-DD):", normalized.toISOString().split("T")[0])

        // Check timezone offset
        console.log("Timezone offset (minutes):", parsedDate.getTimezoneOffset())
        console.log("UTC vs Local difference:", parsedDate.getTime() - normalized.getTime())
      }
    })
  } catch (error) {
    console.error("Error debugging session dates:", error)
  } finally {
    await client.close()
  }
}

debugSessionDates()
