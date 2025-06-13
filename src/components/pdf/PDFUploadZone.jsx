"use client"

import { useCallback, useState } from "react"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"

export default function PDFUploadZone({ onFileSelect, selectedFile, disabled }) {
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState(null)

  const validateFile = useCallback((file) => {
    const errors = []

    // Check file type
    if (file.type !== "application/pdf") {
      errors.push("Only PDF files are supported")
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push("File size must be less than 50MB")
    }

    // Check file name
    if (file.name.length > 100) {
      errors.push("File name is too long")
    }

    return errors
  }, [])

  const handleFileSelect = useCallback(
    (file) => {
      const errors = validateFile(file)

      if (errors.length > 0) {
        setFileError(errors[0])
        return
      }

      setFileError(null)
      onFileSelect(file)
    },
    [validateFile, onFileSelect],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [disabled, handleFileSelect],
  )

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault()
      if (!disabled) {
        setDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e) => {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : selectedFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 bg-gray-50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400 hover:bg-blue-50"}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            {selectedFile ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  dragOver ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <Upload className={`h-8 w-8 ${dragOver ? "text-blue-600" : "text-gray-400"}`} />
              </div>
            )}
          </div>

          <div>
            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">{selectedFile.name}</span>
                </div>
                <div className="text-sm text-green-600">{formatFileSize(selectedFile.size)} • Ready to process</div>
              </div>
            ) : (
              <div>
                <div className="text-lg font-medium text-gray-900 mb-1">
                  {dragOver ? "Drop PDF file here" : "Upload PDF Document"}
                </div>
                <div className="text-sm text-gray-500">Drag and drop your PDF file here, or click to browse</div>
                <div className="text-xs text-gray-400 mt-2">Supports PDF files up to 50MB</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {fileError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{fileError}</span>
        </div>
      )}

      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="text-sm text-blue-800">
            <strong>File Details:</strong>
          </div>
          <div className="text-xs text-blue-600 mt-1 space-y-1">
            <div>Name: {selectedFile.name}</div>
            <div>Size: {formatFileSize(selectedFile.size)}</div>
            <div>Type: {selectedFile.type}</div>
            <div>Last Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  )
}
