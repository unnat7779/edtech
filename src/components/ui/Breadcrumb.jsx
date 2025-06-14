"use client"

import { useRouter } from "next/navigation"
import { ChevronRight, Home, ArrowLeft } from "lucide-react"
import { useState } from "react"

const Breadcrumb = ({ items = [] }) => {
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const handleNavigation = (path) => {
    if (path) {
      router.push(path)
    }
  }

  const handleBack = () => {
    if (items.length > 1) {
      const previousItem = items[items.length - 2]
      if (previousItem.path) {
        router.push(previousItem.path)
      }
    } else {
      router.back()
    }
  }

  return (
    <div className="flex items-center justify-between w-full m-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-105 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Enhanced Breadcrumb */}
      <div className="flex items-center rounded-full px-4 py-2 border border-slate-700/50">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {/* Home Icon for first item */}
            {index === 0 && <Home className="h-4 w-4 mr-2 text-slate-400" />}

            {/* Breadcrumb Item */}
            {item.path ? (
              <button
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                  ${
                    index === items.length - 1
                      ? "text-cyan-400 bg-cyan-400/10 cursor-default"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-105"
                  }
                  ${hoveredIndex === index && index !== items.length - 1 ? "shadow-lg shadow-cyan-500/20" : ""}
                `}
                disabled={index === items.length - 1}
              >
                {item.label}

                {/* Hover Effect */}
                {hoveredIndex === index && index !== items.length - 1 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-md animate-pulse" />
                )}
              </button>
            ) : (
              <span
                className={`
                px-3 py-1.5 text-sm font-medium rounded-md
                ${index === items.length - 1 ? "text-cyan-40  bg-cyan-400/10" : "text-slate-300"}
              `}
              >
                {item.label}
              </span>
            )}

            {/* Separator */}
            {index < items.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2 text-slate-500 transition-colors duration-200" />
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center text-xs text-slate-500">
          {/* <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">Ctrl</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">←</kbd>
          <span className="ml-2">to go back</span> */}
        </div>
      </div>
    </div>
  )
}

export default Breadcrumb
