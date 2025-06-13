/**
 * Enhanced Question Extractor with support for both TXT and PDF files
 */

/**
 * Extracts questions from text content
 * @param {string} text - The text content to extract questions from
 * @param {object} defaultConfig - Default configuration for questions
 * @returns {Array} - Array of extracted questions
 */
export async function extractQuestionsFromText(text, defaultConfig = {}) {
  try {
    // Default configuration
    const config = {
      subject: defaultConfig.subject || "Physics",
      chapter: defaultConfig.chapter || "",
      difficulty: defaultConfig.difficulty || "Medium",
      positiveMarks: defaultConfig.positiveMarks || 4,
      negativeMarks: defaultConfig.negativeMarks || -1,
    }

    // Clean and normalize the text
    const cleanedText = cleanText(text)

    // Split the text by question markers or separators
    const questionBlocks = splitIntoQuestions(cleanedText)

    const extractedQuestions = []

    for (const block of questionBlocks) {
      try {
        // Skip headers or non-question content
        if (block.trim().startsWith("##") || block.trim().length < 20) {
          continue
        }

        // Extract question metadata from tags
        const metadata = extractMetadata(block, config)

        // Parse the question based on type
        const question = parseQuestionBlock(block, metadata)

        if (question && question.questionText.length > 10) {
          extractedQuestions.push(question)
        }
      } catch (error) {
        console.error("Error processing question block:", error)
        continue
      }
    }

    return deduplicateQuestions(extractedQuestions)
  } catch (error) {
    console.error("Error extracting questions:", error)
    throw error
  }
}

/**
 * Clean and normalize text content
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * Split text into individual question blocks
 */
function splitIntoQuestions(text) {
  // Multiple splitting strategies
  const strategies = [
    // Strategy 1: Question N: format
    text.split(/(?=Question\s+\d+[:.])/i),
    // Strategy 2: Number. format
    text.split(/(?=^\d+\.\s)/m),
    // Strategy 3: --- separator
    text.split(/---+/),
    // Strategy 4: Double newline separation
    text.split(/\n\n+/),
  ]

  // Choose the strategy that gives the most reasonable number of blocks
  let bestBlocks = [text]
  let bestScore = 0

  for (const blocks of strategies) {
    const validBlocks = blocks.filter(
      (block) => block.trim().length > 50 && (block.includes("?") || block.includes("A)") || block.includes("Answer")),
    )

    if (validBlocks.length > bestScore && validBlocks.length < 100) {
      bestBlocks = blocks
      bestScore = validBlocks.length
    }
  }

  return bestBlocks.filter((block) => block.trim().length > 0)
}

/**
 * Extract metadata from question block
 */
function extractMetadata(block, defaultConfig) {
  const typeMatch = block.match(/\[(MCQ|NUMERICAL|MULTIPLE\s*CHOICE|NUMERIC)\]/i)
  const subjectMatch = block.match(/\[(PHYSICS|CHEMISTRY|MATHEMATICS|MATH|BIOLOGY)\]/i)
  const difficultyMatch = block.match(/\[(EASY|MEDIUM|HARD|DIFFICULT)\]/i)
  const chapterMatch = block.match(/\[CHAPTER:\s*([^\]]+)\]/i)

  return {
    questionType: typeMatch
      ? typeMatch[1].toLowerCase().includes("mcq") || typeMatch[1].toLowerCase().includes("multiple")
        ? "mcq"
        : "numerical"
      : "mcq",
    subject: subjectMatch ? subjectMatch[1].replace("MATH", "Mathematics") : defaultConfig.subject,
    difficulty: difficultyMatch ? difficultyMatch[1] : defaultConfig.difficulty,
    chapter: chapterMatch ? chapterMatch[1].trim() : defaultConfig.chapter,
    positiveMarks: defaultConfig.positiveMarks,
    negativeMarks: defaultConfig.negativeMarks,
  }
}

/**
 * Parse individual question block
 */
function parseQuestionBlock(block, metadata) {
  if (metadata.questionType === "mcq") {
    return parseMCQQuestion(block, metadata)
  } else {
    return parseNumericalQuestion(block, metadata)
  }
}

/**
 * Parse MCQ question
 */
function parseMCQQuestion(block, metadata) {
  // Extract main question text (everything before options)
  const optionStartMatch = block.match(/(.*?)(?=[A-D]\))/s)
  let questionText = optionStartMatch ? optionStartMatch[1] : block

  // Clean question text
  questionText = questionText
    .replace(/Question\s+\d+[:.]?\s*/i, "")
    .replace(/\[(MCQ|NUMERICAL|PHYSICS|CHEMISTRY|MATHEMATICS|MATH|EASY|MEDIUM|HARD|CHAPTER:[^\]]+)\]/gi, "")
    .trim()

  // Extract options
  const options = extractMCQOptions(block)

  // Extract correct answer
  const correctAnswer = extractCorrectAnswer(block, "mcq")

  // Extract explanation
  const explanation = extractExplanation(block)

  return {
    questionText,
    questionType: "mcq",
    options,
    correctAnswer,
    explanation,
    subject: metadata.subject,
    difficulty: metadata.difficulty,
    chapter: metadata.chapter,
    marks: {
      positive: metadata.positiveMarks,
      negative: metadata.negativeMarks,
    },
    tags: generateTags(metadata),
  }
}

