// Enhanced API client with automatic token refresh and better error handling
export const apiClient = {
  async request(url, options = {}) {
    try {
      const token = localStorage.getItem("token")
      console.log(`🔍 API Request: ${options.method || "GET"} ${url}`)

      // Log request body for debugging
      if (options.body) {
        console.log("📤 Request body:", options.body)
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      }

      let response = await fetch(url, config)
      console.log(`📊 Response status: ${response.status}`)

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

      // For non-2xx responses, get detailed error information
      if (!response.ok) {
        let errorData = {}
        const contentType = response.headers.get("content-type")

        try {
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json()
            console.log("📋 Error response data:", errorData)
          } else {
            // If response is not JSON, get text
            const errorText = await response.text()
            console.log("📋 Error response text:", errorText)
            errorData = { error: errorText || response.statusText, status: response.status }
          }
        } catch (parseError) {
          console.error("❌ Error parsing response:", parseError)
          errorData = { error: response.statusText, status: response.status }
        }

        console.error("❌ API Error Details:", {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          headers: Object.fromEntries(response.headers.entries()),
        })

        // Create a more detailed error message
        let errorMessage = errorData.error || errorData.message || response.statusText

        // Add additional details if available
        if (errorData.details) {
          errorMessage += ` - ${errorData.details}`
        }

        if (errorData.missingFields && errorData.missingFields.length > 0) {
          errorMessage += ` (Missing: ${errorData.missingFields.join(", ")})`
        }

        throw new Error(errorMessage)
      }

      return response
    } catch (error) {
      console.error("❌ API Client Error:", error)
      throw error
    }
  },

  async get(url, options = {}) {
    const response = await this.request(url, { method: "GET", ...options })
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({})),
    }
  },

  async post(url, data, options = {}) {
    const response = await this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    })
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({})),
    }
  },

  async put(url, data, options = {}) {
    const response = await this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    })
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({})),
    }
  },

  async delete(url, options = {}) {
    const response = await this.request(url, { method: "DELETE", ...options })
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({})),
    }
  },
}
