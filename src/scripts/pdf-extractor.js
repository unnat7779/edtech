const fs = require("fs")
const path = require("path")
const pdf = require("pdf-parse")

/**
 * Extract questions from a JEE Main PDF
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} subject - Subject (Physics, Chemistry, Mathematics)
 * @returns {Promise<Array>} - Array of question objects
 */
async function extractQuestionsFromPDF(pdfPath, subject) {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(pdfPath)
    const data = await pdf(dataBuffer)

    // Get the text content
    const text = data.text

    // Split the text into lines
    const lines = text.split("\n").filter((line) => line.trim())

    // Extract questions
    const questions = []
    let currentQuestion = null
    let currentOption = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Check if this is a question
      if (line.match(/^Question\s+\d+\s*:/i) || line.match(/^\d+\s*\./)) {
        // Save previous question if exists
        if (currentQuestion) {
          questions.push(currentQuestion)
        }

        // Start a new question
        currentQuestion = {
          questionText: line
            .replace(/^Question\s+\d+\s*:/i, "")
            .replace(/^\d+\s*\./, "")
            .trim(),
          questionImage: "",
          options: [
            { text: "", image: "" },
            { text: "", image: "" },
            { text: "", image: "" },
            { text: "", image: "" },
          ],
          correctAnswer: 0, // Default, will be updated later
          explanation: "",
          subject,
          chapter: getChapterFromSubject(subject),
          difficulty: "Medium",
          marks: {
            positive: 4,
            negative: -1,
          },
        }

        currentOption = null
      }
      // Check if this is an option
      else if (currentQuestion && line.match(/^$$[A-D]$$/i)) {
        const optionIndex = line.charAt(1).toUpperCase().charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
        if (optionIndex >= 0 && optionIndex < 4) {
          currentOption = optionIndex
          currentQuestion.options[optionIndex].text = line.substring(3).trim()
        }
      }
      // Check if this is a continuation of question or option
      else if (currentQuestion) {
        if (currentOption !== null) {
          currentQuestion.options[currentOption].text += " " + line
        } else {
          currentQuestion.questionText += " " + line
        }
      }
    }

    // Add the last question
    if (currentQuestion) {
      questions.push(currentQuestion)
    }

    // Try to determine correct answers (this is a simplified approach)
    // In a real implementation, you would need to parse the answer key
    questions.forEach((question) => {
      // For demo purposes, randomly assign a correct answer
      question.correctAnswer = Math.floor(Math.random() * 4)
    })

    return questions
  } catch (error) {
    console.error("Error extracting questions from PDF:", error)
    throw error
  }
}

function getChapterFromSubject(subject) {
  const chapters = {
    Physics: ["Mechanics", "Electromagnetism", "Optics", "Modern Physics", "Thermodynamics"],
    Chemistry: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
    Mathematics: ["Calculus", "Algebra", "Coordinate Geometry", "Trigonometry", "Statistics"],
  }

  const subjectChapters = chapters[subject] || ["General"]
  return subjectChapters[Math.floor(Math.random() * subjectChapters.length)]
}

module.exports = { extractQuestionsFromPDF }
