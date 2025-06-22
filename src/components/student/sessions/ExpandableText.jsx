"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function ExpandableText({
  text,
  maxLength = 100,
  className = "",
  showMoreText = "Show more",
  showLessText = "Show less",
}) {
  const [expanded, setExpanded] = useState(false)

  if (!text || text.length <= maxLength) {
    return <p className={className}>{text}</p>
  }

  const truncatedText = text.slice(0, maxLength)
  const remainingText = text.slice(maxLength)

  return (
    <div className="space-y-2">
      <p className={className}>
        {truncatedText}
        {!expanded && <span className="text-slate-500">...</span>}
        {expanded && <span className="animate-fade-in">{remainingText}</span>}
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3 w-3 transition-transform duration-200" />
            {showLessText}
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 transition-transform duration-200" />
            {showMoreText}
          </>
        )}
      </button>
    </div>
  )
}
