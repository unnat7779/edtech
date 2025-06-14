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
    if (analyticsData) {
      processQuestionData()
    }
  }, [analyticsData, filters])

  const processQuestionData = () => {
    try {
      // Mock data processing - replace with actual analytics data
      const stats = {
        totalQuestions: testData?.questions?.length || 0,
        averageCorrectRate: 65.4,
        mostDifficult: [
          { questionId: 1, text: "Complex Integration Problem", correctRate: 23.5, attempts: 156 },
          { questionId: 2, text: "Organic Chemistry Mechanism", correctRate: 31.2, attempts: 142 },
          { questionId: 3, text: "Physics Kinematics", correctRate: 38.7, attempts: 134 },
        ],
        easiest: [
          { questionId: 4, text: "Basic Algebra", correctRate: 89.3, attempts: 167 },
          { questionId: 5, text: "Simple Geometry", correctRate: 85.1, attempts: 159 },
          { questionId: 6, text: "Basic Chemistry", correctRate: 82.4, attempts: 145 },
        ],
        difficultyDistribution: [
          { name: "Easy (>80%)", value: 25, count: 12 },
          { name: "Medium (50-80%)", value: 45, count: 22 },
          { name: "Hard (30-50%)", value: 20, count: 10 },
          { name: "Very Hard (<30%)", value: 10, count: 4 },
        ],
        timeAnalysis: [
          { question: "Q1", avgTime: 120, correctRate: 75 },
          { question: "Q2", avgTime: 180, correctRate: 45 },
          { question: "Q3", avgTime: 90, correctRate: 85 },
          { question: "Q4", avgTime: 150, correctRate: 60 },
          { question: "Q5", avgTime: 200, correctRate: 35 },
        ],
      }
      setQuestionStats(stats)
      setLoading(false)
    } catch (error) {
      console.error("Error processing question data:", error)
      setLoading(false)
    }
  }

  if (loading) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
          Question Analytics
        </h2>
        <div className="text-sm text-slate-400">{questionStats?.totalQuestions} Total Questions</div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Average Correct Rate</p>
                <p className="text-2xl font-bold text-green-400">{questionStats?.averageCorrectRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Hardest Question</p>
                <p className="text-2xl font-bold text-red-400">{questionStats?.mostDifficult[0]?.correctRate}%</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Easiest Question</p>
                <p className="text-2xl font-bold text-blue-400">{questionStats?.easiest[0]?.correctRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Time/Question</p>
                <p className="text-2xl font-bold text-yellow-400">2.5m</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={questionStats?.difficultyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {questionStats?.difficultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time vs Accuracy */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Time vs Accuracy Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionStats?.timeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="question" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="avgTime" fill="#3b82f6" name="Avg Time (s)" />
                <Bar dataKey="correctRate" fill="#10b981" name="Correct Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Most Difficult Questions */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            Most Challenging Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionStats?.mostDifficult.map((question, index) => (
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
                  <p className="text-red-400 font-bold">{question.correctRate}%</p>
                  <p className="text-slate-400 text-sm">correct rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Easiest Questions */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Best Performing Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionStats?.easiest.map((question, index) => (
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
                  <p className="text-green-400 font-bold">{question.correctRate}%</p>
                  <p className="text-slate-400 text-sm">correct rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
