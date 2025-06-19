"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react"

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"]

export default function QuestionAnalyticsPanel({ testData, analyticsData, filters }) {
  const [questionStats, setQuestionStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (analyticsData && analyticsData.questionAnalytics) {
      setQuestionStats(analyticsData.questionAnalytics)
      setLoading(false)
    }
  }, [analyticsData, filters])

  if (loading || !questionStats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  const totalQuestions = testData?.questions?.length || 0
  const averageCorrectRate =
    questionStats.length > 0 ? questionStats.reduce((sum, q) => sum + q.accuracy, 0) / questionStats.length : 0
  const hardestQuestion = questionStats.reduce(
    (min, q) => (q.accuracy < min.accuracy ? q : min),
    questionStats[0] || {},
  )
  const easiestQuestion = questionStats.reduce(
    (max, q) => (q.accuracy > max.accuracy ? q : max),
    questionStats[0] || {},
  )
  const averageTime =
    questionStats.length > 0 ? questionStats.reduce((sum, q) => sum + q.averageTime, 0) / questionStats.length : 0
  // Get most difficult and easiest questions
  const mostDifficult = questionStats
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((q, index) => ({
      questionId: q.questionIndex,
      text: q.questionText || `Question ${q.questionIndex}`,
      correctRate: q.accuracy,
      attempts: q.totalAttempts,
    }))

  const easiest = questionStats
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3)
    .map((q, index) => ({
      questionId: q.questionIndex,
      text: q.questionText || `Question ${q.questionIndex}`,
      correctRate: q.accuracy,
      attempts: q.totalAttempts,
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
          Question Analytics
        </h2>
        <div className="text-sm text-slate-400">{totalQuestions} Total Questions</div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 mt-6 text-sm">Average Correct Rate</p>
                <p className="text-2xl font-bold text-green-400">{averageCorrectRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 mt-6 text-sm">Hardest Question</p>
                <p className="text-2xl font-bold text-red-400">{hardestQuestion?.accuracy?.toFixed(1) || 0}%</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 mt-6 text-sm">Easiest Question</p>
                <p className="text-2xl font-bold text-blue-400">{easiestQuestion?.accuracy?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 mt-6 text-sm">Avg Time/Question</p>
                <p className="text-2xl font-bold text-yellow-400">{Math.round(averageTime)}s</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Difficulty Distribution Chart */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveDifficultyChart testId={testData?._id} questionStats={questionStats} />
          </CardContent>
        </Card>

        {/* Time vs Accuracy */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Time vs Accuracy Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="questionIndex" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="averageTime" fill="#3b82f6" name="Avg Time (s)" />
                <Bar dataKey="accuracy" fill="#10b981" name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Most Difficult Questions */}
      {mostDifficult.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Most Challenging Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostDifficult.map((question, index) => (
                <div
                  key={question.questionId}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <span className="text-red-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium">{question.text}</p>
                      <p className="text-slate-400 text-sm">{question.attempts} attempts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{question.correctRate.toFixed(1)}%</p>
                    <p className="text-slate-400 text-sm">correct rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Easiest Questions */}
      {easiest.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Best Performing Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {easiest.map((question, index) => (
                <div
                  key={question.questionId}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium">{question.text}</p>
                      <p className="text-slate-400 text-sm">{question.attempts} attempts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{question.correctRate.toFixed(1)}%</p>
                    <p className="text-slate-400 text-sm">correct rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const InteractiveDifficultyChart = ({ testId, questionStats }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [difficultyData, setDifficultyData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (questionStats && questionStats.length > 0) {
      calculateDifficultyDistribution()
    }
  }, [questionStats])

  const calculateDifficultyDistribution = () => {
    try {
      const distribution = [
        {
          name: "Easy",
          value: questionStats.filter((q) => q.accuracy > 80).length,
          color: "#10b981",
          range: ">80%",
        },
        {
          name: "Medium",
          value: questionStats.filter((q) => q.accuracy >= 50 && q.accuracy <= 80).length,
          color: "#f59e0b",
          range: "50-80%",
        },
        {
          name: "Hard",
          value: questionStats.filter((q) => q.accuracy >= 30 && q.accuracy < 50).length,
          color: "#ef4444",
          range: "30-50%",
        },
        {
          name: "Very Hard",
          value: questionStats.filter((q) => q.accuracy < 30).length,
          color: "#8b5cf6",
          range: "<30%",
        },
      ].filter((item) => item.value > 0)

      setDifficultyData(distribution)
      setLoading(false)
    } catch (error) {
      console.error("Error calculating difficulty distribution:", error)
      setLoading(false)
    }
  }

  if (loading || !difficultyData || difficultyData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-slate-400 text-sm">{loading ? "Loading..." : "No data available"}</div>
      </div>
    )
  }

  const totalQuestions = questionStats.length

  return (
    <div className="h-72 flex items-center justify-center relative">
      {/* Main Chart */}
      <div className="relative">
        <ResponsiveContainer width={280} height={280}>
          <PieChart>
            <Pie
              data={difficultyData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {difficultyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={hoveredIndex === index ? "#ffffff" : "transparent"}
                  strokeWidth={2}
                  style={{
                    filter: hoveredIndex === index ? "brightness(1.1)" : "brightness(1)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-slate-200">{totalQuestions}</div>
          <div className="text-sm text-slate-400 uppercase tracking-wider">Questions</div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredIndex !== null && (
        <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg px-4 py-3 min-w-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: difficultyData[hoveredIndex].color }} />
            <span className="font-medium text-slate-200 text-sm">{difficultyData[hoveredIndex].name}</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Questions:</span>
              <span className="font-medium">{difficultyData[hoveredIndex].value}</span>
            </div>
            <div className="flex justify-between">
              <span>Percentage:</span>
              <span className="font-medium">
                {((difficultyData[hoveredIndex].value / totalQuestions) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Range:</span>
              <span className="font-medium">{difficultyData[hoveredIndex].range}</span>
            </div>
          </div>
        </div>
      )}

      {/* Simple Legend */}
      <div className="absolute -bottom-4 mt-10 left-1/2 transform -translate-x-1/2 flex gap-4">
        {difficultyData.map((item, index) => (
          <div
            key={item.name}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
              hoveredIndex === index ? "bg-slate-700/50" : "hover:bg-slate-700/30"
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-slate-300 font-medium">{item.name}</span>
            <span className="text-xs text-slate-400">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
