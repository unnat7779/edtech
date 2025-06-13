import { apiClient } from "@/lib/api-client"

export const testApi = {
  async getTests() {
    try {
      const response = await apiClient.get("/api/tests")
      const data = await response.json()
      return data.tests
    } catch (error) {
      console.error("Error fetching tests:", error)
      throw error
    }
  },

  async getTest(id) {
    try {
      console.log(`Fetching test with ID: ${id}`)
      const response = await apiClient.get(`/api/tests/${id}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error response: ${errorText}`)
        throw new Error(`Failed to fetch test: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Test data received: ${data.test ? "Yes" : "No"}`)
      return data.test
    } catch (error) {
      console.error(`Error fetching test ${id}:`, error)
      throw error
    }
  },

  async createTestAttempt(testId) {
    try {
      const response = await apiClient.post("/api/test-attempts", { testId })
      const data = await response.json()
      return data.testAttempt
    } catch (error) {
      console.error("Error creating test attempt:", error)
      throw error
    }
  },

  async saveTestAttempt(attemptId, answers) {
    try {
      const response = await apiClient.put(`/api/test-attempts/${attemptId}/auto-save`, {
        answers,
      })
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Error saving test attempt:", error)
      throw error
    }
  },

  async submitTestAttempt(attemptId, answers) {
    try {
      const response = await apiClient.post(`/api/test-attempts/${attemptId}/submit`, {
        answers,
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error submitting test attempt:", error)
      throw error
    }
  },

  async getTestAttempt(attemptId) {
    try {
      const response = await apiClient.get(`/api/test-attempts/${attemptId}`)
      const data = await response.json()
      return data.testAttempt
    } catch (error) {
      console.error("Error fetching test attempt:", error)
      throw error
    }
  },

  async rateTest(testId, rating, feedback) {
    try {
      const response = await apiClient.post(`/api/tests/${testId}/rating`, {
        rating,
        feedback,
      })
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Error rating test:", error)
      throw error
    }
  },
}
