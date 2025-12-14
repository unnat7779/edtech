const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

// Simple Test Schema matching the project (minimal)
const TestSchema = new mongoose.Schema({
  title: String,
  questions: Array
}, { strict: false });

const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

async function debugTestFetch() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("Connecting to MongoDB...", uri ? "URI present" : "URI missing");
    
    await mongoose.connect(uri);
    console.log("Connected.");

    // 1. Fetch any test
    console.log("Fetching one test...");
    const test = await Test.findOne({});
    
    if (!test) {
      console.log("❌ No tests found in database!");
    } else {
      console.log(`✅ Found test: ${test._id}`);
      console.log(`Title: ${test.title}`);
      
      // 2. Try findById with the ID converted to string
      const idString = test._id.toString();
      console.log(`Trying Test.findById('${idString}')...`);
      
      const foundById = await Test.findById(idString);
      if (foundById) {
        console.log("✅ Success: Found by ID");
      } else {
        console.log("❌ Failed: Not found by ID");
      }
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

debugTestFetch();
