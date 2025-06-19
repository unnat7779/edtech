"use client"

import { useRouter, usePathname } from "next/navigation"
import { ChevronRight, Home, ArrowLeft, BarChart3, Users, FileText, Settings } from "lucide-react"
import { useState, useEffect } from "react"

const SmartBreadcrumb = ({ testData = null, customOverride = null }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateSmartBreadcrumbs()
  }, [pathname, testData])

  const generateSmartBreadcrumbs = async () => {
    if (customOverride) {
      setBreadcrumbs(customOverride)
      setLoading(false)
      return
    }

    const segments = pathname.split("/").filter(Boolean)
    const crumbs = [{ label: "Home", path: "/", icon: Home }]

    try {
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        const fullPath = "/" + segments.slice(0, i + 1).join("/")

        switch (segment) {
          case "admin":
            crumbs.push({
              label: "Admin Dashboard",
              path: "/admin",
              icon: Settings,
            })
            break

          case "analytics":
            if (segments[i - 1] === "admin") {
              crumbs.push({
                label: "Analytics Hub",
                path: "/admin/analytics",
                icon: BarChart3,
              })
            }
            break

          case "test":
            if (segments[i - 1] === "analytics" && segments[i + 1]) {
              const testId = segments[i + 1]
              const testName = testData?.title || (await fetchTestName(testId))
              crumbs.push({
                label: "Test Analytics",
                path: `/admin/analytics/test/${testId}`,
                subtitle: testName,
                icon: FileText,
              })
            }
            break

          case "tests":
            if (segments[i - 1] === "admin") {
              crumbs.push({
                label: "Test Management",
                path: "/admin/tests",
                icon: FileText,
              })
            }
            break

          case "students":
            if (segments[i - 1] === "analytics") {
              crumbs.push({
                label: "Student Analytics",
                path: "/admin/analytics/students",
                icon: Users,
              })
            }
            break

          case "global":
            if (segments[i - 1] === "analytics") {
              crumbs.push({
                label: "Global Analytics",
                path: "/admin/analytics/global",
                icon: BarChart3,
              })
            }
            break

          case "feedbacks":
            crumbs.push({
              label: "Feedback Management",
              path: "/admin/feedbacks",
            })
            break

          case "announcements":
            crumbs.push({
              label: "Announcements",
              path: "/admin/announcements",
            })
            break

          default:
            // Skip MongoDB ObjectIds and other technical segments
            if (!segment.match(/^[0-9a-fA-F]{24}$/)) {
              const isLast = i === segments.length - 1
              if (isLast) {
                crumbs.push({
                  label: formatSegmentName(segment),
                  path: fullPath,
                })
              }
            }
            break
        }
      }

      setBreadcrumbs(crumbs)
    } catch (error) {
      console.error("Error generating breadcrumbs:", error)
      setBreadcrumbs(crumbs)
    } finally {
      setLoading(false)
    }
  }

  const fetchTestName = async (testId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        return data.test?.title || "Test"
      }
    } catch (error) {
      console.error("Error fetching test name:", error)
    }
    return "Test"
  }

  const formatSegmentName = (segment) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getSmartBackPath = () => {
    if (breadcrumbs.length > 1) {
      return breadcrumbs[breadcrumbs.length - 2].path
    }

    // Fallback logic
    if (pathname.includes("/admin/analytics/test/")) return "/admin/tests"
    if (pathname.includes("/admin/analytics/")) return "/admin"
    if (pathname.includes("/admin/")) return "/"
    return "/"
  }

  const handleNavigation = (path) => {
    if (path) router.push(path)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-between w-full mb-6">
        <div className="h-10 w-20 bg-slate-700/50 rounded animate-pulse"></div>
        <div className="h-10 w-96 bg-slate-700/50 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-slate-700/50 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full mb-6">
      {/* Smart Back Button */}
      <button
        onClick={() => router.push(getSmartBackPath())}
        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-105 group border border-slate-700/50"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="hidden sm:inline font-medium">
          {breadcrumbs.length > 1 ? `Back to ${breadcrumbs[breadcrumbs.length - 2].label}` : "Back"}
        </span>
      </button>

      {/* Dynamic Breadcrumb Trail */}
      <div className="flex items-center bg-slate-800/30 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50 shadow-lg">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {/* Icon for first item or special items */}
            {crumb.icon && (
              <crumb.icon
                className={`h-4 w-4 mr-2 ${
                  index === 0 ? "text-slate-400" : index === breadcrumbs.length - 1 ? "text-cyan-400" : "text-slate-500"
                }`}
              />
            )}

            {/* Breadcrumb Content */}
            <div className="flex flex-col">
              {crumb.path && index < breadcrumbs.length - 1 ? (
                <button
                  onClick={() => handleNavigation(crumb.path)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-105"
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    index === breadcrumbs.length - 1 ? "text-cyan-400 bg-cyan-400/10 font-semibold" : "text-slate-300"
                  }`}
                >
                  {crumb.label}
                </span>
              )}

              {/* Subtitle for current page */}
              {crumb.subtitle && index === breadcrumbs.length - 1 && (
                <span className="text-xs text-slate-500 px-3 truncate max-w-48 mt-0.5">{crumb.subtitle}</span>
              )}
            </div>

            {/* Separator */}
            {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 mx-3 text-slate-500" />}
          </div>
        ))}
      </div>

      {/* Quick Actions Hint */}
      <div className="hidden lg:flex items-center text-xs text-slate-500 bg-slate-800/30 rounded-lg px-3 py-2 border border-slate-700/50">
        <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-400 border border-slate-600">Alt</kbd>
        <span className="mx-1">+</span>
        <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-400 border border-slate-600">←</kbd>
        <span className="ml-2">Quick back</span>
      </div>
    </div>
  )
}

export default SmartBreadcrumb
