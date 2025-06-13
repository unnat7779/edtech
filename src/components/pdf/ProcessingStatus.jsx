"use client"

import { CheckCircle, Clock, FileText, ImageIcon, Brain, Zap, AlertCircle } from "lucide-react"

export default function ProcessingStatus({ status, processing }) {
  const stages = [
    { key: "uploading", label: "Uploading", icon: Clock },
    { key: "parsing", label: "Parsing PDF", icon: FileText },
    { key: "extracting", label: "Extracting Text", icon: FileText },
    { key: "rendering", label: "Rendering Pages", icon: ImageIcon },
    { key: "ocr", label: "OCR Processing", icon: Brain },
    { key: "analyzing", label: "Analyzing Content", icon: Zap },
    { key: "complete", label: "Complete", icon: CheckCircle },
  ]

  const getStageIndex = (stage) => {
    return stages.findIndex((s) => s.key === stage)
  }

  const currentStageIndex = getStageIndex(status.stage)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Processing Status</h3>
          <span className="text-sm text-gray-500">{Math.round(status.progress)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              status.stage === "complete" ? "bg-green-500" : processing ? "bg-blue-500" : "bg-gray-400"
            }`}
            style={{ width: `${status.progress}%` }}
          />
        </div>

        {/* Current Status Message */}
        <div className="flex items-center space-x-2">
          {processing ? (
            <Clock className="h-4 w-4 text-blue-500 animate-spin" />
          ) : status.stage === "complete" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-700">{status.message}</span>
        </div>

        {/* Stage Indicators */}
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isActive = index === currentStageIndex
            const isCompleted = index < currentStageIndex
            const isUpcoming = index > currentStageIndex

            return (
              <div
                key={stage.key}
                className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 border border-blue-200" : isCompleted ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive ? "bg-blue-500" : isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-white" : "text-gray-500"
                      } ${isActive && processing ? "animate-pulse" : ""}`}
                    />
                  )}
                </div>

                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {stage.label}
                </span>

                {isActive && processing && (
                  <div className="flex-1 flex justify-end">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Additional Info */}
        {status.stage !== "idle" && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <div>Stage: {status.stage}</div>
            <div>Progress: {status.progress.toFixed(1)}%</div>
            {status.estimatedTime && <div>Estimated time remaining: {status.estimatedTime}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
