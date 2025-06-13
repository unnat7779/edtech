"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function ManualQuestionForm({ testId }) {
  const router = useRouter()
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    questionImage: "",
    options: [
      { text: "", image: "" },
      { text: "", image: "" },
      { text: "", image: "" },
      { text: "", image: "" },
    ],
    correctAnswer: 0,
    explanation: "",
    subject: "Physics",
    chapter: "",
    difficulty: "Medium",
    marks: {
      positive: 4,
      negative: -1,
    },
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchTestDetails()
  }, [testId])

  const fetchTestDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setTest(data.test)
        setCurrentQuestion((prev) => ({
          ...prev,
          subject: data.test.subject,
          chapter: data.test.chapter || "",
        }))
      } else {
        console.error("API Error:", data.error)
        setErrors({ fetch: data.error })
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setErrors({ fetch: "Failed to fetch test details" })
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionChange = (e) => {
    const { name, value } = e.target

    if (name.includes("options")) {
      const [_, index, field] = name.split(".")
      const updatedOptions = [...currentQuestion.options]
      updatedOptions[index] = {
        ...updatedOptions[index],
        [field]: value,
      }

      setCurrentQuestion((prev) => ({
        ...prev,
        options: updatedOptions,
      }))
    } else if (name.includes("marks")) {
      const [_, field] = name.split(".")
      setCurrentQuestion((prev) => ({
        ...prev,
        marks: {
          ...prev.marks,
          [field]: Number(value),
        },
      }))
    } else {
      setCurrentQuestion((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateQuestion = () => {
    const newErrors = {}

    if (!currentQuestion.questionText.trim()) {
      newErrors.questionText = "Question text is required"
    }

    let hasValidOption = false
    currentQuestion.options.forEach((option, index) => {
      if (option.text.trim()) {
        hasValidOption = true
      }
    })

    if (!hasValidOption) {
      newErrors.options = "At least one option must have text"
    }

    if (!currentQuestion.subject) {
      newErrors.subject = "Subject is required"
    }

    if (
      currentQuestion.correctAnswer === undefined ||
      currentQuestion.correctAnswer < 0 ||
      currentQuestion.correctAnswer > 3
    ) {
      newErrors.correctAnswer = "Please select a correct answer"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addQuestion = () => {
    if (!validateQuestion()) return

    // Create a clean question object
    const questionToAdd = {
      questionText: currentQuestion.questionText.trim(),
      questionImage: currentQuestion.questionImage.trim(),
      options: currentQuestion.options.map((option) => ({
        text: option.text.trim(),
        image: option.image.trim(),
      })),
      correctAnswer: Number.parseInt(currentQuestion.correctAnswer),
      explanation: currentQuestion.explanation.trim(),
      subject: currentQuestion.subject,
      chapter: currentQuestion.chapter.trim(),
      difficulty: currentQuestion.difficulty,
      marks: {
        positive: Number.parseInt(currentQuestion.marks.positive),
        negative: Number.parseInt(currentQuestion.marks.negative),
      },
    }

    setQuestions((prev) => [...prev, questionToAdd])

    // Reset form for next question
    setCurrentQuestion({
      questionText: "",
      questionImage: "",
      options: [
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
      ],
      correctAnswer: 0,
      explanation: "",
      subject: test?.subject || "Physics",
      chapter: test?.chapter || "",
      difficulty: "Medium",
      marks: {
        positive: 4,
        negative: -1,
      },
    })

    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const saveAllQuestions = async () => {
    if (questions.length === 0) {
      setErrors({ submit: "Add at least one question before saving" })
      return
    }

    setSaving(true)
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

      const data = await response.json()

      if (response.ok) {
        // Redirect to test details page
        router.push(`/admin/tests/${testId}`)
      } else {
        setErrors({ submit: data.error })
      }
    } catch (error) {
      setErrors({ submit: "Failed to save questions" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading test details...</div>
      </div>
    )
  }

  if (errors.fetch) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-red-600">{errors.fetch}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Questions to {test?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              Question added successfully! Add another question or save all questions.
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <div className="font-medium">Questions Added: {questions.length}</div>
            {questions.length > 0 && (
              <Button onClick={saveAllQuestions} disabled={saving} className="mt-2">
                {saving ? "Saving..." : "Save All Questions"}
              </Button>
            )}
            {errors.submit && <p className="text-sm text-red-600 mt-2">{errors.submit}</p>}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Question Text</label>
              <textarea
                name="questionText"
                value={currentQuestion.questionText}
                onChange={handleQuestionChange}
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter question text"
              />
              {errors.questionText && <p className="text-sm text-red-600">{errors.questionText}</p>}
            </div>

            <Input
              label="Question Image URL (optional)"
              name="questionImage"
              value={currentQuestion.questionImage}
              onChange={handleQuestionChange}
              placeholder="Enter image URL if any"
            />

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Options</label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="space-y-2 p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={index}
                      checked={currentQuestion.correctAnswer === index}
                      onChange={() => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: index }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Option {String.fromCharCode(65 + index)} (select for correct answer)
                    </label>
                  </div>

                  <textarea
                    name={`options.${index}.text`}
                    value={option.text}
                    onChange={handleQuestionChange}
                    rows={2}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter option ${String.fromCharCode(65 + index)} text`}
                  />

                  <Input
                    label="Option Image URL (optional)"
                    name={`options.${index}.image`}
                    value={option.image}
                    onChange={handleQuestionChange}
                    placeholder="Enter image URL if any"
                  />
                </div>
              ))}
              {errors.options && <p className="text-sm text-red-600">{errors.options}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Explanation (optional)</label>
              <textarea
                name="explanation"
                value={currentQuestion.explanation}
                onChange={handleQuestionChange}
                rows={2}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter explanation for the correct answer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <select
                  name="subject"
                  value={currentQuestion.subject}
                  onChange={handleQuestionChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
                {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
              </div>

              <Input
                label="Chapter"
                name="chapter"
                value={currentQuestion.chapter}
                onChange={handleQuestionChange}
                placeholder="Enter chapter name"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  name="difficulty"
                  value={currentQuestion.difficulty}
                  onChange={handleQuestionChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <Input
                label="Positive Marks"
                name="marks.positive"
                type="number"
                value={currentQuestion.marks.positive}
                onChange={handleQuestionChange}
                placeholder="Enter positive marks"
              />

              <Input
                label="Negative Marks"
                name="marks.negative"
                type="number"
                value={currentQuestion.marks.negative}
                onChange={handleQuestionChange}
                placeholder="Enter negative marks"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={addQuestion}>Add Question</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
