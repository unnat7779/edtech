// This file should be placed in the public/workers directory
// It's the same content as src/workers/pdfWorker.js but accessible from public path

importScripts("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js")
importScripts("https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js")

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

class PDFProcessor {
  constructor() {
    this.ocrWorker = null
    this.processingStatus = {
      stage: "idle",
      progress: 0,
      message: "",
    }
  }

  async initializeOCR() {
    if (!this.ocrWorker) {
      this.ocrWorker = await Tesseract.createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            this.updateStatus("ocr", 60 + m.progress * 20, `OCR Processing: ${Math.round(m.progress * 100)}%`)
          }
        },
      })
    }
    return this.ocrWorker
  }

  updateStatus(stage, progress, message) {
    this.processingStatus = { stage, progress, message }
    self.postMessage({
      type: "status",
      data: this.processingStatus,
    })
  }

  async processPDF(pdfBuffer, config = {}) {
    try {
      this.updateStatus("parsing", 10, "Parsing PDF structure...")

      const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
      const pdfDoc = await loadingTask.promise

      this.updateStatus("extracting", 20, "Extracting text content...")
      const textContent = await this.extractTextFromPDF(pdfDoc)

      this.updateStatus("rendering", 40, "Rendering pages for image extraction...")
      const images = await this.extractImagesFromPDF(pdfDoc)

      this.updateStatus("ocr", 60, "Processing images with OCR...")
      const ocrResults = await this.performOCR(images)

      this.updateStatus("analyzing", 80, "Analyzing content structure...")
      const structuredContent = await this.analyzeContent(textContent, ocrResults, images)

      this.updateStatus("complete", 100, "Processing complete!")

      return {
        success: true,
        data: structuredContent,
        metadata: {
          pageCount: pdfDoc.numPages,
          processingTime: Date.now(),
          confidence: this.calculateConfidence(structuredContent),
        },
      }
    } catch (error) {
      console.error("PDF processing error:", error)
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  }

  async extractTextFromPDF(pdfDoc) {
    const textContent = []

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum)
        const textContentObj = await page.getTextContent()

        const pageText = textContentObj.items
          .map((item) => item.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim()

        textContent.push({
          pageNumber: pageNum,
          text: pageText,
          items: textContentObj.items,
        })

        this.updateStatus(
          "extracting",
          20 + (pageNum / pdfDoc.numPages) * 15,
          `Extracting text from page ${pageNum}/${pdfDoc.numPages}`,
        )
      } catch (error) {
        console.error(`Error extracting text from page ${pageNum}:`, error)
        textContent.push({
          pageNumber: pageNum,
          text: "",
          error: error.message,
        })
      }
    }

    return textContent
  }

  async extractImagesFromPDF(pdfDoc) {
    const images = []

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })

        const canvas = new OffscreenCanvas(viewport.width, viewport.height)
        const context = canvas.getContext("2d")

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        await page.render(renderContext).promise

        const imageData = await canvas.convertToBlob({ type: "image/png" })
        const arrayBuffer = await imageData.arrayBuffer()

        images.push({
          pageNumber: pageNum,
          imageData: new Uint8Array(arrayBuffer),
          width: viewport.width,
          height: viewport.height,
          type: "page-render",
        })

        this.updateStatus(
          "rendering",
          40 + (pageNum / pdfDoc.numPages) * 15,
          `Rendering page ${pageNum}/${pdfDoc.numPages}`,
        )
      } catch (error) {
        console.error(`Error rendering page ${pageNum}:`, error)
        images.push({
          pageNumber: pageNum,
          error: error.message,
          type: "error",
        })
      }
    }

    return images
  }

  async performOCR(images) {
    const ocrResults = []
    await this.initializeOCR()

    for (let i = 0; i < images.length; i++) {
      const image = images[i]

      if (image.error || !image.imageData) {
        ocrResults.push({
          pageNumber: image.pageNumber,
          text: "",
          confidence: 0,
          error: image.error || "No image data",
        })
        continue
      }

      try {
        const {
          data: { text, confidence },
        } = await this.ocrWorker.recognize(image.imageData)

        ocrResults.push({
          pageNumber: image.pageNumber,
          text: text.trim(),
          confidence: confidence,
          type: "ocr-result",
        })
      } catch (error) {
        console.error(`OCR error for page ${image.pageNumber}:`, error)
        ocrResults.push({
          pageNumber: image.pageNumber,
          text: "",
          confidence: 0,
          error: error.message,
        })
      }
    }

    return ocrResults
  }

  async analyzeContent(textContent, ocrResults, images) {
    const combinedText = this.combineTextSources(textContent, ocrResults)

    return {
      text: combinedText,
      questions: this.extractQuestions(combinedText),
      formulas: this.detectMathematicalContent(combinedText),
      images: this.processExtractedImages(images),
      structure: this.analyzeDocumentStructure(combinedText),
      confidence: this.calculateOverallConfidence(textContent, ocrResults),
    }
  }

  combineTextSources(textContent, ocrResults) {
    const combinedPages = []

    for (let i = 0; i < Math.max(textContent.length, ocrResults.length); i++) {
      const textPage = textContent[i] || { pageNumber: i + 1, text: "" }
      const ocrPage = ocrResults[i] || { pageNumber: i + 1, text: "", confidence: 0 }

      let finalText = textPage.text

      if (ocrPage.confidence > 70 && ocrPage.text.length > finalText.length) {
        finalText = ocrPage.text
      } else if (textPage.text.length < 50 && ocrPage.text.length > 50) {
        finalText = ocrPage.text
      }

      combinedPages.push({
        pageNumber: i + 1,
        text: finalText,
        sources: {
          extracted: textPage.text,
          ocr: ocrPage.text,
          ocrConfidence: ocrPage.confidence,
        },
      })
    }

    return combinedPages
  }

  extractQuestions(combinedText) {
    const questions = []
    const allText = combinedText.map((page) => page.text).join("\n\n")

    const questionPatterns = [
      /Question\s+(\d+)[:.]?\s*(.*?)(?=Question\s+\d+|$)/gis,
      /(\d+)\.\s*(.*?)(?=\d+\.|$)/gis,
      /(Which of the following|What is|Calculate|Find|Determine|If|Given that).*?(?=\n\n|\d+\.|Question|$)/gis,
    ]

    questionPatterns.forEach((pattern) => {
      let match
      while ((match = pattern.exec(allText)) !== null) {
        const questionText = match[2] || match[1] || match[0]

        if (questionText.length > 20) {
          const question = this.parseQuestion(questionText.trim())
          if (question) {
            questions.push(question)
          }
        }
      }
    })

    return this.deduplicateQuestions(questions)
  }

  parseQuestion(questionText) {
    const isNumerical = /calculate|find|determine|value|answer.*integer/i.test(questionText)
    const hasMCQOptions = /[A-D]\)\s*[^)]+/g.test(questionText)

    if (hasMCQOptions) {
      return this.parseMCQQuestion(questionText)
    } else if (isNumerical) {
      return this.parseNumericalQuestion(questionText)
    }

    return null
  }

  parseMCQQuestion(questionText) {
    const optionMatch = questionText.match(/(.*?)(?=[A-D]\))/s)
    const mainQuestion = optionMatch ? optionMatch[1].trim() : questionText

    const optionPattern = /([A-D])\)\s*([^A-D)]+?)(?=[A-D]\)|$)/g
    const options = []
    let match

    while ((match = optionPattern.exec(questionText)) !== null) {
      options.push({
        label: match[1],
        text: match[2].trim(),
      })
    }

    const answerPattern = /(?:correct answer|answer)[:\s]*([A-D])/i
    const answerMatch = questionText.match(answerPattern)
    const correctAnswer = answerMatch ? answerMatch[1].charCodeAt(0) - 65 : null

    return {
      questionText: mainQuestion,
      questionType: "mcq",
      options: options.map((opt) => ({ text: opt.text })),
      correctAnswer: correctAnswer,
      rawText: questionText,
    }
  }

  parseNumericalQuestion(questionText) {
    const answerPattern = /(?:answer|result)[:\s]*(\d+(?:\.\d+)?)/i
    const answerMatch = questionText.match(answerPattern)
    const numericalAnswer = answerMatch ? Number.parseFloat(answerMatch[1]) : null

    return {
      questionText: questionText.replace(answerPattern, "").trim(),
      questionType: "numerical",
      numericalAnswer: numericalAnswer,
      options: [],
      rawText: questionText,
    }
  }

  detectMathematicalContent(combinedText) {
    const formulas = []
    const allText = combinedText.map((page) => page.text).join("\n")

    const mathPatterns = [
      /\$([^$]+)\$/g,
      /\\\[([^\]]+)\\\]/g,
      /\\$$([^)]+)\\$$/g,
      /([a-zA-Z]\s*=\s*[^,\n]+)/g,
      /(\d+(?:\.\d+)?\s*[+\-*/]\s*\d+(?:\.\d+)?)/g,
      /(sin|cos|tan|log|ln|sqrt|∫|∑|∏|∂|∇)[(\s]/g,
    ]

    mathPatterns.forEach((pattern, index) => {
      let match
      while ((match = pattern.exec(allText)) !== null) {
        formulas.push({
          type: ["latex-inline", "latex-display", "latex-inline-alt", "equation", "calculation", "function"][index],
          content: match[1] || match[0],
          position: match.index,
        })
      }
    })

    return formulas
  }

  processExtractedImages(images) {
    return images.map((image) => ({
      pageNumber: image.pageNumber,
      width: image.width,
      height: image.height,
      type: image.type,
      hasError: !!image.error,
      error: image.error,
      dataUrl: image.imageData ? this.arrayBufferToBase64(image.imageData) : null,
    }))
  }

  arrayBufferToBase64(buffer) {
    let binary = ""
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return "data:image/png;base64," + btoa(binary)
  }

  analyzeDocumentStructure(combinedText) {
    const allText = combinedText.map((page) => page.text).join("\n")

    return {
      hasQuestions: /question\s+\d+/i.test(allText),
      hasMCQOptions: /[A-D]\)\s*[^)]+/g.test(allText),
      hasNumericalAnswers: /answer[:\s]*\d+/i.test(allText),
      hasMathematicalContent: /[=+\-*/∫∑∏∂∇]/.test(allText),
      estimatedQuestionCount: (allText.match(/question\s+\d+/gi) || []).length,
      pageCount: combinedText.length,
    }
  }

  calculateConfidence(structuredContent) {
    let totalConfidence = 0
    let factors = 0

    if (structuredContent.text.length > 0) {
      const avgOCRConfidence =
        structuredContent.text.reduce((sum, page) => sum + (page.sources?.ocrConfidence || 0), 0) /
        structuredContent.text.length
      totalConfidence += avgOCRConfidence
      factors++
    }

    if (structuredContent.questions.length > 0) {
      totalConfidence += 80
      factors++
    }

    if (structuredContent.formulas.length > 0) {
      totalConfidence += 70
      factors++
    }

    return factors > 0 ? totalConfidence / factors : 0
  }

  calculateOverallConfidence(textContent, ocrResults) {
    const textConfidence = textContent.length > 0 ? 80 : 0
    const ocrConfidence = ocrResults.reduce((sum, result) => sum + result.confidence, 0) / ocrResults.length

    return (textConfidence + ocrConfidence) / 2
  }

  deduplicateQuestions(questions) {
    const seen = new Set()
    return questions.filter((question) => {
      const key = question.questionText.substring(0, 100).toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  async cleanup() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate()
      this.ocrWorker = null
    }
  }
}

self.onmessage = async (e) => {
  const { type, data } = e.data

  if (type === "process-pdf") {
    const processor = new PDFProcessor()
    const result = await processor.processPDF(data.pdfBuffer, data.config)

    self.postMessage({
      type: "result",
      data: result,
    })

    await processor.cleanup()
  }
}
