"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function QuestionUploadForm({ testId }) {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError("")
    } else {
      setFile(null)
      setError("Please select a valid PDF file")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a PDF file")
      return
    }

    setLoading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("pdf", file)

      const token = localStorage.getItem("token")

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch(`/api/admin/tests/${testId}/questions/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Redirect to test details page after success
        setTimeout(() => {
          router.push(`/admin/tests/${testId}`)
        }, 2000)
      } else {
        setError(data.error || "Failed to upload questions")
      }
    } catch (err) {
      setError("An error occurred while uploading the file")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleManualEntry = () => {
    router.push(`/admin/tests/${testId}/questions/manual`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Test Questions</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Questions uploaded successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-2">
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-gray-600">
                {file ? file.name : "Drag and drop your PDF file here or click to browse"}
              </div>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Select PDF File
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {loading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
              <p className="text-sm text-gray-600 mt-1 text-center">{progress}% - Processing PDF...</p>
            </div>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleManualEntry}>
              Manual Question Entry
            </Button>

            <Button type="submit" disabled={!file || loading}>
              {loading ? "Uploading..." : "Upload Questions"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
