"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Logo from "@/components/ui/Logo"
import ModernHeroSection from "./ModernHeroSection"
import ModernFeaturesSection from "./ModernFeaturesSection"
import ProblemsSection from "./ProblemsSection"
import HowJEEElevateHelps from "./HowJEEElevateHelps"
import PremiumProgramsSection from "./PremiumProgramsSection"
import { getStoredUser } from "@/lib/auth-utils"
import {
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  Star,
  Target,
  Clock,
  Shield,
  Brain,
  BarChart3,
  Lightbulb,
  Trophy,
  Rocket,
  LayoutDashboard,
} from "lucide-react"
import TestimonialsSection from "./TestimonialsSection"

export default function EnhancedHomePage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsVisible(true)

    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const userData = getStoredUser()
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Adaptive Tests",
      description:
        "Smart algorithms that adjust difficulty based on your performance, ensuring optimal learning progression for JEE success",
      color: "from-teal-600 to-teal-700",
      hoverColor: "hover:shadow-teal-900/30",
    },
    {
      icon: Clock,
      title: "Real-Time Doubt Resolution",
      description:
        "Get instant help from expert JEE mentors whenever you're stuck, available 24/7 to clear your concepts",
      color: "from-blue-600 to-blue-700",
      hoverColor: "hover:shadow-blue-900/30",
    },
    {
      icon: BarChart3,
      title: "Detailed Performance Analytics",
      description:
        "Comprehensive insights into your JEE preparation with subject-wise analysis and improvement recommendations",
      color: "from-yellow-500 to-yellow-600",
      hoverColor: "hover:shadow-yellow-900/30",
    },
    {
      icon: Shield,
      title: "Secure CBT Environment",
      description:
        "Practice in a JEE-like Computer Based Test environment with advanced proctoring for authentic exam experience",
      color: "from-purple-600 to-purple-700",
      hoverColor: "hover:shadow-purple-900/30",
    },
  ]

  const stats = [
    { label: "JEE Aspirants", value: "15,000+", icon: Users },
    { label: "Mock Tests Taken", value: "75,000+", icon: Award },
    { label: "Success Rate", value: "96%", icon: TrendingUp },
    { label: "Expert Mentors", value: "200+", icon: Star },
  ]

  const benefits = [
    {
      icon: Target,
      title: "Personalized Learning Paths",
      description:
        "Customized study plans based on your strengths and weaknesses in Physics, Chemistry, and Mathematics",
    },
    {
      icon: Lightbulb,
      title: "Concept Clarity",
      description:
        "Deep understanding through interactive explanations and step-by-step solutions for complex JEE problems",
    },
    {
      icon: Trophy,
      title: "Rank Improvement",
      description: "Proven strategies and practice methods that have helped thousands achieve their target JEE ranks",
    },
    {
      icon: Rocket,
      title: "Fast Track Progress",
      description: "Accelerated learning with AI-driven recommendations to optimize your JEE preparation timeline",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <Logo size="sm" variant="gradient" className="scale-75 sm:scale-90 md:scale-100" />
            <div className="flex items-center space-x-2 sm:space-x-3">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-slate-700/50 animate-pulse"></div>
              ) : user ? (
                <>
                  {user.role === "admin" && (
                    <Button
                      onClick={() => router.push("/admin")}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1 sm:gap-2 hover:bg-slate-700/50 hover:text-blue-400 transition-all duration-300 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 mr-2"
                    >
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 hover:bg-slate-700/50 hover:text-teal-400 transition-all duration-300 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                  >
                    <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="relative flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-teal-500/20"
                    aria-label="My Profile"
                  >
                    {user?.profile?.avatar ? (
                      <img
                        src={user.profile.avatar || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover rounded-full border-2 border-slate-700"
                      />
                    ) : (
                      <span className="text-xs font-medium text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    )}
                    <span className="absolute -bottom-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-teal-400 rounded-full border-2 border-slate-800"></span>
                  </button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push("/register")}
                    variant="primary"
                    size="sm"
                    className="text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Hero Section */}
      <ModernHeroSection />

      {/* Modern Features Section */}
      <ModernFeaturesSection />

      {/* Problems Section */}
      <ProblemsSection />

      {/* How JEE Elevate Helps Section */}
      <HowJEEElevateHelps />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Benefits Section */}
      {/* <section className="py-10 sm:py-16 bg-slate-900 border-y border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">
                Why JEE Aspirants Choose JEE Elevate
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto px-2">
              Join thousands of successful JEE candidates who have transformed their preparation with our AI-powered
              platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`text-center p-4 transition-all duration-500 delay-${index * 100} ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                } group hover:scale-105`}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-900/50 to-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <benefit.icon className="h-6 w-6 sm:h-8 sm:w-8 text-teal-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Premium Programs Section */}
      <PremiumProgramsSection />

      {/* Stats Section */}
      {/* <section className="py-10 sm:py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Trusted by JEE Aspirants Nationwide
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-500 delay-${index * 100} ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                } group hover:scale-105 p-3`}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-teal-900/50 to-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <stat.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-teal-400" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-200 mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Advanced Features Section */}
      {/* <section className="py-12 sm:py-16 md:py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Advanced Features for JEE Success
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto px-2">
              Cutting-edge AI technology meets proven JEE preparation strategies to deliver unparalleled results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="primary"
                className={`group transform hover:scale-105 transition-all duration-300 ${feature.hoverColor} cursor-pointer border border-slate-700/50`}
              >
                <CardContent className="p-5 sm:p-6 md:p-8">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-2 sm:mb-3 group-hover:text-teal-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-slate-700/50 shadow-2xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl shadow-yellow-900/30">
              <Trophy className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-900" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-teal-400 bg-clip-text text-transparent">
                Ready to Crack JEE?
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
              Join thousands of successful JEE candidates who have transformed their preparation with JEE Elevate. Start
              your journey to IIT today with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Button
                onClick={() => router.push(user ? "/dashboard" : "/register")}
                variant="accent"
                size="lg"
                className="group shadow-2xl shadow-yellow-900/30 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                {user ? "Go to Dashboard" : "Begin Your JEE Journey"}
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                size="lg"
                className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                Already have an account?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="xs" variant="gradient" className="mb-4 md:mb-0 scale-75 sm:scale-90 md:scale-100" />
            <div className="text-xs sm:text-sm text-slate-400 text-center md:text-right">
              © {new Date().getFullYear()} JEE Elevate. All rights reserved. | Empowering JEE Aspirants Nationwide
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
