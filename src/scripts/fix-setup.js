const { MongoClient } = require("mongodb")

async function finalDatabaseFix() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://unnatagrawal195:VNSUtKjboeCNVlP2@cluster0.alca8wl.mongodb.net/"
  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    console.log("🔥 Starting FINAL database fix...")
    await client.connect()

    const db = client.db()

    // 1. COMPLETELY DROP THE COLLECTION
    console.log("💥 DROPPING ENTIRE studentstreaks collection...")
    try {
      await db.collection("studentstreaks").drop()
      console.log("✅ Collection completely destroyed")
    } catch (error) {
      console.log("⚠️ Collection might not exist, continuing...")
    }

    // 2. WAIT A MOMENT FOR MONGODB TO PROCESS
    console.log("⏳ Waiting for MongoDB to process...")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 3. LIST ALL COLLECTIONS TO VERIFY REMOVAL
    const collections = await db.listCollections().toArray()
    const streakCollection = collections.find((col) => col.name === "studentstreaks")
    if (!streakCollection) {
      console.log("✅ Collection completely removed from database")
    } else {
      console.log("⚠️ Collection still exists, forcing removal...")
      await db.collection("studentstreaks").drop()
    }

    // 4. CREATE FRESH COLLECTION WITH EXPLICIT INDEX MANAGEMENT
    console.log("🆕 Creating completely fresh collection...")
    const newCollection = db.collection("studentstreaks")

    // Drop any existing indexes first (just in case)
    try {
      await newCollection.dropIndexes()
      console.log("✅ Dropped any existing indexes")
    } catch (error) {
      console.log("⚠️ No indexes to drop")
    }

    // Create ONLY the student index with explicit name
    await newCollection.createIndex(
      { student: 1 },
      {
        unique: true,
        sparse: true,
        name: "student_unique_index", // Explicit name to avoid conflicts
      },
    )
    console.log("✅ Created ONLY the correct 'student' index with explicit name")

    // 5. VERIFY THE NEW INDEX
    const indexes = await newCollection.indexes()
    console.log("📋 Current indexes:")
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`)
    })

    // 6. CHECK FOR ANY userId INDEXES
    const userIdIndexes = indexes.filter(
      (idx) => idx.name.includes("userId") || JSON.stringify(idx.key).includes("userId"),
    )
    if (userIdIndexes.length === 0) {
      console.log("✅ NO userId indexes found - problem solved!")
    } else {
      console.log("❌ Found userId indexes:", userIdIndexes)
    }

    console.log("🎉 FINAL FIX COMPLETED - Database is now completely clean!")
  } catch (error) {
    console.error("❌ Final fix failed:", error)
  } finally {
    await client.close()
  }
}

// Run the final fix
finalDatabaseFix()
