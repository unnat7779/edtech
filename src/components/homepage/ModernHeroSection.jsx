"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, useAnimation, useInView } from "framer-motion"
import { ArrowRight, Star, Users, Trophy, Award } from 'lucide-react'
import Button from "@/components/ui/Button"
import Logo from "@/components/ui/Logo"
import { Target } from 'lucide-react'
import { useRef } from "react"
import { useAuth } from "@/hooks/auth/useAuth"

// Creative formula positioning with varied orientations and sizes
const backgroundFormulas = [
  {
    formula: "F = ma",
    position: { top: "9.3%", left: "3%" },
    rotation: -15,
    size: "text-lg",
    delay: 0.5,
  },
  {
    formula: "E = mc²",
    position: { top: "24%", right: "4%" },
    rotation: 0,
    size: "text-xl",
    delay: 1.0,
  },
  {
    formula: "PV = nRT",
    position: { top: "35%", left: "3%" },
    rotation: -8,
    size: "text-base",
    delay: 1.5,
  },
  {
    formula: "v = u + at",
    position: { top: "65%", right: "5%" },
    rotation: 12,
    size: "text-lg",
    delay: 2.0,
  },
  {
    formula: "PE = mgh",
    position: { top: "75%", left: "12%" },
    rotation: 18,
    size: "text-lg",
    delay: 3.0,
  },
  {
    formula: "KE = ½mv²",
    position: { top: "5%", left: "68%" },
    rotation: -12,
    size: "text-base",
    delay: 3.5,
  },
  {
    formula: "Q = mcΔT",
    position: { top: "82%", right: "18%" },
    rotation: 8,
    size: "text-lg",
    delay: 4.0,
  },
  {
    formula: "s = ut + ½at²",
    position: { top: "94%", left: "40%" },
    rotation: 360,
    size: "text-lg",
    delay: 5.0,
  },
  {
    formula: "λ = v/f",
    position: { top: "35%", left: "45%" },
    rotation: 10,
    size: "text-sm",
    delay: 6.5,
  },
]

// Counter Animation Hook
const useCounter = (end, duration = 2000, startAnimation = false) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!startAnimation) return

    let startTime
    let animationFrame

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      if (typeof end === "string" && end.includes(".")) {
        // Handle decimal numbers like "4.9"
        const numericEnd = Number.parseFloat(end)
        setCount((numericEnd * progress).toFixed(1))
      } else if (typeof end === "string" && end.includes("%")) {
        // Handle percentages like "95%"
        const numericEnd = Number.parseInt(end)
        setCount(Math.floor(numericEnd * progress))
      } else {
        // Handle regular numbers like "200+"
        const numericEnd = Number.parseInt(end)
        setCount(Math.floor(numericEnd * progress))
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, startAnimation])

  return count
}

// Typewriter Hook
const useTypewriter = (text, speed = 100, startAnimation = false) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!startAnimation) return

    let timeout
    if (currentIndex < text.length) {
      // Typing phase
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)
    } else {
      // Pause before resetting
      timeout = setTimeout(() => {
        setDisplayText("")
        setCurrentIndex(0)
      }, 2000) // 1 second pause after completion
    }

    return () => clearTimeout(timeout)
  }, [currentIndex, text, speed, startAnimation])

  return displayText
}

