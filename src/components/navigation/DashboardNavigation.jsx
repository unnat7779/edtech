"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  BookOpen,
  BarChart3,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  Crown,
  Clock,
  Bookmark,
  MessageCircle,
  HelpCircle,
} from "lucide-react"
import NotificationBell from "@/components/notifications/NotificationBell"
// import AdminReplyBell from "@/components/notifications/AdminReplyBell"
import ProfileDropdown from "@/components/navigation/ProfileDropdown"

export default function DashboardNavigation({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const studentNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: pathname === "/dashboard" },
    { icon: BookOpen, label: "Tests", href: "/tests", active: pathname === "/tests" },
    { icon: BarChart3, label: "Analytics", href: "/analytics", active: pathname.startsWith("/analytics") },
    { icon: Clock, label: "Test History", href: "/test-history", active: pathname.startsWith("/test-history") },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks", active: pathname === "/bookmarks" },
    { icon: MessageCircle, label: "Book Session", href: "/book-session", active: pathname === "/book-session" },
    { icon: Bell, label: "Notifications", href: "/notifications", active: pathname === "/notifications" },
    { icon: MessageSquare, label: "Feedback", href: "/feedback", active: pathname === "/feedback" },
    { icon: HelpCircle, label: "Announcements", href: "/announcements", active: pathname === "/announcements" },
  ]

  const adminNavItems = [
    { icon: Home, label: "Dashboard", href: "/admin", active: pathname === "/admin" },
    { icon: BookOpen, label: "Tests", href: "/admin/tests", active: pathname.startsWith("/admin/tests") },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics", active: pathname.startsWith("/admin/analytics") },
    {
      icon: MessageSquare,
      label: "Feedbacks",
      href: "/admin/feedbacks",
      active: pathname.startsWith("/admin/feedbacks"),
    },
    {
      icon: Bell,
      label: "Announcements",
      href: "/admin/announcements",
      active: pathname.startsWith("/admin/announcements"),
    },
  ]

  const navItems = user?.role === "admin" ? adminNavItems : studentNavItems

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center justify-between px-6 py-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="flex items-center gap-8">
          <Link href={user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JE</span>
            </div>
            <span className="text-xl font-bold text-slate-200">JEE Elevate</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.active ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-700/50 hover:text-teal-400"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === "student" && (
            <>
              <NotificationBell />
              <AdminReplyBell />
            </>
          )}
          <ProfileDropdown user={user} />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JE</span>
            </div>
            <span className="text-lg font-bold text-slate-200">JEE Elevate</span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.role === "student" && (
              <>
                <NotificationBell />
                {/* <AdminReplyBell /> */}
              </>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-teal-400 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-700 bg-slate-800/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-700/50 hover:text-teal-400"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Mobile Profile Section */}
              <div className="border-t border-slate-700 pt-4 mt-4">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium">{user?.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                    {user?.isPremium && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{user?.name}</div>
                    <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-teal-400 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href={`/subscriptions/history/${user?._id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-teal-400 transition-colors"
                  >
                    <Crown className="h-4 w-4" />
                    <span>Subscription History</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
