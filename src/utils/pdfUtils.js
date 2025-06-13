/**
 * PDF Processing Utilities
 */

export class PDFContentExtractor {
  static questionPatterns = {
    numbered: /^(\d+)[.)]\s*(.*?)(?=^\d+[.)]|$)/gms,
    questionWord: /Question\s+(\d+)[:.]?\s*(.*?)(?=Question\s+\d+|$)/gis,
    mcqIndicators: /(Which of the following|What is|Select|Choose|Identify)/i,
    numericalIndicators: /(Calculate|Find|Determine|Compute|Evaluate)/i,
    optionPattern: /^([A-D])\)\s*(.+?)(?=^[A-D]\)|$)/gm,
    answerPattern: /(?:Answer|Correct Answer|Solution)[:\s]*([A-D]|\d+(?:\.\d+)?)/i,
  }

  static mathPatterns = {
    latex: /\$([^$]+)\$/g,
    equations: /([a-zA-Z]\s*=\s*[^,\n]+)/g,
    functions: /(sin|cos|tan|log|ln|sqrt|∫|∑|∏|∂|∇)/g,
    fractions: /(\d+\/\d+)/g,
    exponents: /(\w+\^\w+|\w+\^{\w+})/g,
  }

  static cleanText(text) {
    return text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim()
  }

  static detectQuestionType(text) {
    const hasOptions = this.questionPatterns.optionPattern.test(text)
    const isMCQ = hasOptions || this.questionPatterns.mcqIndicators.test(text)
    const isNumerical = this.questionPatterns.numericalIndicators.test(text)

    if (isMCQ) return "mcq"
    if (isNumerical) return "numerical"
    return "unknown"
  }

  static extractOptions(text) {
    const options = []
    const matches = text.matchAll(this.questionPatterns.optionPattern)

    for (const match of matches) {
      options.push({
        label: match[1],
        text: match[2].trim(),
      })
    }

    return options
  }

  static findCorrectAnswer(text, questionType) {
    const answerMatch = text.match(this.questionPatterns.answerPattern)

    if (!answerMatch) return null

    const answer = answerMatch[1]

    if (questionType === "mcq") {
      // Convert A, B, C, D to 0, 1, 2, 3
      if (/^[A-D]$/.test(answer)) {
        return answer.charCodeAt(0) - 65
      }
    } else if (questionType === "numerical") {
      const numAnswer = Number.parseFloat(answer)
      if (!isNaN(numAnswer)) {
        return numAnswer
      }
    }

    return null
  }

  static extractMathematicalContent(text) {
    const formulas = []

    Object.entries(this.mathPatterns).forEach(([type, pattern]) => {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        formulas.push({
          type,
          content: match[1] || match[0],
          position: match.index,
        })
      }
    })

    return formulas
  }

  static calculateTextConfidence(extractedText, ocrText, ocrConfidence) {
    // If we have both extracted text and OCR text, compare them
    if (extractedText && ocrText) {
      const similarity = this.calculateSimilarity(extractedText, ocrText)
      return Math.max(similarity * 100, ocrConfidence)
    }

    // If we only have extracted text, assume high confidence
    if (extractedText && extractedText.length > 50) {
      return 90
    }

    // If we only have OCR text, use OCR confidence
    if (ocrText) {
      return ocrConfidence
    }

    return 0
  }

  static calculateSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/)
    const words2 = text2.toLowerCase().split(/\s+/)

    const commonWords = words1.filter((word) => words2.includes(word))
    const totalWords = Math.max(words1.length, words2.length)

    return totalWords > 0 ? commonWords.length / totalWords : 0
  }

  static validateQuestion(question) {
    const errors = []

    if (!question.questionText || question.questionText.trim().length < 10) {
      errors.push("Question text is too short or missing")
    }

    if (question.questionType === "mcq") {
      if (!question.options || question.options.length !== 4) {
        errors.push("MCQ questions must have exactly 4 options")
      }

      if (question.correctAnswer === null || question.correctAnswer < 0 || question.correctAnswer > 3) {
        errors.push("MCQ questions must have a valid correct answer (0-3)")
      }
    } else if (question.questionType === "numerical") {
      if (question.numericalAnswer === null || isNaN(question.numericalAnswer)) {
        errors.push("Numerical questions must have a valid numerical answer")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static formatQuestionForPlatform(question, config = {}) {
    const defaultConfig = {
      subject: "Physics",
      chapter: "",
      difficulty: "Medium",
      positiveMarks: 4,
      negativeMarks: -1,
    }

    const finalConfig = { ...defaultConfig, ...config }

    return {
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || [],
      correctAnswer: question.correctAnswer,
      numericalAnswer: question.numericalAnswer,
      explanation: question.explanation || "",
      subject: finalConfig.subject,
      chapter: finalConfig.chapter,
      difficulty: finalConfig.difficulty,
      marks: {
        positive: finalConfig.positiveMarks,
        negative: finalConfig.negativeMarks,
      },
      tags: [
        finalConfig.subject.toLowerCase(),
        finalConfig.difficulty.toLowerCase(),
        ...(finalConfig.chapter ? [finalConfig.chapter.toLowerCase()] : []),
      ],
    }
  }
}

export class PDFErrorHandler {
  static handleProcessingError(error, stage) {
    const errorMap = {
      parsing: "Failed to parse PDF file. The file may be corrupted or password-protected.",
      extracting: "Failed to extract text from PDF. The file may contain only images.",
      rendering: "Failed to render PDF pages. The file may have unsupported content.",
      ocr: "OCR processing failed. Image quality may be too low.",
      analyzing: "Failed to analyze content structure. The document format may not be supported.",
    }

    return {
      stage,
      message: errorMap[stage] || "An unknown error occurred during PDF processing.",
      originalError: error.message,
      suggestions: this.getSuggestions(stage, error),
    }
  }

  static getSuggestions(stage, error) {
    const suggestions = {
      parsing: [
        "Ensure the PDF file is not corrupted",
        "Try removing password protection if present",
        "Convert the PDF to a newer format",
      ],
      extracting: [
        "The PDF may contain only scanned images",
        "OCR processing will be used instead",
        "Consider using a text-based PDF",
      ],
      rendering: [
        "The PDF may contain unsupported elements",
        "Try using a simpler PDF format",
        "Some pages may be skipped",
      ],
      ocr: [
        "Improve image quality by scanning at higher resolution",
        "Ensure text is clearly visible and not too small",
        "Try processing fewer pages at once",
      ],
      analyzing: [
        "The document structure may not match expected format",
        "Try using manual question entry instead",
        "Check if the document contains standard question formats",
      ],
    }

    return suggestions[stage] || ["Try using a different PDF file or manual entry"]
  }
}
