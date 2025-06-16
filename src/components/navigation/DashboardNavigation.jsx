"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Home, BarChart3, FileText, BookOpen, User, ChevronRight, Activity } from "lucide-react"

export default function DashboardNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState(null)

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: Home,
      path: "/dashboard",
      description: "Dashboard overview and quick stats",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/dashboard#analytics",
      description: "Test performance analytics",
    },
    {
      id: "activity",
      label: "Activity",
      icon: Activity,
      path: "/dashboard#activity",
      description: "Activity heatmap and streaks",
    },
    {
      id: "tests",
      label: "Tests",
      icon: FileText,
      path: "/tests",
      description: "Available tests and history",
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: BookOpen,
      path: "/book-session",
      description: "Book doubt sessions",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile",
      description: "Manage your profile",
    },
  ]

  const handleNavigation = (item) => {
    if (item.path.includes("#")) {
      const [path, hash] = item.path.split("#")
      if (pathname === path) {
        // Same page, just scroll to section
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        // Different page, navigate then scroll
        router.push(item.path)
      }
    } else {
      router.push(item.path)
    }
  }

  const isActive = (item) => {
    if (item.path.includes("#")) {
      const [path] = item.path.split("#")
      return pathname === path
    }
    return pathname === item.path
  }

  return (
    <div className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-1 py-4 overflow-x-auto scrollbar-hide">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <div key={item.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => handleNavigation(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                   relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                   transition-all duration-200 ease-in-out whitespace-nowrap
                   ${
                     active
                       ? "bg-teal-500/20 text-teal-400 shadow-lg shadow-teal-500/10"
                       : "text-slate-300 hover:text-slate-100 hover:bg-slate-700/50"
                   }
                   ${hoveredItem === item.id ? "scale-105 transform" : ""}
                 `}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors duration-200 ${active ? "text-teal-400" : "text-slate-400"}`}
                  />
                  <span className="hidden sm:inline">{item.label}</span>

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full" />
                  )}

                  {/* Hover tooltip */}
                  {hoveredItem === item.id && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-xl z-50 whitespace-nowrap">
                      <div className="text-xs text-slate-300">{item.description}</div>
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 border-l border-t border-slate-700/50 rotate-45" />
                    </div>
                  )}
                </button>

                {/* Separator */}
                {index < navigationItems.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-slate-600 mx-1 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
