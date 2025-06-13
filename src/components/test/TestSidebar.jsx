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
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6">
        {/* Question Palette with Subject Tabs */}
        <QuestionPalette
          test={test}
          answers={answers}
          currentQuestion={currentQuestion}
          onQuestionNavigation={onQuestionNavigation}
          isNumericalQuestion={isNumericalQuestion}
          activeSubject={activeSubject}
          setActiveSubject={setActiveSubject}
        />
      </div>
    </div>
  )
}
