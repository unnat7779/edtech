// Script to clear any cached Feedback model and reset the schema
const mongoose = require("mongoose")

async function clearFeedbackModel() {
  try {
    // Clear the model from mongoose cache
    if (mongoose.models.Feedback) {
      delete mongoose.models.Feedback
      console.log("✅ Cleared Feedback model from cache")
    }

    // Clear any connection cache
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
      console.log("✅ Closed existing mongoose connection")
    }

    console.log("✅ Feedback model cache cleared successfully")
    console.log("🔄 Please restart your development server")
  } catch (error) {
    console.error("❌ Error clearing feedback model:", error)
  }
}

clearFeedbackModel()
