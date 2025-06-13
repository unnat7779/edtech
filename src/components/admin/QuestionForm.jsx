"use client"

import { useState } from "react"
import {
  FileText,
  Calculator,
  BookOpen,
  Target,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Upload,
  AlertCircle,
  EyeOff,
  Eye,
  Clock,
  Rocket,
  CheckCircle,
} from "lucide-react"
import Button from "@/components/ui/Button"
import ImageUploadField from "@/components/admin/ImageUploadField"

export default function QuestionForm({ question, onSave, onCancel, testSubject, testId, questions, index, uploading }) {
  const [formData, setFormData] = useState({
    questionText: question?.questionText || "",
    questionImage: question?.questionImage || "",
    questionType: question?.questionType || "mcq",
    options: question?.options || [
      { text: "", image: "" },
      { text: "", image: "" },
      { text: "", image: "" },
      { text: "", image: "" },
    ],
    correctAnswer: question?.correctAnswer || 0,
    numericalAnswer: question?.numericalAnswer || "",
    explanation: question?.explanation || "",
    explanationImage: question?.explanationImage || "",
    subject: question?.subject || testSubject || "Physics",
    chapter: question?.chapter || "",
    difficulty: question?.difficulty || "Medium",
    marks: {
      positive: question?.marks?.positive || 4,
      negative: question?.marks?.negative || -1,
    },
  })

  const [activeTab, setActiveTab] = useState("question")
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes("options")) {
      const [_, index, field] = name.split(".")
      const updatedOptions = [...formData.options]
      updatedOptions[index] = { ...updatedOptions[index], [field]: value }
      setFormData((prev) => ({ ...prev, options: updatedOptions }))
    } else if (name.includes("marks")) {
      const [_, field] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        marks: { ...prev.marks, [field]: Number(value) },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.questionText.trim()) {
      newErrors.questionText = "Question text is required"
    }

    if (formData.questionType === "mcq") {
      const validOptions = formData.options.filter((opt) => opt.text.trim())
      if (validOptions.length < 2) {
        newErrors.options = "At least two options must have text"
      }
    } else if (formData.questionType === "numerical") {
      if (!formData.numericalAnswer) {
        newErrors.numericalAnswer = "Numerical answer is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    onSave(formData)
  }

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, { text: "", image: "" }],
      }))
    }
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      let newCorrectAnswer = formData.correctAnswer
      if (formData.correctAnswer === index) {
        newCorrectAnswer = 0
      } else if (formData.correctAnswer > index) {
        newCorrectAnswer = formData.correctAnswer - 1
      }
      setFormData((prev) => ({
        ...prev,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      }))
    }
  }

  const tabs = [
    { id: "question", label: "Question", icon: FileText },
    { id: "options", label: "Options", icon: FileText, show: formData.questionType === "mcq" },
    { id: "explanation", label: "Explanation", icon: BookOpen },
    { id: "details", label: "Details", icon: Target },
  ].filter((tab) => tab.show !== false)

  return (
    <div className="space-y-6">
      {/* Enhanced Tabs */}
      <div className="flex border-b bg-gray-50 rounded-t-lg p-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              className={`flex-1 px-4 py-3 font-medium text-sm rounded-lg transition-all flex items-center justify-center ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Tab */}
        {activeTab === "question" && (
          <div className="space-y-6 bg-white p-6 rounded-lg border">
            <div className="flex items-center space-x-4 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Question Information</h3>
            </div>

            {/* Question Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Question Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="questionType"
                    value="mcq"
                    checked={formData.questionType === "mcq"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <FileText className="ml-3 mr-2 h-4 w-4" />
                  <span className="text-sm text-gray-700">Multiple Choice (MCQ)</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="questionType"
                    value="numerical"
                    checked={formData.questionType === "numerical"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Calculator className="ml-3 mr-2 h-4 w-4" />
                  <span className="text-sm text-gray-700">Numerical/Integer Type</span>
                </label>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Question Text *</label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleChange}
                rows={5}
                className={`w-full rounded-lg border ${
                  errors.questionText ? "border-red-300" : "border-gray-300"
                } px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter your question here..."
              />
              {errors.questionText && <p className="text-sm text-red-600">{errors.questionText}</p>}
            </div>

            {/* Question Image */}
            <ImageUploadField
              label="Question Image (optional)"
              name="questionImage"
              value={formData.questionImage}
              onChange={handleChange}
              testId={testId}
              questionIndex={index !== undefined ? index : questions.length}
              type="question"
              placeholder="Add an image to your question"
            />

            {/* Numerical Answer (if numerical type) */}
            {formData.questionType === "numerical" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Correct Numerical Answer *</label>
                <input
                  name="numericalAnswer"
                  type="number"
                  step="any"
                  value={formData.numericalAnswer}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.numericalAnswer ? "border-red-300" : "border-gray-300"
                  } px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter the correct numerical answer"
                />
                {errors.numericalAnswer && <p className="text-sm text-red-600">{errors.numericalAnswer}</p>}
              </div>
            )}
          </div>
        )}

        {/* Options Tab */}
        {activeTab === "options" && formData.questionType === "mcq" && (
          <div className="space-y-6 bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Answer Options</h3>
              </div>
              {formData.options.length < 6 && (
                <Button type="button" onClick={addOption} variant="outline" size="sm" className="flex items-center">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Option
                </Button>
              )}
            </div>

            {errors.options && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.options}</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.options.map((option, optionIndex) => (
                <div key={optionIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={optionIndex}
                        checked={formData.correctAnswer === optionIndex}
                        onChange={() => setFormData((prev) => ({ ...prev, correctAnswer: optionIndex }))}
                        className="h-4 w-4 text-green-600"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Option {String.fromCharCode(65 + optionIndex)}
                        {formData.correctAnswer === optionIndex && (
                          <span className="ml-2 text-green-600 text-xs">(Correct Answer)</span>
                        )}
                      </label>
                    </div>
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => removeOption(optionIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <textarea
                    name={`options.${optionIndex}.text`}
                    value={option.text}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                    placeholder={`Enter option ${String.fromCharCode(65 + optionIndex)} text`}
                  />

                  <ImageUploadField
                    label={`Option ${String.fromCharCode(65 + optionIndex)} Image (optional)`}
                    name={`options.${optionIndex}.image`}
                    value={option.image}
                    onChange={handleChange}
                    testId={testId}
                    questionIndex={index !== undefined ? index : questions.length}
                    type={`option-${optionIndex}`}
                    placeholder="Add an image to this option"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation Tab */}
        {activeTab === "explanation" && (
          <div className="space-y-6 bg-white p-6 rounded-lg border">
            <div className="flex items-center space-x-4 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Explanation (Optional)</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Explanation Text</label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide a detailed explanation for the answer..."
              />
            </div>

            <ImageUploadField
              label="Explanation Image (optional)"
              name="explanationImage"
              value={formData.explanationImage}
              onChange={handleChange}
              testId={testId}
              questionIndex={index !== undefined ? index : questions.length}
              type="explanation"
              placeholder="Add an image to help explain the answer"
            />
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-6 bg-white p-6 rounded-lg border">
            <div className="flex items-center space-x-4 mb-4">
              <Target className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Question Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Chapter</label>
                <input
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter chapter name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Positive Marks</label>
                  <input
                    name="marks.positive"
                    type="number"
                    value={formData.marks.positive}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Negative Marks</label>
                  <input
                    name="marks.negative"
                    type="number"
                    value={formData.marks.negative}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {activeTab !== "question" && (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id)
                  }
                }}
                variant="outline"
                className="flex items-center"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={uploading}
              className="flex items-center"
            >
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
            {activeTab !== "details" ? (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                disabled={uploading}
              >
                <Save className="mr-1 h-4 w-4" />
                {uploading ? "Saving..." : index !== undefined ? "Update Question" : "Add Question"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

// Enhanced Question Form Component (used in the main page)
function EnhancedQuestionForm({ question, onSave, onCancel, testSubject, testId, questions, index, uploading }) {
  return (
    <QuestionForm
      question={question}
      onSave={onSave}
      onCancel={onCancel}
      testSubject={testSubject}
      testId={testId}
      questions={questions}
      index={index}
      uploading={uploading}
    />
  )
}

// Upload Questions Modal Component
function UploadQuestionsModal({
  onClose,
  questionConfig,
  onConfigChange,
  file,
  onFileChange,
  onUpload,
  uploading,
  progress,
  error,
  debugInfo,
  showSampleText,
  setShowSampleText,
  extractedQuestions,
  onAddQuestions,
  onClearQuestions,
  onCopyToClipboard,
  onDownloadSample,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Upload className="mr-3 h-6 w-6" />
              Upload Questions
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Configuration Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Default Configuration
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These settings will be used as defaults for extracted questions if not specified in the file.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <select
                    name="subject"
                    value={questionConfig.subject}
                    onChange={onConfigChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Chapter</label>
                  <input
                    name="chapter"
                    value={questionConfig.chapter}
                    onChange={onConfigChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter chapter name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Difficulty</label>
                  <select
                    name="difficulty"
                    value={questionConfig.difficulty}
                    onChange={onConfigChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Positive Marks</label>
                    <input
                      name="positiveMarks"
                      type="number"
                      value={questionConfig.positiveMarks}
                      onChange={onConfigChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Negative Marks</label>
                    <input
                      name="negativeMarks"
                      type="number"
                      value={questionConfig.negativeMarks}
                      onChange={onConfigChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Important Note
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                For best results, please upload a <strong>text (.txt) file</strong> with your questions. PDF extraction
                may not work correctly with all PDF files.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={onDownloadSample} variant="outline" size="sm" className="flex items-center">
                  <FileText className="mr-1 h-4 w-4" />
                  Download Sample TXT
                </Button>
                <Button onClick={onCopyToClipboard} variant="outline" size="sm" className="flex items-center">
                  <FileText className="mr-1 h-4 w-4" />
                  Copy Sample Format
                </Button>
                <Button
                  onClick={() => setShowSampleText(!showSampleText)}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  {showSampleText ? (
                    <>
                      <EyeOff className="mr-1 h-4 w-4" />
                      Hide Sample
                    </>
                  ) : (
                    <>
                      <Eye className="mr-1 h-4 w-4" />
                      Show Sample
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Sample Text */}
            {showSampleText && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Sample Question Format
                </h4>
                <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-60 font-mono">
                  {`## PHYSICS QUESTIONS 

Question 1: [MCQ] [PHYSICS] [MEDIUM] [CHAPTER: Mechanics] [LEVEL: JEE Main] [TOPIC: Kinematics]
A particle moves along the x-axis such that its position as a function of time is given by x(t) = 
4t³ - 6t² + 3t + 5, where x is in meters and t is in seconds. The acceleration of the particle at t 
= 2 seconds is: 

A) 36 m/s² 
B) 24 m/s² 
C) 48 m/s² 
D) 12 m/s² 

Correct Answer: B 

Explanation: The position function is x(t) = 4t³ - 6t² + 3t + 5. To find acceleration, we need to 
differentiate twice. First derivative (velocity): v(t) = 12t² - 12t + 3. Second derivative 
(acceleration): a(t) = 24t - 12. At t = 2 seconds, a(2) = 24(2) - 12 = 48 - 12 = 36 m/s². 

--- 

Question 2: [NUMERICAL] [PHYSICS] [MEDIUM] [CHAPTER: Thermodynamics] [LEVEL: JEE Main] [TOPIC: Heat Engines]
A heat engine operates between temperatures 127°C and 27°C. If it absorbs 600 J of heat 
from the hot reservoir in each cycle, the maximum work (in joules) that can be extracted in 
each cycle is: 

Correct Answer: 150 

Explanation: The maximum efficiency of a heat engine is given by η = 1 - T₂/T₁, where T₁ = 
127 + 273 = 400 K and T₂ = 27 + 273 = 300 K. Therefore, η = 1 - 300/400 = 0.25 or 25%. 
The maximum work is W = η × Q₁ = 0.25 × 600 J = 150 J.`}
                </pre>
              </div>
            )}

            {/* Format Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Format Instructions
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Your file should follow this format for best extraction results:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Start each question with "Question X:" where X is the question number</li>
                <li>Specify question type: [MCQ] or [NUMERICAL]</li>
                <li>Specify subject: [PHYSICS], [CHEMISTRY], or [MATHEMATICS]</li>
                <li>Specify difficulty: [EASY], [MEDIUM], or [HARD]</li>
                <li>Add optional tags: [LEVEL: JEE Main] [TOPIC: Kinematics]</li>
                <li>For MCQ questions, provide 4 options labeled A), B), C), D)</li>
                <li>End with "Correct Answer: X" where X is the answer</li>
              </ul>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input type="file" accept=".txt,.pdf" onChange={onFileChange} className="hidden" id="file-upload-modal" />
              <label htmlFor="file-upload-modal" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900">
                      {file ? (
                        <span className="flex items-center justify-center">
                          <FileText className="mr-2 h-5 w-5" />
                          {file.name}
                        </span>
                      ) : (
                        "Click to select file or drag and drop"
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Supported formats: .txt (recommended), .pdf</div>
                  </div>
                </div>
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Debug Info */}
            {debugInfo && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {debugInfo.message}
                </h4>
                {debugInfo.suggestion && <p className="text-sm text-yellow-700 mb-3">{debugInfo.suggestion}</p>}
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 font-mono">
                  {debugInfo.textSample}
                </pre>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 text-center flex items-center justify-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {progress}% - Extracting questions...
                </p>
              </div>
            )}

            {/* Extracted Questions Summary */}
            {extractedQuestions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-green-800 flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Questions Extracted Successfully!
                    </h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {extractedQuestions.length} questions
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {extractedQuestions.filter((q) => q.questionType === "mcq").length}
                      </div>
                      <div className="text-sm text-gray-600">MCQ Questions</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {extractedQuestions.filter((q) => q.questionType === "numerical").length}
                      </div>
                      <div className="text-sm text-gray-600">Numerical Questions</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {extractedQuestions.reduce((acc, q) => acc + (q.marks?.positive || 4), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Marks</div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-green-200">
                    <Button onClick={onClearQuestions} variant="outline" className="flex items-center">
                      <Trash2 className="mr-1 h-4 w-4" />
                      Clear Questions
                    </Button>
                    <Button
                      onClick={onAddQuestions}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add to Test
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button onClick={onClose} variant="outline" className="flex items-center">
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={onUpload}
                disabled={!file || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                {uploading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Upload & Extract Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
