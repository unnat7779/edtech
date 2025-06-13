"use client"

import { useState } from "react"
import {
  FileText,
  Calculator,
  Target,
  Settings,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Save,
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

  const [errors, setErrors] = useState({})
  const [activeTab, setActiveTab] = useState("basic")

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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.questionText.trim()) {
      newErrors.questionText = "Question text is required"
    }

    if (!formData.chapter.trim()) {
      newErrors.chapter = "Chapter is required"
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
    { id: "basic", label: "Question", icon: FileText },
    { id: "options", label: "Options", icon: Target, show: formData.questionType === "mcq" },
    { id: "details", label: "Details", icon: Settings },
  ].filter((tab) => tab.show !== false)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {index !== undefined ? `Edit Question ${index + 1}` : "Add New Question"}
            </h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          {/* Enhanced Tabs */}
          <div className="flex border-b border-slate-700 bg-slate-800/50">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`flex-1 px-6 py-4 font-medium text-sm transition-all flex items-center justify-center gap-2 relative ${
                    activeTab === tab.id
                      ? "text-teal-400 bg-slate-700/50"
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Required Fields Warning */}
            {Object.keys(errors).length > 0 && (
              <div className="m-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-300 mb-2">Please fix the following errors:</p>
                  <ul className="text-sm text-red-400 space-y-1">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>• {message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  {/* Question Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Question Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.questionType === "mcq"
                            ? "border-teal-500 bg-teal-500/10"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="questionType"
                          value="mcq"
                          checked={formData.questionType === "mcq"}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.questionType === "mcq" ? "bg-teal-500" : "bg-slate-600"
                            }`}
                          >
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-200">Multiple Choice</div>
                            <div className="text-xs text-slate-400">MCQ with 4 options</div>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.questionType === "numerical"
                            ? "border-teal-500 bg-teal-500/10"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="questionType"
                          value="numerical"
                          checked={formData.questionType === "numerical"}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.questionType === "numerical" ? "bg-teal-500" : "bg-slate-600"
                            }`}
                          >
                            <Calculator className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-200">Numerical</div>
                            <div className="text-xs text-slate-400">Integer/Decimal answer</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Question Text <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="questionText"
                      value={formData.questionText}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full bg-slate-700/50 border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none ${
                        errors.questionText ? "border-red-500" : "border-slate-600"
                      }`}
                      placeholder="Enter your question here..."
                    />
                    {errors.questionText && <p className="text-sm text-red-400">{errors.questionText}</p>}
                  </div>

                  {/* Question Image Upload */}
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

                  {/* Numerical Answer */}
                  {formData.questionType === "numerical" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Correct Numerical Answer <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="numericalAnswer"
                        type="number"
                        step="any"
                        value={formData.numericalAnswer}
                        onChange={handleChange}
                        className={`w-full bg-slate-700/50 border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${
                          errors.numericalAnswer ? "border-red-500" : "border-slate-600"
                        }`}
                        placeholder="Enter the correct numerical answer"
                      />
                      {errors.numericalAnswer && <p className="text-sm text-red-400">{errors.numericalAnswer}</p>}
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Explanation (optional)</label>
                    <textarea
                      name="explanation"
                      value={formData.explanation}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                      placeholder="Provide a detailed explanation for the answer..."
                    />
                  </div>

                  {/* Explanation Image */}
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

              {/* Options Tab */}
              {activeTab === "options" && formData.questionType === "mcq" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-slate-200">Answer Options</h3>
                    {formData.options.length < 6 && (
                      <Button
                        type="button"
                        onClick={addOption}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  {errors.options && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-sm text-red-400">{errors.options}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {formData.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="bg-slate-700/30 border border-slate-600 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="correctAnswer"
                              value={optionIndex}
                              checked={formData.correctAnswer === optionIndex}
                              onChange={() => setFormData((prev) => ({ ...prev, correctAnswer: optionIndex }))}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <label className="text-sm font-medium text-slate-300">
                              Option {String.fromCharCode(65 + optionIndex)}
                              {formData.correctAnswer === optionIndex && (
                                <span className="ml-2 text-green-400 text-xs flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Correct Answer
                                </span>
                              )}
                            </label>
                          </div>
                          {formData.options.length > 2 && (
                            <Button
                              type="button"
                              onClick={() => removeOption(optionIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <textarea
                          name={`options.${optionIndex}.text`}
                          value={option.text}
                          onChange={handleChange}
                          rows={2}
                          className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none mb-3"
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

              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      >
                        <option value="Physics">⚛️ Physics</option>
                        <option value="Chemistry">🧪 Chemistry</option>
                        <option value="Mathematics">📐 Mathematics</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Chapter <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="chapter"
                        value={formData.chapter}
                        onChange={handleChange}
                        className={`w-full bg-slate-700/50 border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${
                          errors.chapter ? "border-red-500" : "border-slate-600"
                        }`}
                        placeholder="Enter chapter name"
                      />
                      {errors.chapter && <p className="text-sm text-red-400">{errors.chapter}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Difficulty</label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      >
                        <option value="Easy">🟢 Easy</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Hard">🔴 Hard</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Positive Marks</label>
                        <input
                          name="marks.positive"
                          type="number"
                          value={formData.marks.positive}
                          onChange={handleChange}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Negative Marks</label>
                        <input
                          name="marks.negative"
                          type="number"
                          value={formData.marks.negative}
                          onChange={handleChange}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-slate-700 bg-slate-800/50 px-6 py-4">
            <div className="flex justify-between">
              <div>
                {activeTab !== "basic" && (
                  <Button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1].id)
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={onCancel} variant="outline" disabled={uploading}>
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
                    className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white flex items-center gap-2"
                    disabled={uploading}
                  >
                    <Save className="h-4 w-4" />
                    {uploading ? "Saving..." : index !== undefined ? "Update Question" : "Add Question"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
