"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import {
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Bookmark,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  Award,
  Filter,
  BookmarkCheck,
  SlidersHorizontal,
} from "lucide-react"

export default function QuestionReview({ attemptData, testData, analyticsData }) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("Physics")
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set())
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (attemptData && testData) {
      processQuestions()
    }
  }, [attemptData, testData])

  useEffect(() => {
    loadBookmarkedQuestions()
  }, [])

  const loadBookmarkedQuestions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/bookmarks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const bookmarkedIds = new Set(data.bookmarks.map((b) => b.questionId))
        setBookmarkedQuestions(bookmarkedIds)
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error)
    }
  }

  const processQuestions = () => {
    try {
      setLoading(true)

      if (!testData.questions || !Array.isArray(testData.questions)) {
        console.error("No questions found in test data")
        setQuestions([])
        setLoading(false)
        return
      }

      const processedQuestions = testData.questions.map((question, index) => {
        const studentAnswer = attemptData.answers?.[index]

        // Handle question text
        let questionText = ""
        if (typeof question.questionText === "string") {
          questionText = question.questionText
        } else if (typeof question.questionText === "object" && question.questionText?.text) {
          questionText = question.questionText.text
        } else if (question.question) {
          questionText = question.question
        } else {
          questionText = "Question text not available"
        }

        // Handle options for MCQ
        let options = []
        if (question.options && Array.isArray(question.options)) {
          options = question.options.map((option) => {
            if (typeof option === "string") return option
            if (typeof option === "object" && option.text) return option.text
            return String(option)
          })
        }

        // Determine question type
        const questionType = question.questionType || question.type || "mcq"

        // Handle user's answer - FIXED for numerical questions
        let userAnswer = "Not Attempted"
        if (studentAnswer) {
          if (questionType === "numerical" || questionType === "NUMERICAL") {
            // For numerical questions, check numericalAnswer first, then selectedAnswer
            if (studentAnswer.numericalAnswer !== null && studentAnswer.numericalAnswer !== undefined) {
              userAnswer = String(studentAnswer.numericalAnswer)
            } else if (studentAnswer.selectedAnswer !== null && studentAnswer.selectedAnswer !== undefined) {
              userAnswer = String(studentAnswer.selectedAnswer)
            }
          } else if (questionType === "mcq" || questionType === "MCQ") {
            // For MCQ questions
            if (studentAnswer.selectedAnswer !== null && studentAnswer.selectedAnswer !== undefined) {
              const answerIndex = Number.parseInt(studentAnswer.selectedAnswer)
              if (!isNaN(answerIndex) && answerIndex >= 0 && answerIndex < options.length) {
                userAnswer = `${String.fromCharCode(65 + answerIndex)}) ${options[answerIndex]}`
              } else {
                userAnswer = String(studentAnswer.selectedAnswer)
              }
            }
          }
        }

        // Handle correct answer - FIXED for numerical questions
        let correctAnswer = "Not Available"
        if (questionType === "numerical" || questionType === "NUMERICAL") {
          // For numerical questions, check numericalAnswer first, then correctAnswer
          if (question.numericalAnswer !== null && question.numericalAnswer !== undefined) {
            correctAnswer = String(question.numericalAnswer)
          } else if (question.correctAnswer !== null && question.correctAnswer !== undefined) {
            correctAnswer = String(question.correctAnswer)
          }
        } else if (questionType === "mcq" || questionType === "MCQ") {
          // For MCQ questions
          if (question.correctAnswer !== null && question.correctAnswer !== undefined && options.length > 0) {
            const correctIndex = Number.parseInt(question.correctAnswer)
            if (!isNaN(correctIndex) && correctIndex >= 0 && correctIndex < options.length) {
              correctAnswer = `${String.fromCharCode(65 + correctIndex)}) ${options[correctIndex]}`
            } else {
              correctAnswer = String(question.correctAnswer)
            }
          }
        }

        return {
          id: question._id || `q_${index}`,
          questionNo: index + 1,
          questionText,
          subject: question.subject || "Physics",
          chapter: question.chapter || "Unknown Chapter",
          difficulty: question.difficulty || "Medium",
          level: question.level || "JEE Main",
          topic: question.topic || "",
          timeSpent: studentAnswer?.timeSpent || studentAnswer?.timeTaken || 0,
          userAnswer,
          correctAnswer,
          isCorrect: studentAnswer?.isCorrect || false,
          isAttempted:
            (studentAnswer?.selectedAnswer !== null && studentAnswer?.selectedAnswer !== undefined) ||
            (studentAnswer?.numericalAnswer !== null && studentAnswer?.numericalAnswer !== undefined),
          explanation: question.explanation || "Explanation not available for this question.",
          solution: question.solution || question.detailedSolution || "Solution not available for this question.",
          tags: question.tags || [],
          questionType,
          options,
          marks: question.marks || { positive: 4, negative: -1 },
          marksAwarded: studentAnswer?.marksAwarded || 0,
        }
      })

      setQuestions(processedQuestions)
      console.log("Processed questions:", processedQuestions.length)
    } catch (error) {
      console.error("Error processing questions:", error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
        <span className="ml-3 text-slate-400">Loading questions...</span>
      </div>
    )
  }

  if (!attemptData || !testData || !analyticsData) {
    return <div className="text-center py-8 text-slate-400">No data available for question review.</div>
  }

  // Define the desired order for subjects
  const subjectOrder = ["Physics", "Chemistry", "Mathematics", "Maths"]
  const uniqueSubjects = [...new Set(questions.map((q) => q.subject))]
  const subjects = subjectOrder
    .filter((subject) => uniqueSubjects.includes(subject))
    .concat(uniqueSubjects.filter((subject) => !subjectOrder.includes(subject)))

  // Filter questions by selected subject first
  const subjectFilteredQuestions = questions.filter((question) => question.subject === selectedSubject)

  // Calculate filter counts based on selected subject
  const filters = [
    { value: "all", label: "All", count: subjectFilteredQuestions.length },
    { value: "correct", label: "Correct", count: subjectFilteredQuestions.filter((q) => q.isCorrect).length },
    {
      value: "incorrect",
      label: "Incorrect",
      count: subjectFilteredQuestions.filter((q) => !q.isCorrect && q.isAttempted).length,
    },
    {
      value: "unattempted",
      label: "Unattempted",
      count: subjectFilteredQuestions.filter((q) => !q.isAttempted).length,
    },
    {
      value: "bookmarked",
      label: "Bookmarked",
      count: subjectFilteredQuestions.filter((q) => bookmarkedQuestions.has(q.id)).length,
    },
  ]

  // Apply additional filters
  const filteredQuestions = subjectFilteredQuestions.filter((question) => {
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "correct" && question.isCorrect) ||
      (selectedFilter === "incorrect" && !question.isCorrect && question.isAttempted) ||
      (selectedFilter === "unattempted" && !question.isAttempted) ||
      (selectedFilter === "bookmarked" && bookmarkedQuestions.has(question.id))

    const matchesSearch =
      searchTerm === "" ||
      question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.topic.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const toggleBookmark = async (questionId) => {
    try {
      setBookmarkLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const isBookmarked = bookmarkedQuestions.has(questionId)
      const method = isBookmarked ? "DELETE" : "POST"

      const response = await fetch("/api/bookmarks", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId,
          testId: testData._id,
          attemptId: attemptData._id,
        }),
      })

      if (response.ok) {
        const newBookmarks = new Set(bookmarkedQuestions)
        if (isBookmarked) {
          newBookmarks.delete(questionId)
        } else {
          newBookmarks.add(questionId)
        }
        setBookmarkedQuestions(newBookmarks)
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
    } finally {
      setBookmarkLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-900/50 text-green-400 border-green-700/50"
      case "medium":
        return "bg-yellow-900/50 text-yellow-400 border-yellow-700/50"
      case "hard":
        return "bg-red-900/50 text-red-400 border-red-700/50"
      default:
        return "bg-slate-900/50 text-slate-400 border-slate-700/50"
    }
  }

  const getSubjectColor = (subject) => {
    switch (subject?.toLowerCase()) {
      case "physics":
        return "bg-blue-900/50 text-blue-400"
      case "chemistry":
        return "bg-green-900/50 text-green-400"
      case "mathematics":
      case "maths":
        return "bg-purple-900/50 text-purple-400"
      default:
        return "bg-slate-900/50 text-slate-400"
    }
  }

  const getStatusIcon = (question) => {
    if (!question.isAttempted) {
      return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
    return question.isCorrect ? (
      <CheckCircle className="h-5 w-5 text-green-400" />
    ) : (
      <XCircle className="h-5 w-5 text-red-400" />
    )
  }

  const getStatusColor = (question) => {
    if (!question.isAttempted) return "bg-gray-600"
    return question.isCorrect ? "bg-green-600" : "bg-red-600"
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="text-center mb-6 sm:mb-8 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Question Review
        </h2>
        <p className="text-sm sm:text-base text-slate-400">Detailed analysis with explanations and solutions</p>
      </div>

      {/* Mobile-First Filter Section */}
      <div className="px-4 sm:px-0">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4 sm:p-6">
            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-4 sm:hidden">
              <h3 className="text-lg font-semibold text-slate-200">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-slate-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? "Hide" : "Show"}
              </button>
            </div>

            {/* Filter Content */}
            <div className={`space-y-6 ${!showFilters ? "hidden sm:block" : ""}`}>
              {/* Subject Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Subject</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedSubject === subject
                          ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Filter by Status</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`px-3 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        selectedFilter === filter.value
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                      }`}
                    >
                      {filter.value === "bookmarked" && <BookmarkCheck className="h-3 w-3" />}
                      <span className="text-center">
                        {filter.label}
                        <br className="sm:hidden" />
                        <span className="text-xs">({filter.count})</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions, chapters, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {filteredQuestions.map((question, index) => (
          <Card
            key={question.id}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-md border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl"
          >
            <CardContent className="p-4 sm:p-6">
              {/* Mobile-Optimized Question Header */}
              <div className="space-y-4 mb-6">
                {/* Top Row - Question Number and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${getStatusColor(question)} text-white shadow-lg`}
                    >
                      {getStatusIcon(question)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 text-lg sm:text-xl">Q{question.questionNo}</span>
                      <div className="text-xs sm:text-sm text-slate-400">{question.questionType?.toUpperCase()}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(question.id)}
                    disabled={bookmarkLoading}
                    className={`p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                      bookmarkedQuestions.has(question.id)
                        ? "bg-yellow-600/20 text-yellow-400 shadow-lg"
                        : "bg-slate-700/50 text-slate-400 hover:text-yellow-400 hover:bg-yellow-600/10"
                    } ${bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}
                  >
                    {question.difficulty}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSubjectColor(question.subject)}`}>
                    {question.subject}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                    {question.level}
                  </span>
                </div>

                {/* Info Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="truncate">{question.chapter}</span>
                  </div>
                  {question.topic && (
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span className="truncate">{question.topic}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(question.timeSpent)}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        question.marksAwarded > 0
                          ? "text-green-400"
                          : question.marksAwarded < 0
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {question.marksAwarded > 0
                        ? `+${question.marksAwarded}`
                        : question.marksAwarded < 0
                          ? question.marksAwarded
                          : "0"}{" "}
                      marks
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                  <p className="text-slate-200 leading-relaxed text-sm sm:text-base">{question.questionText}</p>
                </div>

                {question.options && question.options.length > 0 && (
                  <div className="grid grid-cols-1 gap-3">
                    {question.options.map((option, idx) => (
                      <div key={idx} className="bg-slate-700/20 rounded-lg p-3 border border-slate-600/30">
                        <span className="font-medium text-slate-300 text-sm sm:text-base">
                          {String.fromCharCode(65 + idx)}) {option}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Answer Section - Mobile Optimized */}
              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 mb-6">
                <div className="bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-lg p-4 border border-slate-600/30">
                  <div className="text-sm text-slate-400 mb-2 font-medium">Your Answer</div>
                  <div
                    className={`font-semibold text-sm sm:text-base break-words ${
                      !question.isAttempted ? "text-gray-400" : question.isCorrect ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {question.userAnswer}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-700/30">
                  <div className="text-sm text-green-300 mb-2 font-medium">Correct Answer</div>
                  <div className="font-semibold text-green-400 text-sm sm:text-base break-words">
                    {question.correctAnswer}
                  </div>
                </div>
              </div>

              {/* Expand/Collapse Solution */}
              <div className="border-t border-slate-700/50 pt-4">
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                  className="flex items-center justify-between w-full text-left p-3 sm:p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-medium text-slate-200 flex items-center gap-2 text-sm sm:text-base">
                    <BookOpen className="h-4 w-4" />
                    View Solution & Explanation
                  </span>
                  {expandedQuestion === question.id ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {expandedQuestion === question.id && (
                  <div className="mt-4 space-y-4 animate-fadeIn">
                    <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-700/30">
                      <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Target className="h-4 w-4" />
                        Explanation
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{question.explanation}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-lg p-4 border border-purple-700/30">
                      <h4 className="font-semibold text-purple-300 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Award className="h-4 w-4" />
                        Step-by-Step Solution
                      </h4>
                      <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap font-mono text-xs sm:text-sm bg-slate-800/50 p-3 rounded overflow-x-auto">
                        {question.solution}
                      </pre>
                    </div>
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-teal-900/30 text-teal-400 text-xs rounded-full border border-teal-700/50"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="px-4 sm:px-0">
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <CardContent className="p-8 sm:p-12 text-center">
              <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-300 mb-2">No questions found</h3>
              <p className="text-slate-400">
                No {selectedFilter !== "all" ? selectedFilter : ""} questions found for {selectedSubject}.
                {searchTerm && " Try adjusting your search terms."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
