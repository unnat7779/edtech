"use client"

import { useState } from "react"
import { processImageUploads, cleanupFileObjects } from "@/utils/imageUploadUtils"

export function useQuestionManagement(testId) {
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)

  const fetchTestDetails = async (id) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (response.ok) {
        setTest(data.test)
        setQuestions(data.test.questions || [])
      }
    } catch (error) {
      console.error("Failed to fetch test details")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuestion = async (questionData, index) => {
    try {
      setUploading(true)

      let processedQuestionData
      try {
        // Process any pending image uploads
        processedQuestionData = await processImageUploads(
          questionData,
          testId,
          index !== undefined ? index : questions.length,
        )
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError)
        // If image upload fails, clean up file objects and proceed with text-only question
        processedQuestionData = cleanupFileObjects(questionData)
        alert(`Warning: Image upload failed (${uploadError.message}). Question will be saved without images.`)
      }

      const token = localStorage.getItem("token")
      const updatedQuestions = [...questions]

      if (index !== undefined) {
        updatedQuestions[index] = processedQuestionData
      } else {
        updatedQuestions.push(processedQuestionData)
      }

      const response = await fetch(`/api/admin/tests/${testId}/questions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions: updatedQuestions }),
      })

      if (response.ok) {
        setQuestions(updatedQuestions)
        setEditingQuestion(null)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        alert("Question saved successfully!")
      } else {
        const errorData = await response.json()
        alert(`Failed to save question: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error saving question:", error)
      alert(`Failed to save question: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleEditQuestion = (index) => {
    setEditingQuestion(index)
  }

  const handleDeleteQuestion = async (index) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      const token = localStorage.getItem("token")
      const updatedQuestions = questions.filter((_, i) => i !== index)

      const response = await fetch(`/api/admin/tests/${testId}/questions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions: updatedQuestions }),
      })

      if (response.ok) {
        setQuestions(updatedQuestions)
      }
    } catch (error) {
      alert("Failed to delete question")
    }
  }

  const handleFinalizeTest = async () => {
    if (questions.length === 0) {
      alert("Please add at least one question before finalizing the test.")
      return
    }

    if (confirm("Are you sure you want to finalize this test? You can still edit it later from the admin dashboard.")) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/admin/tests/${testId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: true,
            status: "published",
          }),
        })

        if (response.ok) {
          alert("Test has been finalized and published successfully!")
          window.location.href = "/admin"
        } else {
          alert("Failed to finalize test. Please try again.")
        }
      } catch (error) {
        alert("An error occurred while finalizing the test.")
      }
    }
  }

  return {
    test,
    questions,
    loading,
    uploading,
    success,
    editingQuestion,
    fetchTestDetails,
    handleSaveQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleFinalizeTest,
    setEditingQuestion,
  }
}
