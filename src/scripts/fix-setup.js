const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

function fixSetup() {
  console.log("🔧 Fixing EdTech Platform Setup...\n")

  try {
    // Clean node_modules and package-lock
    console.log("🧹 Cleaning node_modules...")
    if (fs.existsSync("node_modules")) {
      execSync("rm -rf node_modules", { stdio: "inherit" })
    }
    if (fs.existsSync("package-lock.json")) {
      execSync("rm package-lock.json", { stdio: "inherit" })
    }

    // Install dependencies
    console.log("📦 Installing dependencies...")
    execSync("npm install", { stdio: "inherit" })

    // Create .next directory if it doesn't exist
    if (!fs.existsSync(".next")) {
      fs.mkdirSync(".next")
    }

    console.log("✅ Setup fixed successfully!")
    console.log("\n🚀 You can now run: npm run dev")
  } catch (error) {
    console.error("❌ Error fixing setup:", error.message)
  }
}

fixSetup()
