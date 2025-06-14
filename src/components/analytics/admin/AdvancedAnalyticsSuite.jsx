"use client"

import { useState, useEffect } from "react"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Brain, Zap, Target, TrendingUp, Users, Clock, AlertTriangle } from "lucide-react"

export default function AdvancedAnalyticsSuite({ testData, analyticsData, filters }) {
  const [advancedData, setAdvancedData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (analyticsData) {
      processAdvancedData()
    }
  }, [analyticsData, filters])

  const processAdvancedData = () => {
    try {
      // Mock advanced analytics data - replace with actual ML/AI insights
      const data = {
        predictiveInsights: {
          passRate: 78.5,
          riskStudents: 23,
          improvementTrend: 12.3,
          confidenceScore: 0.87,
        },
        learningCurve: [
          { attempt: 1, avgScore: 45, confidence: 0.6 },
          { attempt: 2, avgScore: 58, confidence: 0.7 },
          { attempt: 3, avgScore: 67, confidence: 0.8 },
          { attempt: 4, avgScore: 72, confidence: 0.85 },
          { attempt: 5, avgScore: 75, confidence: 0.87 },
        ],
        timeEfficiency: [
          { timeSpent: 30, score: 45, students: 12 },
          { timeSpent: 45, score: 62, students: 28 },
          { timeSpent: 60, score: 75, students: 45 },
          { timeSpent: 75, score: 78, students: 32 },
          { timeSpent: 90, score: 72, students: 18 },
        ],
        cognitiveLoad: [
          { question: "Q1", difficulty: 2.3, timeSpent: 120, errorRate: 0.25 },
          { question: "Q2", difficulty: 4.1, timeSpent: 180, errorRate: 0.65 },
          { question: "Q3", difficulty: 1.8, timeSpent: 90, errorRate: 0.15 },
          { question: "Q4", difficulty: 3.5, timeSpent: 150, errorRate: 0.45 },
          { question: "Q5", difficulty: 4.8, timeSpent: 200, errorRate: 0.75 },
        ],
        behaviorPatterns: {
          rushers: 15, // Students who finish too quickly
          overthinkers: 22, // Students who spend too much time
          consistent: 63, // Students with consistent performance
          erratic: 12, // Students with highly variable performance
        },
        adaptiveLearning: [
          { concept: "Basic Algebra", mastery: 0.85, nextConcept: "Quadratic Equations" },
          { concept: "Organic Chemistry", mastery: 0.45, nextConcept: "Basic Reactions" },
          { concept: "Mechanics", mastery: 0.72, nextConcept: "Energy Conservation" },
        ],
      }
      setAdvancedData(data)
      setLoading(false)
    } catch (error) {
      console.error("Error processing advanced data:", error)
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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Advanced Analytics Suite
        </h2>
        <div className="text-sm text-slate-400">AI-Powered Insights & Predictions</div>
      </div>

      {/* Predictive Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-md border-purple-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Predicted Pass Rate</p>
                <p className="text-2xl font-bold text-purple-400">{advancedData?.predictiveInsights.passRate}%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-md border-red-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">At-Risk Students</p>
                <p className="text-2xl font-bold text-red-400">{advancedData?.predictiveInsights.riskStudents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-md border-green-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Improvement Trend</p>
                <p className="text-2xl font-bold text-green-400">
                  +{advancedData?.predictiveInsights.improvementTrend}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-md border-blue-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">AI Confidence</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(advancedData?.predictiveInsights.confidenceScore * 100).toFixed(0)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Curve Analysis */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Learning Curve & Confidence Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={advancedData?.learningCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="attempt" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="avgScore" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Efficiency Analysis */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            Time Efficiency vs Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={advancedData?.timeEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timeSpent" stroke="#9ca3af" name="Time Spent (min)" />
              <YAxis dataKey="score" stroke="#9ca3af" name="Score" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [
                  value,
                  name === "students" ? "Students" : name === "score" ? "Score" : "Time",
                ]}
              />
              <Scatter dataKey="students" fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Behavior Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-400" />
              Student Behavior Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-slate-200">Rushers</span>
                </div>
                <span className="text-red-400 font-bold">{advancedData?.behaviorPatterns.rushers}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-200">Overthinkers</span>
                </div>
                <span className="text-yellow-400 font-bold">{advancedData?.behaviorPatterns.overthinkers}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-slate-200">Consistent</span>
                </div>
                <span className="text-green-400 font-bold">{advancedData?.behaviorPatterns.consistent}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-200">Erratic</span>
                </div>
                <span className="text-purple-400 font-bold">{advancedData?.behaviorPatterns.erratic}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Adaptive Learning Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {advancedData?.adaptiveLearning.map((item, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-slate-200 font-medium">{item.concept}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.mastery > 0.8
                          ? "bg-green-500/20 text-green-400"
                          : item.mastery > 0.6
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {(item.mastery * 100).toFixed(0)}% mastery
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Next: <span className="text-teal-400">{item.nextConcept}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cognitive Load Analysis */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Cognitive Load Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {advancedData?.cognitiveLoad.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-slate-200 font-medium">{item.question}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">Difficulty:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full mr-1 ${i < item.difficulty ? "bg-red-400" : "bg-slate-600"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-slate-400">Time</div>
                    <div className="text-slate-200">{item.timeSpent}s</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">Error Rate</div>
                    <div className="text-red-400">{(item.errorRate * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
