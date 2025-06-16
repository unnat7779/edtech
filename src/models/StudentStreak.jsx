import mongoose from "mongoose"

const StudentStreakSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // Remove index: true to prevent duplicate index creation
    },

    // Daily streak tracking
    dailyStreak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastActiveDate: {
        type: String, // Format: "2024-01-15"
        default: null,
      },
    },

    // Weekly streak tracking
    weeklyStreak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastActiveWeek: {
        type: String, // Format: "2024-01"
        default: null,
      },
    },

    // Activity heatmap data (last 365 days)
    activityMap: {
      type: Map,
      of: {
        tests: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        subjects: {
          Physics: { type: Number, default: 0 },
          Chemistry: { type: Number, default: 0 },
          Mathematics: { type: Number, default: 0 },
        },
      },
      default: new Map(),
    },

    // Monthly statistics
    monthlyStats: [
      {
        month: String, // Format: "2024-01"
        tests: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        subjects: {
          Physics: { type: Number, default: 0 },
          Chemistry: { type: Number, default: 0 },
          Mathematics: { type: Number, default: 0 },
        },
      },
    ],

    // Weekly statistics
    weeklyStats: [
      {
        week: String, // Format: "2024-01"
        tests: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        subjects: {
          Physics: { type: Number, default: 0 },
          Chemistry: { type: Number, default: 0 },
          Mathematics: { type: Number, default: 0 },
        },
      },
    ],

    // Overall statistics
    totalTests: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },

    // Achievements
    achievements: [
      {
        type: String,
        default: [],
      },
    ],

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// REMOVE ALL SCHEMA-LEVEL INDEXES TO PREVENT DUPLICATES
// We'll create indexes manually in the database

// Only create the model if it doesn't exist
const StudentStreak = mongoose.models.StudentStreak || mongoose.model("StudentStreak", StudentStreakSchema)

// Create indexes programmatically after model creation
if (mongoose.connection.readyState === 1) {
  // Connection is ready
  createIndexesSafely()
} else {
  // Wait for connection
  mongoose.connection.once("connected", createIndexesSafely)
}

async function createIndexesSafely() {
  try {
    const collection = mongoose.connection.db.collection("studentstreaks")

    // Drop all existing indexes except _id
    try {
      const indexes = await collection.indexes()
      for (const index of indexes) {
        if (index.name !== "_id_") {
          try {
            await collection.dropIndex(index.name)
            console.log(`🗑️ Dropped index: ${index.name}`)
          } catch (dropError) {
            console.log(`⚠️ Could not drop index ${index.name}:`, dropError.message)
          }
        }
      }
    } catch (error) {
      console.log("⚠️ Error dropping indexes:", error.message)
    }

    // Create only the student index with explicit name
    try {
      await collection.createIndex(
        { student: 1 },
        {
          unique: true,
          sparse: true,
          name: "student_unique_index",
        },
      )
      console.log("✅ Created student index successfully")
    } catch (indexError) {
      if (indexError.code !== 85) {
        // 85 = IndexAlreadyExists
        console.log("⚠️ Index creation error:", indexError.message)
      }
    }
  } catch (error) {
    console.log("⚠️ Index management error:", error.message)
  }
}

export default StudentStreak
