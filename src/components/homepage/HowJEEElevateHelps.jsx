"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Users, BarChart3, Calendar, Sparkles, ArrowRight, CheckCircle, Video, Target } from "lucide-react"

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

// Feature Row Component
const FeatureRow = ({ feature, index, isReversed = false }) => {
  const rowRef = useRef(null)
  const isInView = useInView(rowRef, { once: true, margin: "-100px" })
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      ref={rowRef}
      className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
        isReversed ? "lg:flex-row-reverse" : ""
      } mb-16 lg:mb-20`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {/* Icon Section */}
      <motion.div
        className="flex-shrink-0"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-3xl flex items-center justify-center shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${feature.gradientColors[0]}, ${feature.gradientColors[1]})`,
          }}
          whileHover={{
            boxShadow: `0 25px 50px -12px ${feature.accentColor}40, 0 0 30px ${feature.accentColor}30`,
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {/* Icon glow effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl blur-xl opacity-0"
            style={{ backgroundColor: feature.accentColor }}
            animate={{
              opacity: isHovered ? 0.3 : 0,
              scale: isHovered ? 1.2 : 1,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Icon */}
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? [0, -10, 10, 0] : 0,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <feature.icon className="h-12 w-12 lg:h-16 lg:w-16 text-white relative z-10" />
          </motion.div>

          {/* Floating particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-5, -15, -5],
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Content Section */}
      <motion.div
        className="flex-1 text-center lg:text-left"
        initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isReversed ? 50 : -50 }}
        transition={{
          duration: 0.6,
          delay: index * 0.2 + 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <motion.div
          className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-slate-700/50 shadow-xl"
          whileHover={{
            scale: 1.03,
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            borderColor: "rgba(148, 163, 184, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(148, 163, 184, 0.1)",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Feature badge */}
          <motion.div
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{
              backgroundColor: `${feature.accentColor}20`,
              color: feature.accentColor,
              border: `1px solid ${feature.accentColor}30`,
            }}
            whileHover={{ scale: 1.05 }}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {feature.badge}
          </motion.div>

          {/* Feature title */}
          <motion.h3
            className="text-xl lg:text-2xl font-bold text-white mb-4 leading-tight"
            whileHover={{ color: feature.accentColor }}
            transition={{ duration: 0.2 }}
          >
            {feature.title}
          </motion.h3>

          {/* Feature description */}
          <motion.p className="text-slate-300 leading-relaxed text-base lg:text-lg mb-6">
            {feature.description}
          </motion.p>

          {/* Feature highlights */}
          <div className="space-y-2">
            {feature.highlights.map((highlight, i) => (
              <motion.div
                key={i}
                className="flex items-center text-sm text-slate-400"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: index * 0.2 + 0.4 + i * 0.1 }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full mr-3"
                  style={{ backgroundColor: feature.accentColor }}
                  whileHover={{ scale: 1.5 }}
                />
                {highlight}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const HowJEEElevateHelps = () => {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const bannerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  const isBannerInView = useInView(bannerRef, { once: true, margin: "-100px" })

  const { displayText: typewriterText, isComplete } = useTypewriter("HOW JEE ELEVATE HELPS", 100, isHeaderInView)

  const features = [
    {
      icon: Users,
      title: "Personalised Guidance by Expert Mentors",
      description:
        "Get personalised guidance based on your current status by experienced mentors from IITs and other Tier-1 colleges. Our mentors understand your journey and provide tailored strategies for success.",
      badge: "Expert Mentorship",
      accentColor: "#14b8a6",
      gradientColors: ["#14b8a6", "#0891b2"],
      highlights: [
        "One-on-one mentorship sessions",
        "Customized study plans based on your strengths",
        "Regular progress tracking and feedback",
      ],
    },
    {
      icon: Video,
      title: "Live Doubt Support for PCM",
      description:
        "Get your doubts solved instantly by subject experts live on Google Meet. No more waiting or accumulating doubts - get immediate clarification on Physics, Chemistry, and Mathematics concepts.",
      badge: "24/7 Support",
      accentColor: "#3b82f6",
      gradientColors: ["#3b82f6", "#1d4ed8"],
      highlights: [
        "Instant doubt resolution via video calls",
        "Subject-wise expert teachers available",
        "Interactive whiteboard sessions",
      ],
    },
    {
      icon: BarChart3,
      title: "CBT Tests with Detailed Analysis",
      description:
        "Take Computer-Based Tests with comprehensive analysis including Part Tests, Full Syllabus Tests, and more. Check your performance, track progress, and generate detailed test reports.",
      badge: "Performance Analytics",
      accentColor: "#f59e0b",
      gradientColors: ["#f59e0b", "#d97706"],
      highlights: [
        "JEE-pattern Computer Based Tests",
        "Detailed performance analytics",
        "Subject-wise and topic-wise analysis",
      ],
    },
    {
      icon: Calendar,
      title: "Weekly Strategy Calls",
      description:
        "Join weekly strategy calls to discuss your progress, create effective schedules, understand problems, and find the best solutions. Stay on track with regular guidance and motivation.",
      badge: "Strategic Planning",
      accentColor: "#8b5cf6",
      gradientColors: ["#8b5cf6", "#7c3aed"],
      highlights: [
        "Weekly progress review sessions",
        "Personalized study schedule creation",
        "Problem-solving and motivation support",
      ],
    },
  ]

  return (
    <section ref={sectionRef} className="relative py-20 bg-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 rounded-full blur-3xl"
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

        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <motion.div
          ref={bannerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isBannerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="inline-block bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-slate-600/50 shadow-2xl max-w-4xl mx-auto"
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              borderColor: "rgba(148, 163, 184, 0.3)",
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center justify-center mb-4"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-6 w-6 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-medium text-sm">Welcome to JEE Elevate</span>
            </motion.div>
            <motion.p
              className="text-xl lg:text-2xl text-slate-200 leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={isBannerInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              "At JEE Elevate, we've been where you are — we understand your struggles, and we're here to guide you
              through every step."
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          ref={headerRef}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 min-h-[1.2em]"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent">
              {typewriterText}
              {!isComplete && (
                <motion.span
                  className="inline-block w-1 h-[0.9em] bg-blue-400 ml-2"
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
            Comprehensive solutions designed specifically for JEE aspirants by those who've walked the same path.
          </motion.p>
        </motion.div>

        {/* Features */}
        <div className="space-y-8">
          {features.map((feature, index) => (
            <FeatureRow key={index} feature={feature} index={index} isReversed={index % 2 === 1} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full text-white font-medium shadow-xl"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px -12px rgba(20, 184, 166, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Target className="h-5 w-5 mr-2" />
            <span>Ready to transform your JEE preparation?</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowJEEElevateHelps
