"use client"
import Breadcrumb from "@/components/ui/Breadcrumb"
import { Home } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function TestPreviewPage({ params }) {
  const router = useRouter()
  const [test, setTest] = useState(null)
  const [testId, setTestId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const optionFileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const explanationFileInputRef = useRef(null)

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
      } else {
        setError(data.error || "Failed to fetch test details")
      }
    } catch (error) {
      setError("Failed to fetch test details")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAllQuestions = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testId}/questions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions: test.questions }),
      })

      if (response.ok) {
        setSuccess("All questions saved successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save questions")
      }
    } catch (error) {
      setError("Failed to save questions")
    } finally {
      setSaving(false)
    }
  }

  const handleEditQuestion = (index) => {
    setEditingQuestion({
      index,
      ...test.questions[index],
      tags: test.questions[index].tags ? test.questions[index].tags.join(", ") : "",
    })
  }

  const handleDeleteQuestion = (index) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const updatedTest = { ...test }
      updatedTest.questions.splice(index, 1)
      setTest(updatedTest)
      setSuccess("Question deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleQuestionChange = (e) => {
    const { name, value } = e.target

    if (name.includes("options")) {
      const [_, optIndex, field] = name.split(".")
      const updatedOptions = [...editingQuestion.options]
      updatedOptions[optIndex] = { ...updatedOptions[optIndex], [field]: value }
      setEditingQuestion((prev) => ({ ...prev, options: updatedOptions }))
    } else if (name.includes("marks")) {
      const [_, field] = name.split(".")
      setEditingQuestion((prev) => ({
        ...prev,
        marks: { ...prev.marks, [field]: Number(value) },
      }))
    } else if (name === "tags") {
      setEditingQuestion((prev) => ({ ...prev, [name]: value }))
    } else {
      setEditingQuestion((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = async (e, type, optionIndex = null) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("image", file)
    formData.append("testId", testId)
    formData.append("questionIndex", editingQuestion.index.toString())
    formData.append("type", type) // 'question', 'option', or 'explanation'
    if (optionIndex !== null) {
      formData.append("optionIndex", optionIndex.toString())
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        if (type === "question") {
          setEditingQuestion((prev) => ({ ...prev, questionImage: data.imageUrl }))
        } else if (type === "option" && optionIndex !== null) {
          const updatedOptions = [...editingQuestion.options]
          updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], image: data.imageUrl }
          setEditingQuestion((prev) => ({ ...prev, options: updatedOptions }))
        } else if (type === "explanation") {
          setEditingQuestion((prev) => ({ ...prev, explanationImage: data.imageUrl }))
        }
        setSuccess("Image uploaded successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || "Failed to upload image")
      }
    } catch (error) {
      setError("An error occurred while uploading the image")
    }
  }

  const handleSaveQuestion = () => {
    // Process tags from comma-separated string to array
    const processedQuestion = {
      ...editingQuestion,
      tags: editingQuestion.tags
        ? editingQuestion.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    }

    // Remove index property which was added for editing
    const { index, ...questionData } = processedQuestion

    // Update the question in the test
    const updatedTest = { ...test }
    updatedTest.questions[index] = questionData
    setTest(updatedTest)
    setEditingQuestion(null)
    setSuccess("Question updated successfully!")
    setTimeout(() => setSuccess(""), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading test preview...</div>
      </div>
    )
  }

  if (error && !test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <Button onClick={() => router.push(`/admin/tests/${testId}`)} variant="outline">
            Back to Test
          </Button>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Test not found</div>
      </div>
    )
  }

  const stats = {
    totalQuestions: test.questions?.length || 0,
    mcqCount: test.questions?.filter((q) => q.questionType === "mcq").length || 0,
    numericalCount: test.questions?.filter((q) => q.questionType === "numerical").length || 0,
    totalMarks: test.questions?.reduce((acc, q) => acc + (q.marks?.positive || 4), 0) || 0,
    subjects: [...new Set(test.questions?.map((q) => q.subject) || [])],
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "Home", path: "/", icon: Home },
            { label: "Admin Dashboard", path: "/admin" },
            { label: "Test Management", path: "/admin/tests" },
            { label: "Test Details", path: `/admin/tests/${testId}` },
            { label: "Preview Test" },
          ]}
        />
      </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Preview & Edit</h1>
            <p className="mt-2 text-gray-600">{test.title}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => router.push(`/admin/tests/${testId}`)} variant="outline">
              Back to Test
            </Button>
            <Button onClick={() => router.push(`/admin/tests/${testId}/questions/upload`)} variant="outline">
              Upload More Questions
            </Button>
            <Button onClick={handleSaveAllQuestions} disabled={saving}>
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md border border-green-200">{success}</div>
        )}

        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md border border-red-200">{error}</div>}

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">Preview & Edit Mode</h3>
          <p className="text-blue-700 text-sm">
            Review and edit all questions before publishing. Click "Edit Question" on any question to modify its
            content, options, tags, explanation, and upload images. Click "Save All Changes" when you're done.
          </p>
        </div>

        {/* Test Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.mcqCount}</div>
                <div className="text-sm text-gray-600">MCQ Questions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.numericalCount}</div>
                <div className="text-sm text-gray-600">Numerical Questions</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.totalMarks}</div>
                <div className="text-sm text-gray-600">Total Marks</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Subjects:</div>
              <div className="flex flex-wrap gap-2">
                {stats.subjects.map((subject) => (
                  <span key={subject} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-6">
          {test.questions && test.questions.length > 0 ? (
            test.questions.map((question, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {question.questionType === "mcq" ? "MCQ" : "Numerical"}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{question.subject}</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {question.difficulty}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          +{question.marks?.positive || 4} / {question.marks?.negative || -1}
                        </span>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Button onClick={() => handleEditQuestion(index)} size="sm" variant="outline">
                        Edit Question
                      </Button>
                      <Button onClick={() => handleDeleteQuestion(index)} size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <div className="font-medium text-gray-700 mb-2">Question:</div>
                      <p className="text-gray-900">{question.questionText}</p>
                      {question.questionImage && (
                        <img
                          src={question.questionImage || "/placeholder.svg"}
                          alt="Question"
                          className="mt-2 max-w-md rounded border"
                        />
                      )}
                    </div>

                    {/* Options for MCQ */}
                    {question.questionType === "mcq" && question.options && (
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Options:</div>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded border ${
                                question.correctAnswer === optIndex
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{String.fromCharCode(65 + optIndex)})</span>
                                <span>{option.text}</span>
                                {question.correctAnswer === optIndex && (
                                  <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                                )}
                              </div>
                              {option.image && (
                                <img
                                  src={option.image || "/placeholder.svg"}
                                  alt={`Option ${String.fromCharCode(65 + optIndex)}`}
                                  className="mt-2 max-w-xs rounded border"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Numerical Answer */}
                    {question.questionType === "numerical" && (
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Correct Answer:</div>
                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                          <span className="text-green-800 font-medium">{question.numericalAnswer}</span>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Explanation:</div>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                          {question.explanation}
                        </p>
                        {question.explanationImage && (
                          <img
                            src={question.explanationImage || "/placeholder.svg"}
                            alt="Explanation"
                            className="mt-2 max-w-md rounded border"
                          />
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Tags:</div>
                        <div className="flex flex-wrap gap-1">
                          {question.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500 mb-4">No questions found in this test.</div>
                <Button onClick={() => router.push(`/admin/tests/${testId}/questions/upload`)}>Upload Questions</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Question Modal */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Edit Question {editingQuestion.index + 1}</h2>
                  <Button onClick={() => setEditingQuestion(null)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Question Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Question Type</label>
                    <select
                      name="questionType"
                      value={editingQuestion.questionType}
                      onChange={handleQuestionChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="numerical">Numerical/Integer Type</option>
                    </select>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Question Text *</label>
                    <textarea
                      name="questionText"
                      value={editingQuestion.questionText}
                      onChange={handleQuestionChange}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter question text..."
                      required
                    />
                  </div>

                  {/* Question Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Question Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {editingQuestion.questionImage ? (
                        <div className="space-y-2">
                          <img
                            src={editingQuestion.questionImage || "/placeholder.svg"}
                            alt="Question"
                            className="max-w-xs rounded border"
                          />
                          <Button
                            onClick={() => setEditingQuestion((prev) => ({ ...prev, questionImage: "" }))}
                            size="sm"
                            variant="outline"
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "question")}
                            className="hidden"
                            id="question-image"
                            ref={fileInputRef}
                          />
                          <label htmlFor="question-image" className="cursor-pointer">
                            <div className="text-gray-500">Click to upload question image or drag and drop</div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options for MCQ */}
                  {editingQuestion.questionType === "mcq" && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      {editingQuestion.options.map((option, optIndex) => (
                        <div key={optIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{String.fromCharCode(65 + optIndex)})</span>
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={editingQuestion.correctAnswer === optIndex}
                              onChange={() => setEditingQuestion((prev) => ({ ...prev, correctAnswer: optIndex }))}
                              className="text-blue-600"
                            />
                            <label className="text-sm text-gray-600">Correct Answer</label>
                          </div>
                          <textarea
                            name={`options.${optIndex}.text`}
                            value={option.text}
                            onChange={handleQuestionChange}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)} text`}
                          />

                          {/* Option Image Upload */}
                          <div className="mt-2">
                            {option.image ? (
                              <div className="space-y-2">
                                <img
                                  src={option.image || "/placeholder.svg"}
                                  alt={`Option ${String.fromCharCode(65 + optIndex)}`}
                                  className="max-w-xs rounded border"
                                />
                                <Button
                                  onClick={() => {
                                    const updatedOptions = [...editingQuestion.options]
                                    updatedOptions[optIndex] = { ...updatedOptions[optIndex], image: "" }
                                    setEditingQuestion((prev) => ({ ...prev, options: updatedOptions }))
                                  }}
                                  size="sm"
                                  variant="outline"
                                >
                                  Remove Image
                                </Button>
                              </div>
                            ) : (
                              <div className="border border-dashed border-gray-200 rounded p-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, "option", optIndex)}
                                  className="hidden"
                                  id={`option-image-${optIndex}`}
                                  ref={optionFileInputRefs[optIndex]}
                                />
                                <label htmlFor={`option-image-${optIndex}`} className="cursor-pointer">
                                  <div className="text-gray-400 text-sm text-center">
                                    Upload image for option {String.fromCharCode(65 + optIndex)}
                                  </div>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Numerical Answer */}
                  {editingQuestion.questionType === "numerical" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Correct Answer *</label>
                      <input
                        type="number"
                        step="any"
                        name="numericalAnswer"
                        value={editingQuestion.numericalAnswer || ""}
                        onChange={handleQuestionChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter numerical answer..."
                        required
                      />
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Explanation</label>
                    <textarea
                      name="explanation"
                      value={editingQuestion.explanation}
                      onChange={handleQuestionChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Provide an explanation for the correct answer..."
                    />
                  </div>

                  {/* Explanation Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Explanation Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {editingQuestion.explanationImage ? (
                        <div className="space-y-2">
                          <img
                            src={editingQuestion.explanationImage || "/placeholder.svg"}
                            alt="Explanation"
                            className="max-w-xs rounded border"
                          />
                          <Button
                            onClick={() => setEditingQuestion((prev) => ({ ...prev, explanationImage: "" }))}
                            size="sm"
                            variant="outline"
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "explanation")}
                            className="hidden"
                            id="explanation-image"
                            ref={explanationFileInputRef}
                          />
                          <label htmlFor="explanation-image" className="cursor-pointer">
                            <div className="text-gray-500">Click to upload explanation image or drag and drop</div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject, Chapter, Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Subject *</label>
                      <select
                        name="subject"
                        value={editingQuestion.subject}
                        onChange={handleQuestionChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Chapter</label>
                      <input
                        type="text"
                        name="chapter"
                        value={editingQuestion.chapter || ""}
                        onChange={handleQuestionChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter chapter name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Difficulty *</label>
                      <select
                        name="difficulty"
                        value={editingQuestion.difficulty}
                        onChange={handleQuestionChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Marks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Positive Marks *</label>
                      <input
                        type="number"
                        name="marks.positive"
                        value={editingQuestion.marks?.positive || 4}
                        onChange={handleQuestionChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Negative Marks *</label>
                      <input
                        type="number"
                        name="marks.negative"
                        value={editingQuestion.marks?.negative || -1}
                        onChange={handleQuestionChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={editingQuestion.tags}
                      onChange={handleQuestionChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="physics, mechanics, kinematics..."
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button onClick={() => setEditingQuestion(null)} variant="outline">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveQuestion}>Save Changes</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
