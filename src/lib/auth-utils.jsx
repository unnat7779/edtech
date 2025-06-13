// Client-side auth utilities
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem("user")
    if (!userData || userData === "undefined") {
      return null
    }
    return JSON.parse(userData)
  } catch (error) {
    console.error("Error parsing stored user data:", error)
    localStorage.removeItem("user")
    return null
  }
}

export const getStoredToken = () => {
  try {
    const token = localStorage.getItem("token")
    if (!token || token === "undefined") {
      return null
    }
    return token
  } catch (error) {
    console.error("Error getting stored token:", error)
    localStorage.removeItem("token")
    return null
  }
}

export const clearAuthData = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export const setAuthData = (token, user) => {
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))
}
