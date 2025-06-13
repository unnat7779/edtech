const fs = require("fs")
const path = require("path")

// Create upload directories
const uploadDirs = [
  "public/uploads",
  "public/uploads/images", // General images
  "public/uploads/tests", // Test-specific folders will be created dynamically
  "public/uploads/avatars", // User avatars
  "public/uploads/documents", // General documents
]

console.log("Setting up upload directory structure...")

uploadDirs.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`✓ Created directory: ${dir}`)
  } else {
    console.log(`✓ Directory already exists: ${dir}`)
  }
})

// Create a .gitkeep file in uploads directory to ensure it's tracked
const gitkeepPath = path.join(process.cwd(), "public/uploads/.gitkeep")
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, "")
  console.log("✓ Created .gitkeep file in uploads directory")
}

// Create a README file explaining the structure
const readmePath = path.join(process.cwd(), "public/uploads/README.md")
const readmeContent = `# Upload Directory Structure

This directory contains all uploaded files organized as follows:

## Structure
- \`images/\` - General images not associated with specific tests
- \`avatars/\` - User profile pictures
- \`documents/\` - General documents
- \`tests/\` - Test-specific uploads organized by test name and date

## Test Folders
Test folders are automatically created with the format:
\`Test-Name_YYYY-MM-DD\`

For example:
- \`Physics-Chapter-1-Motion_2024-01-15/\`
- \`Mathematics-Algebra-Test_2024-01-16/\`

Each test folder contains:
- \`images/\` - Question images, option images, explanation images
- \`documents/\` - PDF uploads, answer keys, etc.

## File Naming Convention
- Question images: \`q{index}_question_{uuid}.jpg\`
- Option images: \`q{index}_option_{uuid}.jpg\`
- Explanation images: \`q{index}_explanation_{uuid}.jpg\`
- General images: \`image_{uuid}.jpg\`
`

if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(readmePath, readmeContent)
  console.log("✓ Created README.md explaining directory structure")
}

console.log("\n🎉 Upload directories setup complete!")
console.log("\nDirectory structure:")
console.log("public/uploads/")
console.log("├── images/           (general images)")
console.log("├── avatars/          (user profiles)")
console.log("├── documents/        (general docs)")
console.log("├── tests/            (test-specific folders)")
console.log("│   ├── Test-Name_YYYY-MM-DD/")
console.log("│   │   ├── images/")
console.log("│   │   └── documents/")
console.log("└── README.md")
