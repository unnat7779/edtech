"use client"

import { useEffect, useState } from "react"

export default function ConfettiAnimation() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Create confetti particles
    const newParticles = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        rotation: Math.random() * 360,
        color: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"][Math.floor(Math.random() * 6)],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 3 + 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      })
    }
    setParticles(newParticles)

    // Animate particles
    const animateParticles = () => {
      setParticles((prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.speedX,
            y: particle.y + particle.speedY,
            rotation: particle.rotation + particle.rotationSpeed,
            speedY: particle.speedY + 0.1, // gravity
          }))
          .filter((particle) => particle.y < window.innerHeight + 20),
      )
    }

    const interval = setInterval(animateParticles, 16) // ~60fps

    // Clean up after 3 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setParticles([])
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            transition: "none",
          }}
        />
      ))}

      {/* Success Message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">Welcome aboard! 🎉</h3>
              <p className="text-green-100">Your account has been created successfully</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
