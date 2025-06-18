"use client"

import { BookOpen, Target, Clock, TrendingUp, Award, CheckCircle, XCircle, MinusCircle } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function SubjectAnalysis({ attemptData, testData, analyticsData }) {
  if (!analyticsData?.subjectWise || analyticsData.subjectWise.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Subject Analysis
          </h2>
          <p className="text-slate-400 text-lg">No subject-wise data available</p>
        </div>
      </div>
    )
  }

  const subjectData = analyticsData.subjectWise

  // EXACT SAME LOGIC AS TIME MANAGEMENT TAB - START
  // Enhanced format time helper
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0s"
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  // Get ACTUAL time tracking data with proper validation
  const getActualTimeTrackingData = () => {
    console.log("=== GETTING ACTUAL TIME TRACKING DATA FOR SUBJECT ANALYSIS ===")
    console.log("Attempt data:", attemptData)
    console.log("Time tracking:", attemptData.timeTracking)
    console.log("Question time tracking:", attemptData.questionTimeTracking)
    console.log("Subject time tracking:", attemptData.subjectTimeTracking)

    // Use actual time tracking data from the test session
    const questionTimeTracking = attemptData.questionTimeTracking || {}
    const subjectTimeTracking = attemptData.subjectTimeTracking || {}

    // Get the actual total time spent from the attempt
    const actualTotalTimeSpent = attemptData.timeSpent || 0

    console.log("Actual total time spent:", actualTotalTimeSpent)
    console.log("Question time tracking keys:", Object.keys(questionTimeTracking))
    console.log("Subject time tracking keys:", Object.keys(subjectTimeTracking))

    // Create question-wise time data using ACTUAL tracking data
    const questionTimeData = []
    let calculatedTotalTime = 0

    if (testData.questions) {
      testData.questions.forEach((question, index) => {
        const answer = attemptData.answers?.[index]
        let subject = "Mathematics" // default

        // Determine subject
        if (question.subject) {
          const subjectLower = question.subject.toLowerCase()
          if (subjectLower.includes("phys")) subject = "Physics"
          else if (subjectLower.includes("chem")) subject = "Chemistry"
          else if (subjectLower.includes("math")) subject = "Mathematics"
        }

        // Get ACTUAL time spent on this question from tracking data
        let timeSpent = 0
        if (questionTimeTracking[index]?.totalTime) {
          timeSpent = questionTimeTracking[index].totalTime
          console.log(`Question ${index + 1}: Using tracked time ${timeSpent}s`)
        } else if (answer?.timeTaken) {
          timeSpent = answer.timeTaken
          console.log(`Question ${index + 1}: Using answer time ${timeSpent}s`)
        } else {
          // Only assign time if the question was actually visited/answered
          const wasVisited =
            answer?.selectedAnswer !== undefined || answer?.numericalAnswer !== undefined || answer?.markedForReview

          if (wasVisited) {
            // Distribute remaining time proportionally among visited questions
            timeSpent = 0 // Will be calculated later
          } else {
            timeSpent = 0 // No time for unvisited questions
          }
          console.log(
            `Question ${index + 1}: Question ${wasVisited ? "was visited" : "not visited"}, time: ${timeSpent}s`,
          )
        }

        calculatedTotalTime += timeSpent

        questionTimeData.push({
          questionIndex: index,
          questionNo: index + 1,
          subject,
          timeSpent,
          isAnswered: answer?.selectedAnswer !== undefined || answer?.numericalAnswer !== undefined,
          isCorrect: answer?.isCorrect || false,
          isMarked: answer?.markedForReview || false,
          wasVisited:
            answer?.selectedAnswer !== undefined ||
            answer?.numericalAnswer !== undefined ||
            answer?.markedForReview ||
            false,
        })
      })
    }

    // If we have actual total time but calculated time doesn't match, distribute the difference
    if (actualTotalTimeSpent > 0 && calculatedTotalTime !== actualTotalTimeSpent) {
      const visitedQuestions = questionTimeData.filter((q) => q.wasVisited)
      const unaccountedTime = actualTotalTimeSpent - calculatedTotalTime

      if (visitedQuestions.length > 0 && unaccountedTime > 0) {
        const timePerVisitedQuestion = Math.floor(unaccountedTime / visitedQuestions.length)
        const remainder = unaccountedTime % visitedQuestions.length

        questionTimeData.forEach((q, index) => {
          if (q.wasVisited && q.timeSpent === 0) {
            q.timeSpent = timePerVisitedQuestion + (index < remainder ? 1 : 0)
          }
        })

        calculatedTotalTime = actualTotalTimeSpent
      }
    }

    // Use actual total time
    const finalTotalTime = actualTotalTimeSpent

    console.log("Final total time:", finalTotalTime)
    console.log("Calculated total time:", calculatedTotalTime)
    console.log("Question time data:", questionTimeData)

    return {
      questionTimeData,
      totalTimeSpent: finalTotalTime,
      subjectTimeTracking,
      questionTimeTracking,
    }
  }

  const { questionTimeData, totalTimeSpent, subjectTimeTracking, questionTimeTracking } = getActualTimeTrackingData()

  // Calculate subject-wise time data using ACTUAL tracking data - ONLY for visited subjects
  const calculateSubjectTimeData = () => {
    const subjects = ["Physics", "Chemistry", "Mathematics"]

    return subjects
      .map((subject) => {
        const subjectQuestions = questionTimeData.filter((q) => q.subject === subject)
        const visitedSubjectQuestions = subjectQuestions.filter((q) => q.wasVisited)

        // Only calculate time if subject was actually visited
        let totalTime = 0
        if (visitedSubjectQuestions.length > 0) {
          if (subjectTimeTracking[subject]?.totalTime) {
            totalTime = subjectTimeTracking[subject].totalTime
            console.log(`${subject}: Using tracked subject time ${totalTime}s`)
          } else {
            // Sum question times for this subject (only visited questions)
            totalTime = visitedSubjectQuestions.reduce((sum, q) => sum + q.timeSpent, 0)
            console.log(`${subject}: Using calculated time from visited questions ${totalTime}s`)
          }
        }

        const avgTime = visitedSubjectQuestions.length > 0 ? Math.round(totalTime / visitedSubjectQuestions.length) : 0
        const correctAnswers = visitedSubjectQuestions.filter((q) => q.isAnswered && q.isCorrect).length
        const totalAnswered = visitedSubjectQuestions.filter((q) => q.isAnswered).length
        const efficiency = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0

        return {
          subject,
          timeSpent: totalTime,
          timeInMinutes: Math.round(totalTime / 60),
          questions: subjectQuestions.length,
          visitedQuestions: visitedSubjectQuestions.length,
          avgTimePerQuestion: avgTime,
          efficiency,
          correctAnswers,
          totalAnswered,
          wasVisited: visitedSubjectQuestions.length > 0,
        }
      })
      .filter((subject) => subject.wasVisited) // Only show subjects that were actually visited
  }

  const subjectTimeData = calculateSubjectTimeData()
  // EXACT SAME LOGIC AS TIME MANAGEMENT TAB - END

  // Create enhanced subject data by merging performance data with time data
  const enhancedSubjectData = subjectData.map((subject) => {
    const timeInfo = subjectTimeData.find((timeSubject) => timeSubject.subject === subject.subject) || {
      timeSpent: 0,
      avgTimePerQuestion: 0,
    }

    return {
      ...subject,
      timeSpent: timeInfo.timeSpent,
      averageTimePerQuestion: timeInfo.avgTimePerQuestion,
    }
  })

  console.log("=== SUBJECT ANALYSIS TIME DATA ===")
  console.log("Subject time data:", subjectTimeData)
  console.log("Enhanced subject data:", enhancedSubjectData)

  const getSubjectConfig = (subject) => {
    const configs = {
      Physics: {
        primary: "text-blue-400",
        bg: "from-blue-500/20 to-cyan-500/20",
        border: "border-blue-500/30",
        icon: "bg-blue-500/20",
        accent: "from-blue-500 to-cyan-500",
      },
      Chemistry: {
        primary: "text-green-400",
        bg: "from-green-500/20 to-emerald-500/20",
        border: "border-green-500/30",
        icon: "bg-green-500/20",
        accent: "from-green-500 to-emerald-500",
      },
      Mathematics: {
        primary: "text-purple-400",
        bg: "from-purple-500/20 to-pink-500/20",
        border: "border-purple-500/30",
        icon: "bg-purple-500/20",
        accent: "from-purple-500 to-pink-500",
      },
      Math: {
        primary: "text-purple-400",
        bg: "from-purple-500/20 to-pink-500/20",
        border: "border-purple-500/30",
        icon: "bg-purple-500/20",
        accent: "from-purple-500 to-pink-500",
      },
    }
    return (
      configs[subject] || {
        primary: "text-yellow-400",
        bg: "from-yellow-500/20 to-orange-500/20",
        border: "border-yellow-500/30",
        icon: "bg-yellow-500/20",
        accent: "from-yellow-500 to-orange-500",
      }
    )
  }

  const getPerformanceLevel = (accuracy) => {
    if (accuracy >= 80) return { level: "Excellent", color: "text-green-400", bgColor: "bg-green-500/20" }
    if (accuracy >= 60) return { level: "Good", color: "text-blue-400", bgColor: "bg-blue-500/20" }
    if (accuracy >= 40) return { level: "Average", color: "text-yellow-400", bgColor: "bg-yellow-500/20" }
    return { level: "Needs Improvement", color: "text-red-400", bgColor: "bg-red-500/20" }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-3">
          Subject Analysis
        </h2>
        <p className="text-slate-400 text-lg">Detailed breakdown of your performance across different subjects</p>
      </div>

      {/* Time Verification Debug */}
      {/* <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 mb-6">
        <h3 className="text-slate-300 font-semibold mb-2">Time Data Verification:</h3>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Total Test Time: {formatTime(totalTimeSpent)}</div>
          <div>Subject Time Data:</div>
          {subjectTimeData.map((subject, index) => (
            <div key={index} className="ml-4">
              <strong className="text-slate-300">{subject.subject}:</strong> Time: {formatTime(subject.timeSpent)}, Avg
              per Q: {formatTime(subject.avgTimePerQuestion)}, Visited: {subject.visitedQuestions}/{subject.questions}
            </div>
          ))}
        </div>
      </div> */}

      {/* Subject Cards - Enhanced Design with ACTUAL TIME DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {enhancedSubjectData.map((subject, index) => {
          const config = getSubjectConfig(subject.subject)
          const performance = getPerformanceLevel(subject.accuracy)

          return (
            <Card
              key={index}
              className={`relative overflow-hidden bg-gradient-to-br ${config.bg} backdrop-blur-xl border-2 ${config.border} hover:scale-105 hover:shadow-2xl transition-all duration-500 group`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 to-slate-800/85"></div>

              <CardHeader className="relative pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl ${config.icon} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <BookOpen className={`h-6 w-6 ${config.primary}`} />
                    </div>
                    <div>
                      <h3 className="text-slate-200 text-xl font-bold">{subject.subject}</h3>
                      <div
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${performance.bgColor} ${performance.color} mt-1`}
                      >
                        {performance.level}
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative space-y-6">
                {/* Score Overview */}
                <div className="text-center bg-slate-800/40 rounded-2xl p-6 border border-slate-700/30">
                  <div className={`text-4xl font-bold ${config.primary} mb-2`}>
                    {subject.obtainedMarks || 0}/{subject.totalMarks || 0}
                  </div>
                  <div className="text-slate-400 text-sm font-medium">{subject.percentage || 0}% Score</div>
                </div>

                {/* Accuracy Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Accuracy</span>
                   <span className={`${config.primary} font-bold`}>
  {(subject.accuracy ? subject.accuracy.toFixed(2) : "0.00") + "%"}
</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${config.accent} h-3 rounded-full transition-all duration-1000 ease-out shadow-lg`}
                      style={{ width: `${subject.accuracy || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 group-hover:bg-slate-800/60 transition-colors duration-300">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-400">{subject.correct || 0}</div>
                    <div className="text-xs text-slate-400 font-medium">Correct</div>
                  </div>
                  <div className="text-center bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 group-hover:bg-slate-800/60 transition-colors duration-300">
                    <div className="flex items-center justify-center mb-2">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-red-400">{subject.incorrect || 0}</div>
                    <div className="text-xs text-slate-400 font-medium">Incorrect</div>
                  </div>
                  <div className="text-center bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 group-hover:bg-slate-800/60 transition-colors duration-300">
                    <div className="flex items-center justify-center mb-2">
                      <MinusCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">{subject.unattempted || 0}</div>
                    <div className="text-xs text-slate-400 font-medium">Skipped</div>
                  </div>
                </div>

                {/* Time Analysis - NOW WITH ACTUAL DATA */}
                {/* <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-300 font-semibold">Time Analysis</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Time Spent</span>
                    <span className="text-slate-300 font-bold">{formatTime(subject.timeSpent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Avg per question</span>
                    <span className="text-slate-300 font-bold">{formatTime(subject.averageTimePerQuestion)}</span>
                  </div>
                </div> */}

                {/* Recommendations */}
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">
                    Recommendation
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed">
                    {subject.accuracy >= 80
                      ? "🎉 Excellent work! Maintain this level."
                      : subject.accuracy >= 60
                        ? "👍 Good performance. Practice more complex problems."
                        : subject.accuracy >= 40
                          ? "📚 Focus on concept clarity and practice."
                          : "⚠️ Requires significant improvement. Review fundamentals."}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Overall Subject Comparison - WITH ACTUAL TIME DATA */}
      {/* <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-slate-200 flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-teal-500/20">
              <Target className="h-6 w-6 text-teal-400" />
            </div>
            Subject Comparison
          </CardTitle> */}
        {/* </CardHeader> */}
        {/* <CardContent>
          <div className="space-y-4">
            {enhancedSubjectData.map((subject, index) => {
              const config = getSubjectConfig(subject.subject)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-6 bg-slate-800/40 rounded-2xl border border-slate-700/30 hover:bg-slate-800/60 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${config.accent}`}></div>
                    <span className="text-slate-300 font-semibold text-lg">{subject.subject}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${config.primary}`}>{(subject.accuracy ? subject.accuracy.toFixed(2) : "0.00") + "%"}%</div>
                      <div className="text-xs text-slate-400 font-medium">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-300">{subject.obtainedMarks || 0}</div>
                      <div className="text-xs text-slate-400 font-medium">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-300">{formatTime(subject.timeSpent)}</div>
                      <div className="text-xs text-slate-400 font-medium">Time</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent> */}
      {/* </Card> */}

      {/* Strengths and Weaknesses */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-green-900/30 to-slate-900/60 backdrop-blur-xl border-green-700/40 shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-green-400 flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Award className="h-6 w-6" />
              </div>
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedSubjectData
                .filter((subject) => subject.accuracy >= 60)
                .sort((a, b) => b.accuracy - a.accuracy)
                .slice(0, 3)
                .map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-green-900/20 rounded-xl border border-green-700/30"
                  >
                    <span className="text-slate-300 font-medium">{subject.subject}</span>
                    <span className="text-green-400 font-bold">{subject.accuracy}% accuracy</span>
                  </div>
                ))}
              {enhancedSubjectData.filter((subject) => subject.accuracy >= 60).length === 0 && (
                <div className="text-slate-400 text-center py-8">
                  Focus on improving performance across all subjects
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/30 to-slate-900/60 backdrop-blur-xl border-red-700/40 shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-red-400 flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedSubjectData
                .filter((subject) => subject.accuracy < 60)
                .sort((a, b) => a.accuracy - b.accuracy)
                .slice(0, 3)
                .map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-red-900/20 rounded-xl border border-red-700/30"
                  >
                    <span className="text-slate-300 font-medium">{subject.subject}</span>
                    <span className="text-red-400 font-bold">{subject.accuracy}% accuracy</span>
                  </div>
                ))}
              {enhancedSubjectData.filter((subject) => subject.accuracy < 60).length === 0 && (
                <div className="text-slate-400 text-center py-8">Great! All subjects are performing well</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
