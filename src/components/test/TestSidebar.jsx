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
  console.log("🔍 TestSidebar - Props received:", {
    activeSubject,
    setActiveSubject: typeof setActiveSubject,
    hasTest: !!test,
    currentQuestion,
  })

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
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
  )
}
