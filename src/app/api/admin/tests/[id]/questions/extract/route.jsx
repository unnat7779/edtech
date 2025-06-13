import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { authenticate } from "@/middleware/auth"

// Enhanced function to extract questions from text with comprehensive tag parsing
function extractQuestionsFromText(text, config = {}) {
  console.log("Starting enhanced question extraction...")

  // Clean the text - normalize line endings and spacing
  const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()

  // Enhanced regex to capture all tags - more flexible approach
  const questionRegex =
    /Question\s+(\d+):\s*\[(MCQ|NUMERICAL)\]\s*\[(PHYSICS|CHEMISTRY|MATHEMATICS)\]\s*\[(EASY|MEDIUM|HARD)\]\s*\[CHAPTER:\s*([^\]]+)\](?:\s*\[LEVEL:\s*([^\]]+)\])?(?:\s*\[TOPIC:\s*([^\]]+)\])?/gi

  // Find all question headers
  const matches = []
  let match
  while ((match = questionRegex.exec(cleanText)) !== null) {
    matches.push({
      index: match.index,
      number: match[1],
      type: match[2].toLowerCase(),
      subject: match[3],
      difficulty: match[4],
      chapter: match[5] || "",
      level: match[6] || "JEE Main",
      topic: match[7] || "",
      headerLength: match[0].length,
    })
  }

  console.log(`Found ${matches.length} question headers`)
  console.log("Matches:", matches)

  const questions = []

  // Process each question
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i]
    const nextMatch = matches[i + 1]

    // Extract the content between this question header and the next one (or end of text)
    const startIndex = currentMatch.index + currentMatch.headerLength
    const endIndex = nextMatch ? nextMatch.index : cleanText.length
    const questionContent = cleanText.substring(startIndex, endIndex).trim()

    console.log(`Processing Question ${currentMatch.number}: ${currentMatch.type} - ${currentMatch.subject}`)

    try {
      // Parse the question content
      const questionData = parseQuestionContent(
        questionContent,
        currentMatch.type,
        currentMatch.subject,
        currentMatch.difficulty,
        currentMatch.chapter,
        currentMatch.level,
        currentMatch.topic,
        config,
      )

      if (questionData) {
        questions.push(questionData)
        console.log(`✓ Successfully extracted Question ${currentMatch.number}`)
      } else {
        console.log(`✗ Failed to parse Question ${currentMatch.number}`)
      }
    } catch (error) {
      console.error(`Error processing Question ${currentMatch.number}:`, error.message)
    }
  }

  return questions
}

