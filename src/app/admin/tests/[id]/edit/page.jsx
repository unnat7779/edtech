"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function EditTestPage({ params }) {
  const router = useRouter()
  const [test, setTest] = useState(null)
  const [testId, setTestId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "full-syllabus",
    subject: "Physics",
    chapter: "",
    class: "11",
    duration: 180,
    totalMarks: 300,
    instructions: [],
  })

  useEffect(() => {
    const resolvedParams = Promise.resolve(params)
    resolvedParams.then((p) => {
      setTestId(p.id)
      fetchTestDetails(p.id)
    })
  }, [params])

  const fetchTestDetails = async (id) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (response.ok) {
        setTest(data.test)
        setFormData({
          title: data.test.title,
          description: data.test.description,
          type: data.test.type,
          subject: data.test.subject,
          chapter: data.test.chapter || "",
          class: data.test.class,
          duration: data.test.duration,
          totalMarks: data.test.totalMarks,
          instructions: data.test.instructions || [],
        })
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Failed to fetch test details")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...formData.instructions]
    updatedInstructions[index] = value
    setFormData((prev) => ({ ...prev, instructions: updatedInstructions }))
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
    setFormData((prev) => ({ ...prev, instructions: updatedInstructions }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/admin/tests/${testId}`)
        }, 2000)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Failed to update test")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Test</h1>
          <p className="mt-2 text-gray-600">Update test details and settings</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            Test updated successfully! Redirecting...
          </div>
        )}

        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input label="Test Title" name="title" value={formData.title} onChange={handleChange} required />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Test Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-syllabus">Full Syllabus</option>
                    <option value="chapter-wise">Chapter Wise</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="All">All Subjects</option>
                  </select>
                </div>

                {formData.type === "chapter-wise" && (
                  <Input label="Chapter" name="chapter" value={formData.chapter} onChange={handleChange} />
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Class</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                    <option value="Dropper">Dropper</option>
                  </select>
                </div>

                <Input
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Total Marks"
                  name="totalMarks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Instructions</label>
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Instruction ${index + 1}`}
                    />
                    <Button type="button" onClick={() => removeInstruction(index)} variant="destructive" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addInstruction} variant="outline">
                  Add Instruction
                </Button>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" onClick={() => router.push(`/admin/tests/${testId}`)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
