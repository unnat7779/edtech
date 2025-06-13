"use client"

import Input from "@/components/ui/Input"

export default function NumericalQuestion({ question, selectedAnswer, onAnswerChange, questionNumber }) {
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Question {questionNumber}: {question.questionText}
        </h2>
        {question.questionImage && (
          <div className="mb-4">
            <img
              src={question.questionImage || "/placeholder.svg"}
              alt="Question"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}
      </div>

      {/* Answer Input */}
      <div className="max-w-md">
        <Input
          label="Your Answer"
          type="number"
          step="any"
          value={selectedAnswer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Enter your numerical answer"
          className="text-lg"
        />
        <p className="text-sm text-gray-500 mt-2">Enter your answer as a number. For example: 42, 3.14, -5, etc.</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter only the numerical value</li>
          <li>• Use decimal point (.) for decimal numbers</li>
          <li>• Use negative sign (-) for negative numbers</li>
          <li>• Do not include units or symbols</li>
        </ul>
      </div>
    </div>
  )
}
