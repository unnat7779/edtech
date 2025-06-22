"use client"

import { useEffect, useState } from "react"

export default function ConfettiEffect() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Generate confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      rotation: Math.random() * 360,
      color: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"][Math.floor(Math.random() * 5)],
      size: Math.random() * 8 + 4,
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 3 + 2,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }))

    setParticles(newParticles)

    // Animate particles
    const animateParticles = () => {
      setParticles((prev) =>
        prev
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

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 6px ${particle.color}50`,
          }}
        />
      ))}
    </div>
  )
}
