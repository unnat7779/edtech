"use client"

import { useState, useEffect, useRef } from "react"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Arjun Sharma",
    city: "Delhi",
    rating: 5,
    text: "JEE Elevate's personalized guidance helped me crack JEE Advanced with AIR 247. The mentors from IIT really understand what it takes!",
    image: null, // No image to test initials
  },
  {
    id: 2,
    name: "Priya Patel",
    city: "Mumbai",
    rating: 5,
    text: "The live doubt sessions are amazing! Got my chemistry doubts cleared instantly during late night study sessions. Highly recommend!",
    image: null,
  },
  {
    id: 3,
    name: "Rohit Kumar",
    city: "Bangalore",
    rating: 4,
    text: "CBT tests with detailed analysis helped me identify my weak areas. Improved my score by 40 marks in just 2 months!",
    image: null, // No image to test initials
  },
  {
    id: 4,
    name: "Sneha Reddy",
    city: "Hyderabad",
    rating: 5,
    text: "Weekly strategy calls kept me motivated and on track. The mentors helped me create a perfect study schedule for JEE preparation.",
    image: null,
  },
  {
    id: 5,
    name: "Vikash Singh",
    city: "Patna",
    rating: 5,
    text: "From struggling with physics to scoring 98 percentile! JEE Elevate's approach is simply outstanding. Thank you team!",
    image: null, // No image to test initials
  },
  {
    id: 6,
    name: "Ananya Gupta",
    city: "Kolkata",
    rating: 4,
    text: "The AI-powered tests adapt to my level perfectly. Each test feels challenging yet achievable. Great platform for JEE prep!",
    image: null,
  },
  {
    id: 7,
    name: "Karthik Nair",
    city: "Chennai",
    rating: 5,
    text: "Best investment for JEE preparation! The mentors are incredibly supportive and the study material is top-notch.",
    image: null, // No image to test initials
  },
  {
    id: 8,
    name: "Ishita Jain",
    city: "Jaipur",
    rating: 5,
    text: "JEE Elevate made my dream of getting into IIT come true. The comprehensive approach covers everything you need for success!",
    image: null,
  },
]

