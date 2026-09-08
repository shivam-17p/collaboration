const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ SUCCESS! MongoDB Connected to: ${conn.connection.host}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ FAILED! MongoDB Connection Error:`);
    console.error(error.message);
    process.exit(1);
  }
};

testConnection();
