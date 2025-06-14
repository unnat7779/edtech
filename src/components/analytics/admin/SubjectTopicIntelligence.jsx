"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { BookOpen, TrendingUp, TrendingDown, Target, Brain } from "lucide-react"

export default function SubjectTopicIntelligence({ testData, analyticsData, filters }) {
  const [subjectData, setSubjectData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (analyticsData) {
      processSubjectData()
    }
  }, [analyticsData, filters])

  const processSubjectData = () => {
    try {
      // Mock data processing - replace with actual analytics data
      const data = {
        subjectPerformance: [
          { subject: "Physics", avgScore: 72.5, totalQuestions: 20, attempts: 156, improvement: 8.3 },
          { subject: "Chemistry", avgScore: 68.2, totalQuestions: 15, attempts: 142, improvement: -2.1 },
          { subject: "Mathematics", avgScore: 75.8, totalQuestions: 13, attempts: 134, improvement: 12.7 },
        ],
        topicBreakdown: {
          Physics: [
            { topic: "Mechanics", score: 78, difficulty: "Medium", questions: 8 },
            { topic: "Thermodynamics", score: 65, difficulty: "Hard", questions: 6 },
            { topic: "Optics", score: 82, difficulty: "Easy", questions: 6 },
          ],
          Chemistry: [
            { topic: "Organic Chemistry", score: 58, difficulty: "Hard", questions: 7 },
            { topic: "Inorganic Chemistry", score: 72, difficulty: "Medium", questions: 5 },
            { topic: "Physical Chemistry", score: 75, difficulty: "Medium", questions: 3 },
          ],
          Mathematics: [
            { topic: "Calculus", score: 80, difficulty: "Medium", questions: 6 },
            { topic: "Algebra", score: 85, difficulty: "Easy", questions: 4 },
            { topic: "Geometry", score: 62, difficulty: "Hard", questions: 3 },
          ],
        },
        competencyRadar: [
          { subject: "Physics", conceptual: 75, application: 68, problem_solving: 72, speed: 65 },
          { subject: "Chemistry", conceptual: 70, application: 65, problem_solving: 58, speed: 72 },
          { subject: "Mathematics", conceptual: 82, application: 78, problem_solving: 75, speed: 70 },
        ],
        learningGaps: [
          { area: "Organic Chemistry Mechanisms", severity: "High", affectedStudents: 78, avgScore: 32 },
          { area: "Complex Integration", severity: "Medium", affectedStudents: 45, avgScore: 48 },
          { area: "Thermodynamics Laws", severity: "Medium", affectedStudents: 52, avgScore: 44 },
        ],
      }
      setSubjectData(data)
      setLoading(false)
    } catch (error) {
      console.error("Error processing subject data:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
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
          Subject & Topic Intelligence
        </h2>
        <div className="text-sm text-slate-400">Advanced Learning Analytics</div>
      </div>

      {/* Subject Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjectData?.subjectPerformance.map((subject, index) => (
          <Card key={subject.subject} className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-teal-400" />
                  <h3 className="font-semibold text-slate-200">{subject.subject}</h3>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    subject.improvement > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {subject.improvement > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(subject.improvement)}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Average Score</span>
                  <span className="text-slate-200 font-medium">{subject.avgScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Questions</span>
                  <span className="text-slate-200">{subject.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Attempts</span>
                  <span className="text-slate-200">{subject.attempts}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subject Performance Chart */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200">Subject Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData?.subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="subject" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="avgScore" fill="#14b8a6" name="Average Score %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Competency Radar Chart */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Competency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={subjectData?.competencyRadar}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af" }} />
              <PolarRadiusAxis tick={{ fill: "#9ca3af" }} />
              <Radar name="Conceptual" dataKey="conceptual" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              <Radar name="Application" dataKey="application" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              <Radar
                name="Problem Solving"
                dataKey="problem_solving"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
              />
              <Radar name="Speed" dataKey="speed" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(subjectData?.topicBreakdown || {}).map(([subject, topics]) => (
          <Card key={subject} className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200">{subject} Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topics.map((topic, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-slate-200 font-medium text-sm">{topic.topic}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          topic.difficulty === "Easy"
                            ? "bg-green-500/20 text-green-400"
                            : topic.difficulty === "Medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {topic.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Score: {topic.score}%</span>
                      <span className="text-slate-400">{topic.questions} questions</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Gaps */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Target className="h-5 w-5 text-red-400" />
            Critical Learning Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectData?.learningGaps.map((gap, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${gap.severity === "High" ? "bg-red-400" : "bg-yellow-400"}`}
                  ></div>
                  <div>
                    <p className="text-slate-200 font-medium">{gap.area}</p>
                    <p className="text-slate-400 text-sm">{gap.affectedStudents}% of students affected</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">{gap.avgScore}%</p>
                  <p className="text-slate-400 text-sm">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
