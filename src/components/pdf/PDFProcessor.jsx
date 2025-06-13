
"use client"

import { useState, useRef, useCallback } from "react"
import {
  FileText,
  Brain,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Settings,
  Upload,
  File,
  Edit,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { extractQuestionsFromText, validateQuestions } from "@/lib/question-extractor"

export default function PDFProcessor({ testId, onQuestionsExtracted, onClose }) {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState({
    stage: "idle",
    progress: 0,
    message: "",
  })
  const [extractedContent, setExtractedContent] = useState(null)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState({
    subject: "Physics",
    chapter: "",
    difficulty: "Medium",
    positiveMarks: 4,
    negativeMarks: -1,
  })
  const [showAllQuestions, setShowAllQuestions] = useState(false)

  const fileInputRef = useRef(null)

  const handleFileSelect = useCallback((selectedFile) => {
    setFile(selectedFile)
    setError(null)
    setExtractedContent(null)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && (droppedFile.type === "text/plain" || droppedFile.type === "application/pdf")) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const updateStatus = (stage, progress, message) => {
    setProcessingStatus({ stage, progress, message })
  }

  const handleProcessFile = useCallback(async () => {
    if (!file) {
      setError({
        stage: "validation",
        message: "Please select a file to process",
      })
      return
    }

    setProcessing(true)
    setError(null)
    updateStatus("reading", 10, "Reading file content...")

    try {
      let text = ""

      if (file.type === "text/plain") {
        // Handle TXT files
        text = await file.text()
        updateStatus("parsing", 30, "Parsing text content...")
      } else if (file.type === "application/pdf") {
        // Handle PDF files with server-side processing
        updateStatus("uploading", 20, "Uploading PDF for processing...")

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/admin/process-pdf", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("PDF processing failed on server")
        }

        const result = await response.json()
        text = result.text || ""
        updateStatus("parsing", 50, "Processing extracted PDF text...")
      } else {
        throw new Error("Unsupported file type. Please use .txt or .pdf files.")
      }

      if (!text || text.trim().length < 50) {
        throw new Error("File appears to be empty or contains insufficient content")
      }

      updateStatus("extracting", 70, "Extracting questions from content...")

      // Extract questions using our improved extractor
      const questions = await extractQuestionsFromText(text, config)

      if (questions.length === 0) {
        throw new Error("No questions could be extracted from the file. Please check the format.")
      }

      updateStatus("validating", 90, "Validating extracted questions...")

      // Validate questions
      const validationErrors = validateQuestions(questions)

      updateStatus("complete", 100, `Successfully extracted ${questions.length} questions!`)

      setExtractedContent({
        questions,
        validationErrors,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          questionCount: questions.length,
          processingTime: Date.now(),
        },
      })
    } catch (error) {
      console.error("File processing error:", error)
      setError({
        stage: "processing",
        message: error.message || "Failed to process file",
        suggestions: [
          "Ensure your file follows the correct format",
          "Check that questions are clearly separated",
          "Verify that MCQ options are labeled A), B), C), D)",
          "Make sure correct answers are specified",
        ],
      })
    } finally {
      setProcessing(false)
    }
  }, [file, config])

  const handleConfigChange = useCallback((key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    setExtractedContent(null)
    setProcessingStatus({
      stage: "idle",
      progress: 0,
      message: "",
    })
  }, [])

  const handleExportQuestions = useCallback(() => {
    if (!extractedContent || !extractedContent.questions.length) return

    const questionsData = {
      questions: extractedContent.questions,
      metadata: extractedContent.metadata,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(questionsData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `extracted-questions-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [extractedContent])

  const handleAddToTest = useCallback(async () => {
    if (!extractedContent || !extractedContent.questions.length) return

    try {
      await onQuestionsExtracted(extractedContent.questions)
    } catch (error) {
      setError({
        stage: "integration",
        message: "Failed to add questions to test",
        originalError: error.message,
      })
    }
  }, [extractedContent, onQuestionsExtracted])

  const downloadSampleFile = () => {
    const sampleContent = `## PHYSICS QUESTIONS

Question 1: [MCQ] [PHYSICS] [MEDIUM] [CHAPTER: Mechanics]
A particle moves along the x-axis such that its position as a function of time is given by x(t) = 4t³ - 6t² + 3t + 5, where x is in meters and t is in seconds. The acceleration of the particle at t = 2 seconds is:

A) 36 m/s²
B) 24 m/s²
C) 48 m/s²
D) 12 m/s²

Correct Answer: B

Explanation: The position function is x(t) = 4t³ - 6t² + 3t + 5. To find acceleration, we need to differentiate twice. First derivative (velocity): v(t) = 12t² - 12t + 3. Second derivative (acceleration): a(t) = 24t - 12. At t = 2 seconds, a(2) = 24(2) - 12 = 48 - 12 = 36 m/s².

---

Question 2: [NUMERICAL] [PHYSICS] [MEDIUM] [CHAPTER: Thermodynamics]
A heat engine operates between temperatures 127°C and 27°C. If it absorbs 600 J of heat from the hot reservoir in each cycle, the maximum work (in joules) that can be extracted in each cycle is:

Correct Answer: 150

Explanation: The maximum efficiency of a heat engine is given by η = 1 - T₂/T₁, where T₁ = 127 + 273 = 400 K and T₂ = 27 + 273 = 300 K. Therefore, η = 1 - 300/400 = 0.25 or 25%. The maximum work is W = η × Q₁ = 0.25 × 600 J = 150 J.`

    const blob = new Blob([sampleContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-questions.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Question Extractor</h2>
              <p className="text-sm text-gray-600">Extract questions from TXT or PDF files</p>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Upload & Config */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Settings className="h-5 w-5 mr-2" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Subject</label>
                      <select
                        value={config.subject}
                        onChange={(e) => handleConfigChange("subject", e.target.value)}
                        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Difficulty</label>
                      <select
                        value={config.difficulty}
                        onChange={(e) => handleConfigChange("difficulty", e.target.value)}
                        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Chapter</label>
                    <input
                      type="text"
                      value={config.chapter}
                      onChange={(e) => handleConfigChange("chapter", e.target.value)}
                      placeholder="Enter chapter name"
                      className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Positive Marks</label>
                      <input
                        type="number"
                        value={config.positiveMarks}
                        onChange={(e) => handleConfigChange("positiveMarks", Number.parseInt(e.target.value))}
                        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Negative Marks</label>
                      <input
                        type="number"
                        value={config.negativeMarks}
                        onChange={(e) => handleConfigChange("negativeMarks", Number.parseInt(e.target.value))}
                        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample File Download */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700 mb-2">Need help with the format? Download our sample file:</p>
                      <Button onClick={downloadSampleFile} size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download Sample
                      </Button>
                    </div>

                    {/* Upload Zone */}
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />

                      {file ? (
                        <div className="space-y-2">
                          <File className="h-12 w-12 text-green-500 mx-auto" />
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {file.type}
                          </div>
                          <div className="text-xs text-green-600">Ready to process</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <div className="text-gray-600">Click to select or drag and drop</div>
                          <div className="text-xs text-gray-500">Supports .txt and .pdf files</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Status */}
              {(processing || processingStatus.stage !== "idle") && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Processing Status</span>
                        <span className="text-sm text-gray-500">{processingStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processingStatus.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{processingStatus.message}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800">Processing Error</h4>
                        <p className="text-sm text-red-700 mt-1">{error.message}</p>
                        {error.suggestions && (
                          <ul className="text-xs text-red-600 mt-2 space-y-1">
                            {error.suggestions.map((suggestion, index) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button onClick={handleRetry} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            {extractedContent ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Extracted Questions</h3>
                  <div className="text-sm text-gray-500">{extractedContent.questions.length} questions found</div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border rounded-md text-center">
                    <div className="text-lg font-medium text-blue-600">
                      {extractedContent.questions.filter((q) => q.questionType === "mcq").length}
                    </div>
                    <div className="text-sm text-gray-600">MCQ Questions</div>
                  </div>
                  <div className="p-4 bg-green-50 border rounded-md text-center">
                    <div className="text-lg font-medium text-green-600">
                      {extractedContent.questions.filter((q) => q.questionType === "numerical").length}
                    </div>
                    <div className="text-sm text-gray-600">Numerical Questions</div>
                  </div>
                  <div className="p-4 bg-purple-50 border rounded-md text-center">
                    <div className="text-lg font-medium text-purple-600">
                      {extractedContent.questions.reduce((acc, q) => acc + (q.marks?.positive || 4), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Marks</div>
                  </div>
                </div>

                {/* Validation Errors */}
                {extractedContent.validationErrors && extractedContent.validationErrors.length > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Validation Warnings</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {extractedContent.validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Questions Preview */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Questions Preview</h4>
                  {extractedContent.questions.slice(0, 5).map((question, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Question {index + 1}</span>
                          <div className="flex space-x-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {question.questionType === "mcq" ? "MCQ" : "Numerical"}
                            </span>
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                              {question.subject}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{question.questionText}</p>
                        {question.questionType === "mcq" && question.options && (
                          <div className="text-xs text-gray-500">
                            Options: {question.options.length} | Correct:{" "}
                            {question.correctAnswer !== null
                              ? String.fromCharCode(65 + question.correctAnswer)
                              : "Not specified"}
                          </div>
                        )}
                        {question.questionType === "numerical" && (
                          <div className="text-xs text-gray-500">
                            Answer: {question.numericalAnswer !== null ? question.numericalAnswer : "Not specified"}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {extractedContent.questions.length > 5 && !showAllQuestions && (
                    <div className="text-center">
                      <Button
                        onClick={() => setShowAllQuestions(true)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Show {extractedContent.questions.length - 5} more questions
                      </Button>
                    </div>
                  )}

                  {showAllQuestions &&
                    extractedContent.questions.slice(5).map((question, index) => (
                      <Card key={index + 5} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium">Question {index + 6}</span>
                            <div className="flex space-x-1">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {question.questionType === "mcq" ? "MCQ" : "Numerical"}
                              </span>
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                {question.subject}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{question.questionText}</p>
                          {question.questionType === "mcq" && question.options && (
                            <div className="text-xs text-gray-500">
                              Options: {question.options.length} | Correct:{" "}
                              {question.correctAnswer !== null
                                ? String.fromCharCode(65 + question.correctAnswer)
                                : "Not specified"}
                            </div>
                          )}
                          {question.questionType === "numerical" && (
                            <div className="text-xs text-gray-500">
                              Answer: {question.numericalAnswer !== null ? question.numericalAnswer : "Not specified"}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                  {showAllQuestions && extractedContent.questions.length > 5 && (
                    <div className="text-center">
                      <Button
                        onClick={() => setShowAllQuestions(false)}
                        variant="outline"
                        size="sm"
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Show less
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex space-x-4">
                    <Button onClick={handleAddToTest} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Add {extractedContent.questions.length} Questions to Test
                    </Button>
                    <Button onClick={handleExportQuestions} variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Export as JSON
                    </Button>
                  </div>

                  <div className="mt-3 text-center">
                    <Button
                      onClick={() => {
                        // Navigate to individual question editing
                        window.open(`/admin/tests/${testId}/questions/bulk-edit`, "_blank")
                      }}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Questions Individually
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h3>
                  <p className="text-gray-600">Upload and process a file to see extracted content here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
