"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  Users,
  MessageCircle,
  Video,
  Check,
  Star,
  Award,
  Shield,
  Crown,
  Clock,
  Target,
  BookOpen,
  TrendingUp,
  Play,
  ExternalLink,
} from "lucide-react"

const PremiumProgramsSection = () => {
  const [mentorshipPlan, setMentorshipPlan] = useState("gold")
  const [doubtSolvingTab, setDoubtSolvingTab] = useState("chat")
  const [isVisible, setIsVisible] = useState(false)
  const [animatedCards, setAnimatedCards] = useState(new Set())
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Stagger card animations
          setTimeout(() => setAnimatedCards((prev) => new Set([...prev, "mentorship"])), 200)
          setTimeout(() => setAnimatedCards((prev) => new Set([...prev, "doubt-solving"])), 400)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const mentorshipPlans = {
    silver: {
      name: "Silver Plan",
      price: "₹2,000",
      duration: "3 months",
      color: "from-yellow-500 to-amber-600",
      badge: "bg-gradient-to-r from-yellow-500 to-amber-600",
      features: ["Bi-Weekly 1:1 sessions", "Customized study plan", "Progress tracking", "Mock-Test analysis"],
    },
    gold: {
      name: "Gold Plan",
      price: "₹3,500",
      duration: "6 months",
      color: "from-teal-500 to-teal-600",
      badge: "bg-gradient-to-r from-teal-500 to-teal-600",
      popular: true,
      features: [
        "Bi-weekly 1:1 sessions",
        "Personalized study roadmap",
        "Mock test analysis",
        "Career guidance sessions",
      ],
    },
  }

  const doubtSolvingOptions = {
    chat: {
      name: "Chat Support",
      price: "₹1,500",
      duration: "3 months",
      response: "10-min response",
      features: [
        "Text-based doubt solving",
        "Step-by-step solutions",
        "Image/diagram support",
        "Subject expert responses",
      ],
    },
    live: {
      name: "Live 1:1 Sessions",
      price: "₹4,499",
      duration: "per month",
      response: "Daily VC sessions",
      features: ["Live video sessions", "Real-time problem solving", "Interactive whiteboard", "Recorded sessions"],
    },
  }

  // YouTube links for the programs
  const youtubeLinks = {
    mentorship: "https://forms.gle/orB5jFbGMvhqB6JQA", // Replace with actual mentorship video
    doubtSolving: "https://forms.gle/orB5jFbGMvhqB6JQA", // Replace with actual doubt solving video
  }

  const handleVideoClick = (type) => {
    window.open(youtubeLinks[type], "_blank", "noopener,noreferrer")
  }

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-teal-600/20 to-blue-600/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-yellow-600/20 to-teal-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-purple-600/15 to-pink-600/15 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-900/60 to-blue-900/60 border border-teal-700/50 rounded-full text-sm text-teal-300 mb-6 backdrop-blur-sm shadow-lg">
            <Crown className="h-4 w-4 mr-2 text-yellow-400" />
            <span className="font-semibold">Premium Learning Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent">
              Premium Learning Programs
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Accelerate your JEE preparation with personalized mentorship and expert doubt resolution from IITian mentors
          </p>

          {/* Trust Badge */}
          <div className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-teal-700/30 rounded-xl backdrop-blur-sm">
            <Shield className="h-5 w-5 text-teal-400 mr-2" />
            <span className="text-sm font-semibold text-slate-300">100% IITian Experts</span>
            <div className="mx-3 w-1 h-4 bg-slate-600 rounded-full"></div>
            <Award className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-sm font-semibold text-slate-300">Money-back Guarantee</span>
          </div>
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Mentorship Program Card */}
          <div
            className={`group transition-all duration-700 ${
              animatedCards.has("mentorship") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Card className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 backdrop-blur-sm hover:scale-105 hover:shadow-2xl hover:shadow-teal-900/20 transition-all duration-500 group-hover:border-teal-600/50 overflow-hidden">
              {/* Popular Badge */}
              {/* {mentorshipPlan === "gold" && (
                <div className="absolute -top-2 -right-2 z-20">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold shadow-lg">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </div>
                  </div>
                </div>
              )} */}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-200 group-hover:text-teal-300 transition-colors duration-300">
                        1:1 Mentorship by IITians
                      </h3>
                      <p className="text-sm text-slate-400">Personalized guidance for JEE success</p>
                    </div>
                  </div>
                </div>

                {/* Plan Toggle */}
                <div className="flex bg-slate-800/50 rounded-lg p-1 mb-6">
                  {Object.entries(mentorshipPlans).map(([key, plan]) => (
                    <button
                      key={key}
                      onClick={() => setMentorshipPlan(key)}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                        mentorshipPlan === key
                          ? `bg-gradient-to-r ${plan.color} text-white shadow-lg`
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                      }`}
                    >
                      {plan.name}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  {mentorshipPlans[mentorshipPlan].features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-5 h-5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 rounded-xl p-6 mb-6 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold text-slate-200 animate-pulse">
                          {mentorshipPlans[mentorshipPlan].price}
                        </span>
                        <span className="text-slate-400 ml-2">/ {mentorshipPlans[mentorshipPlan].duration}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Billed {mentorshipPlans[mentorshipPlan].duration}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${mentorshipPlans[mentorshipPlan].badge}`}
                    >
                      {mentorshipPlans[mentorshipPlan].name}
                    </div>
                  </div>

                  {/* Enhanced Video Button */}
                  <button
                    onClick={() => handleVideoClick("mentorship")}
                    className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>

                    {/* Button Content */}
                    <div className="relative flex items-center justify-center">
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:bg-white/30 transition-colors duration-300">
                            <Play className="h-4 w-4 text-white fill-white group-hover/btn:scale-110 transition-transform duration-300" />
                          </div>
                          {/* Pulse Animation */}
                          <div className="absolute inset-0 w-8 h-8 bg-white/20 rounded-full animate-ping group-hover/btn:animate-none"></div>
                        </div>
                        <span className="text-base font-bold">Start Mentorship Journey</span>
                        <ExternalLink className="h-4 w-4 ml-2 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400/0 via-teal-400/20 to-teal-400/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* Video Indicator */}
                  <div className="flex items-center justify-center mt-3 text-xs text-teal-400">
                    <Video className="h-3 w-3 mr-1" />
                    <span>Watch detailed program overview</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-center text-xs text-slate-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>First session within 24 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doubt Solving Program Card */}
          <div
            className={`group transition-all duration-700 delay-200 ${
              animatedCards.has("doubt-solving") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Card className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 backdrop-blur-sm hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 group-hover:border-blue-600/50 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-200 group-hover:text-blue-300 transition-colors duration-300">
                        PCM Doubt Solving
                      </h3>
                      <p className="text-sm text-slate-400">Instant expert help when you need it</p>
                    </div>
                  </div>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-slate-800/50 rounded-lg p-1 mb-6">
                  {Object.entries(doubtSolvingOptions).map(([key, option]) => (
                    <button
                      key={key}
                      onClick={() => setDoubtSolvingTab(key)}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                        doubtSolvingTab === key
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                      }`}
                    >
                      {key === "chat" ? <MessageCircle className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                      {option.name}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  {doubtSolvingOptions[doubtSolvingTab].features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 rounded-xl p-6 mb-6 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold text-slate-200 animate-pulse">
                          {doubtSolvingOptions[doubtSolvingTab].price}
                        </span>
                        <span className="text-slate-400 ml-2">/ {doubtSolvingOptions[doubtSolvingTab].duration}</span>
                      </div>
                      <p className="text-sm text-blue-400 mt-1 font-medium">
                        {doubtSolvingOptions[doubtSolvingTab].response}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-slate-400">
                      {doubtSolvingTab === "chat" ? (
                        <MessageCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Video className="h-4 w-4 mr-1" />
                      )}
                      {doubtSolvingTab === "chat" ? "Chat" : "Live"}
                    </div>
                  </div>

                  {/* Enhanced Video Button */}
                  <button
                    onClick={() => handleVideoClick("doubtSolving")}
                    className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>

                    {/* Button Content */}
                    <div className="relative flex items-center justify-center">
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:bg-white/30 transition-colors duration-300">
                            <Play className="h-4 w-4 text-white fill-white group-hover/btn:scale-110 transition-transform duration-300" />
                          </div>
                          {/* Pulse Animation */}
                          <div className="absolute inset-0 w-8 h-8 bg-white/20 rounded-full animate-ping group-hover/btn:animate-none"></div>
                        </div>
                        <span className="text-base font-bold">Start Solving Doubts</span>
                        <ExternalLink className="h-4 w-4 ml-2 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* Video Indicator */}
                  <div className="flex items-center justify-center mt-3 text-xs text-blue-400">
                    <Video className="h-3 w-3 mr-1" />
                    <span>Watch detailed program overview</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-center text-xs text-slate-500">
                  <Target className="h-3 w-3 mr-1" />
                  <span>Available 24/7 for all PCM subjects</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA Section */}
        {/* <div
          className={`text-center mt-12 sm:mt-16 transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/30 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-teal-400 mr-2" />
              <span className="text-lg font-semibold text-slate-200">Ready to Excel in JEE?</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              Join thousands of successful JEE candidates who have transformed their preparation with our premium
              programs. Get personalized guidance and expert support to achieve your IIT dreams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" className="group">
                <TrendingUp className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Explore All Programs
              </Button>
              <Button variant="outline" size="lg">
                Schedule Free Consultation
              </Button>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}

export default PremiumProgramsSection
