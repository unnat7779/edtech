"use client"

import Image from "next/image"

// Simple className utility function since we're having issues with the import
const cn = (...classes) => classes.filter(Boolean).join(" ")

const Logo = ({ size = "md", showText = true, className = "", variant = "default", onClick = null }) => {
  const sizes = {
    xs: { logo: "h-6 w-6", text: "text-sm" },
    sm: { logo: "h-8 w-8", text: "text-base" },
    md: { logo: "h-10 w-10", text: "text-lg" },
    lg: { logo: "h-12 w-12", text: "text-xl" },
    xl: { logo: "h-16 w-16", text: "text-2xl" },
    "2xl": { logo: "h-20 w-20", text: "text-3xl" },
  }

  const variants = {
    default: "text-white",
    light: "text-slate-900",
    gradient: "bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent",
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  return (
    <div
      className={cn("flex items-center gap-3 cursor-pointer transition-all duration-300 ", className)}
      onClick={handleClick}
    >
      <div className={cn("relative", sizes[size].logo)}>
        <Image
          src="/logo.png"
          alt="JEEElevate Logo"
          fill
          className="object-contain drop-shadow-lg"
          priority
          style={{ backgroundColor: "transparent" }}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight leading-none", sizes[size].text, variants[variant])}>
            JEEElevate
          </span>
          <span
            className={cn(
              "text-xs font-medium opacity-80 leading-none mt-0.5",
              variant === "light" ? "text-slate-600" : "text-slate-400",
            )}
          >
            Let's Ace JEE Together
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