const TestimonialCard = ({ testimonial, isPaused }) => {
  const [isHovered, setIsHovered] = useState(false)

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`
          h-4 w-4 transition-colors duration-300
          ${index < rating ? "text-amber-400 fill-amber-400" : "text-gray-500"}
        `}
      />
    ))
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
      "from-red-500 to-red-600",
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <div
      className={`
        relative flex-shrink-0 w-80 sm:w-96 mx-4 p-6 rounded-2xl cursor-pointer
        transition-all duration-300 ease-out
        ${
          isHovered
            ? "bg-slate-700 border border-teal-500/60 shadow-xl shadow-teal-500/20 transform scale-102"
            : "bg-slate-800/80 border border-slate-700 shadow-lg shadow-black/20"
        }
        hover:bg-slate-700 hover:border-teal-500/60 hover:shadow-xl hover:shadow-teal-500/20 hover:scale-102
        focus:bg-slate-700 focus:border-teal-500/60 focus:shadow-xl focus:shadow-teal-500/20 focus:scale-102
        focus:outline-none focus:ring-2 focus:ring-teal-400/50
        backdrop-blur-sm
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="article"
      aria-label={`Testimonial from ${testimonial.name}`}
    >
      {/* Quote Icon Background */}
      <div
        className={`
          absolute top-4 right-4 transition-all duration-300
          ${isHovered ? "opacity-25 text-teal-400" : "opacity-15 text-gray-500"}
        `}
      >
        <Quote className="h-8 w-8" />
      </div>

      {/* Student Info */}
      <div className="flex items-center mb-4">
        <div className="relative">
          {testimonial.image ? (
            <img
              src={testimonial.image || "/placeholder.svg"}
              alt={testimonial.name}
              className={`
                h-12 w-12 rounded-full object-cover shadow-md border-2 transition-all duration-300
                ${isHovered ? "border-teal-400 shadow-teal-400/50" : "border-slate-600"}
              `}
            />
          ) : (
            <div
              className={`
                h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-sm
                bg-gradient-to-br ${getAvatarColor(testimonial.name)} shadow-md border-2 transition-all duration-300
                ${isHovered ? "border-teal-400 shadow-teal-400/50 scale-105" : "border-slate-600"}
              `}
            >
              {getInitials(testimonial.name)}
            </div>
          )}
          <div
            className={`
              absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 transition-all duration-300
              ${isHovered ? "bg-teal-400 border-slate-700 shadow-sm shadow-teal-400/50" : "bg-teal-500 border-slate-800"}
            `}
          />
        </div>
        <div className="ml-4">
          <h4
            className={`
              font-semibold text-lg transition-colors duration-300
              ${isHovered ? "text-white" : "text-gray-200"}
            `}
          >
            {testimonial.name}
          </h4>
          <p
            className={`
              text-sm font-medium transition-colors duration-300
              ${isHovered ? "text-teal-400" : "text-gray-400"}
            `}
          >
            {testimonial.city}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4">
        <div className="flex space-x-1">{renderStars(testimonial.rating)}</div>
        <span
          className={`
            ml-2 text-sm font-medium transition-colors duration-300
            ${isHovered ? "text-amber-400" : "text-gray-400"}
          `}
        >
          {testimonial.rating}.0
        </span>
      </div>

      {/* Testimonial Text */}
      <p
        className={`
          leading-relaxed text-sm transition-colors duration-300
          ${isHovered ? "text-gray-200" : "text-gray-300"}
        `}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        "{testimonial.text}"
      </p>
    </div>
  )
}

export default function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const scrollRef = useRef(null)
  const animationRef = useRef(null)

  const [isManualMode, setIsManualMode] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [animationStartTime, setAnimationStartTime] = useState(Date.now())

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  // Calculate current position based on time
  const getCurrentAnimationOffset = () => {
    if (isManualMode) return currentOffset

    const elapsed = (Date.now() - animationStartTime) / 1000
    const duration = 35 // 35 seconds for full cycle
    const progress = (elapsed % duration) / duration
    const maxOffset = -(testimonials.length * 400) // Total width of original testimonials

    return maxOffset * progress
  }

  const handleMouseMove = (e) => {
    if (!scrollRef.current || !isManualMode) return

    const rect = scrollRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const containerWidth = rect.width
    const maxOffset = -(testimonials.length * 400)

    // Convert mouse position to scroll offset
    const scrollPercent = mouseX / containerWidth
    const newOffset = maxOffset * scrollPercent

    setCurrentOffset(Math.max(maxOffset, Math.min(0, newOffset)))
  }

  const handleMouseEnter = () => {
    // Capture current animation position when entering manual mode
    const currentAnimationOffset = getCurrentAnimationOffset()
    setCurrentOffset(currentAnimationOffset)
    setIsManualMode(true)
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    // Resume animation from current manual position
    const now = Date.now()
    const maxOffset = -(testimonials.length * 400)
    const progress = Math.abs(currentOffset / maxOffset)
    const duration = 35

    // Calculate new start time to continue from current position
    const newStartTime = now - progress * duration * 1000
    setAnimationStartTime(newStartTime)

    setIsManualMode(false)
    setIsPaused(false)
  }

  const handleFocus = () => {
    const currentAnimationOffset = getCurrentAnimationOffset()
    setCurrentOffset(currentAnimationOffset)
    setIsManualMode(true)
    setIsPaused(true)
  }

  const handleBlur = () => {
    const now = Date.now()
    const maxOffset = -(testimonials.length * 400)
    const progress = Math.abs(currentOffset / maxOffset)
    const duration = 35

    const newStartTime = now - progress * duration * 1000
    setAnimationStartTime(newStartTime)

    setIsManualMode(false)
    setIsPaused(false)
  }

  // Update animation offset in real-time
  useEffect(() => {
    if (isManualMode) return

    const updateOffset = () => {
      setCurrentOffset(getCurrentAnimationOffset())
      animationRef.current = requestAnimationFrame(updateOffset)
    }

    animationRef.current = requestAnimationFrame(updateOffset)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isManualMode, animationStartTime])

  return (
    <section className="py-16 sm:py-20 bg-slate-900 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Background Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`
            text-center mb-12 sm:mb-16 transition-all duration-700 delay-200
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Students Say
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Hear from JEE aspirants who transformed their preparation journey with JEE Elevate
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div
          className={`
            relative transition-all duration-1000 delay-500
            ${isVisible ? "opacity-100" : "opacity-0"}
          `}
        >
          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            className="relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ cursor: isManualMode ? "grab" : "default" }}
          >
            <div
              className="flex items-center transition-transform duration-100 ease-linear"
              style={{
                transform: `translateX(${currentOffset}px)`,
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} isPaused={isPaused} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        {/* <div className="text-center mt-8 sm:hidden">
          <p className="text-sm text-gray-400">👆 Tap and hold to pause • Swipe to explore more</p>
        </div> */}

        {/* Desktop Interaction Hint */}
        {/* <div className="text-center mt-8 hidden sm:block">
          <p className="text-sm text-gray-400">Move cursor over testimonials to control • Hover to pause and read</p>
        </div> */}
      </div>

      <style jsx>{`
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </section>
  )
}