function parseQuestionContent(content, type, subject, difficulty, chapter, level, topic, config) {
  // Split content by lines and clean them
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    console.log("Not enough content to parse question")
    return null
  }

  const questionText = []
  const options = []
  let correctAnswer = null
  let numericalAnswer = null
  const explanation = []
  let currentSection = "question"

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip separator lines
    if (line === "---") {
      break
    }

    // Check for section markers
    if (line.startsWith("Correct Answer:")) {
      currentSection = "answer"
      const answerText = line.replace("Correct Answer:", "").trim()

      if (type === "mcq") {
        // Convert letter (A, B, C, D) to index (0, 1, 2, 3)
        if (/^[A-D]$/i.test(answerText)) {
          correctAnswer = answerText.toUpperCase().charCodeAt(0) - 65
        }
      } else if (type === "numerical") {
        // Convert to number for numerical questions
        const numAnswer = Number.parseFloat(answerText)
        if (!isNaN(numAnswer)) {
          numericalAnswer = numAnswer
        }
      }
      continue
    }

    if (line.startsWith("Explanation:")) {
      currentSection = "explanation"
      const explText = line.replace("Explanation:", "").trim()
      if (explText) explanation.push(explText)
      continue
    }

    // Process based on current section
    switch (currentSection) {
      case "question":
        // Check if this is an option for MCQ
        if (type === "mcq" && /^[A-D]\)/.test(line)) {
          const optionText = line.replace(/^[A-D]\)\s*/, "").trim()
          options.push({ text: optionText, image: "" })
        } else {
          // This is part of the question text - but remove any remaining tags
          let cleanLine = line
          // Remove any remaining tag patterns from question text
          cleanLine = cleanLine.replace(/\[LEVEL:\s*[^\]]+\]/gi, "")
          cleanLine = cleanLine.replace(/\[TOPIC:\s*[^\]]+\]/gi, "")
          cleanLine = cleanLine.replace(/\[CHAPTER:\s*[^\]]+\]/gi, "")
          cleanLine = cleanLine.trim()

          if (cleanLine) {
            questionText.push(cleanLine)
          }
        }
        break
      case "explanation":
        explanation.push(line)
        break
    }
  }

  // Format the fields properly
  const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase()
  const formattedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()

  // Create comprehensive tags array
  const tags = [
    type.toLowerCase(), // mcq or numerical - this is the key tag for type detection
    formattedSubject.toLowerCase(),
    formattedDifficulty.toLowerCase(),
    chapter.toLowerCase(),
  ]

  if (level) {
    tags.push(level.toLowerCase().replace(/\s+/g, "_"))
  }

  if (topic) {
    tags.push(topic.toLowerCase().replace(/\s+/g, "_"))
  }

  // Map difficulty to numeric level
  const difficultyMapping = {
    Easy: 2,
    Medium: 3,
    Hard: 4,
  }

  // Create the enhanced question object
  const questionData = {
    questionText: questionText.join(" "),
    questionImage: "",
    questionType: type, // Store as lowercase
    type: type.toUpperCase(), // Store as uppercase for compatibility
    options: type === "mcq" ? options : [],
    correctAnswer: type === "mcq" ? correctAnswer : undefined,
    numericalAnswer: type === "numerical" ? numericalAnswer : undefined,
    explanation: explanation.join(" "),
    subject: formattedSubject,
    chapter: chapter,
    difficulty: formattedDifficulty,
    level: level || "JEE Main",
    topic: topic || "",
    marks: {
      positive: config.positiveMarks || 4,
      negative: config.negativeMarks || -1,
    },
    tags: tags,
    metadata: {
      questionType: type.toUpperCase(),
      subject: subject.toUpperCase(),
      difficulty: difficulty.toUpperCase(),
      chapter: chapter,
      level: level || "JEE Main",
      topic: topic || "",
    },
    topicTags: [topic].filter(Boolean),
    conceptTags: [formattedSubject, chapter, topic].filter(Boolean),
    difficultyLevel: difficultyMapping[formattedDifficulty] || 3,
  }

  console.log("Created enhanced question data:", {
    type: questionData.questionType,
    typeUppercase: questionData.type,
    subject: questionData.subject,
    chapter: questionData.chapter,
    level: questionData.level,
    topic: questionData.topic,
    tags: questionData.tags,
    metadata: questionData.metadata,
    hasOptions: questionData.options.length,
    hasNumericalAnswer: questionData.numericalAnswer !== undefined,
    questionText: questionData.questionText.substring(0, 100) + "...",
  })

  return questionData
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const configStr = formData.get("config")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    let config = {}
    if (configStr) {
      try {
        config = JSON.parse(configStr)
      } catch (error) {
        console.warn("Invalid config format:", error)
      }
    }

    await connectDB()

    const test = await Test.findById(resolvedParams.id)
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Extract text from file
    let extractedText = ""

    try {
      if (file.name.toLowerCase().endsWith(".txt")) {
        console.log("Processing text file...")
        extractedText = await file.text()
      } else {
        return NextResponse.json({ error: "Please upload a .txt file for best results." }, { status: 400 })
      }

      console.log("Extracted text length:", extractedText.length)
      console.log("Text sample:", extractedText.substring(0, 500))
    } catch (error) {
      console.error("Error extracting text:", error)
      return NextResponse.json(
        {
          error: "Failed to extract text from file: " + error.message,
        },
        { status: 400 },
      )
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "No text content found in the file." }, { status: 400 })
    }

    // Extract questions from text
    const extractedQuestions = extractQuestionsFromText(extractedText, {
      chapter: config.chapter || "",
      positiveMarks: config.positiveMarks || 4,
      negativeMarks: config.negativeMarks || -1,
      level: config.level || "JEE Main",
    })

    console.log("Final extracted questions count:", extractedQuestions.length)
    console.log(
      "Question details:",
      extractedQuestions.map((q) => ({
        type: q.questionType,
        typeUpper: q.type,
        subject: q.subject,
        chapter: q.chapter,
        level: q.level,
        topic: q.topic,
        tags: q.tags,
        hasNumericalAnswer: q.numericalAnswer !== undefined,
        hasOptions: q.options.length,
      })),
    )

    if (extractedQuestions.length === 0) {
      return NextResponse.json(
        {
          error: "No questions could be extracted from the file. Please check the format.",
          textSample: extractedText.substring(0, 500),
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      extractedQuestions,
      count: extractedQuestions.length,
      summary: {
        totalQuestions: extractedQuestions.length,
        mcqCount: extractedQuestions.filter((q) => q.questionType === "mcq").length,
        numericalCount: extractedQuestions.filter((q) => q.questionType === "numerical").length,
        subjects: [...new Set(extractedQuestions.map((q) => q.subject))],
        levels: [...new Set(extractedQuestions.map((q) => q.level))],
        topics: [...new Set(extractedQuestions.map((q) => q.topic).filter(Boolean))],
      },
    })
  } catch (error) {
    console.error("Extraction error:", error)
    return NextResponse.json(
      {
        error: "Failed to process file: " + error.message,
      },
      { status: 500 },
    )
  }
}
