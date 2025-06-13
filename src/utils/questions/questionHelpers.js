import { Atom, Beaker, Calculator, BookOpen } from "lucide-react"

export function groupQuestionsBySubject(questions) {
  return questions.reduce((acc, question, index) => {
    const subject = question.subject || "Other"
    if (!acc[subject]) {
      acc[subject] = []
    }
    acc[subject].push({ ...question, originalIndex: index })
    return acc
  }, {})
}

export function getSubjectIcon(subject) {
  const subjectIcons = {
    Physics: Atom,
    Chemistry: Beaker,
    Mathematics: Calculator,
    Other: BookOpen,
  }
  return subjectIcons[subject] || BookOpen
}

export function getSubjectColors(subject) {
  const subjectColors = {
    Physics: {
      bgColor: "bg-blue-50 border-blue-200",
      textColor: "text-blue-800",
    },
    Chemistry: {
      bgColor: "bg-green-50 border-green-200",
      textColor: "text-green-800",
    },
    Mathematics: {
      bgColor: "bg-purple-50 border-purple-200",
      textColor: "text-purple-800",
    },
    Other: {
      bgColor: "bg-gray-50 border-gray-200",
      textColor: "text-gray-800",
    },
  }
  return subjectColors[subject] || subjectColors.Other
}

export function calculateQuestionStats(questions) {
  const totalQuestions = questions.length
  const mcqCount = questions.filter((q) => q.questionType === "mcq" || !q.questionType).length
  const numericalCount = questions.filter((q) => q.questionType === "numerical").length
  const totalMarks = questions.reduce((acc, q) => acc + (q.marks?.positive || 4), 0)

  const difficultyBreakdown = questions.reduce((acc, q) => {
    const difficulty = q.difficulty || "Medium"
    acc[difficulty] = (acc[difficulty] || 0) + 1
    return acc
  }, {})

  return {
    totalQuestions,
    mcqCount,
    numericalCount,
    totalMarks,
    difficultyBreakdown,
  }
}
