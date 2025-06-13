const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("Installing PDF parsing dependencies...")

try {
  // Check if pdf-parse is already installed
  try {
    require.resolve("pdf-parse")
    console.log("pdf-parse is already installed.")
  } catch (e) {
    console.log("Installing pdf-parse...")
    execSync("npm install pdf-parse@1.1.1", { stdio: "inherit" })
  }

  // Create necessary directories for PDF processing
  const tempDir = path.join(process.cwd(), "temp")
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
    console.log("Created temp directory for PDF processing")
  }

  console.log("PDF dependencies installed successfully!")
} catch (error) {
  console.error("Error installing PDF dependencies:", error)
  process.exit(1)
}
