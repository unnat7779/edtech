const mongoose = require("mongoose")

async function checkDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/edtech-platform"

    console.log("🔌 Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("✅ MongoDB connected successfully")

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "📊 Available collections:",
      collections.map((c) => c.name),
    )

    await mongoose.disconnect()
    console.log("✅ Database check complete")
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    console.log("💡 Make sure MongoDB is running and MONGODB_URI is correct")
  }
}

checkDatabase()