/**
 * Parse numerical question
 */
function parseNumericalQuestion(block, metadata) {
  // Extract main question text
  const questionText = block
    .replace(/Question\s+\d+[:.]?\s*/i, "")
    .replace(/\[(MCQ|NUMERICAL|PHYSICS|CHEMISTRY|MATHEMATICS|MATH|EASY|MEDIUM|HARD|CHAPTER:[^\]]+)\]/gi, "")
    .replace(/(?:Correct\s+)?Answer[:\s]*\d+(?:\.\d+)?/i, "")
    .replace(/Explanation:[\s\S]*$/i, "")
    .trim()

  // Extract numerical answer
  const numericalAnswer = extractCorrectAnswer(block, "numerical")

  // Extract explanation
  const explanation = extractExplanation(block)

  return {
    questionText,
    questionType: "numerical",
    numericalAnswer,
    options: [],
    explanation,
    subject: metadata.subject,
    difficulty: metadata.difficulty,
    chapter: metadata.chapter,
    marks: {
      positive: metadata.positiveMarks,
      negative: metadata.negativeMarks,
    },
    tags: generateTags(metadata),
  }
}

/**
 * Extract MCQ options
 */
function extractMCQOptions(block) {
  const options = []
  const optionPattern = /([A-D])\)\s*([^A-D\n]+?)(?=[A-D]\)|Correct\s+Answer|Answer|Explanation|$)/gi

  let match
  while ((match = optionPattern.exec(block)) !== null) {
    const optionText = match[2].trim()
    if (optionText.length > 0) {
      options.push({ text: optionText })
    }
  }

  // If no options found with the pattern above, try a simpler approach
  if (options.length === 0) {
    const lines = block.split("\n")
    for (const line of lines) {
      const simpleMatch = line.match(/^([A-D])\)\s*(.+)$/i)
      if (simpleMatch) {
        options.push({ text: simpleMatch[2].trim() })
      }
    }
  }

  return options
}

/**
 * Extract correct answer
 */
function extractCorrectAnswer(block, questionType) {
  if (questionType === "mcq") {
    const answerPattern = /(?:Correct\s+)?Answer[:\s]*([A-D])/i
    const match = block.match(answerPattern)
    return match ? match[1].charCodeAt(0) - 65 : null
  } else {
    const answerPattern = /(?:Correct\s+)?Answer[:\s]*(\d+(?:\.\d+)?)/i
    const match = block.match(answerPattern)
    return match ? Number.parseFloat(match[1]) : null
  }
}

/**
 * Extract explanation
 */
function extractExplanation(block) {
  const explanationMatch = block.match(/Explanation[:\s]*([\s\S]+?)(?=Question\s+\d+|$)/i)
  return explanationMatch ? explanationMatch[1].trim() : ""
}

/**
 * Generate tags for question
 */
function generateTags(metadata) {
  const tags = [metadata.subject.toLowerCase(), metadata.difficulty.toLowerCase(), metadata.questionType]

  if (metadata.chapter) {
    tags.push(metadata.chapter.toLowerCase())
  }

  return tags
}

/**
 * Remove duplicate questions
 */
function deduplicateQuestions(questions) {
  const seen = new Set()
  return questions.filter((question) => {
    const key = question.questionText.substring(0, 100).toLowerCase().replace(/\s+/g, " ")
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * Process PDF file (simplified approach)
 */
export async function extractQuestionsFromPDF(file, config) {
  try {
    // For now, we'll use a simple text extraction approach
    // In a production environment, you would use a proper PDF parsing library

    const formData = new FormData()
    formData.append("file", file)

    // This would call a server-side PDF processing endpoint
    const response = await fetch("/api/admin/process-pdf", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("PDF processing failed")
    }

    const { text } = await response.json()
    return await extractQuestionsFromText(text, config)
  } catch (error) {
    console.error("PDF processing error:", error)
    throw new Error("Failed to process PDF file. Please try converting it to a text file.")
  }
}

/**
 * Validate extracted questions
 */
export function validateQuestions(questions) {
  const errors = []

  questions.forEach((question, index) => {
    const questionNum = index + 1

    if (!question.questionText || question.questionText.trim().length < 10) {
      errors.push(`Question ${questionNum}: Question text is too short or missing`)
    }

    if (question.questionType === "mcq") {
      if (!question.options || question.options.length !== 4) {
        errors.push(`Question ${questionNum}: MCQ must have exactly 4 options`)
      }

      if (question.correctAnswer === null || question.correctAnswer < 0 || question.correctAnswer > 3) {
        errors.push(`Question ${questionNum}: MCQ must have a valid correct answer (A, B, C, or D)`)
      }
    } else if (question.questionType === "numerical") {
      if (question.numericalAnswer === null || question.numericalAnswer === undefined) {
        errors.push(`Question ${questionNum}: Numerical question must have a numerical answer`)
      }
    }
  })

  return errors
}
