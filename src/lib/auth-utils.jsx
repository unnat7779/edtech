// Client-side auth utilities
export const getStoredUser = () => {
  try {
    if (typeof window === "undefined") return null // Server-side check

    const userData = localStorage.getItem("user")
    if (!userData || userData === "undefined" || userData === "null") {
      return null
    }

    const parsedUser = JSON.parse(userData)
    console.log("📋 Retrieved user from storage:", parsedUser?.name, parsedUser?.role)
    return parsedUser
  } catch (error) {
    console.error("Error parsing stored user data:", error)
    localStorage.removeItem("user")
    return null
  }
}

export const getStoredToken = () => {
  try {
    if (typeof window === "undefined") return null // Server-side check

    const token = localStorage.getItem("token")
    if (!token || token === "undefined" || token === "null") {
      return null
    }

    console.log("🔑 Retrieved token from storage:", token ? "Present" : "Missing")
    return token
  } catch (error) {
    console.error("Error getting stored token:", error)
    localStorage.removeItem("token")
    return null
  }
}

export const clearAuthData = () => {
  if (typeof window === "undefined") return // Server-side check

  console.log("🧹 Clearing authentication data")
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export const setAuthData = (token, user) => {
  if (typeof window === "undefined") return // Server-side check

  console.log("💾 Storing authentication data for:", user?.name)
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))
}

// Validate stored auth data
export const validateStoredAuth = () => {
  const token = getStoredToken()
  const user = getStoredUser()

  if (!token || !user) {
    console.log("❌ Invalid stored auth data")
    clearAuthData()
    return false
  }

  console.log("✅ Valid stored auth data found")
  return true
}
