"use client"
import QuestionPalette from "./QuestionPalette"

export default function TestSidebar({
  test,
  answers,
  currentQuestion,
  onQuestionNavigation,
  isNumericalQuestion,
  activeSubject,
  setActiveSubject,
}) {
  // Add safety checks
  if (!test || !test.questions) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-400">Loading test data...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <QuestionPalette
        test={test}
        answers={answers || {}}
        currentQuestion={currentQuestion}
        onQuestionNavigation={onQuestionNavigation}
        isNumericalQuestion={isNumericalQuestion}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
      />
    </div>
  )
}
