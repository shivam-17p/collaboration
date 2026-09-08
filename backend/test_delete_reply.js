const mongoose = require('mongoose');
const User = require('./models/User');
const Discussion = require('./models/Discussion');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
  
  const user = await User.findOne({ email: 'student0@college.edu' });
  if (!user) return console.log("No user");

  const discussion = await Discussion.findOne();
  if (!discussion) return console.log("No discussion");

  // Add reply
  discussion.replies.push({ content: "Test reply", author: user._id });
  await discussion.save();
  console.log("Added reply");

  const newReply = discussion.replies[discussion.replies.length - 1];
  
  // Try to delete using the same logic as the controller
  try {
    const discussion2 = await Discussion.findById(discussion._id);
    const reply2 = discussion2.replies.id(newReply._id);
    if (!reply2) throw new Error("Reply not found");
    
    if (reply2.author.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new Error("Not authorized");
    }

    reply2.deleteOne();
    await discussion2.save();
    console.log("Reply deleted successfully");
  } catch (e) {
    console.error("ERROR DELETING:", e.message);
  }

  process.exit();
}

run();
