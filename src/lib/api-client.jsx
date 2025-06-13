// Client-side API utility
export const apiClient = {
  async request(url, options = {}) {
    const token = localStorage.getItem("token")

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
      return
    }

    return response
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
