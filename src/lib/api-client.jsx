// Enhanced API client with automatic token refresh
export const apiClient = {
  async request(url, options = {}) {
    try {
      const token = localStorage.getItem("token")
      console.log(`API Request: ${options.method || "GET"} ${url}`)

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      }

      let response = await fetch(url, config)
      console.log(`Response status: ${response.status}`)

      // Handle token expiration with automatic refresh
      if (response.status === 401) {
        console.log("🔄 Token expired, attempting refresh...")

        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()

          // Update stored token and user
          localStorage.setItem("token", refreshData.token)
          localStorage.setItem("user", JSON.stringify(refreshData.user))

          console.log("✅ Token refreshed, retrying original request...")

          // Retry original request with new token
          config.headers.Authorization = `Bearer ${refreshData.token}`
          response = await fetch(url, config)

          if (response.ok) {
            return response
          }
        }

        // If refresh failed, redirect to login
        console.error("❌ Token refresh failed, redirecting to login")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return
      }

      // For non-2xx responses, log the error response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(`API Error: ${errorData.error || response.statusText}`)
      }

      return response
    } catch (error) {
      console.error("API Client Error:", error)
      throw error
    }
  },

  async get(url, options = {}) {
    return this.request(url, { method: "GET", ...options })
  },

  async post(url, data, options = {}) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    })
  },

  async put(url, data, options = {}) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    })
  },

  async delete(url, options = {}) {
    return this.request(url, { method: "DELETE", ...options })
  },
}
