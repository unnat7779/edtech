"use client"

import { useState } from "react"
import { X, Star, MessageSquare, Clock, Target, Award, BookOpen } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

export default function TestRatingModal({ isOpen, onClose, testData, onSubmit, isMandatory = false }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [categories, setCategories] = useState({
    questionQuality: 0,
    difficulty: 0,
    timeAllocation: 0,
    overallExperience: 0,
  })
  const [feedback, setFeedback] = useState({
    difficulty: "",
    quality: "",
    comments: "",
  })
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleCategoryRating = (category, value) => {
    setCategories((prev) => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async () => {
    if (rating === 0 || Object.values(categories).some((val) => val === 0)) {
      alert("Please provide ratings for all categories")
      return
    }

    console.log("🌟 Submitting rating...")
    console.log("📊 Test data:", testData)
    console.log("📊 Rating data:", { rating, categories, feedback, isAnonymous })

    setSubmitting(true)
    try {
      await onSubmit({
        rating,
        categories,
        feedback,
        isAnonymous,
      })
    } catch (error) {
      console.error("❌ Failed to submit rating:", error)
      alert("Failed to submit rating. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isMandatory) {
      const confirmSkip = confirm(
        "Rating is required to continue. Are you sure you want to skip? You can rate later from the dashboard.",
      )
      if (!confirmSkip) return
    }
    console.log("❌ Rating cancelled")
    onClose()
  }

  const categoryLabels = {
    questionQuality: { label: "Question Quality", icon: BookOpen, color: "text-blue-400" },
    difficulty: { label: "Difficulty Level", icon: Target, color: "text-yellow-400" },
    timeAllocation: { label: "Time Allocation", icon: Clock, color: "text-green-400" },
    overallExperience: { label: "Overall Experience", icon: Award, color: "text-purple-400" },
  }

  const difficultyOptions = ["Too Easy", "Easy", "Just Right", "Hard", "Too Hard"]
  const qualityOptions = ["Poor", "Fair", "Good", "Very Good", "Excellent"]

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800/95 backdrop-blur-md border-slate-700">
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Rate Your Test Experience
                {isMandatory && <span className="text-red-400 ml-2">*Required</span>}
              </h2>
              <p className="text-slate-400 mt-1">{testData?.title || "Test"}</p>
            </div>
            {!isMandatory && (
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-400 hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-8">
          {/* Overall Rating */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Overall Rating <span className="text-red-400">*</span>
            </h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-current"
                        : "text-slate-600 hover:text-slate-500"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              {rating > 0 && (
                <span>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </p>
          </div>

          {/* Category Ratings */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-200">
              Detailed Feedback <span className="text-red-400">*</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categoryLabels).map(([key, { label, icon: Icon, color }]) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${color}`} />
                    <span className="text-sm font-medium text-slate-300">
                      {label} <span className="text-red-400">*</span>
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleCategoryRating(key, star)}
                        className="transition-all duration-200 hover:scale-110"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= categories[key]
                              ? "text-yellow-400 fill-current"
                              : "text-slate-600 hover:text-slate-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Difficulty Level</label>
              <select
                value={feedback.difficulty}
                onChange={(e) => setFeedback((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select difficulty</option>
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Question Quality</label>
              <select
                value={feedback.quality}
                onChange={(e) => setFeedback((prev) => ({ ...prev, quality: e.target.value }))}
                className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select quality</option>
                {qualityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Additional Comments (Optional)
            </label>
            <textarea
              value={feedback.comments}
              onChange={(e) => setFeedback((prev) => ({ ...prev, comments: e.target.value }))}
              placeholder="Share your thoughts about the test..."
              rows={4}
              maxLength={500}
              className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
            <p className="text-xs text-slate-500">{feedback.comments.length}/500 characters</p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-teal-600 bg-slate-800 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
            />
            <label htmlFor="anonymous" className="text-sm text-slate-300">
              Submit anonymously
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            {!isMandatory && (
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={submitting}
              >
                Skip for Now
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0 || Object.values(categories).some((val) => val === 0)}
              className={`${
                isMandatory ? "w-full" : "flex-1"
              } bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>

          {isMandatory && (
            <div className="text-center">
              <button
                onClick={handleCancel}
                className="text-sm text-slate-400 hover:text-slate-300 underline"
                disabled={submitting}
              >
                Skip (you can rate later)
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
