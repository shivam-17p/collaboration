const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto seed remote DB
    const { importData } = require('../seeder');
    await importData();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log(`Failed to connect to local MongoDB. Falling back to in-memory MongoDB...`);
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      
      // Auto seed memory DB
      const { importData } = require('../seeder');
      await importData();
    } catch (memError) {
      console.error(`Error with in-memory DB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
