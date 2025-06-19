// Script to update existing subscriptions with plan names
const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://unnatagrawal195:VNSUtKjboeCNVlP2@cluster0.alca8wl.mongodb.net/"

async function updateExistingSubscriptions() {
  console.log("🔄 Starting subscription update process...")

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db()
    const usersCollection = db.collection("users")

    // Find users with currentSubscription but missing plan name fields
    const usersWithSubscriptions = await usersCollection
      .find({
        currentSubscription: { $exists: true },
        $or: [
          { "currentSubscription.planName": { $exists: false } },
          { "currentSubscription.planName": null },
          { "currentSubscription.planName": "Premium Plan" },
          { "currentSubscription.plan": "Premium Plan" },
        ],
      })
      .toArray()

    console.log(`📊 Found ${usersWithSubscriptions.length} users with subscriptions to update`)

    let updatedCount = 0

    for (const user of usersWithSubscriptions) {
      const currentSub = user.currentSubscription

      // Skip if no subscription data
      if (!currentSub) continue

      // Determine plan name based on amount and other factors
      let planName = "Premium Plan"
      let type = "mentorship"
      let category = "silver"

      // Try to determine plan type based on amount
      if (currentSub.amount) {
        if (currentSub.amount >= 4000) {
          planName = "1:1 Mentorship - Gold Plan"
          category = "gold"
          type = "mentorship"
        } else if (currentSub.amount >= 2000) {
          planName = "1:1 Mentorship - Silver Plan"
          category = "silver"
          type = "mentorship"
        } else if (currentSub.amount >= 1500) {
          planName = "PCM Live 1:1 Doubt Support"
          category = "premium"
          type = "live-doubt-solving"
        } else if (currentSub.amount >= 1000) {
          planName = "PCM Chat Doubt Support"
          category = "premium"
          type = "chat-doubt-solving"
        }
      }

      // Update the subscription
      const updateResult = await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            "currentSubscription.plan": planName,
            "currentSubscription.planName": planName,
            "currentSubscription.type": type,
            "currentSubscription.category": category,
            "currentSubscription.planTier": category === "gold" ? "premium" : "basic",
            "currentSubscription.updatedAt": new Date(),
          },
        },
      )

      if (updateResult.modifiedCount > 0) {
        updatedCount++
        console.log(`✅ Updated subscription for user: ${user.name} (${user.email}) - Plan: ${planName}`)
      }

      // Also update subscription history if it exists
      if (user.subscriptionHistory && user.subscriptionHistory.length > 0) {
        const historyUpdates = user.subscriptionHistory.map((_, index) => ({
          [`subscriptionHistory.${index}.plan`]: planName,
          [`subscriptionHistory.${index}.planName`]: planName,
          [`subscriptionHistory.${index}.type`]: type,
          [`subscriptionHistory.${index}.category`]: category,
          [`subscriptionHistory.${index}.planTier`]: category === "gold" ? "premium" : "basic",
          [`subscriptionHistory.${index}.updatedAt`]: new Date(),
        }))

        for (const update of historyUpdates) {
          await usersCollection.updateOne({ _id: user._id }, { $set: update })
        }
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} subscriptions`)
  } catch (error) {
    console.error("❌ Error updating subscriptions:", error)
  } finally {
    await client.close()
    console.log("🔌 Disconnected from MongoDB")
  }
}

// Run the update
updateExistingSubscriptions()
  .then(() => {
    console.log("✅ Subscription update completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Subscription update failed:", error)
    process.exit(1)
  })
