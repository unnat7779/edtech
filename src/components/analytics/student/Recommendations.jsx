"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  Target,
  BookOpen,
  Clock,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Star,
  Play,
} from "lucide-react"

export default function Recommendations({ attemptData, testData, analyticsData }) {
  // Mock data - replace with actual recommendation engine data
  const weakAreas = [
    {
      subject: "Chemistry",
      chapter: "Organic Chemistry",
      accuracy: 45,
      timeSpent: 240,
      optimalTime: 180,
      questionsWrong: 6,
      totalQuestions: 10,
      priority: "High",
      recommendations: [
        "Review reaction mechanisms for alkyl halides",
        "Practice naming conventions for organic compounds",
        "Focus on stereochemistry concepts",
      ],
    },
    {
      subject: "Physics",
      chapter: "Thermodynamics",
      accuracy: 60,
      timeSpent: 180,
      optimalTime: 150,
      questionsWrong: 3,
      totalQuestions: 8,
      priority: "Medium",
      recommendations: [
        "Strengthen understanding of heat engines",
        "Practice problems on entropy calculations",
        "Review first and second laws of thermodynamics",
      ],
    },
  ]

  const strengths = [
    {
      subject: "Mathematics",
      chapter: "Calculus",
      accuracy: 92,
      timeSpent: 120,
      optimalTime: 135,
      questionsCorrect: 12,
      totalQuestions: 13,
    },
    {
      subject: "Physics",
      chapter: "Mechanics",
      accuracy: 88,
      timeSpent: 150,
      optimalTime: 160,
      questionsCorrect: 14,
      totalQuestions: 16,
    },
  ]

  const studyPlan = [
    {
      week: 1,
      focus: "Organic Chemistry Fundamentals",
      tasks: [
        "Complete 50 practice problems on reaction mechanisms",
        "Watch video lectures on stereochemistry",
        "Take chapter-wise mock test",
      ],
      estimatedTime: "8-10 hours",
    },
    {
      week: 2,
      focus: "Thermodynamics Deep Dive",
      tasks: [
        "Solve numerical problems on heat engines",
        "Review entropy and enthalpy concepts",
        "Practice mixed problems from previous years",
      ],
      estimatedTime: "6-8 hours",
    },
    {
      week: 3,
      focus: "Integration and Review",
      tasks: [
        "Take full-length practice test",
        "Review mistakes from previous attempts",
        "Focus on time management strategies",
      ],
      estimatedTime: "10-12 hours",
    },
  ]

  const practiceResources = [
    {
      title: "Organic Chemistry Problem Bank",
      type: "Practice Questions",
      difficulty: "Medium to Hard",
      questions: 150,
      estimatedTime: "3-4 hours",
      topics: ["Reaction Mechanisms", "Stereochemistry", "Nomenclature"],
    },
    {
      title: "Thermodynamics Concept Videos",
      type: "Video Lectures",
      difficulty: "Beginner to Advanced",
      duration: "2.5 hours",
      topics: ["Heat Engines", "Entropy", "Laws of Thermodynamics"],
    },
    {
      title: "JEE Previous Year Questions",
      type: "Mock Tests",
      difficulty: "JEE Level",
      questions: 75,
      estimatedTime: "3 hours",
      topics: ["Mixed Topics", "Time Management"],
    },
  ]

  const timeManagementTips = [
    {
      tip: "Allocate specific time limits for each subject",
      description: "Based on your performance, spend 40% time on Chemistry, 35% on Physics, and 25% on Mathematics",
      priority: "High",
    },
    {
      tip: "Practice the 'skip and return' strategy",
      description:
        "Don't spend more than 3 minutes on any single question initially. Mark difficult ones and return later",
      priority: "High",
    },
    {
      tip: "Use the elimination method for MCQs",
      description: "You spent too much time on some MCQs. Practice eliminating wrong options quickly",
      priority: "Medium",
    },
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-900/50 text-red-400 border-red-700/50"
      case "Medium":
        return "bg-yellow-900/50 text-yellow-400 border-yellow-700/50"
      case "Low":
        return "bg-green-900/50 text-green-400 border-green-700/50"
      default:
        return "bg-slate-900/50 text-slate-400 border-slate-700/50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <Target className="h-6 w-6 text-teal-400" />
            Performance Summary & Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Areas for Improvement */}
            <div>
              <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Areas for Improvement
              </h3>
              <div className="space-y-4">
                {weakAreas.map((area, index) => (
                  <div key={index} className="p-4 bg-red-900/10 border border-red-700/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-slate-200">{area.chapter}</h4>
                        <p className="text-sm text-slate-400">{area.subject}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(area.priority)}`}>
                        {area.priority} Priority
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-slate-400">Accuracy: </span>
                        <span className="text-red-400 font-medium">{area.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Wrong: </span>
                        <span className="text-red-400 font-medium">
                          {area.questionsWrong}/{area.totalQuestions}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {area.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <ArrowRight className="h-3 w-3 mt-1 text-teal-400 flex-shrink-0" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Your Strengths
              </h3>
              <div className="space-y-4">
                {strengths.map((strength, index) => (
                  <div key={index} className="p-4 bg-green-900/10 border border-green-700/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-slate-200">{strength.chapter}</h4>
                        <p className="text-sm text-slate-400">{strength.subject}</p>
                      </div>
                      <Star className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Accuracy: </span>
                        <span className="text-green-400 font-medium">{strength.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Correct: </span>
                        <span className="text-green-400 font-medium">
                          {strength.questionsCorrect}/{strength.totalQuestions}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      Keep practicing to maintain this level of performance
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Plan */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <BookOpen className="h-6 w-6 text-blue-400" />
            Personalized 3-Week Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {studyPlan.map((week, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-200">
                    Week {week.week}: {week.focus}
                  </h3>
                  <span className="text-sm text-slate-400">{week.estimatedTime}</span>
                </div>
                <div className="space-y-2">
                  {week.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-teal-400 flex-shrink-0" />
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Resources */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <Play className="h-6 w-6 text-green-400" />
            Recommended Practice Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {practiceResources.map((resource, index) => (
              <div
                key={index}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="mb-3">
                  <h4 className="font-semibold text-slate-200 mb-1">{resource.title}</h4>
                  <p className="text-sm text-slate-400">{resource.type}</p>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Difficulty:</span>
                    <span className="text-slate-300">{resource.difficulty}</span>
                  </div>
                  {resource.questions && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Questions:</span>
                      <span className="text-slate-300">{resource.questions}</span>
                    </div>
                  )}
                  {resource.duration && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-slate-300">{resource.duration}</span>
                    </div>
                  )}
                  {resource.estimatedTime && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Time:</span>
                      <span className="text-slate-300">{resource.estimatedTime}</span>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {resource.topics.map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-teal-900/30 text-teal-400 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white">
                  Start Practice
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Management Tips */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <Clock className="h-6 w-6 text-yellow-400" />
            Time Management Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeManagementTips.map((tip, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-200">{tip.tip}</h4>
                  <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(tip.priority)}`}>
                    {tip.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 border-teal-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <TrendingUp className="h-6 w-6 text-teal-400" />
            Your Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-teal-400">Immediate Actions (This Week)</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  Start with Organic Chemistry practice problems
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  Review thermodynamics concepts using video lectures
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  Practice time management with mock tests
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-400">Long-term Goals (Next Month)</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <Target className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  Improve Chemistry accuracy to 75%+
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <Target className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  Achieve consistent 85%+ overall scores
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <Target className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  Reach top 10 percentile consistently
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-3">
              Start Your Improvement Journey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
