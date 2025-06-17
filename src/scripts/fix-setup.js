require("dotenv").config()
const { MongoClient, ObjectId } = require("mongodb")

async function fixBrokenNotifications() {
  console.log("🔧 Fixing broken SystemNotifications (v2)...")


  const client = new MongoClient(process.env.MONGODB_URI || "mongodb+srv://unnatagrawal195:VNSUtKjboeCNVlP2@cluster0.alca8wl.mongodb.net/")

  try {
    await client.connect()
    const db = client.db()

    // First, let's clean up all broken notifications
    console.log("🧹 Cleaning up broken notifications...")

    const deleteResult = await db.collection("systemnotifications").deleteMany({
      userId: { $exists: false },
    })

    console.log(`🗑️  Deleted ${deleteResult.deletedCount} broken notifications`)

    // Now let's create proper notifications for the admin user
    const adminUserId = "684761982b3e6de2e281fa77"
    const adminUser = await db.collection("users").findOne({
      _id: new ObjectId(adminUserId),
    })

    if (!adminUser) {
      console.log("❌ Admin user not found")
      return
    }

    console.log(`👤 Found admin user: ${adminUser.name} (${adminUser.email})`)

    // Create a test announcement for the admin user
    const testNotification = {
      notificationId: `ANN-${Date.now()}-0001`,
      userId: new ObjectId(adminUserId),
      type: "announcement",
      title: "Welcome to the Notification System",
      message: "Your notification system has been successfully fixed!",
      description: "This is a test notification to verify that the system is working correctly.",
      images: [],
      targetAudience: "all",
      priority: "medium",
      totalRecipients: 1,
      readCount: 0,
      createdBy: new ObjectId(adminUserId),
      isActive: true,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("systemnotifications").insertOne(testNotification)
    console.log("✅ Created test notification for admin user")

    // Check if there are any feedbacks that need admin reply notifications
    const feedbacks = await db
      .collection("feedbacks")
      .find({
        studentId: new ObjectId(adminUserId),
        adminReply: { $exists: true, $ne: null, $ne: "" },
      })
      .toArray()

    console.log(`📝 Found ${feedbacks.length} feedbacks with admin replies`)

    let replyNotificationCount = 0
    for (const feedback of feedbacks) {
      // Check if notification already exists for this feedback
      const existingNotification = await db.collection("systemnotifications").findOne({
        relatedFeedbackId: feedback._id,
        type: "admin-reply",
      })

      if (!existingNotification) {
        const replyNotification = {
          notificationId: `REP-${Date.now()}-${String(replyNotificationCount).padStart(4, "0")}`,
          userId: feedback.studentId,
          type: "admin-reply",
          title: "Admin Response Received",
          message: `You have received a response to your feedback: "${feedback.subject || "Your Feedback"}"`,
          description: feedback.adminReply,
          images: [],
          relatedFeedbackId: feedback._id,
          priority: "high",
          totalRecipients: 1,
          readCount: 0,
          createdBy: feedback.adminId || new ObjectId(adminUserId),
          isActive: true,
          isRead: false,
          actionUrl: `/feedback-history?highlight=${feedback._id}`,
          metadata: {
            feedbackId: feedback._id,
            feedbackSubject: feedback.subject,
            originalMessage: feedback.message,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection("systemnotifications").insertOne(replyNotification)
        replyNotificationCount++
        console.log(`✅ Created admin reply notification for feedback: ${feedback.subject || feedback._id}`)
      }
    }

    // Final verification
    const userNotifications = await db
      .collection("systemnotifications")
      .find({
        userId: new ObjectId(adminUserId),
      })
      .toArray()

    console.log(`\n🎉 Summary:`)
    console.log(`✅ User ${adminUserId} now has ${userNotifications.length} notifications`)
    console.log(`📢 Announcements: ${userNotifications.filter((n) => n.type === "announcement").length}`)
    console.log(`💬 Admin Replies: ${userNotifications.filter((n) => n.type === "admin-reply").length}`)

    // Show notification details
    console.log(`\n📋 Notification Details:`)
    userNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.type}: ${notification.title}`)
      console.log(`   ID: ${notification.notificationId}`)
      console.log(`   Read: ${notification.isRead}`)
      console.log(`   Created: ${notification.createdAt}`)
    })

    // Show total notifications in collection
    const totalNotifications = await db.collection("systemnotifications").countDocuments({})
    console.log(`\n📊 Total notifications in collection: ${totalNotifications}`)
  } catch (error) {
    console.error("❌ Fix error:", error)
  } finally {
    await client.close()
  }
}

fixBrokenNotifications()
