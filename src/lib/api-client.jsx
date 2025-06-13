// Client-side API utility
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

      const response = await fetch(url, config)
      console.log(`Response status: ${response.status}`)

      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        console.error("Authentication failed, redirecting to login")
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
