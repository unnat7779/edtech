const { execSync } = require("child_process")

function installMissingDeps() {
  console.log("🔧 Installing missing dependencies...\n")

  try {
    // Install specific dependencies
    console.log("📦 Installing autoprefixer and tailwindcss...")
    execSync("npm install --save-dev autoprefixer@10.4.14 tailwindcss@3.3.3 postcss@8.4.27 tailwindcss-animate@1.0.7", {
      stdio: "inherit",
    })

    console.log("✅ Dependencies installed successfully!")
    console.log("\n🚀 You can now run: npm run dev")
  } catch (error) {
    console.error("❌ Error installing dependencies:", error.message)
  }
}

installMissingDeps()
