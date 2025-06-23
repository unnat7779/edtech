"use client"

import { useRouter, usePathname } from "next/navigation"
import { ChevronRight, Home, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"

const Breadcrumb = ({ items = [], customItems = null }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [dynamicItems, setDynamicItems] = useState([])

  useEffect(() => {
    if (customItems) {
      setDynamicItems(customItems)
    } else if (items.length === 0) {
      // Generate dynamic breadcrumbs based on current path
      generateDynamicBreadcrumbs()
    } else {
      setDynamicItems(items)
    }
  }, [pathname, items, customItems])

  const generateDynamicBreadcrumbs = async () => {
    const pathSegments = pathname.split("/").filter((segment) => segment !== "")
    const breadcrumbs = [{ label: "Home", path: "/", icon: Home }]

    let currentPath = ""

    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`
      const segment = pathSegments[i]

      // Handle different route patterns
      if (segment === "admin") {
        breadcrumbs.push({ label: "Admin Dashboard", path: "/admin" })
      } else if (segment === "analytics") {
        if (pathSegments[i - 1] === "admin") {
          breadcrumbs.push({ label: "Analytics", path: "/admin/analytics" })
        }
      } else if (segment === "test" && pathSegments[i - 1] === "analytics") {
        // For test analytics, we need to fetch test name
        const testId = pathSegments[i + 1]
        if (testId) {
          try {
            const testName = await fetchTestName(testId)
            breadcrumbs.push({
              label: "Test Analytics",
              path: `/admin/analytics/test/${testId}`,
              subtitle: testName,
            })
          } catch (error) {
            breadcrumbs.push({ label: "Test Analytics", path: currentPath })
          }
        }
      } else if (segment === "tests") {
        if (pathSegments[i - 1] === "admin") {
          breadcrumbs.push({ label: "Tests", path: "/admin/tests" })
        }
      } else if (segment === "students" && pathSegments[i - 1] === "analytics") {
        breadcrumbs.push({ label: "Student Analytics", path: "/admin/analytics/students" })
      } else if (segment === "global" && pathSegments[i - 1] === "analytics") {
        breadcrumbs.push({ label: "Global Analytics", path: "/admin/analytics/global" })
      } else if (segment === "retention" && pathSegments[i - 1] === "analytics") {
        breadcrumbs.push({ label: "Retention Analytics", path: "/admin/analytics/retention" })
      } else if (segment === "feedbacks") {
        breadcrumbs.push({ label: "Feedback Management", path: "/admin/feedbacks" })
      } else if (segment === "announcements") {
        breadcrumbs.push({ label: "Announcements", path: "/admin/announcements" })
      } else if (segment.match(/^[0-9a-fA-F]{24}$/)) {
        // This is likely a MongoDB ObjectId, skip it or handle specially
        continue
      } else if (i === pathSegments.length - 1 && !segment.match(/^[0-9a-fA-F]{24}$/)) {
        // Last segment that's not an ID
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
          path: currentPath,
        })
      }
    }

    setDynamicItems(breadcrumbs)
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

  const handleNavigation = (path) => {
    if (path) {
      router.push(path)
    }
  }

  const handleBack = () => {
    if (dynamicItems.length > 1) {
      const previousItem = dynamicItems[dynamicItems.length - 2]
      if (previousItem.path) {
        router.push(previousItem.path)
      }
    } else {
      router.back()
    }
  }

  const getSmartBackPath = () => {
    // Determine the most logical back path based on current route
    if (pathname.includes("/admin/analytics/test/")) {
      return "/admin/tests"
    } else if (pathname.includes("/admin/analytics/students/")) {
      return "/admin/analytics"
    } else if (pathname.includes("/admin/analytics/")) {
      return "/admin"
    } else if (pathname.includes("/admin/tests/")) {
      return "/admin"
    } else if (pathname.includes("/admin/")) {
      return "/"
    }
    return null
  }

  const smartBackPath = getSmartBackPath()

  return (
    <div className="flex items-center justify-between w-full mb-6">
      {/* Smart Back Button */}
      <button
        onClick={() => (smartBackPath ? router.push(smartBackPath) : router.back())}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-105 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="hidden sm:inline">
          {smartBackPath === "/admin/tests"
            ? "Back to Tests"
            : smartBackPath === "/admin/analytics"
              ? "Back to Analytics"
              : smartBackPath === "/admin"
                ? "Back to Dashboard"
                : smartBackPath === "/"
                  ? "Back to Home"
                  : "Back"}
        </span>
      </button>

      {/* Enhanced Dynamic Breadcrumb */}
      <div className="flex items-center bg-slate-800/30 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50">
        {dynamicItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {/* Home Icon for first item */}
            {index === 0 && item.icon && <item.icon className="h-4 w-4 mr-2 text-slate-400" />}

            {/* Breadcrumb Item */}
            <div className="flex flex-col">
              {item.path && index < dynamicItems.length - 1 ? (
                <button
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                    text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-105
                    ${hoveredIndex === index ? "shadow-lg shadow-cyan-500/20" : ""}
                  `}
                >
                  {item.label}
                  {/* Hover Effect */}
                  {hoveredIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-md animate-pulse" />
                  )}
                </button>
              ) : (
                <span
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    index === dynamicItems.length - 1 ? "text-cyan-400 bg-cyan-400/10" : "text-slate-300"
                  }`}
                >
                  {item.label}
                </span>
              )}

              {/* Subtitle for current page */}
              {item.subtitle && index === dynamicItems.length - 1 && (
                <span className="text-xs text-slate-500 px-3 truncate max-w-48">{item.subtitle}</span>
              )}
            </div>

            {/* Separator */}
            {index < dynamicItems.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2 text-slate-500 transition-colors duration-200" />
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {/* <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center text-xs text-slate-500">
          <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">Ctrl</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">←</kbd>
          <span className="ml-2">to go back</span>
        </div>
      </div> */}
    </div>
  )
}

export default Breadcrumb
