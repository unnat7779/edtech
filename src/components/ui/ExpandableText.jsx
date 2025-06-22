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

  return (
    <div className="space-y-2">
      <p className={className}>{expanded ? text : `${text.slice(0, maxLength)}...`}</p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1 font-medium"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3 w-3" />
            {showLessText}
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            {showMoreText}
          </>
        )}
      </button>
    </div>
  )
}
