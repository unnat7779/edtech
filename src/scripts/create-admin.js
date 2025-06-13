const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://unnatagrawal195:VNSUtKjboeCNVlP2@cluster0.alca8wl.mongodb.net/";

// User schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  whatsappNo: String,
  class: String,
  role: {
    type: String,
    enum: ["student", "admin", "teacher"],
    default: "student",
  },
  enrolledInCoaching: Boolean,
  coachingName: String,
});

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = mongoose.model("User", userSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@edtech.com" });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("ℹ️  Admin details:");
      console.log({
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role,
        id: existingAdmin._id,
      });
      console.log("\n📝 If you want to reset this user, delete it from MongoDB manually.");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@edtech.com",
      password: hashedPassword,
      whatsappNo: "9999999999",
      class: "12",
      role: "admin",
      enrolledInCoaching: false,
      coachingName: "",
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("🔐 Email: admin@edtech.com");
    console.log("🔐 Password: admin123");
    console.log("🔐 Role: admin");
    console.log("🆔 ID:", adminUser._id);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
