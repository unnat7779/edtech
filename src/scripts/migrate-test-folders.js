const fs = require("fs")
const path = require("path")
const { connectDB } = require("../lib/mongodb")
const Test = require("../models/Test")

// Helper function to create safe folder name
function createSafeFolderName(testName, createdAt) {
  const cleanName = testName
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 50)

  const date = new Date(createdAt)
  const formattedDate = date.toISOString().split("T")[0]

  return `${cleanName}_${formattedDate}`
}

async function migrateTestFolders() {
  try {
    console.log("🔄 Starting migration of test folders...")

    // Connect to database
    await connectDB()

    // Get all tests
    const tests = await Test.find({})
    console.log(`Found ${tests.length} tests to process`)

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "tests")

    if (!fs.existsSync(uploadsDir)) {
      console.log("No uploads/tests directory found. Nothing to migrate.")
      return
    }

    // Get existing folders
    const existingFolders = fs
      .readdirSync(uploadsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    console.log(`Found ${existingFolders.length} existing folders`)

    let migratedCount = 0
    let skippedCount = 0

    for (const test of tests) {
      const testId = test._id.toString()
      const newFolderName = createSafeFolderName(test.title, test.createdAt)

      // Check if old folder exists (by ID)
      const oldFolderPath = path.join(uploadsDir, testId)
      const newFolderPath = path.join(uploadsDir, newFolderName)

      if (fs.existsSync(oldFolderPath)) {
        if (!fs.existsSync(newFolderPath)) {
          // Rename the folder
          fs.renameSync(oldFolderPath, newFolderPath)
          console.log(`✓ Migrated: ${testId} → ${newFolderName}`)
          migratedCount++
        } else {
          console.log(`⚠ Skipped: ${newFolderName} already exists`)
          skippedCount++
        }
      }
    }

    console.log(`\n🎉 Migration complete!`)
    console.log(`✓ Migrated: ${migratedCount} folders`)
    console.log(`⚠ Skipped: ${skippedCount} folders`)

    // List remaining ID-based folders that couldn't be matched
    const remainingIdFolders = fs
      .readdirSync(uploadsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter((name) => name.match(/^[0-9a-f]{24}$/)) // MongoDB ObjectId pattern

    if (remainingIdFolders.length > 0) {
      console.log(`\n⚠ Found ${remainingIdFolders.length} unmigrated ID-based folders:`)
      remainingIdFolders.forEach((folder) => console.log(`  - ${folder}`))
      console.log("These might be orphaned folders from deleted tests.")
    }
  } catch (error) {
    console.error("❌ Migration failed:", error)
  }
}

// Run migration
migrateTestFolders()
