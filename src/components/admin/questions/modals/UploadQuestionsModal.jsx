"use client"

import { useState } from "react"
import {
  Upload,
  Target,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  Rocket,
  X,
  Download,
  Copy,
} from "lucide-react"
import Button from "@/components/ui/Button"

export default function UploadQuestionsModal({ testId, onClose, onQuestionsAdded }) {
  const [questionConfig, setQuestionConfig] = useState({
    subject: "Physics",
    chapter: "",
    difficulty: "Medium",
    positiveMarks: 4,
    negativeMarks: -1,
  })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [showSampleText, setShowSampleText] = useState(false)
  const [extractedQuestions, setExtractedQuestions] = useState([])
  const [dragActive, setDragActive] = useState(false)

  const handleConfigChange = (e) => {
    const { name, value } = e.target
    setQuestionConfig((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    setUploading(true)
    setProgress(0)
    setExtractedQuestions([])

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("config", JSON.stringify(questionConfig))

      const token = localStorage.getItem("token")

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch(`/api/admin/tests/${testId}/questions/extract`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (response.ok) {
        setExtractedQuestions(data.extractedQuestions || [])
        if (data.extractedQuestions?.length > 0) {
          await handleAddQuestionsToTest(data.extractedQuestions)
        }
      } else {
        setError(data.error || "Failed to extract questions")
      }
    } catch (err) {
      setError("An error occurred while uploading the file")
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleAddQuestionsToTest = async (questions = extractedQuestions) => {
    if (questions.length === 0) {
      setError("No questions to add")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions }),
      })

      if (response.ok) {
        onQuestionsAdded()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add questions to test")
      }
    } catch (error) {
      setError("An error occurred while adding questions to the test")
    }
  }

  const handleDownloadSample = () => {
    const sampleText = `## PHYSICS QUESTIONS 

Question 1: [MCQ] [PHYSICS] [MEDIUM] [CHAPTER: Mechanics] [LEVEL: JEE Main] [TOPIC: Kinematics]
A particle moves along the x-axis such that its position as a function of time is given by x(t) = 4t³ - 6t² + 3t + 5, where x is in meters and t is in seconds. The acceleration of the particle at t = 2 seconds is:

A) 36 m/s²
B) 24 m/s²
C) 48 m/s²
D) 12 m/s²

Correct Answer: B

Explanation: The position function is x(t) = 4t³ - 6t² + 3t + 5. To find acceleration, we need to differentiate twice.

---

Question 2: [NUMERICAL] [PHYSICS] [MEDIUM] [CHAPTER: Thermodynamics] [LEVEL: JEE Main] [TOPIC: Heat Engines]
A heat engine operates between temperatures 127°C and 27°C. If it absorbs 600 J of heat from the hot reservoir in each cycle, the maximum work (in joules) that can be extracted in each cycle is:

Correct Answer: 150

Explanation: The maximum efficiency of a heat engine is given by η = 1 - T₂/T₁.`

    const blob = new Blob([sampleText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-questions.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyToClipboard = async () => {
    const sampleText = `## PHYSICS QUESTIONS 

Question 1: [MCQ] [PHYSICS] [MEDIUM] [CHAPTER: Mechanics] [LEVEL: JEE Main] [TOPIC: Kinematics]
A particle moves along the x-axis such that its position as a function of time is given by x(t) = 4t³ - 6t² + 3t + 5, where x is in meters and t is in seconds. The acceleration of the particle at t = 2 seconds is:

A) 36 m/s²
B) 24 m/s²
C) 48 m/s²
D) 12 m/s²

Correct Answer: B

Explanation: The position function is x(t) = 4t³ - 6t² + 3t + 5. To find acceleration, we need to differentiate twice.

---

Question 2: [NUMERICAL] [PHYSICS] [MEDIUM] [CHAPTER: Thermodynamics] [LEVEL: JEE Main] [TOPIC: Heat Engines]
A heat engine operates between temperatures 127°C and 27°C. If it absorbs 600 J of heat from the hot reservoir in each cycle, the maximum work (in joules) that can be extracted in each cycle is:

Correct Answer: 150

Explanation: The maximum efficiency of a heat engine is given by η = 1 - T₂/T₁.`

    try {
      await navigator.clipboard.writeText(sampleText)
      console.log("Sample text copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center">
              <Upload className="h-6 w-6 mr-3 text-teal-400" />
              Upload Questions
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-full hover:bg-slate-700 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Default Configuration */}
          <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 p-6 rounded-lg border border-teal-700/50 mb-6">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-teal-400" />
              Default Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                <select
                  name="subject"
                  value={questionConfig.subject}
                  onChange={handleConfigChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Chapter</label>
                <input
                  name="chapter"
                  value={questionConfig.chapter}
                  onChange={handleConfigChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter chapter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                <select
                  name="difficulty"
                  value={questionConfig.difficulty}
                  onChange={handleConfigChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Positive Marks</label>
                  <input
                    name="positiveMarks"
                    type="number"
                    value={questionConfig.positiveMarks}
                    onChange={handleConfigChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Negative Marks</label>
                  <input
                    name="negativeMarks"
                    type="number"
                    value={questionConfig.negativeMarks}
                    onChange={handleConfigChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-700/50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-300 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Important Note
            </h3>
            <p className="text-yellow-200 text-sm mb-3">
              For best results, please upload a <strong>text (.txt) file</strong> with your questions.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleDownloadSample}
                variant="outline"
                size="sm"
                className="border-yellow-600 text-yellow-300 hover:bg-yellow-900/20 flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Sample TXT
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                size="sm"
                className="border-yellow-600 text-yellow-300 hover:bg-yellow-900/20 flex items-center"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Sample Format
              </Button>
              <Button
                onClick={() => setShowSampleText(!showSampleText)}
                variant="outline"
                size="sm"
                className="border-yellow-600 text-yellow-300 hover:bg-yellow-900/20 flex items-center"
              >
                {showSampleText ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide Sample
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show Sample
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sample Text */}
          {showSampleText && (
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-slate-200 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-400" />
                Sample Question Format
              </h4>
              <pre className="text-xs bg-slate-900 text-slate-300 p-4 rounded border border-slate-700 overflow-auto max-h-60 font-mono">
                {`## PHYSICS QUESTIONS 

Question 1: [MCQ] [PHYSICS] [MEDIUM] [CHAPTER: Mechanics]
A particle moves along the x-axis such that its position as a function of time is given by x(t) = 4t³ - 6t² + 3t + 5, where x is in meters and t is in seconds. The acceleration of the particle at t = 2 seconds is:

A) 36 m/s²
B) 24 m/s²
C) 48 m/s²
D) 12 m/s²

Correct Answer: B

Explanation: The position function is x(t) = 4t³ - 6t² + 3t + 5. To find acceleration, we need to differentiate twice.

---

Question 2: [NUMERICAL] [PHYSICS] [MEDIUM] [CHAPTER: Thermodynamics]
A heat engine operates between temperatures 127°C and 27°C. If it absorbs 600 J of heat from the hot reservoir in each cycle, the maximum work (in joules) that can be extracted in each cycle is:

Correct Answer: 150

Explanation: The maximum efficiency of a heat engine is given by η = 1 - T₂/T₁.`}
              </pre>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 mb-6 ${
              dragActive
                ? "border-teal-500 bg-teal-900/20"
                : file
                  ? "border-green-500 bg-green-900/20"
                  : "border-slate-600 hover:border-teal-500 hover:bg-slate-800/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
              id="file-upload-modal"
            />
            <label htmlFor="file-upload-modal" className="cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      file
                        ? "bg-gradient-to-r from-green-600 to-green-700"
                        : "bg-gradient-to-r from-teal-600 to-blue-600"
                    }`}
                  >
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-medium text-slate-200">
                    {file ? (
                      <span className="flex items-center justify-center text-green-300">
                        <FileText className="h-5 w-5 mr-2" />
                        {file.name}
                      </span>
                    ) : (
                      "Click to select file or drag and drop"
                    )}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Supported formats: .txt (recommended), .pdf</div>
                </div>
              </div>
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 rounded-lg mb-6">
              <p className="text-sm text-red-300 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2 mb-6">
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-400 text-center flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                {progress}% - Extracting questions...
              </p>
            </div>
          )}

          {/* Success Message */}
          {extractedQuestions.length > 0 && (
            <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-300 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Questions Extracted Successfully!
                </h3>
                <span className="bg-green-800/50 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-700/50">
                  {extractedQuestions.length} questions
                </span>
              </div>
              <p className="text-green-200 text-sm">
                Questions have been successfully extracted and added to your test.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-700">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Upload & Extract Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
