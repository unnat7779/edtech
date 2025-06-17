"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { X, Upload, Send, Users, Crown, UserCheck, Globe } from "lucide-react"

export default function AnnouncementForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    description: "",
    targetAudience: "all",
    priority: "medium",
    expiresAt: "",
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed")
      return
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }))

    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (imageId) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== imageId)
      // Clean up preview URLs
      const removed = prev.find((img) => img.id === imageId)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.message.trim()) newErrors.message = "Message is required"
    if (formData.title.length > 100) newErrors.title = "Title must be less than 100 characters"
    if (formData.message.length > 500) newErrors.message = "Message must be less than 500 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const submitFormData = new FormData()

      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitFormData.append(key, formData[key])
        }
      })

      // Add images
      images.forEach((image) => {
        submitFormData.append("images", image.file)
      })

      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitFormData,
      })

      if (response.ok) {
        const data = await response.json()
        onSuccess?.(data.announcement)
        onClose()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to create announcement")
      }
    } catch (error) {
      console.error("Error creating announcement:", error)
      alert("Failed to create announcement")
    } finally {
      setLoading(false)
    }
  }

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case "all":
        return <Globe className="h-4 w-4" />
      case "registered":
        return <UserCheck className="h-4 w-4" />
      case "premium":
        return <Crown className="h-4 w-4" />
      case "non-premium":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-100">Create Announcement</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.title ? "border-red-500" : "border-slate-600"
                }`}
                placeholder="Enter announcement title..."
                maxLength={100}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              <p className="text-slate-500 text-xs mt-1">{formData.title.length}/100 characters</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none ${
                  errors.message ? "border-red-500" : "border-slate-600"
                }`}
                placeholder="Enter announcement message..."
                maxLength={500}
              />
              {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
              <p className="text-slate-500 text-xs mt-1">{formData.message.length}/500 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                placeholder="Additional details..."
                maxLength={1000}
              />
              <p className="text-slate-500 text-xs mt-1">{formData.description.length}/1000 characters</p>
            </div>

            {/* Target Audience & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Students</option>
                  <option value="registered">Registered Students</option>
                  <option value="premium">Premium Students</option>
                  <option value="non-premium">Non-Premium Students</option>
                </select>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  {getAudienceIcon(formData.targetAudience)}
                  <span>
                    {formData.targetAudience === "all" && "Visible to all users"}
                    {formData.targetAudience === "registered" && "Visible to registered users only"}
                    {formData.targetAudience === "premium" && "Visible to premium subscribers only"}
                    {formData.targetAudience === "non-premium" && "Visible to non-premium users only"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date (Optional)</label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-slate-500 text-xs mt-1">Leave empty for permanent announcement</p>
            </div>

            {/* Images */}
            {/* <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Images (Optional)</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={images.length >= 5}
                    />
                  </label>
                  <span className="text-xs text-slate-500">Max 5 images, 5MB each</span>
                </div>

               
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg border border-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div> */}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Announcement
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
