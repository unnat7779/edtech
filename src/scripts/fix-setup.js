const { MongoClient, ObjectId } = require("mongodb")

async function testDirectMongoDBUpdate() {
  const client = new MongoClient("mongodb+srv://unnatagrawal195:VNSUtKjboeCNVlP2@cluster0.alca8wl.mongodb.net/")

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db()
    const usersCollection = db.collection("users")

    const userId = "684ab51e477fe14bc11aaee3"

    // Test data
    const testSubscription = {
      plan: "Test Plan",
      planName: "Test Plan",
      type: "test",
      category: "test",
      planTier: "TEST",
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      amount: 1000,
      paymentId: "test123",
      duration: {
        months: 1,
        days: 30,
      },
      autoRenew: false,
      createdAt: new Date(),
    }

    const testHistoryEntry = {
      plan: "Test Plan",
      planName: "Test Plan",
      type: "test",
      category: "test",
      planTier: "TEST",
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: 1000,
      paymentId: "test123",
      duration: {
        months: 1,
        days: 30,
      },
      autoRenew: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Testing direct MongoDB update...")

    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          currentSubscription: testSubscription,
          premiumTier: "premium",
          isPremium: true,
        },
        $push: {
          subscriptionHistory: testHistoryEntry,
        },
      },
    )

    console.log("Update result:", updateResult)

    if (updateResult.modifiedCount > 0) {
      console.log("✅ Direct MongoDB update successful!")

      // Verify the update
      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) })
      console.log("✅ Current subscription:", updatedUser.currentSubscription)
      console.log("✅ Subscription history length:", updatedUser.subscriptionHistory.length)
      console.log("✅ Premium status:", updatedUser.isPremium)
    } else {
      console.log("❌ Update failed")
    }
  } catch (error) {
    console.error("❌ Error testing direct MongoDB update:", error)
  } finally {
    await client.close()
  }
}

// Run the test
testDirectMongoDBUpdate()
