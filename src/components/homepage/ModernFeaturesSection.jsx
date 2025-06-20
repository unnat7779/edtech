"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Calendar, MessageCircle, BarChart3, ArrowRight, Sparkles, Zap, Target } from "lucide-react"
import Button from "@/components/ui/Button"

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
const useTypewriter = (text, speed = 100, startAnimation = false) => {
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

// Feature Card Component with advanced animations
const FeatureCard = ({ feature, index, mousePosition }) => {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [cardBounds, setCardBounds] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseXPercent = (e.clientX - centerX) / (rect.width / 2)
    const mouseYPercent = (e.clientY - centerY) / (rect.height / 2)

    mouseX.set(mouseXPercent)
    mouseY.set(mouseYPercent)
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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        className="relative h-full bg-slate-800/90 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 shadow-xl overflow-hidden cursor-pointer"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          scale: 1.02,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderColor: "rgba(148, 163, 184, 0.3)",
          boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(148, 163, 184, 0.1)",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Holographic border effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(71, 85, 105, 0.2))",
            padding: "1px",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
          }}
        />

        {/* Gradient background shift */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(148, 163, 184, 0.2), transparent 50%)`,
          }}
        />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-slate-500/20 rounded-full"
              style={{
                left: `${30 + i * 20}%`,
                top: `${40 + (i % 2) * 20}%`,
              }}
              animate={{
                y: [-5, -15, -5],
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Icon container with advanced animations */}
        <motion.div
          className="relative z-10 mb-6"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 border border-slate-600"
            whileHover={{
              backgroundColor: "rgb(51, 65, 85)",
              borderColor: "rgb(148, 163, 184)",
              boxShadow: "0 0 20px rgba(148, 163, 184, 0.2)",
            }}
          >
            <feature.icon className="h-8 w-8 text-slate-300 group-hover:text-white transition-colors duration-300" />
          </motion.div>

          {/* Icon glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
            animate={{
              scale: isHovered ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Text content with reveal animations */}
        <div className="relative z-10">
          <motion.h3
            className="text-xl font-bold text-white mb-4 group-hover:text-slate-100 transition-colors duration-300"
            style={{ transform: "translateZ(20px)" }}
          >
            {feature.title}
          </motion.h3>

          <motion.p
            className="text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors duration-300"
            style={{ transform: "translateZ(10px)" }}
          >
            {feature.description}
          </motion.p>

          {/* CTA Button with liquid morph effect */}
          {/* <motion.div className="relative overflow-hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="group/btn relative bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-400 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
          </motion.div> */}
        </div>

        {/* Sparkle effects */}
        <motion.div
          className="absolute top-4 right-4 text-slate-500/50 group-hover:text-slate-400/70"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const ModernFeaturesSection = () => {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  const mousePosition = useMagneticCursor()

  const { displayText: typewriterText, isComplete } = useTypewriter(
    "Built by IITians. Designed for Rankers.",
    80,
    isHeaderInView,
  )

  const features = [
    {
      icon: Calendar,
      title: "Personalised Weekly Plans for Every Student",
      description:
        "AI-powered study schedules tailored to your learning pace, strengths, and target goals. Get customized weekly plans that adapt to your progress and optimize your JEE preparation journey.",
      color: "from-teal-600 to-blue-600",
    },
    {
      icon: MessageCircle,
      title: "Real-Time Doubt Solving Support",
      description:
        "Connect instantly with expert IIT mentors for immediate doubt resolution. Get step-by-step explanations, concept clarity, and strategic guidance whenever you need it, 24/7.",
      color: "from-blue-600 to-purple-600",
    },
    {
      icon: BarChart3,
      title: "Weekly Tests and Performance Reviews",
      description:
        "Comprehensive JEE-pattern mock tests with detailed analytics. Track your progress, identify weak areas, and get personalized recommendations to boost your rank and performance.",
      color: "from-purple-600 to-pink-600",
    },
  ]

  return (
    <section ref={sectionRef} className="relative py-20 bg-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-teal-600/10 to-blue-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-yellow-500/10 to-teal-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-4 h-4 border border-teal-400/30 rotate-45"
          animate={{
            rotate: [45, 225, 45],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-gradient-to-r from-yellow-400/20 to-teal-400/20 rounded-full"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with Typewriter Effect */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div className="mb-4">
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-900/50 to-blue-900/50 rounded-full border border-teal-700/50 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Zap className="h-4 w-4 text-teal-400 mr-2" />
              <span className="text-sm font-medium text-teal-300">Premium Features</span>
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 min-h-[1.2em]"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent">
              {typewriterText}
              {!isComplete && (
                <motion.span
                  className="inline-block w-1 h-[0.9em] bg-yellow-400 ml-2"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: isComplete ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Experience the perfect blend of IIT expertise and cutting-edge technology designed specifically for JEE
            toppers.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} mousePosition={mousePosition} />
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {/* <Button
              variant="primary"
              size="lg"
              className="group relative overflow-hidden bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 text-lg font-semibold shadow-xl shadow-slate-900/50 border border-slate-600 hover:border-slate-400"
            >
              <span className="relative z-10 flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span> */}

              {/* Subtle animated background */}
              {/* <motion.div
                className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-500/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              /> */}
            {/* </Button> */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default ModernFeaturesSection
