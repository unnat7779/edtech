"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import {
  Brain,
  MessageCircle,
  TrendingDown,
  BookOpen,
  Clock,
  UserX,
  GraduationCap,
  Users,
  Sparkles,
  AlertCircle,
} from "lucide-react"

// Custom hook for magnetic cursor effect
const useMagneticCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return mousePosition
}

// Typewriter effect hook
const useTypewriter = (text, speed = 80, startAnimation = false) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!startAnimation) return

    let timeout
    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)
    } else {
      setIsComplete(true)
    }

    return () => clearTimeout(timeout)
  }, [currentIndex, text, speed, startAnimation])

  return { displayText, isComplete }
}

// Problem Card Component
const ProblemCard = ({ problem, index, mousePosition }) => {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseXPercent = (e.clientX - centerX) / (rect.width / 2)
    const mouseYPercent = (e.clientY - centerY) / (rect.height / 2)

    mouseX.set(mouseXPercent * 0.5)
    mouseY.set(mouseYPercent * 0.5)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className="group relative"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative h-full bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30 shadow-lg overflow-hidden cursor-pointer"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          scale: 1.03,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          borderColor: "rgba(148, 163, 184, 0.4)",
          boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(148, 163, 184, 0.1)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Gradient border effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${problem.gradientColors[0]}, ${problem.gradientColors[1]})`,
            padding: "1px",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
          }}
        />

        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${problem.accentColor}, transparent 70%)`,
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: problem.accentColor,
                left: `${30 + i * 40}%`,
                top: `${20 + i * 30}%`,
                opacity: 0.3,
              }}
              animate={{
                y: [-5, -15, -5],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Icon container */}
        <motion.div
          className="relative z-10 mb-4"
          whileHover={{
            scale: 1.1,
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md border border-slate-600/50"
            style={{ backgroundColor: `${problem.accentColor}20` }}
            whileHover={{
              backgroundColor: `${problem.accentColor}30`,
              borderColor: problem.accentColor,
              boxShadow: `0 0 20px ${problem.accentColor}40`,
            }}
          >
            <problem.icon className="h-6 w-6 transition-colors duration-300" style={{ color: problem.accentColor }} />
          </motion.div>
        </motion.div>

        {/* Text content */}
        <div className="relative z-10">
          <motion.h3
            className="text-lg font-semibold text-white mb-2 leading-tight group-hover:text-slate-100 transition-colors duration-300"
            style={{ transform: "translateZ(10px)" }}
          >
            {problem.title}
          </motion.h3>

          {/* Problem indicator */}
          {/* <motion.div
            className="flex items-center text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
          > */}
            {/* <AlertCircle className="h-3 w-3 mr-1" /> */}
            {/* <span>Common JEE Challenge</span> */}
          {/* </motion.div> */}
        </div>

        {/* Subtle sparkle effect */}
        <motion.div
          className="absolute top-3 right-3 text-slate-500/40 group-hover:text-slate-400/60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: index * 0.2,
          }}
        >
          <Sparkles className="h-3 w-3" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const ProblemsSection = () => {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  const mousePosition = useMagneticCursor()

  const { displayText: typewriterText, isComplete } = useTypewriter(
    "Problems Every JEE Aspirant Faces",
    60,
    isHeaderInView,
  )

  const problems = [
    {
      icon: Brain,
      title: "I study a lot but still score less",
      accentColor: "#ef4444",
      gradientColors: ["rgba(239, 68, 68, 0.2)", "rgba(220, 38, 38, 0.2)"],
    },
    {
      icon: MessageCircle,
      title: "Doubts pile up and never get solved",
      accentColor: "#f59e0b",
      gradientColors: ["rgba(245, 158, 11, 0.2)", "rgba(217, 119, 6, 0.2)"],
    },
    {
      icon: TrendingDown,
      title: "My marks fluctuate every test",
      accentColor: "#8b5cf6",
      gradientColors: ["rgba(139, 92, 246, 0.2)", "rgba(124, 58, 237, 0.2)"],
    },
    {
      icon: BookOpen,
      title: "Don't know what to revise before tests",
      accentColor: "#06b6d4",
      gradientColors: ["rgba(6, 182, 212, 0.2)", "rgba(8, 145, 178, 0.2)"],
    },
    {
      icon: Clock,
      title: "Stuck in a timetable that doesn't work",
      accentColor: "#10b981",
      gradientColors: ["rgba(16, 185, 129, 0.2)", "rgba(5, 150, 105, 0.2)"],
    },
    {
      icon: UserX,
      title: "I feel demotivated and have no one to talk to",
      accentColor: "#f97316",
      gradientColors: ["rgba(249, 115, 22, 0.2)", "rgba(234, 88, 12, 0.2)"],
    },
    {
      icon: GraduationCap,
      title: "Coaching teachers are too fast or not accessible",
      accentColor: "#3b82f6",
      gradientColors: ["rgba(59, 130, 246, 0.2)", "rgba(37, 99, 235, 0.2)"],
    },
    {
      icon: Users,
      title: "Struggling to meet expectations while balancing pressure from all sides",
      accentColor: "#ec4899",
      gradientColors: ["rgba(236, 72, 153, 0.2)", "rgba(219, 39, 119, 0.2)"],
    },
  ]

  return (
    <section ref={sectionRef} className="relative py-20 bg-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Subtle gradient orbs */}
        <motion.div
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div className="mb-6">
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-full border border-red-700/30 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-sm font-medium text-red-300">Common Challenges</span>
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 min-h-[1.2em]"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              {typewriterText}
              {!isComplete && (
                <motion.span
                  className="inline-block w-1 h-[0.9em] bg-orange-400 ml-2"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: isComplete ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Every JEE aspirant faces these challenges. You're not alone in this journey, and these problems have
            solutions.
          </motion.p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <ProblemCard key={index} problem={problem} index={index} mousePosition={mousePosition} />
          ))}
        </div>

        {/* Bottom Message */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <motion.div
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-full border border-slate-600/50 backdrop-blur-sm"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              borderColor: "rgba(148, 163, 184, 0.3)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-yellow-400 mr-2" />
            <span className="text-slate-300 font-medium">
              JEE Elevate has solutions for every single one of these problems
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProblemsSection
