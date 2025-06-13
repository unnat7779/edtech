"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  BookOpen,
  Target,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Settings,
  Clock,
  Award,
  Check,
  X,
} from "lucide-react"

export default function TestCreationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "full-syllabus",
    subject: "Physics",
    chapter: "",
    class: "11",
    duration: 180,
    totalMarks: 300,
    instructions: [
      "Attempt all questions",
      "Each question carries 4 marks",
      "Negative marking: -1 for incorrect answers",
    ],
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [buttonState, setButtonState] = useState("idle") // 'idle', 'loading', 'success'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...formData.instructions]
    updatedInstructions[index] = value
    setFormData((prev) => ({
      ...prev,
      instructions: updatedInstructions,
    }))
  }

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }))
  }

  const removeInstruction = (index) => {
    const updatedInstructions = [...formData.instructions]
    updatedInstructions.splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      instructions: updatedInstructions,
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.type) newErrors.type = "Test type is required"
    if (!formData.subject) newErrors.subject = "Subject is required"
    if (formData.type === "chapter-wise" && !formData.chapter.trim()) {
      newErrors.chapter = "Chapter is required for chapter-wise tests"
    }
    if (!formData.class) newErrors.class = "Class is required"
    if (!formData.duration) newErrors.duration = "Duration is required"
    if (!formData.totalMarks) newErrors.totalMarks = "Total marks is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    // Start button animation sequence
    setButtonState("loading")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          isActive: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success animation sequence
        setButtonState("success")
        setSuccess(true)

        // Reset form
        setFormData({
          title: "",
          description: "",
          type: "full-syllabus",
          subject: "Physics",
          chapter: "",
          class: "11",
          duration: 180,
          totalMarks: 300,
          instructions: [
            "Attempt all questions",
            "Each question carries 4 marks",
            "Negative marking: -1 for incorrect answers",
          ],
        })

        // Redirect after success animation
        setTimeout(() => {
          router.push(`/admin/tests/${data.test._id}/questions`)
        }, 1500)
      } else {
        setErrors({ submit: data.error })
        setButtonState("idle")
      }
    } catch (error) {
      setErrors({ submit: "Test creation failed. Please try again." })
      setButtonState("idle")
    } finally {
      setLoading(false)
    }
  }

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <div className="flex items-center justify-center">
            {/* Morphing spinner */}
            <div className="relative">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 border-2 border-transparent border-t-teal-300 rounded-full animate-spin animation-delay-200"></div>
            </div>
            <span className="ml-2 sm:ml-3 animate-pulse text-sm sm:text-base">Creating Test...</span>
          </div>
        )
      case "success":
        return (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="ml-2 sm:ml-3 text-sm sm:text-base">Test Created!</span>
          </div>
        )
      default:
        return (
          <>
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 transition-transform group-hover:rotate-12" />
            <span className="text-sm sm:text-base">Create Test</span>
          </>
        )
    }
  }

  const getButtonClasses = () => {
    const baseClasses =
      "relative overflow-hidden w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-500 ease-out transform flex items-center justify-center min-w-0 sm:min-w-[200px] group touch-manipulation"

    switch (buttonState) {
      case "loading":
        return `${baseClasses} bg-gradient-to-r from-teal-600 to-blue-600 text-white scale-105 shadow-2xl cursor-not-allowed`
      case "success":
        return `${baseClasses} bg-gradient-to-r from-green-600 to-emerald-600 text-white scale-110 shadow-2xl shadow-green-500/25`
      default:
        return `${baseClasses} bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl hover:shadow-teal-500/25 active:scale-95`
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header with Icon */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Create New Test
          </h1>
         
        </div>

        {/* Main Form Container */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Test Configuration Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">Test Configuration</h2>
            <p className="text-teal-100 text-sm sm:text-base">Configure your test settings and details</p>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 text-green-300 rounded-lg flex items-center animate-slideInDown">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 animate-pulse flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  Test created successfully! Redirecting to question upload...
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Basic Information Section */}
              <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-700/30">
                <div className="flex items-center mb-4 sm:mb-6">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-200">Basic Information</h3>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Test Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="flex w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter a descriptive test title"
                    />
                    {errors.title && (
                      <p className="text-xs sm:text-sm text-red-400 animate-slideInDown">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="flex w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Provide a detailed description of the test"
                    />
                    {errors.description && (
                      <p className="text-xs sm:text-sm text-red-400 animate-slideInDown">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Configuration Section */}
              <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-700/30">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-200">Test Configuration</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Test Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="flex h-10 sm:h-12 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="full-syllabus">Full Syllabus</option>
                      <option value="chapter-wise">Chapter Wise</option>
                    </select>
                    {errors.type && (
                      <p className="text-xs sm:text-sm text-red-400 animate-slideInDown">{errors.type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="flex h-10 sm:h-12 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="All">All Subjects</option>
                    </select>
                    {errors.subject && (
                      <p className="text-xs sm:text-sm text-red-400 animate-slideInDown">{errors.subject}</p>
                    )}
                  </div>

                  {formData.type === "chapter-wise" && (
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Chapter</label>
                      <input
                        type="text"
                        name="chapter"
                        value={formData.chapter}
                        onChange={handleChange}
                        className="flex w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter chapter name"
                      />
                      {errors.chapter && (
                        <p className="text-xs sm:text-sm text-red-400 animate-slideInDown">{errors.chapter}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Class</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      className="flex h-10 sm:h-12 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                      <option value="Dropper">Dropper</option>
                    </select>
                    {errors.class && (
                      <p className="text-xs sm:text-sm text-red-400 animate-slideInDown">{errors.class}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="flex w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Test duration"
                    />
                    {errors.duration && (
                      <p className="text-xs sm:text-sm text-red-400 animate-slideInDown">{errors.duration}</p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Total Marks
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      className="flex w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Total marks"
                    />
                    {errors.totalMarks && (
                      <p className="text-xs sm:text-sm text-red-400 animate-slideInDown">{errors.totalMarks}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Instructions Section */}
              <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-700/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-200">Test Instructions</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="flex items-center justify-center px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base touch-manipulation"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Add Instruction
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {formData.instructions.map((instruction, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 animate-slideInDown"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value)}
                          className="flex w-full rounded-lg border border-slate-600 bg-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder={`Instruction ${index + 1}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="flex items-center justify-center px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm touch-manipulation sm:px-4"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <div className="p-3 sm:p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 text-red-300 rounded-lg flex items-start animate-shake">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">{errors.submit}</span>
                </div>
              )}

              {/* Animated Submit Button */}
              <div className="flex justify-center sm:justify-end pt-4 sm:pt-6 border-t border-slate-700">
                <button type="submit" disabled={buttonState !== "idle"} className={getButtonClasses()}>
                  {/* Background pulse effect for loading */}
                  {buttonState === "loading" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 opacity-30 animate-pulse"></div>
                  )}

                  {/* Success ripple effect */}
                  {buttonState === "success" && (
                    <div className="absolute inset-0 bg-green-400 opacity-20 animate-ping"></div>
                  )}

                  {/* Button content */}
                  <div className="relative z-10">{getButtonContent()}</div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
