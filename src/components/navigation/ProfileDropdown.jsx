"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { User, Crown, LogOut } from "lucide-react"

export default function ProfileDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)
  const router = useRouter()

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap below button
        right: window.innerWidth - rect.right, // Align to right edge of button
      })
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  const handleProfileClick = () => {
    console.log("Navigating to profile page...")
    router.push("/profile")
    setIsOpen(false)
  }

  const handleSubscriptionHistoryClick = () => {
    if (user?._id) {
      console.log(`Navigating to subscription history for user: ${user._id}`)
      router.push(`/subscriptions/history/${user._id}`)
    } else {
      console.error("User ID not found")
      // Fallback: try to get user from localStorage
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser._id) {
          router.push(`/subscriptions/history/${parsedUser._id}`)
        }
      }
    }
    setIsOpen(false)
  }

  const handleLogout = () => {
    console.log("Logging out user...")

    // Clear all authentication data
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")

    // Clear any session storage
    sessionStorage.clear()

    // Clear cookies if any
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos) : c
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })

    setIsOpen(false)

    // Redirect to login page
    router.push("/login")

    // Force page reload to clear any cached state
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed w-56 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl shadow-black/20 z-[99999]"
      style={{
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
      }}
    >
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
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
            <div className="text-sm font-medium text-slate-200 truncate">{user?.name || "User"}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email || "user@example.com"}</div>
            {user?.isPremium && <div className="text-xs text-amber-400 font-medium">Premium Member</div>}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={handleProfileClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-teal-400 transition-colors duration-200 group"
        >
          <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Profile Details</span>
        </button>

        <button
          onClick={handleSubscriptionHistoryClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-teal-400 transition-colors duration-200 group"
        >
          <Crown className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Subscription History</span>
        </button>
      </div>

      {/* Logout Section */}
      <div className="border-t border-slate-700/50 py-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200 group"
        >
          <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Profile Avatar Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-teal-500/20"
        aria-label="Profile Menu"
      >
        {user?.avatar ? (
          <img
            src={user.avatar || "/placeholder.svg"}
            alt="Profile"
            className="h-full w-full object-cover rounded-full border-2 border-slate-700"
          />
        ) : (
          <span className="text-sm font-medium text-white">{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
        )}
        {/* Online Status Indicator */}
        <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-800"></span>
      </button>

      {/* Render dropdown using portal */}
      {isOpen && typeof document !== "undefined" && createPortal(<DropdownContent />, document.body)}
    </>
  )
}
