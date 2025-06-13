"use client"

import { useState, useCallback } from "react"
import {
  Edit3,
  Save,
  X,
  FileText,
  ImageIcon,
  Calculator,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Maximize2,
} from "lucide-react"
import Button from "@/components/ui/Button"

export default function ContentPreview({ content, processing, onContentEdit }) {
  const [activeTab, setActiveTab] = useState("questions")
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editedContent, setEditedContent] = useState("")
  const [previewMode, setPreviewMode] = useState("grid") // 'grid' or 'list'

  const handleEditQuestion = useCallback(
    (questionIndex) => {
      const question = content.questions[questionIndex]
      setEditingQuestion(questionIndex)
      setEditedContent(JSON.stringify(question, null, 2))
    },
    [content],
  )

  const handleSaveEdit = useCallback(() => {
    try {
      const updatedQuestion = JSON.parse(editedContent)
      const updatedQuestions = [...content.questions]
      updatedQuestions[editingQuestion] = updatedQuestion

      onContentEdit({
        ...content,
        questions: updatedQuestions,
      })

      setEditingQuestion(null)
      setEditedContent("")
    } catch (error) {
      alert("Invalid JSON format. Please check your edits.")
    }
  }, [editedContent, editingQuestion, content, onContentEdit])

  const handleCancelEdit = useCallback(() => {
    setEditingQuestion(null)
    setEditedContent("")
  }, [])

  if (processing) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing PDF</h3>
          <p className="text-gray-600">Extracting and analyzing content...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h3>
          <p className="text-gray-600">Upload and process a PDF to see extracted content here.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: "questions", label: "Questions", icon: BookOpen, count: content.questions?.length || 0 },
    { key: "text", label: "Extracted Text", icon: FileText, count: content.text?.length || 0 },
    { key: "formulas", label: "Formulas", icon: Calculator, count: content.formulas?.length || 0 },
    { key: "images", label: "Images", icon: Image, count: content.images?.length || 0 },
  ]

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Extracted Content</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Confidence: {Math.round(content.confidence || 0)}%</span>
            <div
              className={`w-3 h-3 rounded-full ${
                (content.confidence || 0) > 80
                  ? "bg-green-500"
                  : (content.confidence || 0) > 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "questions" && (
          <div className="space-y-4">
            {content.questions && content.questions.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{content.questions.length} Questions Extracted</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPreviewMode("grid")}
                      className={`p-2 rounded ${previewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                    >
                      <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                      </div>
                    </button>
                    <button
                      onClick={() => setPreviewMode("list")}
                      className={`p-2 rounded ${previewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                    >
                      <div className="w-4 h-4 flex flex-col space-y-1">
                        <div className="bg-current h-0.5 rounded"></div>
                        <div className="bg-current h-0.5 rounded"></div>
                        <div className="bg-current h-0.5 rounded"></div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className={previewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
                  {content.questions.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                      {editingQuestion === index ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Editing Question {index + 1}</span>
                            <div className="flex space-x-2">
                              <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                          <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Edit question JSON..."
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">Question {index + 1}</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  question.questionType === "mcq"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {question.questionType === "mcq" ? "MCQ" : "Numerical"}
                              </span>
                              {question.correctAnswer !== null || question.numericalAnswer !== null ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <Button onClick={() => handleEditQuestion(index)} size="sm" variant="outline">
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>

                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-2">{question.questionText}</p>

                            {question.questionType === "mcq" && question.options && (
                              <div className="space-y-1 ml-4">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`flex items-start space-x-2 ${
                                      question.correctAnswer === optIndex ? "text-green-700 font-medium" : ""
                                    }`}
                                  >
                                    <span className="font-mono text-xs mt-0.5">
                                      {String.fromCharCode(65 + optIndex)})
                                    </span>
                                    <span>{option.text}</span>
                                    {question.correctAnswer === optIndex && (
                                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.questionType === "numerical" && question.numericalAnswer !== null && (
                              <div className="ml-4 text-green-700 font-medium">Answer: {question.numericalAnswer}</div>
                            )}

                            {question.explanation && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                <strong>Explanation:</strong> {question.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No questions extracted from the PDF</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "text" && (
          <div className="space-y-4">
            {content.text && content.text.length > 0 ? (
              content.text.map((page, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Page {page.pageNumber}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {page.sources?.ocrConfidence && <span>OCR: {Math.round(page.sources.ocrConfidence)}%</span>}
                      <span>{page.text.length} chars</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
                    {page.text || "No text extracted from this page"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No text content extracted</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "formulas" && (
          <div className="space-y-4">
            {content.formulas && content.formulas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.formulas.map((formula, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Formula {index + 1}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          formula.type === "latex-inline"
                            ? "bg-blue-100 text-blue-800"
                            : formula.type === "equation"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {formula.type}
                      </span>
                    </div>
                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">{formula.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No mathematical formulas detected</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "images" && (
          <div className="space-y-4">
            {content.images && content.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.images.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">Page {image.pageNumber}</span>
                      <Button size="sm" variant="outline">
                        <Maximize2 className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                    {image.dataUrl && !image.hasError ? (
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img
                          src={image.dataUrl || "/placeholder.svg"}
                          alt={`Page ${image.pageNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-center">
                          <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">{image.error || "Failed to render page"}</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {image.width} × {image.height}px
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No images extracted</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
