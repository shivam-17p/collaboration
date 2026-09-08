const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const Discussion = require('./models/Discussion');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ email: 'student0@college.edu' });
  let discussion = await Discussion.findOne();
  
  if (!discussion) {
    console.log("No discussions found");
    process.exit();
  }

  // Ensure there's a reply from student0
  discussion.replies.push({ content: "API Test Reply", author: user._id });
  await discussion.save();

  const newReply = discussion.replies[discussion.replies.length - 1];

  // We need a token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  console.log("Trying to delete:", discussion._id, "reply:", newReply._id);
  
  try {
    const res = await axios.delete(`http://localhost:5000/api/discussions/${discussion._id}/reply/${newReply._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", res.status);
  } catch (err) {
    console.error("ERROR STATUS:", err.response?.status);
    console.error("ERROR DATA:", err.response?.data);
    console.error("ERROR MESSAGE:", err.message);
  }

  process.exit();
}
run();
