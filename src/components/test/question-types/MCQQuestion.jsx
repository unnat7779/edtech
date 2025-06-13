"use client"

export default function MCQQuestion({ question, selectedAnswer, onAnswerChange, questionNumber }) {
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

      {/* Options */}
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedAnswer === index
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => onAnswerChange(index)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <input
                  type="radio"
                  name={`question-${questionNumber}`}
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => onAnswerChange(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)})</span>
                  <span className="text-gray-900">{option.text}</span>
                </div>
                {option.image && (
                  <div className="mt-2">
                    <img
                      src={option.image || "/placeholder.svg"}
                      alt={`Option ${String.fromCharCode(65 + index)}`}
                      className="max-w-xs h-auto rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
