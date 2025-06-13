const API_BASE = "/api"

export const testApi = {
  getTests: async () => {
    const response = await fetch(`${API_BASE}/tests`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    return response.json()
  },

  getTest: async (testId) => {
    const response = await fetch(`${API_BASE}/tests/${testId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    return response.json()
  },

  startTest: async (testId) => {
    const response = await fetch(`${API_BASE}/test-attempts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ testId }),
    })
    return response.json()
  },

  submitTest: async (attemptId, answers) => {
    const response = await fetch(`${API_BASE}/test-attempts/${attemptId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ answers }),
    })
    return response.json()
  },

  autoSave: async (attemptId, answers) => {
    const response = await fetch(`${API_BASE}/test-attempts/${attemptId}/auto-save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ answers }),
    })
    return response.json()
  },

  getTestResults: async (attemptId) => {
    const response = await fetch(`${API_BASE}/test-attempts/${attemptId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    return response.json()
  },
}
