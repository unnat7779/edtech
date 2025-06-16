"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { AlertCircle, Bug, FileText, HelpCircle, Upload, X, CheckCircle, Loader, Home, History } from "lucide-react"

export default function FeedbackForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: "",
    subject: "",
    description: "",
    testName: "",
    testId: "",
  })
  const [images, setImages] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tests", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setTests(data.tests || [])
      }
    } catch (error) {
      console.error("Error fetching tests:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (error) setError("")
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const maxFiles = 5
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (images.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      return
    }

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB`)
        return false
      }
      if (!file.type.startsWith("image/")) {
        setError(`File ${file.name} is not an image`)
        return false
      }
      return true
    })

    setImages((prev) => [...prev, ...validFiles])
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!formData.type || !formData.subject || !formData.description) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      if (formData.type === "test-issue" && !formData.testName) {
        setError("Please select a test for test issues")
        setLoading(false)
        return
      }

      const token = localStorage.getItem("token")
      const submitFormData = new FormData()

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitFormData.append(key, formData[key])
        }
      })

      images.forEach((image) => {
        submitFormData.append("images", image)
      })

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitFormData,
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          router.push("/feedback-history")
        }, 3000)
      } else {
        setError(data.error || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("Feedback submission error:", error)
      setError("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const feedbackTypes = [
    {
      id: "bug",
      label: "Bug/Error Report",
      icon: Bug,
      description: "Report technical issues or errors",
      color: "text-red-400",
      bgColor: "bg-red-900/20",
      borderColor: "border-red-800",
    },
    {
      id: "test-issue",
      label: "Test Issue",
      icon: FileText,
      description: "Report problems with specific tests",
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-800",
    },
    {
      id: "query",
      label: "General Query",
      icon: HelpCircle,
      description: "Ask questions or get help",
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
      borderColor: "border-blue-800",
    },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center p-4">
        <Card variant="primary" className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Feedback Submitted!</h2>
            <p className="text-slate-400 mb-4">
              Thank you for your feedback. We'll review it and get back to you soon.
            </p>
            <p className="text-sm text-slate-500">Redirecting to feedback history...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Submit Feedback
            </h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                onClick={() => router.push("/feedback-history")}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                History
              </Button>
            </div>
          </div>
          <p className="text-slate-400">Help us improve by reporting issues or asking questions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type Selection */}
          <Card variant="primary">
            <CardHeader>
              <CardTitle>Select Feedback Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: type.id }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.type === type.id
                          ? `${type.borderColor} ${type.bgColor}`
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`h-5 w-5 ${formData.type === type.id ? type.color : "text-slate-400"}`} />
                        <span className={`font-medium ${formData.type === type.id ? type.color : "text-slate-300"}`}>
                          {type.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{type.description}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          {formData.type && (
            <Card variant="secondary">
              <CardHeader>
                <CardTitle>Feedback Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test Selection for Test Issues */}
                {formData.type === "test-issue" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Select Test <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="testName"
                      value={formData.testName}
                      onChange={(e) => {
                        const selectedTest = tests.find((test) => test.title === e.target.value)
                        setFormData((prev) => ({
                          ...prev,
                          testName: e.target.value,
                          testId: selectedTest?._id || "",
                        }))
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-teal-500 focus:outline-none"
                      required
                    >
                      <option value="">Select a test...</option>
                      {tests.map((test) => (
                        <option key={test._id} value={test.title}>
                          {test.title} - {test.subject}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={
                      formData.type === "bug"
                        ? "Brief description of the bug"
                        : formData.type === "test-issue"
                          ? "Issue with the test"
                          : "Your question or topic"
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-teal-500 focus:outline-none resize-vertical"
                    placeholder={
                      formData.type === "bug"
                        ? "Describe the bug in detail. Include steps to reproduce, expected behavior, and actual behavior."
                        : formData.type === "test-issue"
                          ? "Describe the issue with the test. Include question numbers if applicable."
                          : "Describe your question or provide more details about what you need help with."
                    }
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Screenshots/Images (Optional)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Upload Images</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <span className="text-xs text-slate-400">Max 5 images, 5MB each</span>
                    </div>

                    {/* Image Preview */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image) || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                            <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded truncate">
                              {image.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          {formData.type && (
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