// Creative Background Formulas Component
const BackgroundFormulas = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block" aria-hidden="true">
      {backgroundFormulas.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute text-white/15 font-mono ${item.size} font-medium select-none`}
          style={{
            top: item.position.top,
            left: item.position.left,
            right: item.position.right,
            transform: `rotate(${item.rotation}deg)`,
          }}
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.7,
            rotate: item.rotation - 10,
          }}
          animate={{
            opacity: [0, 0.12, 0.18, 0.12],
            y: [30, 0, -8, 0],
            scale: [0.7, 1, 1, 1],
            rotate: [item.rotation - 10, item.rotation, item.rotation + 3, item.rotation],
          }}
          transition={{
            duration: 10,
            delay: item.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          {item.formula}
        </motion.div>
      ))}

      {/* Creative Mathematical Symbols with varied positioning */}
      <motion.div
        className="absolute top-16 left-16 text-white/10 text-4xl font-light select-none hidden lg:block"
        style={{ transform: "rotate(-30deg)" }}
        animate={{
          rotate: [-30, 330],
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        ∫
      </motion.div>

      <motion.div
        className="absolute bottom-24 right-24 text-white/10 text-3xl font-light select-none hidden lg:block"
        style={{ transform: "rotate(45deg)" }}
        animate={{
          rotate: [45, 405],
          y: [-15, 15, -15],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        Σ
      </motion.div>

      <motion.div
        className="absolute top-1/3 left-8 text-white/10 text-2xl font-light select-none hidden xl:block"
        style={{ transform: "rotate(-45deg)" }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.18, 0.1],
          rotate: [-45, -45, -30, -45],
        }}
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        π
      </motion.div>

      <motion.div
        className="absolute top-2/3 right-12 text-white/10 text-2xl font-light select-none hidden xl:block"
        style={{ transform: "rotate(60deg)" }}
        animate={{
          rotate: [60, 420],
          scale: [1, 1.1, 1],
          x: [-5, 5, -5],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        ∆
      </motion.div>

      <motion.div
        className="absolute top-7 left-1/2 text-white/10 text-xl font-light select-none hidden lg:block"
        style={{ transform: "rotate(-20deg)" }}
        animate={{
          rotate: [-20, 340],
          y: [-8, 8, -8],
          opacity: [0.1, 0.16, 0.1],
        }}
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        ∞
      </motion.div>

      {/* <motion.div
        className="absolute top-1/4 right-3/5 text-white/8 text-lg font-light select-none hidden xl:block"
        style={{ transform: "rotate(35deg)" }}
        animate={{
          rotate: [35, 395],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 16,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        √
      </motion.div> */}
    </div>
  )
}

// Animated Counter Component
const AnimatedCounter = ({ end, label, icon: Icon, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const count = useCounter(end, 2000, isInView)

  return (
    <motion.div
      ref={ref}
      className="text-center group cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-900/50 to-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:from-teal-800/60 group-hover:to-blue-800/60">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-teal-400" />
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white mb-1">
        {typeof end === "string" && end.includes(".")
          ? `${count}/5`
          : typeof end === "string" && end.includes("%")
            ? `${count}%`
            : `${count}+`}
      </div>
      <div className="text-xs sm:text-sm text-slate-400 font-medium">{label}</div>
    </motion.div>
  )
}

const ModernHeroSection = () => {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const controls = useAnimation()
  const headlineRef = useRef(null)
  const isHeadlineInView = useInView(headlineRef, { once: true })
  const { user, loading } = useAuth()

  const typewriterText = useTypewriter("Mentorship by IITians", 150, isHeadlineInView)

  useEffect(() => {
    setIsVisible(true)
    controls.start("visible")

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [controls])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const mentorAvatars = [
    { name: "Rahul K.", iit: "IIT Delhi", subject: "Physics" },
    { name: "Priya S.", iit: "IIT Bombay", subject: "Chemistry" },
    { name: "Arjun M.", iit: "IIT Madras", subject: "Mathematics" },
    { name: "Sneha R.", iit: "IIT Kanpur", subject: "Physics" },
  ]

  const trustIndicators = [
    { icon: Users, label: "200+ IIT Graduates", value: "200", delay: 0.2 },
    { icon: Trophy, label: "Success Stories", value: "1000", delay: 0.4 },
    { icon: Star, label: "Average Rating", value: "4.9", delay: 0.6 },
    { icon: Award, label: "JEE Selections", value: "95", delay: 0.8 },
  ]

  const handleStartJourney = () => {
    if (loading) return // Prevent action while loading
    
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <section className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-teal-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-500/15 to-teal-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Creative Background Formulas - Desktop Only */}
      <BackgroundFormulas />

      {/* Magnetic Cursor Effect */}
      {/* <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-teal-400 to-yellow-400 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x ,
          y: mousePosition.y ,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      /> */}

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Logo Section */}
        <motion.div
          className="mb-8 sm:mb-12"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div animate="animate" className="mb-2 mt-8">
            <Logo size="2xl" variant="gradient" className="drop-shadow-2xl" />
          </motion.div>
        </motion.div>

        {/* Main Headline with Typewriter Effect */}
        <motion.div className="mb-8 sm:mb-12" variants={itemVariants} ref={headlineRef}>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4"
            variants={itemVariants}
          >
            <span className="block bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent min-h-[1.2em]">
              {typewriterText}
              <motion.span
                className="inline-block w-1 h-[0.8em] bg-yellow-400 ml-2"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              />
            </span>
            <span className="block text-white mt-2">to lift your JEE preparation</span>
          </motion.h2>
        </motion.div>

        {/* Supporting Text */}
        <motion.p
          className="text-lg sm:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12 sm:mb-16"
          variants={itemVariants}
        >
          Get personalized guidance from top IIT graduates who understand your journey. Our expert mentors provide
          strategic study plans, exam strategies, and continuous support to accelerate your JEE success.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-16 sm:mb-8" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleStartJourney}
              disabled={loading}
              variant="primary"
              size="lg"
              className="group relative overflow-hidden bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 text-lg font-semibold shadow-xl shadow-slate-900/50 border border-slate-600 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center">
                <Target className="mr-2 h-5 w-5" />
                {loading ? "Loading..." : "Start Your Journey"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />}
              </span>

              {/* Subtle animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-500/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
        </motion.div>
         {/* Social Media Icons */}
          <motion.div className="flex items-center justify-center gap-6 mb-16 sm:mb-16" variants={itemVariants}>
            {/* YouTube Icon */}
            <motion.a
              href="https://youtube.com/@jee_elevate" // Replace with your actual YouTube channel
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-red-500/50 transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Visit our YouTube Channel"
            >
              {/* YouTube SVG Icon */}
              <svg
                className="w-7 h-7 text-slate-400 group-hover:text-red-500 transition-colors duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>

              {/* Hover Shadow Effect */}
              <div className="absolute inset-0 rounded-full bg-red-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10" />

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-slate-700 shadow-lg">
                Visit our YouTube Channel
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            </motion.a>

            {/* Telegram Icon */}
            <motion.a
              href="https://t.me/JEE_Elevate" // Replace with your actual Telegram group
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Join our Telegram Group"
            >
              {/* Telegram SVG Icon */}
              <svg
                className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>

              {/* Hover Shadow Effect */}
              <div className="absolute inset-0 rounded-full bg-blue-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10" />

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-slate-700 shadow-lg">
                Join our Telegram Group
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            </motion.a>
          </motion.div>
        {/* Trust Indicators with Counter Animation */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-4xl mx-auto"
          variants={itemVariants}
        >
          {trustIndicators.map((indicator, index) => (
            <AnimatedCounter
              key={index}
              end={indicator.value}
              label={indicator.label}
              icon={indicator.icon}
              delay={indicator.delay}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Achievement Badges */}
      <motion.div
        className="absolute top-20 right-8 hidden lg:block"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 shadow-2xl">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Top Ranked Platform</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-slate-300">Trusted by 10,000+ students</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default ModernHeroSection
