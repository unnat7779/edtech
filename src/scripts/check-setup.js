const fs = require("fs")
const path = require("path")

function checkSetup() {
  console.log("🔍 Checking EdTech Platform Setup...\n")

  // Check environment variables
  console.log("📋 Environment Variables:")
  const envPath = path.join(process.cwd(), ".env.local")

  if (fs.existsSync(envPath)) {
    console.log("✅ .env.local file exists")
    const envContent = fs.readFileSync(envPath, "utf8")

    const requiredVars = ["MONGODB_URI", "JWT_SECRET", "NEXTAUTH_SECRET"]
    requiredVars.forEach((varName) => {
      if (envContent.includes(varName)) {
        console.log(`✅ ${varName} is set`)
      } else {
        console.log(`❌ ${varName} is missing`)
      }
    })
  } else {
    console.log("❌ .env.local file not found")
  }

  console.log("\n📁 Directory Structure:")
  const requiredDirs = ["src/app", "src/components", "src/lib", "src/models", "src/middleware", "public/uploads"]

  requiredDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir} exists`)
    } else {
      console.log(`❌ ${dir} missing`)
      // Create missing directories
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Created ${dir}`)
    }
  })

  console.log("\n📦 Package.json Dependencies:")
  const packagePath = path.join(process.cwd(), "package.json")
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
    const requiredDeps = ["next", "react", "mongoose", "bcryptjs", "jsonwebtoken"]

    requiredDeps.forEach((dep) => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep} is installed`)
      } else {
        console.log(`❌ ${dep} is missing`)
      }
    })
  }

  console.log("\n🔧 Setup Complete! Run the following if you see any missing items:")
  console.log("npm install")
  console.log("node src/scripts/create-admin.js")
}

checkSetup()
